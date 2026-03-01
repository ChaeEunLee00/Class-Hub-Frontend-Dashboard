import type { User } from '../types';
import type { LoginOperationRequest, SignUpOperationRequest, LoginResponse, LoginStatusResponse } from '../generated';
import { delay } from './storage';

const AUTH_KEY = 'classhub_auth_user';
const USERS_KEY = 'classhub_users';

// Helper to get users from localStorage
const getUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

import { AuthServiceInterface } from '../types';

export const authApiMock: AuthServiceInterface = {
    async login(requestParameters: LoginOperationRequest): Promise<LoginResponse> {
        await delay(500); // Simulate network latency
        const { email, password } = requestParameters.loginRequest;

        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('등록되지 않은 이메일입니다.');
        }

        const savedPassword = localStorage.getItem(`password_${email}`);
        if (savedPassword !== password) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // Save session
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        return {
            userId: user.id.includes('_') ? parseInt(user.id.split('_')[1]) : 1,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role === 'admin' ? 'ADMIN' : 'USER',
            profileUrl: user.profileUrl
        } as LoginResponse;
    },

    async signUp(requestParameters: SignUpOperationRequest): Promise<number> {
        await delay(500);
        const { email, name, password, phoneNumber, profileUrl } = requestParameters.signUpRequest;
        const users = getUsers();

        if (users.find(u => u.email === email)) {
            throw new Error('이미 가입된 이메일입니다.');
        }

        const newUser: User = {
            id: `instructor_${Date.now()}`,
            email: email || '',
            name,
            phoneNumber,
            role: 'instructor',
            createdAt: new Date().toISOString(),
            profileUrl,
        };

        users.push(newUser);
        saveUsers(users);

        // Save password separately (simple imitation)
        localStorage.setItem(`password_${email || ''}`, password || '');

        return parseInt(newUser.id.split('_')[1]);
    },

    async logout(): Promise<void> {
        await delay(200);
        localStorage.removeItem(AUTH_KEY);
    },

    async checkLoginStatus(): Promise<LoginStatusResponse> {
        await delay(200);
        if (typeof window === 'undefined') return { loggedIn: false };
        const data = localStorage.getItem(AUTH_KEY);
        const user = data ? JSON.parse(data) : null;
        return {
            loggedIn: !!user,
            username: user ? user.name : undefined
        };
    },

    async refresh(): Promise<void> {
        await delay(200);
        // Mock refresh always succeeds if we are here
    },

    // Extended helper methods (kept for compatibility during migration, or as part of Enhanced interface)
    async getCurrentUser(): Promise<User | null> {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    },

    async isLoggedIn(): Promise<boolean> {
        if (typeof window === 'undefined') return false;
        const data = localStorage.getItem(AUTH_KEY);
        return !!data;
    }
};
