import { requestApi } from "./request";
import type { User } from "@/types/api";

export const searchUsers = (email?: string, name?: string) => {
  return requestApi<User[]>("/user/search", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
};

export const getUserById = (userId: string) => {
  return requestApi<User>(`/user/${userId}`, {
    method: "GET",
  });
};

export const getCurrentUser = () => {
  return requestApi<User>("/user/me", {
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
  return requestApi<User>("/user/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const sendFriendRequest = (receiverId: string) => {
  return requestApi<{ requester: string; recipient: string; status: string }>(
    "/user/friends/request",
    {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    }
  );
};

export const acceptFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/user/friends/${requestId}/accept`, {
    method: "PATCH",
  });
};

export const rejectFriendRequest = (requestId: string) => {
  return requestApi<{ status: string }>(`/user/friends/${requestId}/reject`, {
    method: "PATCH",
  });
};

export const cancelFriendRequest = (requestId: string) => {
  return requestApi<{ message: string }>(`/user/friends/${requestId}`, {
    method: "DELETE",
  });
};

export const getFriendsList = () => {
  return requestApi<User[]>("/user/friends/list", {
    method: "GET",
  });
};

export const getPendingRequests = () => {
  return requestApi<Array<{ _id: string; requester: User; status: string }>>(
    "/user/friends/pending",
    {
      method: "GET",
    }
  );
};

export const unfriend = (targetUserId: string) => {
  return requestApi<{ message: string }>("/user/friends/unfriend", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
};
