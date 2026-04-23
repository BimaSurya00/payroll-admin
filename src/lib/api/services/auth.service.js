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
     * @param {string} userId - User ID (required by backend)
     * @returns {Promise} Response with new tokens
     */
    refresh: (refreshToken, userId) => {
        return apiClient.post('/auth/refresh', { refreshToken, userId });
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

    /**
     * Change password
     * @param {Object} data - Password data
     *   { oldPassword, newPassword }
     * @returns {Promise} Response confirmation
     */
    changePassword: (data) => {
        return apiClient.put('/auth/change-password', data);
    },

    /**
     * Forgot password - request reset token
     * @param {string} email - User email
     * @returns {Promise} Response with reset token
     */
    forgotPassword: (email) => {
        return apiClient.post('/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise} Response confirmation
     */
    resetPassword: (token, newPassword) => {
        return apiClient.post('/auth/reset-password', { token, newPassword });
    },
};
