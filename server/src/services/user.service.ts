import { User } from '@/models/user.model';
import { Friend } from '@/models/friend.model';
import { Conversation } from '@/models/conversation.model';
import { Message } from '@/models/message.model';
import { IUser } from '@/types/user';
import { Types } from 'mongoose';
import { RegexFilter } from '@/types/data';
import { getIO, getOnlineUsers } from './socket.service';
import type { ConversationDeletedPayload } from '@/types/socket';

type SearchFilter = {
  _id?: string | { $ne: string };
  email?: string | RegexFilter;
  name?: string | RegexFilter;
};

export const UserService = {
  async searchUsers(userId: string, email?: string, name?: string) {
    const filter: SearchFilter = {};

    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    filter._id = { $ne: userId };

    return await User.find(filter).select('-password');
  },

  async getUserById(userId: string) {
    return await User.findById(userId).select('-password');
  },

  async sendFriendRequest(senderId: string, receiverId: string) {
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!sender || !receiver) {
      throw new Error('One or both users not found');
    }

    if (senderId === receiverId) {
      throw new Error('Cannot send friend request to yourself');
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { requester: new Types.ObjectId(senderId), recipient: new Types.ObjectId(receiverId) },
        { requester: new Types.ObjectId(receiverId), recipient: new Types.ObjectId(senderId) },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        throw new Error('Already friends');
      }
      if (existingRequest.status === 'pending') {
        throw new Error('Friend request already sent');
      }
    }

    const friendRequest = await Friend.create({
      requester: new Types.ObjectId(senderId),
      recipient: new Types.ObjectId(receiverId),
      status: 'pending',
    });

    return friendRequest;
  },

  async acceptFriendRequest(requestId: string, userId: string) {
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    if (friendRequest.recipient.toString() !== userId) {
      throw new Error('Not authorized to accept this request');
    }

    if (friendRequest.status !== 'pending') {
      throw new Error('Request is not pending');
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    const requesterId = friendRequest.requester.toString();
    const recipientId = friendRequest.recipient.toString();

    const existingConversation = await Conversation.findOne({
      participants: { $all: [new Types.ObjectId(requesterId), new Types.ObjectId(recipientId)] },
      $expr: { $eq: [{ $size: '$participants' }, 2] },
    });

    let conversationId: string;

    if (existingConversation) {
      conversationId = (existingConversation._id as Types.ObjectId).toString();
    } else {
      const newConversation = await Conversation.create({
        participants: [new Types.ObjectId(requesterId), new Types.ObjectId(recipientId)],
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
      });
      conversationId = (newConversation._id as Types.ObjectId).toString();
    }

    return { friendRequest, conversationId, requesterId, recipientId };
  },

  async rejectFriendRequest(requestId: string, userId: string) {
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    if (friendRequest.recipient.toString() !== userId) {
      throw new Error('Not authorized to reject this request');
    }

    if (friendRequest.status !== 'pending') {
      throw new Error('Request is not pending');
    }

    await Friend.findByIdAndDelete(requestId);

    return { message: 'Friend request rejected and deleted' };
  },

  async cancelFriendRequest(requestId: string, userId: string) {
    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    const isRequester = friendRequest.requester.toString() === userId;
    const isRecipient = friendRequest.recipient.toString() === userId;

    if (!isRequester && !isRecipient) {
      throw new Error('Not authorized to cancel this request');
    }

    if (friendRequest.status === 'pending' && !isRequester) {
      throw new Error('Only the requester can cancel a pending request');
    }

    await Friend.findByIdAndDelete(requestId);

    return { message: 'Friend request cancelled successfully' };
  },

  async getFriendsList(userId: string) {
    const friends = await Friend.find({
      $or: [{ requester: new Types.ObjectId(userId) }, { recipient: new Types.ObjectId(userId) }],
      status: 'accepted',
    })
      .populate('requester', '-password')
      .populate('recipient', '-password');

    return friends.map((friend) => {
      const requesterId =
        (friend.requester as IUser | Types.ObjectId)._id?.toString() || friend.requester.toString();
      if (requesterId === userId) {
        return friend.recipient;
      }
      return friend.requester;
    });
  },

  async getPendingRequests(userId: string) {
    const pendingRequests = await Friend.find({
      recipient: new Types.ObjectId(userId),
      status: 'pending',
    }).populate('requester', '-password');

    return pendingRequests;
  },

  async getRelationshipStatus(userId: string, targetUserId: string) {
    const relationship = await Friend.findOne({
      $or: [
        { requester: new Types.ObjectId(userId), recipient: new Types.ObjectId(targetUserId) },
        { requester: new Types.ObjectId(targetUserId), recipient: new Types.ObjectId(userId) },
      ],
    });

    if (!relationship) {
      return { status: 'none', isSender: false };
    }

    if (relationship.status === 'accepted') {
      return {
        status: 'friends',
        isSender: false,
        friendshipId: (relationship._id as Types.ObjectId).toString(),
      };
    }

    const isSender = relationship.requester.toString() === userId;
    return { status: 'pending', isSender };
  },

  async unfriend(userId: string, targetUserId: string) {
    const friendship = await Friend.findOne({
      $or: [
        { requester: new Types.ObjectId(userId), recipient: new Types.ObjectId(targetUserId) },
        { requester: new Types.ObjectId(targetUserId), recipient: new Types.ObjectId(userId) },
      ],
      status: 'accepted',
    });

    if (!friendship) {
      throw new Error('Friendship not found');
    }

    await Friend.findByIdAndDelete(friendship._id);

    return { message: 'Unfriended successfully' };
  },
  async getConversations(userId: string) {
    if (!userId) throw new Error('User ID is required');

    const conversations = await Conversation.find({
      participants: userId,
      deletedBy: { $ne: userId },
    })
      .populate('participants', 'name avatar _id isOnline')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    return conversations;
  },
  async getConversationById(conversationId: string, userId: string) {
    if (!conversationId) throw new Error('Conversation ID is required');

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate('participants', '_id name avatar isOnline')
      .populate('lastMessage');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  },

  async getOrCreateDirectConversation(userId: string, friendId: string) {
    // Check if conversation already exists (including soft-deleted ones)
    let conversation: any = await Conversation.findOne({
      participants: { $all: [new Types.ObjectId(userId), new Types.ObjectId(friendId)] },
      isGroup: false,
    })
      .populate('participants', '_id name avatar isOnline')
      .populate('lastMessage');

    if (!conversation) {
      // Create new conversation only if none exists
      conversation = await Conversation.create({
        participants: [new Types.ObjectId(userId), new Types.ObjectId(friendId)],
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        isGroup: false,
      });

      conversation = await conversation.populate('participants', '_id name avatar isOnline');
    } else {
      // Remove userId from deletedBy if present (restore conversation for this user)
      if (conversation.deletedBy && conversation.deletedBy.length > 0) {
        conversation.deletedBy = conversation.deletedBy.filter(
          (id: any) => id.toString() !== userId,
        );
      }

      // Remove userId from deletedAt if present
      if (conversation.deletedAt && conversation.deletedAt.length > 0) {
        conversation.deletedAt = conversation.deletedAt.filter(
          (item: any) => item.userId !== userId,
        );
      }

      await conversation.save();
    }

    return conversation;
  },

  async createGroupConversation(
    userId: string,
    groupName: string,
    participantIds: string[],
    groupAvatar?: string,
  ) {
    if (!groupName || !participantIds || participantIds.length === 0) {
      throw new Error('Group name and participants are required');
    }

    // Add creator to participants if not included
    const allParticipants = [userId, ...participantIds.filter((id) => id !== userId)];

    // Validate minimum 3 members for group
    if (allParticipants.length < 3) {
      throw new Error('Group must have at least 3 members (including you)');
    }

    // Create group conversation
    const conversation = await Conversation.create({
      participants: allParticipants.map((id) => new Types.ObjectId(id)),
      isGroup: true,
      groupName,
      groupAvatar: groupAvatar || '',
      admin: new Types.ObjectId(userId),
      lastMessage: null,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
    });

    return conversation.populate('participants', '_id name avatar isOnline');
  },

  async searchConversations(userId: string, query: string) {
    if (!query) throw new Error('Search query is required');

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name avatar _id isOnline')
      .populate('lastMessage');

    // Filter conversations based on query
    const filtered = conversations.filter((conv: any) => {
      if (conv.isGroup) {
        // For group chats, search by group name
        return conv.groupName?.toLowerCase().includes(query.toLowerCase());
      } else {
        // For 1:1 chats, search by participant name
        const otherParticipant = conv.participants.find((p: any) => p._id.toString() !== userId);
        return otherParticipant?.name?.toLowerCase().includes(query.toLowerCase());
      }
    });

    return filtered;
  },

  async markConversationAsRead(conversationId: string, userId: string) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true },
    );

    return { message: 'Conversation marked as read' };
  },

  async markConversationAsUnread(conversationId: string, userId: string) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get the last message and mark it as unread
    const lastMessage = await Message.findById(conversation.lastMessage);
    if (lastMessage && lastMessage.senderId.toString() !== userId) {
      lastMessage.isRead = false;
      await lastMessage.save();
    }

    return { message: 'Conversation marked as unread' };
  },

  async deleteConversation(conversationId: string, userId: string) {
    const conversation: any = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).populate('participants');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const participantIds = conversation.participants.map((p: any) => p._id.toString());

    // Add user to deletedBy array and save timestamp
    if (!conversation.deletedBy) {
      conversation.deletedBy = [];
    }

    if (!conversation.deletedBy.includes(userId)) {
      conversation.deletedBy.push(new Types.ObjectId(userId));
    }

    // Save deletion timestamp for this user
    if (!conversation.deletedAt) {
      conversation.deletedAt = [];
    }
    const deletionTime = new Date();

    // Remove existing entry if any
    conversation.deletedAt = conversation.deletedAt.filter((item: any) => item.userId !== userId);

    // Add new entry
    conversation.deletedAt.push({ userId, timestamp: deletionTime });

    const allDeleted = participantIds.every((id: string) =>
      conversation.deletedBy.some((deletedId: any) => deletedId.toString() === id),
    );

    if (allDeleted) {
      // Hard delete: Delete all messages and conversation
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
    } else {
      // Soft delete: Save deletedBy and deletedAt
      await conversation.save();

      // Verify saved data
      await Conversation.findById(conversationId);
    }

    // Emit socket event to current user only
    try {
      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const socketId = onlineUsers.get(userId);

      if (socketId) {
        io.to(socketId).emit('conversation:deleted', {
          conversationId,
          participantIds: [userId],
        } as ConversationDeletedPayload);
      }
    } catch (error) {
      console.error('Failed to emit conversation:deleted event:', error);
    }

    return { message: 'Conversation deleted successfully' };
  },

  async dissolveGroup(conversationId: string, userId: string) {
    const conversation: any = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).populate('participants');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('This is not a group conversation');
    }

    // Check if user is admin
    if (conversation.admin?.toString() !== userId) {
      throw new Error('Only admin can dissolve the group');
    }

    const participantIds = conversation.participants.map((p: any) => p._id.toString());

    // Hard delete: Delete all messages and conversation
    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    return {
      message: 'Group dissolved successfully',
      participants: participantIds,
    };
  },

  async updateGroupInfo(
    conversationId: string,
    userId: string,
    updates: { groupName?: string; groupAvatar?: string },
  ) {
    const conversation: any = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('This is not a group conversation');
    }

    // Check if user is admin
    if (conversation.admin.toString() !== userId) {
      throw new Error('Only admin can update group info');
    }

    if (updates.groupName) {
      conversation.groupName = updates.groupName;
    }

    if (updates.groupAvatar) {
      conversation.groupAvatar = updates.groupAvatar;
    }

    await conversation.save();

    return conversation.populate('participants', '_id name avatar isOnline');
  },

  async addGroupMembers(conversationId: string, userId: string, memberIds: string[]) {
    const conversation: any = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('This is not a group conversation');
    }

    // Check if user is admin
    if (conversation.admin.toString() !== userId) {
      throw new Error('Only admin can add members');
    }

    // Add new members
    const newMembers = memberIds.filter(
      (id) => !conversation.participants.some((p: any) => p.toString() === id),
    );

    conversation.participants.push(...newMembers.map((id) => new Types.ObjectId(id)));
    await conversation.save();

    return conversation.populate('participants', '_id name avatar isOnline');
  },

  async removeGroupMember(conversationId: string, userId: string, memberId: string) {
    const conversation: any = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isGroup) {
      throw new Error('This is not a group conversation');
    }

    // Check if user is admin
    if (conversation.admin.toString() !== userId) {
      throw new Error('Only admin can remove members');
    }

    // Cannot remove admin
    if (conversation.admin.toString() === memberId) {
      throw new Error('Cannot remove the admin');
    }

    // Remove member
    conversation.participants = conversation.participants.filter(
      (p: any) => p.toString() !== memberId,
    );

    await conversation.save();

    return conversation.populate('participants', '_id name avatar isOnline');
  },
};
