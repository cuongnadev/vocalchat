import { Express } from 'express';
import { authRoutes } from './auth.route';
import { messageRoutes } from './message.route';
import { userRoutes } from './user.route';

const API_VERSION = '/api/v1';
const AppRouters = (app: Express) => {
  app.use(`${API_VERSION}/auth`, authRoutes);
  app.use(`${API_VERSION}/messages`, messageRoutes);
  app.use(`${API_VERSION}/users`, userRoutes);
};

export default AppRouters;
