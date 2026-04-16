import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Schedule Service
 * Handles all API calls related to work schedules
 */
export const scheduleService = {
    /**
     * Get all schedules with optional pagination
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with schedules data and pagination
     */
    getAll: (params = {}) => {
        return apiClient.get('/schedules', { params: buildPaginationParams(params) });
    },

    /**
     * Get single schedule by ID
     * @param {string} id - Schedule UUID
     * @returns {Promise} Response with schedule data
     */
    getById: (id) => {
        return apiClient.get(`/schedules/${id}`);
    },

    /**
     * Create new schedule
     * @param {Object} data - Schedule data
     *   { name, timeIn, timeOut, allowedLateMinutes }
     * @returns {Promise} Response with created schedule
     */
    create: (data) => {
        return apiClient.post('/schedules', data);
    },

    /**
     * Update existing schedule
     * @param {string} id - Schedule UUID
     * @param {Object} data - Updated schedule data (partial)
     * @returns {Promise} Response with updated schedule
     */
    update: (id, data) => {
        return apiClient.patch(`/schedules/${id}`, data);
    },

    /**
     * Delete schedule
     * @param {string} id - Schedule UUID
     * @returns {Promise} Response confirmation
     */
    delete: (id) => {
        return apiClient.delete(`/schedules/${id}`);
    },
};
