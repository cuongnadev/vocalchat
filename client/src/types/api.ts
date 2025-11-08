export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export interface User {
  _id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  isOnline?: boolean;
  lastSeen?: string;
}

export type RegisterResponse = ApiResponse<{ user_id: string }>;
export type VerifyResponse = ApiResponse<{ user: User }>;
export type UpdateProfileResponse = ApiResponse<{ user: User; token: string }>;
export type LoginResponse = ApiResponse<{ user: User; token: string }>;

export interface ApiError {
  message: string;
  status?: number;
}