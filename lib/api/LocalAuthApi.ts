import { AuthApi, LoginOperationRequest, LoginResponse, SignUpOperationRequest } from './generated';
import { User, AuthServiceInterface } from './types';

const AUTH_KEY = 'classhub_auth_user';

export class LocalAuthApi extends AuthApi implements AuthServiceInterface {

    async login(requestParameters: LoginOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<LoginResponse> {
        const response = await super.login(requestParameters, initOverrides);

        // Save user info to localStorage
        const user: User = {
            id: String(response.userId),
            email: requestParameters.loginRequest.email,
            name: response.name || '',
            phoneNumber: response.phoneNumber || '',
            role: response.role?.toLowerCase() || '',
            createdAt: new Date().toISOString(), // Server doesn't return this in LoginResponse
            profileUrl: response.profileUrl || '',
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        }

        return response;
    }

    async logout(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        try {
            await super.logout(initOverrides);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(AUTH_KEY);
            }
        }
    }

    async getCurrentUser(): Promise<User | null> {
        if (typeof window === 'undefined') return null;

        const userData = localStorage.getItem(AUTH_KEY);
        if (!userData) return null;

        try {
            // Check session status with server
            const status = await this.checkLoginStatus();

            if (!status.loggedIn) {
                // Try refresh
                console.log('[LocalAuthApi] Session check returned false. Attempting manual refresh...');
                await this.refresh();
                const newStatus = await this.checkLoginStatus();
                if (newStatus.loggedIn) {
                    return JSON.parse(userData);
                }
            } else {
                return JSON.parse(userData);
            }
        } catch (error) {
            console.error('[LocalAuthApi] Session check failed', error);
            // Return local data optimistically or null? 
            // Existing logic returned local data optimistically on error.
            return JSON.parse(userData);
        }

        console.warn('[LocalAuthApi] User session invalid. Clearing local data.');
        localStorage.removeItem(AUTH_KEY);
        return null;
    }

    async isLoggedIn(): Promise<boolean> {
        const user = await this.getCurrentUser();
        return !!user;
    }
}

import * as runtime from './generated/runtime';
