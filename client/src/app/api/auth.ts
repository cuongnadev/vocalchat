import type { User } from '@/types/api';
import { requestApi } from './request';


export const register = (email: string, password: string) =>
    requestApi<{ user_id: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const verifyOtp = (email: string, code: string) =>
    requestApi<{ user: User }>('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
    });

export const updateProfile = (email: string, name: string) =>
    requestApi<{ user: User; token: string }>('/auth/update-info', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
    });

export const login = (email: string, password: string) =>
    requestApi<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
