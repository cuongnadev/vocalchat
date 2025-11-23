import { UserService } from '@/services/user.service';
import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '@/libs/hash';
import { getIO, getOnlineUsers } from '@/services/socket.service';

export const UserController = {
  async searchUsers(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }
    const { email, name } = req.body;

    if (!email && !name) {
      return res
        .status(400)
        .json({ success: false, message: 'Email or name must be provided', data: null });
    }

    try {
      const users = await UserService.searchUsers(userId, email, name);
      if (!users.length) {
        return res.status(400).json({ success: false, message: 'No users found', data: null });
      }

      const usersWithStatus = await Promise.all(
        users.map(async (user: any) => {
          const relationship = await UserService.getRelationshipStatus(userId, user._id.toString());
          return {
            ...user.toObject(),
            relationshipStatus: relationship.status,
            isSender: relationship.isSender,
            friendshipId: relationship.friendshipId,
          };
        }),
      );

      return res
        .status(200)
        .json({ success: true, message: 'Get users successfully', data: usersWithStatus });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },

  async getCurrentUser(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found', data: null });
      }

      return res
        .status(200)
        .json({ success: true, message: 'Get current user successfully', data: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required', data: null });
    }

    try {
      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found', data: null });
      }

      return res.status(200).json({ success: true, message: 'Get user successfully', data: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },

  async sendFriendRequest(req: Request, res: Response) {
    const { receiverId } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: 'Receiver ID is required', data: null });
    }

    try {
      const friendRequest = await UserService.sendFriendRequest(senderId, receiverId);
      return res.status(201).json({
        success: true,
        message: 'Friend request sent successfully',
        data: friendRequest,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async acceptFriendRequest(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Request ID is required', data: null });
    }

    try {
      const result = await UserService.acceptFriendRequest(id, userId);

      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();

        const requesterSocketId = onlineUsers.get(result.requesterId);
        if (requesterSocketId) {
          io.to(requesterSocketId).emit('conversation:created', {
            conversationId: result.conversationId,
            participantId: result.requesterId,
            friendId: result.recipientId,
          });
        }

        const recipientSocketId = onlineUsers.get(result.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('conversation:created', {
            conversationId: result.conversationId,
            participantId: result.recipientId,
            friendId: result.requesterId,
          });
        }
      } catch (socketError) {
        console.error('Failed to emit socket event:', socketError);
      }

      return res.status(200).json({
        success: true,
        message: 'Friend request accepted',
        data: { friendRequest: result.friendRequest, conversationId: result.conversationId },
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async rejectFriendRequest(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Request ID is required', data: null });
    }

    try {
      const friendRequest = await UserService.rejectFriendRequest(id, userId);
      return res.status(200).json({
        success: true,
        message: 'Friend request rejected',
        data: friendRequest,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async cancelFriendRequest(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Request ID is required', data: null });
    }

    try {
      const result = await UserService.cancelFriendRequest(id, userId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async getFriendsList(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const friends = await UserService.getFriendsList(userId);
      return res.status(200).json({
        success: true,
        message: 'Get friends list successfully',
        data: friends,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },

  async getPendingRequests(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      console.log('Getting pending requests for user:', userId);
      const pendingRequests = await UserService.getPendingRequests(userId);
      console.log('Found pending requests:', pendingRequests.length);
      return res.status(200).json({
        success: true,
        message: 'Get pending requests successfully',
        data: pendingRequests,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },

  async updateProfile(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    const { name, avatar, phone, oldPassword, password } = req.body;

    try {
      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found', data: null });
      }

      if (password) {
        if (!oldPassword) {
          return res
            .status(400)
            .json({ success: false, message: 'Old password is required', data: null });
        }

        const isValidPassword = await comparePassword(oldPassword, user.password);
        if (!isValidPassword) {
          return res
            .status(400)
            .json({ success: false, message: 'Old password is incorrect', data: null });
        }

        user.password = await hashPassword(password);
      }

      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (phone) user.phone = phone;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },

  async unfriend(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { targetUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!targetUserId) {
      return res
        .status(400)
        .json({ success: false, message: 'Target user ID is required', data: null });
    }

    try {
      const result = await UserService.unfriend(userId, targetUserId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },
  async getConversations(req: Request, res: Response) {
    const userId = req.user?.userId;

    console.log('user_id', userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const conversations = await UserService.getConversations(userId);

      return res.status(200).json({
        success: true,
        message: 'Get conversations successfully',
        data: conversations.map((conv) => ({
          _id: conv._id,
          participants: conv.participants
            .map((p) => ({
              _id: p._id,
              name: p.name,
              avatar: p.avatar,
              isOnline: p.isOnline,
            }))
            .filter((p) => p._id.toString() !== userId),
          lastMessage: conv.lastMessage || null,
          unreadCount: conv.unreadCount,
          isPinned: conv.isPinned,
          isMuted: conv.isMuted,
          isArchived: conv.isArchived,
          isGroup: conv.isGroup,
          groupName: conv.groupName,
          groupAvatar: conv.groupAvatar,
          admin: conv.admin,
        })),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Server error', data: error });
    }
  },
  async getConversationById(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
        data: null,
      });
    }

    try {
      const conversation = await UserService.getConversationById(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Get conversation successfully',
        data: {
          _id: conversation._id,
          lastMessage: conversation.lastMessage || null,
          isPinned: conversation.isPinned,
          isMuted: conversation.isMuted,
          isArchived: conversation.isArchived,
          isGroup: conversation.isGroup,
          groupName: conversation.groupName,
          groupAvatar: conversation.groupAvatar,
          admin: conversation.admin,
          participants: conversation.participants
            .map((p) => ({
              _id: p._id,
              name: p.name,
              avatar: p.avatar,
              isOnline: p.isOnline,
            }))
            .filter((p) => p._id.toString() !== userId),
          unreadCount: conversation.unreadCount,
        },
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async createGroupConversation(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { groupName, participantIds, groupAvatar } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!groupName || !participantIds || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group name and participants are required',
        data: null,
      });
    }

    try {
      const conversation = await UserService.createGroupConversation(
        userId,
        groupName,
        participantIds,
        groupAvatar,
      );

      // Emit socket event to all participants
      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();

        const allParticipants = [userId, ...participantIds];
        for (const participantId of allParticipants) {
          const socketId = onlineUsers.get(participantId);
          if (socketId) {
            io.to(socketId).emit('conversation:created', {
              conversationId: (conversation as any)._id.toString(),
              participantId: participantId,
              friendId: '',
            });
          }
        }
      } catch (socketError) {
        console.error('Failed to emit socket event:', socketError);
      }

      return res.status(201).json({
        success: true,
        message: 'Group conversation created successfully',
        data: conversation,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async searchConversations(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { query } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        data: null,
      });
    }

    try {
      const conversations = await UserService.searchConversations(userId, query);

      return res.status(200).json({
        success: true,
        message: 'Search conversations successfully',
        data: conversations.map((conv: any) => ({
          _id: conv._id,
          participants: conv.participants
            .map((p: any) => ({
              _id: p._id,
              name: p.name,
              avatar: p.avatar,
              isOnline: p.isOnline,
            }))
            .filter((p: any) => p._id.toString() !== userId),
          lastMessage: conv.lastMessage || null,
          unreadCount: conv.unreadCount,
          isPinned: conv.isPinned,
          isMuted: conv.isMuted,
          isArchived: conv.isArchived,
          isGroup: conv.isGroup,
          groupName: conv.groupName,
          groupAvatar: conv.groupAvatar,
          admin: conv.admin,
        })),
      });
    } catch (error: any) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async markConversationAsRead(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const result = await UserService.markConversationAsRead(id, userId);
      return res.status(200).json({ success: true, message: result.message, data: null });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async markConversationAsUnread(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const result = await UserService.markConversationAsUnread(id, userId);
      return res.status(200).json({ success: true, message: result.message, data: null });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async deleteConversation(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const result = await UserService.deleteConversation(id, userId);
      return res.status(200).json({ success: true, message: result.message, data: null });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async dissolveGroup(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const result = await UserService.dissolveGroup(id, userId);

      // Emit socket event to all participants
      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();

        if (result.participants) {
          for (const participantId of result.participants) {
            const socketId = onlineUsers.get(participantId);
            if (socketId) {
              io.to(socketId).emit('conversation:deleted', {
                conversationId: id,
                participantIds: result.participants,
              });
            }
          }
        }
      } catch (socketError) {
        console.log('Socket error:', socketError);
      }

      return res.status(200).json({ success: true, message: result.message, data: null });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async getOrCreateDirectConversation(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const conversation = await UserService.getOrCreateDirectConversation(userId, friendId);
      return res.status(200).json({ success: true, message: 'success', data: conversation });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async updateGroupInfo(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { groupName, groupAvatar } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const conversation = await UserService.updateGroupInfo(id, userId, {
        groupName,
        groupAvatar,
      });
      return res.status(200).json({
        success: true,
        message: 'Group info updated successfully',
        data: conversation,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async addGroupMembers(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { memberIds } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Member IDs are required',
        data: null,
      });
    }

    try {
      const conversation = await UserService.addGroupMembers(id, userId, memberIds);

      // Emit socket event to all participants
      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();

        const allParticipants = (conversation as any).participants.map((p: any) =>
          p._id ? p._id.toString() : p.toString(),
        );

        for (const participantId of allParticipants) {
          const socketId = onlineUsers.get(participantId);
          if (socketId) {
            io.to(socketId).emit('conversation:updated', {
              conversationId: id,
              lastMessage: (conversation as any).lastMessage,
              unreadCount: 0,
              participantIds: allParticipants,
            });
          }
        }
      } catch (socketError) {
        console.log('Socket error:', socketError);
      }

      return res.status(200).json({
        success: true,
        message: 'Members added successfully',
        data: conversation,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },

  async removeGroupMember(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { id, memberId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
      const conversation = await UserService.removeGroupMember(id, userId, memberId);

      // Emit socket event to all remaining participants and removed member
      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();

        const allParticipants = (conversation as any).participants.map((p: any) =>
          p._id ? p._id.toString() : p.toString(),
        );

        // Notify all remaining participants
        for (const participantId of allParticipants) {
          const socketId = onlineUsers.get(participantId);
          if (socketId) {
            io.to(socketId).emit('conversation:updated', {
              conversationId: id,
              lastMessage: (conversation as any).lastMessage,
              unreadCount: 0,
              participantIds: allParticipants,
            });
          }
        }

        // Notify removed member to remove conversation from their list
        const removedSocketId = onlineUsers.get(memberId);
        if (removedSocketId) {
          io.to(removedSocketId).emit('conversation:deleted', {
            conversationId: id,
            participantIds: [memberId],
          });
        }
      } catch (socketError) {
        console.log('Socket error:', socketError);
      }

      return res.status(200).json({
        success: true,
        message: 'Member removed successfully',
        data: conversation,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
  },
};
