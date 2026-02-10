import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Overtime Service
 * Handles all API calls related to overtime management
 */
export const overtimeService = {
    /**
     * Get active overtime policies
     * @returns {Promise} Response with overtime policies
     */
    getPolicies: () => {
        return apiClient.get('/overtime/policies');
    },

    /**
     * Get own overtime requests with pagination
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with overtime requests
     */
    getMyRequests: (params = {}) => {
        return apiClient.get('/overtime/requests/my', { params: buildPaginationParams(params) });
    },

    /**
     * Get all overtime requests (Admin/Super User only)
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with all overtime requests
     */
    getAll: (params = {}) => {
        const { page, perPage, employeeId, status, dateFrom, dateTo, ...rest } = params;
        const queryParams = buildPaginationParams({ page, perPage });

        if (employeeId) queryParams.employee_id = employeeId;
        if (status) queryParams.status = status;
        if (dateFrom) queryParams.date_from = dateFrom;
        if (dateTo) queryParams.date_to = dateTo;

        return apiClient.get('/overtime/requests', { params: { ...queryParams, ...rest } });
    },

    /**
     * Get pending overtime requests (Admin/Super User only)
     * @returns {Promise} Response with pending overtime requests
     */
    getPending: () => {
        return apiClient.get('/overtime/requests/pending');
    },

    /**
     * Get overtime request by ID
     * @param {string} id - Overtime request ID
     * @returns {Promise} Response with overtime request data
     */
    getById: (id) => {
        return apiClient.get(`/overtime/requests/${id}`);
    },

    /**
     * Create new overtime request
     * @param {Object} data - Overtime request data
     *   { overtimeDate, startTime, endTime, reason, overtimePolicyId }
     * @returns {Promise} Response with created overtime request
     */
    create: (data) => {
        return apiClient.post('/overtime/requests', data);
    },

    /**
     * Clock in for overtime
     * @param {string} id - Overtime request ID
     * @param {string} notes - Optional notes
     * @returns {Promise} Response with clock in data
     */
    clockIn: (id, notes = '') => {
        return apiClient.post(`/overtime/requests/${id}/clock-in`, { notes });
    },

    /**
     * Clock out from overtime
     * @param {string} id - Overtime request ID
     * @param {string} notes - Optional notes
     * @returns {Promise} Response with clock out data
     */
    clockOut: (id, notes = '') => {
        return apiClient.post(`/overtime/requests/${id}/clock-out`, { notes });
    },

    /**
     * Approve overtime request (Admin/Super User only)
     * @param {string} id - Overtime request ID
     * @returns {Promise} Response confirmation
     */
    approve: (id) => {
        return apiClient.put(`/overtime/requests/${id}/approve`);
    },

    /**
     * Reject overtime request (Admin/Super User only)
     * @param {string} id - Overtime request ID
     * @param {string} reason - Rejection reason (required)
     * @returns {Promise} Response confirmation
     */
    reject: (id, reason) => {
        return apiClient.put(`/overtime/requests/${id}/reject`, { rejectionReason: reason });
    },

    /**
     * Calculate overtime pay for an employee
     * @param {string} employeeId - Employee ID
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise} Response with overtime calculation
     */
    calculatePay: (employeeId, startDate, endDate) => {
        return apiClient.get(`/overtime/calculation/${employeeId}`, {
            params: { start_date: startDate, end_date: endDate }
        });
    },
};
