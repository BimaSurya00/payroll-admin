import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Department Service
 * Handles all API calls related to department management
 */
export const departmentService = {
    /**
     * Get all departments
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with departments data
     */
    getAll: (params = {}) => {
        return apiClient.get('/departments', { params: buildPaginationParams(params) });
    },

    /**
     * Get single department by ID
     * @param {string} id - Department UUID
     * @returns {Promise} Response with department data
     */
    getById: (id) => {
        return apiClient.get(`/departments/${id}`);
    },

    /**
     * Create new department
     * @param {Object} data - Department data { name, description, managerId }
     * @returns {Promise} Response with created department
     */
    create: (data) => {
        return apiClient.post('/departments', data);
    },

    /**
     * Update existing department
     * @param {string} id - Department UUID
     * @param {Object} data - Updated department data
     * @returns {Promise} Response with updated department
     */
    update: (id, data) => {
        return apiClient.patch(`/departments/${id}`, data);
    },

    /**
     * Delete department
     * @param {string} id - Department UUID
     * @returns {Promise} Response confirmation
     */
    delete: (id) => {
        return apiClient.delete(`/departments/${id}`);
    },
};
