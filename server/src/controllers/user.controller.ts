import { Request, Response } from 'express';

export const UserController = {
  async searchUsers(req: Request, res: Response) {},
  async getUserById(req: Request, res: Response) {},
  async sendFriendRequest(req: Request, res: Response) {},
  async acceptFriendRequest(req: Request, res: Response) {},
  async rejectFriendRequest(req: Request, res: Response) {},
  async cancelFriendRequest(req: Request, res: Response) {},
  async getFriendsList(req: Request, res: Response) {},
  async getPendingRequests(req: Request, res: Response) {},
};
