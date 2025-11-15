import { User } from '@/models/user.model';
import { Friend } from '@/models/friend.model';
import { Conversation } from '@/models/conversation.model';
import { IUser } from '@/types/user';
import { Types } from 'mongoose';
import { RegexFilter } from '@/types/data';

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

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name avatar _id')
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
      .populate('participants', '_id name avatar')
      .populate('lastMessage');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  },
};
