import api from '../utils/api';
import { UserLogin, UserRegister, Token, UserResponse } from '../types';
import { database } from '../database';
import { seedDefaultData } from '../database/seedDefaultData';
import { sync } from '../database/sync';

export const authService = {
    async register(data: UserRegister): Promise<Token> {
        const response = await api.post<Token>('/auth/register', data);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    async login(data: UserLogin): Promise<Token> {
        const response = await api.post<Token>('/auth/login', data);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            // Also store family_id if needed
            if (response.data.family_id) {
                localStorage.setItem('family_id', response.data.family_id);
            }
        }
        return response.data;
    },

    async getMe(): Promise<UserResponse> {
        const response = await api.get<UserResponse>('/auth/me');
        return response.data;
    },

    async joinFamily(inviteCode: string, data: UserRegister): Promise<Token> {
        const response = await api.post<Token>('/auth/join-family', {
            ...data,
            invite_code: inviteCode
        });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            if (response.data.family_id) {
                localStorage.setItem('family_id', response.data.family_id);
            }
            // Clear local database to prevent data duplication/mixing
            await database.write(async () => {
                await database.unsafeResetDatabase();
            });
            await seedDefaultData();
            await sync();
        }
        return response.data;
    },

    async joinFamilyAfterAuth(inviteCode: string): Promise<Token> {
        const response = await api.post<Token>('/family/join', {
            invite_code: inviteCode
        });
        // We might get a new token or just success. If new token, save it.
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            if (response.data.family_id) {
                localStorage.setItem('family_id', response.data.family_id);
            }
            // Clear local database to prevent data duplication/mixing
            await database.write(async () => {
                await database.unsafeResetDatabase();
            });
            await seedDefaultData();
            await sync();
        }
        return response.data;
    },

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('family_id');
        localStorage.removeItem('user');

        // Clear local database to prevent data leakage between users
        try {
            await database.write(async () => {
                await database.unsafeResetDatabase();
            });
        } catch (error) {
            console.error('Error resetting database on logout:', error);
        }

        // Force reload to ensure database adapter and state is fresh
        window.location.reload();
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },

    async requestPasswordReset(email: string): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>('/auth/password-reset/request', { email });
        return response.data;
    },

    async getFamilyDetails(): Promise<any> {
        const response = await api.get('/family/');
        return response.data;
    },

    async leaveFamily(): Promise<Token> {
        const response = await api.post<Token>('/family/leave');
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            if (response.data.family_id) {
                localStorage.setItem('family_id', response.data.family_id);
            }
            // Clear local database to prevent data duplication/mixing
            await database.write(async () => {
                await database.unsafeResetDatabase();
            });
            await seedDefaultData();
            await sync();
        }
        return response.data;
    },

    async removeFamilyMember(userId: string): Promise<any> {
        const response = await api.post('/family/remove-member', { user_id: userId });
        return response.data;
    }
};
