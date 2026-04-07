import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Leave Service
 * Handles all API calls related to leave management
 */
export const leaveService = {
    /**
     * Get leave balances for current user
     * @param {number} year - Optional year filter
     * @returns {Promise} Response with leave balances
     */
    getMyBalances: (year = new Date().getFullYear()) => {
        return apiClient.get('/leave/balances/my', { params: { year } });
    },

    /**
     * Get own leave requests with pagination
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with leave requests
     */
    getMyRequests: (params = {}) => {
        return apiClient.get('/leave/requests/my', { params: buildPaginationParams(params) });
    },

    /**
     * Get all leave requests (Admin/Super User only)
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with all leave requests
     */
    getAll: (params = {}) => {
        const { page, perPage, employeeId, status, dateFrom, dateTo, ...rest } = params;
        const queryParams = buildPaginationParams({ page, perPage });

        if (employeeId) queryParams.employee_id = employeeId;
        if (status) queryParams.status = status;
        if (dateFrom) queryParams.date_from = dateFrom;
        if (dateTo) queryParams.date_to = dateTo;

        return apiClient.get('/leave/requests', { params: { ...queryParams, ...rest } });
    },

    /**
     * Get pending leave requests (Admin/Super User only)
     * @returns {Promise} Response with pending leave requests
     */
    getPending: () => {
        return apiClient.get('/leave/requests/pending');
    },

    /**
     * Get leave request by ID
     * @param {string} id - Leave request ID
     * @returns {Promise} Response with leave request data
     */
    getById: (id) => {
        return apiClient.get(`/leave/requests/${id}`);
    },

    /**
     * Create new leave request
     * @param {Object} data - Leave request data
     *   { leaveTypeId, startDate, endDate, reason, emergencyContact }
     * @returns {Promise} Response with created leave request
     */
    create: (data) => {
        return apiClient.post('/leave/requests', data);
    },

    /**
     * Approve leave request (Admin/Super User only)
     * @param {string} id - Leave request ID
     * @param {string} note - Optional approval note
     * @returns {Promise} Response confirmation
     */
    approve: (id, note = '') => {
        return apiClient.put(`/leave/requests/${id}/approve`, { approvalNote: note });
    },

    /**
     * Reject leave request (Admin/Super User only)
     * @param {string} id - Leave request ID
     * @param {string} reason - Rejection reason (required)
     * @returns {Promise} Response confirmation
     */
    reject: (id, reason) => {
        return apiClient.put(`/leave/requests/${id}/reject`, { rejectionReason: reason });
    },

    /**
     * Cancel own leave request
     * @param {string} id - Leave request ID
     * @returns {Promise} Response confirmation
     */
    cancel: (id) => {
        return apiClient.put(`/leave/requests/${id}/cancel`);
    },

    /**
     * Get leave types
     * @returns {Promise} Response with leave types
     */
    getLeaveTypes: () => {
        return apiClient.get('/leave/types');
    },

    /**
     * Get all leave types including inactive (Admin/Super User only)
     * @returns {Promise} Response with all leave types
     */
    getAllLeaveTypes: () => {
        return apiClient.get('/leave/types/all');
    },

    /**
     * Get leave type by ID (Admin/Super User only)
     * @param {string} id - Leave type ID
     * @returns {Promise} Response with leave type data
     */
    getLeaveTypeById: (id) => {
        return apiClient.get(`/leave/types/${id}`);
    },

    /**
     * Create new leave type (Admin/Super User only)
     * @param {Object} data - Leave type data
     *   { name, code, description, defaultDays, isPaid, isActive, color }
     * @returns {Promise} Response with created leave type
     */
    createLeaveType: (data) => {
        return apiClient.post('/leave/types', data);
    },

    /**
     * Update leave type (Admin/Super User only)
     * @param {string} id - Leave type ID
     * @param {Object} data - Updated leave type data
     * @returns {Promise} Response with updated leave type
     */
    updateLeaveType: (id, data) => {
        return apiClient.put(`/leave/types/${id}`, data);
    },

    /**
     * Delete leave type (Admin/Super User only)
     * @param {string} id - Leave type ID
     * @returns {Promise} Response confirmation
     */
    deleteLeaveType: (id) => {
        return apiClient.delete(`/leave/types/${id}`);
    },
};
