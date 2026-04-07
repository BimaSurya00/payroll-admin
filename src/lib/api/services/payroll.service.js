import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Payroll Service
 * Handles all API calls related to payroll management
 */
export const payrollService = {
    /**
     * Generate bulk payroll for a period
     * @param {number} periodMonth - Month (1-12)
     * @param {number} periodYear - Year (2020-2100)
     * @returns {Promise} Response with generation result
     */
    generate: (periodMonth, periodYear) => {
        return apiClient.post('/payrolls/generate', { periodMonth, periodYear });
    },

    /**
     * Get all payrolls with optional pagination
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with payrolls data and pagination
     */
    getAll: (params = {}) => {
        return apiClient.get('/payrolls', { params: buildPaginationParams(params) });
    },

    /**
     * Get single payroll by ID
     * @param {string} id - Payroll UUID
     * @returns {Promise} Response with payroll data including items
     */
    getById: (id) => {
        return apiClient.get(`/payrolls/${id}`);
    },

    /**
     * Get my payrolls (current user's own payrolls)
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with own payrolls data and pagination
     */
    getMyPayrolls: (params = {}) => {
        return apiClient.get('/payrolls/my', { params: buildPaginationParams(params) });
    },

    /**
     * Get my payroll by ID (current user's own payroll)
     * @param {string} id - Payroll UUID
     * @returns {Promise} Response with own payroll data including items
     */
    getMyPayrollById: (id) => {
        return apiClient.get(`/payrolls/my/${id}`);
    },

    /**
     * Update payroll status
     * @param {string} id - Payroll UUID
     * @param {string} status - New status (DRAFT, APPROVED, PAID)
     * @returns {Promise} Response confirmation
     */
    updateStatus: (id, status) => {
        return apiClient.patch(`/payrolls/${id}/status`, { status });
    },

    /**
     * Export payroll to CSV
     * @param {number} month - Month (1-12)
     * @param {number} year - Year (2020-2100)
     * @returns {Promise} Blob response for CSV download
     */
    exportCsv: (month, year) => {
        return apiClient.get('/payrolls/export/csv', {
            params: { month, year },
            responseType: 'blob',
        });
    },
};
