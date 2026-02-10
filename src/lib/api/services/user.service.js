import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * User Service
 * Handles all API calls related to user management
 */
export const userService = {
    /**
     * Get current user profile
     * @returns {Promise} Response with user profile
     */
    getMe: () => {
        return apiClient.get('/users/me');
    },

    /**
     * Get all users with optional pagination
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with users data and pagination
     */
    getAll: (params = {}) => {
        return apiClient.get('/users', { params: buildPaginationParams(params) });
    },

    /**
     * Get single user by ID
     * @param {string} id - User UUID
     * @returns {Promise} Response with user data
     */
    getById: (id) => {
        return apiClient.get(`/users/${id}`);
    },

    /**
     * Create new user
     * @param {Object} data - User data { name, email, password, role }
     * @returns {Promise} Response with created user
     */
    create: (data) => {
        return apiClient.post('/users', data);
    },

    /**
     * Update existing user
     * @param {string} id - User UUID
     * @param {Object} data - Updated user data (partial)
     * @returns {Promise} Response with updated user
     */
    update: (id, data) => {
        return apiClient.patch(`/users/${id}`, data);
    },

    /**
     * Delete user
     * @param {string} id - User UUID
     * @returns {Promise} Response confirmation
     */
    delete: (id) => {
        return apiClient.delete(`/users/${id}`);
    },

    /**
     * Upload profile image
     * @param {string} id - User UUID
     * @param {File} file - Image file (JPG, PNG, max 2MB)
     * @returns {Promise} Response with image URL
     */
    uploadProfileImage: (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        return apiClient.post(`/users/${id}/profile-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Update profile image
     * @param {string} id - User UUID
     * @param {File} file - Image file (JPG, PNG, max 2MB)
     * @returns {Promise} Response with image URL
     */
    updateProfileImage: (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        return apiClient.put(`/users/${id}/profile-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Delete profile image
     * @param {string} id - User UUID
     * @returns {Promise} Response confirmation
     */
    deleteProfileImage: (id) => {
        return apiClient.delete(`/users/${id}/profile-image`);
    },
};
