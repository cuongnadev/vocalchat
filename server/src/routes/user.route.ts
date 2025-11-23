import { UserController } from '@/controllers/user.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/conversations', authMiddleware, UserController.getConversations);
router.get('/conversations/search', authMiddleware, UserController.searchConversations);
router.get(
  '/conversations/direct/:friendId',
  authMiddleware,
  UserController.getOrCreateDirectConversation,
);
router.post('/conversations/group', authMiddleware, UserController.createGroupConversation);
router.patch('/conversations/:id/read', authMiddleware, UserController.markConversationAsRead);
router.patch('/conversations/:id/unread', authMiddleware, UserController.markConversationAsUnread);
router.delete('/conversations/:id', authMiddleware, UserController.deleteConversation);
router.delete('/conversations/:id/dissolve', authMiddleware, UserController.dissolveGroup);
router.patch('/conversations/:id/group', authMiddleware, UserController.updateGroupInfo);
router.post('/conversations/:id/members', authMiddleware, UserController.addGroupMembers);
router.delete(
  '/conversations/:id/members/:memberId',
  authMiddleware,
  UserController.removeGroupMember,
);
router.post('/search', authMiddleware, UserController.searchUsers);
router.get('/me', authMiddleware, UserController.getCurrentUser);
router.patch('/me', authMiddleware, UserController.updateProfile);
router.get('/:id', UserController.getUserById);
router.get('/conversations/:id', authMiddleware, UserController.getConversationById);
router.post('/friends/request', authMiddleware, UserController.sendFriendRequest);
router.patch('/friends/:id/accept', authMiddleware, UserController.acceptFriendRequest);
router.patch('/friends/:id/reject', authMiddleware, UserController.rejectFriendRequest);
router.delete('/friends/:id', authMiddleware, UserController.cancelFriendRequest);
router.post('/friends/unfriend', authMiddleware, UserController.unfriend);
router.get('/friends/list', authMiddleware, UserController.getFriendsList);
router.get('/friends/pending', authMiddleware, UserController.getPendingRequests);

export const userRoutes = router;
