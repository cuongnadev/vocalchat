import { requestApi } from './request';
import type { User } from '@/types/api';

export const searchUser = (query: string) => {
  return requestApi<User[]>(`/users/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
};

export const sendFriendRequest = (recipientId: string) => {
  return requestApi<{ id: string }>('/friends', {
    method: 'POST',
    body: JSON.stringify({ recipientId }),
  });
};

export const acceptFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/friends/${requestId}/accept`, {
    method: 'PATCH',
  });
};

export const rejectFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/friends/${requestId}/reject`, {
    method: 'PATCH',
  });
};

export const cancelFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/friends/${requestId}`, {
    method: 'DELETE',
  });
};

export const getFriendsList = (userId: string) => {
  return requestApi<User[]>(`/friends?userId=${userId}`, {
    method: 'GET',
  });
};

export const getPendingRequests = (userId: string) => {
  return requestApi<User[]>(`/friends/requests?userId=${userId}`, {
    method: 'GET',
  });
};
