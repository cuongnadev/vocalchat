import type { User } from "@/types/user";
import type { UserResponse } from "@/types/api";
import { requestApi } from "./request";
import type { Conversation } from "@/types/message";

export const searchUsers = (email?: string, name?: string) => {
  return requestApi<UserResponse[]>("/users/search", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
};

export const getUserById = (userId: string) => {
  return requestApi<User>(`/users/${userId}`, {
    method: "GET",
  });
};

export const getCurrentUser = () => {
  return requestApi<User>("/users/me", {
    method: "GET",
  });
};

export const updateUserProfile = (data: {
  name?: string;
  avatar?: string;
  phone?: string;
  oldPassword?: string;
  password?: string;
}) => {
  return requestApi<User>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const sendFriendRequest = (receiverId: string) => {
  return requestApi<{ requester: string; recipient: string; status: string }>(
    "/users/friends/request",
    {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    }
  );
};

export const acceptFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/users/friends/${requestId}/accept`, {
    method: "PATCH",
  });
};

export const rejectFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/users/friends/${requestId}/reject`, {
    method: "PATCH",
  });
};

export const cancelFriendRequest = (requestId: string) => {
  return requestApi<{ message: string }>(`/users/friends/${requestId}`, {
    method: "DELETE",
  });
};

export const getFriendsList = () => {
  return requestApi<User[]>("/users/friends/list", {
    method: "GET",
  });
};

export const getPendingRequests = () => {
  return requestApi<Array<{ _id: string; requester: User; status: string }>>(
    "/users/friends/pending",
    {
      method: "GET",
    }
  );
};

export const unfriend = (targetUserId: string) => {
  return requestApi<{ message: string }>("/users/friends/unfriend", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
};

export const getConversations = () => {
  return requestApi<Conversation[]>("/users/conversations", {
    method: "GET",
  });
};

export const getConversationById = (id: string) => {
  return requestApi<Conversation>(`/users/conversations/${id}`, {
    method: "GET",
  });
};

