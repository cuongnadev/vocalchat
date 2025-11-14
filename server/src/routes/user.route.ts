import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();

router.get('/user/search', UserController.searchUsers);
router.post('/user/friends', UserController.sendFriendRequest);
router.patch('/api/friends/:id/accept', UserController.acceptFriendRequest);
router.patch('/api/friends/:id/reject', UserController.rejectFriendRequest);
router.delete('/api/friends/:id', UserController.cancelFriendRequest);
router.get('/api/friends', UserController.getFriendsList);
router.get('/api/friends/requests', UserController.getPendingRequests);
