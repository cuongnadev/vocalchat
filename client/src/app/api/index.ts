import type { ApiResponse, User } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const DEPLOYMENT_URL = import.meta.env.VITE_API_DEPLOYMENT_URL;

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    return res.json();
}

export const register = (email: string, password: string) =>
    fetchApi<{ user_id: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const verifyOtp = (email: string, code: string) =>
    fetchApi<{ user: User }>('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
    });

export const updateProfile = (email: string, name: string) =>
    fetchApi<{ user: User; token: string }>('/auth/update-info', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
    });

export const login = (email: string, password: string) =>
    fetchApi<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
