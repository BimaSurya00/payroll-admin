import apiClient from '../client.js';

/**
 * Dashboard Service
 * Handles all API calls related to dashboard statistics and summaries
 */
export const dashboardService = {
    /**
     * Get dashboard summary statistics
     * Returns aggregated stats for admin dashboard
     * @returns {Promise} Response with dashboard summary data
     */
    getSummary: () => {
        return apiClient.get('/dashboard/summary');
    },

    /**
     * Get attendance statistics for a specific period
     * @param {Object} params - Query parameters (startDate, endDate)
     * @returns {Promise} Response with attendance stats
     */
    getAttendanceStats: (params = {}) => {
        // Transform camelCase to snake_case for API
        const apiParams = {};
        if (params.startDate) apiParams.start_date = params.startDate;
        if (params.endDate) apiParams.end_date = params.endDate;
        return apiClient.get('/dashboard/attendance-stats', { params: apiParams });
    },

    /**
     * Get payroll statistics for a specific period
     * @param {Object} params - Query parameters (month, year)
     * @returns {Promise} Response with payroll stats
     */
    getPayrollStats: (params = {}) => {
        // Transform camelCase to snake_case for API
        const apiParams = {};
        if (params.month) apiParams.month = params.month;
        if (params.year) apiParams.year = params.year;
        if (params.limit) apiParams.limit = params.limit;
        return apiClient.get('/dashboard/payroll-stats', { params: apiParams });
    },

    /**
     * Get employee statistics
     * @returns {Promise} Response with employee stats
     */
    getEmployeeStats: () => {
        return apiClient.get('/dashboard/employee-stats');
    },

    /**
     * Get recent activities
     * @param {Object} params - Query parameters (limit)
     * @returns {Promise} Response with recent activities
     */
    getRecentActivities: (params = {}) => {
        return apiClient.get('/dashboard/recent-activities', { params });
    },

    getSuperUserSummary: () => {
        return apiClient.get('/platform/summary');
    },
};
