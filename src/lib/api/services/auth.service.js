import apiClient from '../client.js';

/**
 * Auth Service
 * Handles all authentication API calls
 */
export const authService = {
    /**
     * User login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Response with user data and tokens
     */
    login: (email, password) => {
        return apiClient.post('/auth/login', { email, password });
    },

    /**
     * User registration
     * @param {Object} data - Registration data { name, email, password, role }
     * @returns {Promise} Response with user data and tokens
     */
    register: (data) => {
        return apiClient.post('/auth/register', data);
    },

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise} Response with new tokens
     */
    refresh: (refreshToken) => {
        return apiClient.post('/auth/refresh', { refreshToken });
    },

    /**
     * Logout from current device
     * @param {string} refreshToken - Refresh token to invalidate
     * @returns {Promise} Response confirmation
     */
    logout: (refreshToken) => {
        return apiClient.post('/auth/logout', { refreshToken });
    },

    /**
     * Logout from all devices
     * @returns {Promise} Response confirmation
     */
    logoutAll: () => {
        return apiClient.post('/auth/logout-all');
    },
};
