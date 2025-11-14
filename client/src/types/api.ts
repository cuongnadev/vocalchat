export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export interface UserResponse {
  _id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  isOnline?: boolean;
  lastSeen?: string;
}

export type RegisterResponse = ApiResponse<{ user_id: string }>;
export type VerifyResponse = ApiResponse<{ user: UserResponse }>;
export type UpdateProfileResponse = ApiResponse<{ user: UserResponse; token: string }>;
export type LoginResponse = ApiResponse<{ user: UserResponse; token: string }>;

export interface ApiError {
  message: string;
  status?: number;
}
