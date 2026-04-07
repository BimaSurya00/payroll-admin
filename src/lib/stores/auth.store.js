import { writable, get } from 'svelte/store';
import { authService } from '$lib/api/services/auth.service.js';

/**
 * Auth Store
 * Manages authentication state with localStorage persistence
 */
function createAuthStore() {
    const initialState = {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    };

    // Load initial state from localStorage
    const loadFromStorage = () => {
        if (typeof window === 'undefined') return initialState;

        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            const user = localStorage.getItem('user');

            if (token && user) {
                return {
                    user: JSON.parse(user),
                    accessToken: token,
                    refreshToken: refreshToken,
                    isAuthenticated: true,
                    loading: false,
                    error: null,
                };
            }
        } catch (e) {
            console.error('Error loading auth from storage:', e);
        }

        return initialState;
    };

    const { subscribe, set, update } = writable(loadFromStorage());

    // Helper to save to localStorage
    const saveToStorage = (user, accessToken, refreshToken) => {
        if (typeof window === 'undefined') return;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
    };

    // Helper to clear localStorage
    const clearStorage = () => {
        if (typeof window === 'undefined') return;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };

    return {
        subscribe,

        /**
         * User login
         * @param {string} email 
         * @param {string} password 
         */
        login: async (email, password) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await authService.login(email, password);
                const { user, accessToken, refreshToken } = response.data;

                saveToStorage(user, accessToken, refreshToken);

                update((state) => ({
                    ...state,
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Login failed',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * User registration
         * @param {Object} data - { name, email, password, role }
         */
        register: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await authService.register(data);
                const { user, accessToken, refreshToken } = response.data;

                saveToStorage(user, accessToken, refreshToken);

                update((state) => ({
                    ...state,
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Registration failed',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Logout current device
         */
        logout: async () => {
            const currentState = get({ subscribe });

            try {
                if (currentState.refreshToken) {
                    await authService.logout(currentState.refreshToken);
                }
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                clearStorage();
                set(initialState);
            }
        },

        /**
         * Logout from all devices
         */
        logoutAll: async () => {
            try {
                await authService.logoutAll();
            } catch (error) {
                console.error('Logout all error:', error);
            } finally {
                clearStorage();
                set(initialState);
            }
        },

        /**
         * Change password
         * @param {string} oldPassword - Current password
         * @param {string} newPassword - New password
         */
        changePassword: async (oldPassword, newPassword) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await authService.changePassword({
                    oldPassword,
                    newPassword,
                });

                update((state) => ({ ...state, loading: false, error: null }));

                return response.data;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to change password',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Refresh access token
         */
        refreshAccessToken: async () => {
            const currentState = get({ subscribe });

            if (!currentState.refreshToken || !currentState.user?.id) {
                throw new Error('No refresh token or user ID available');
            }

            try {
                const response = await authService.refresh(currentState.refreshToken, currentState.user.id);
                const { accessToken, refreshToken } = response.data;

                saveToStorage(currentState.user, accessToken, refreshToken);

                update((state) => ({
                    ...state,
                    accessToken,
                    refreshToken,
                }));

                return response;
            } catch (error) {
                // If refresh fails, logout
                clearStorage();
                set(initialState);
                throw error;
            }
        },

        /**
         * Check if user is authenticated
         */
        checkAuth: () => {
            const state = get({ subscribe });
            return state.isAuthenticated && state.accessToken;
        },

        /**
         * Clear error
         */
        clearError: () => {
            update((state) => ({ ...state, error: null }));
        },

        /**
         * Reset store
         */
        reset: () => {
            clearStorage();
            set(initialState);
        },
    };
}

export const authStore = createAuthStore();
