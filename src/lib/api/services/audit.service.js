import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Audit Service
 * Handles all API calls related to audit logs and activity tracking
 */
export const auditService = {
    /**
     * Get all audit logs with optional filters
     * @param {Object} params - Query parameters
     *   { page, perPage, action, resourceType, userId, dateFrom, dateTo }
     * @returns {Promise} Response with audit logs and pagination
     */
    getAll: (params = {}) => {
        const { page, perPage, action, resourceType, userId, dateFrom, dateTo, ...rest } = params;
        const queryParams = buildPaginationParams({ page, perPage });

        // Add optional filters
        if (action) queryParams.action = action;
        if (resourceType) queryParams.resource_type = resourceType;
        if (userId) queryParams.user_id = userId;
        if (dateFrom) queryParams.date_from = dateFrom;
        if (dateTo) queryParams.date_to = dateTo;

        return apiClient.get('/audit/logs', { params: { ...queryParams, ...rest } });
    },

    /**
     * Get audit logs for a specific resource
     * @param {string} resourceType - Resource type (e.g., 'employee', 'user', 'payroll')
     * @param {string} resourceId - Resource UUID
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with audit logs for the resource
     */
    getByResource: (resourceType, resourceId, params = {}) => {
        return apiClient.get(`/audit/logs/${resourceType}/${resourceId}`, {
            params: buildPaginationParams(params),
        });
    },

    /**
     * Get audit logs for a specific user
     * @param {string} userId - User UUID
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with user activity logs
     */
    getByUser: (userId, params = {}) => {
        return apiClient.get('/audit/logs', {
            params: {
                ...buildPaginationParams(params),
                user_id: userId,
            },
        });
    },

    /**
     * Get audit logs by action type
     * @param {string} action - Action type (CREATE, UPDATE, DELETE, etc.)
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with filtered audit logs
     */
    getByAction: (action, params = {}) => {
        return apiClient.get('/audit/logs', {
            params: {
                ...buildPaginationParams(params),
                action: action,
            },
        });
    },

    /**
     * Get recent audit logs
     * @param {number} limit - Number of logs to fetch (default: 20)
     * @returns {Promise} Response with recent audit logs
     */
    getRecent: (limit = 20) => {
        return apiClient.get('/audit/logs', {
            params: { per_page: limit },
        });
    },
};
