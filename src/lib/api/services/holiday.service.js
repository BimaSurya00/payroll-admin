import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Holiday Service
 * Handles all API calls related to holiday management
 */
export const holidayService = {
    /**
     * Get all holidays with optional pagination and year filter
     * @param {Object} params - Query parameters (page, perPage, year)
     * @returns {Promise} Response with holidays data and pagination
     */
    getAll: (params = {}) => {
        return apiClient.get('/holidays', { params: buildPaginationParams(params) });
    },

    /**
     * Get single holiday by ID
     * @param {string} id - Holiday UUID
     * @returns {Promise} Response with holiday data
     */
    getById: (id) => {
        return apiClient.get(`/holidays/${id}`);
    },

    /**
     * Create new holiday
     * @param {Object} data - Holiday data { name, date, year, isRecurring, description }
     * @returns {Promise} Response with created holiday
     */
    create: (data) => {
        return apiClient.post('/holidays', data);
    },

    /**
     * Update existing holiday
     * @param {string} id - Holiday UUID
     * @param {Object} data - Updated holiday data
     * @returns {Promise} Response with updated holiday
     */
    update: (id, data) => {
        return apiClient.patch(`/holidays/${id}`, data);
    },

    /**
     * Delete holiday
     * @param {string} id - Holiday UUID
     * @returns {Promise} Response confirmation
     */
    delete: (id) => {
        return apiClient.delete(`/holidays/${id}`);
    },

    /**
     * Get holidays by year
     * @param {number} year - Year to filter
     * @returns {Promise} Response with holidays for specified year
     */
    getByYear: (year) => {
        return apiClient.get('/holidays', { params: { year } });
    },
};
