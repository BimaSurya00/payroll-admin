import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Attendance Service
 * Handles all API calls related to attendance
 */
export const attendanceService = {
    /**
     * Clock in for today
     * @param {number} lat - Current latitude
     * @param {number} long - Current longitude
     * @returns {Promise} Response with attendance data
     */
    clockIn: (lat, long) => {
        return apiClient.post('/attendance/clock-in', { lat, long });
    },

    /**
     * Clock out for today
     * @param {number} lat - Current latitude
     * @param {number} long - Current longitude
     * @returns {Promise} Response with attendance data
     */
    clockOut: (lat, long) => {
        return apiClient.post('/attendance/clock-out', { lat, long });
    },

    /**
     * Get own attendance history
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with attendance history and pagination
     */
    getHistory: (params = {}) => {
        return apiClient.get('/attendance/history', { params: buildPaginationParams(params) });
    },

    /**
     * Get all attendances (Admin/Super User only)
     * @param {Object} params - Query parameters
     *   { page, perPage, employee_id, schedule_id, status, date_from, date_to }
     * @returns {Promise} Response with all attendances and pagination
     */
    getAll: (params = {}) => {
        const { page, perPage, employeeId, scheduleId, status, dateFrom, dateTo, ...rest } = params;

        const queryParams = buildPaginationParams({ page, perPage });

        // Add optional filters with snake_case for API
        if (employeeId) queryParams.employee_id = employeeId;
        if (scheduleId) queryParams.schedule_id = scheduleId;
        if (status) queryParams.status = status;
        if (dateFrom) queryParams.date_from = dateFrom;
        if (dateTo) queryParams.date_to = dateTo;

        return apiClient.get('/attendance/all', { params: { ...queryParams, ...rest } });
    },

    /**
     * Get monthly attendance report (Admin/Super User only)
     * @param {Object} params - Query parameters (month, year, employee_id)
     * @returns {Promise} Response with monthly report
     */
    getMonthlyReport: (params = {}) => {
        return apiClient.get('/attendance/report/monthly', { params });
    },

    /**
     * Get my monthly attendance summary
     * @param {Object} params - Query parameters (month, year)
     * @returns {Promise} Response with own monthly summary
     */
    getMyMonthlySummary: (params = {}) => {
        return apiClient.get('/attendance/report/my', { params });
    },

    /**
     * Create attendance correction request (Admin/Super User only)
     * @param {Object} data - Correction data
     *   { attendanceId, correctClockIn, correctClockOut, reason }
     * @returns {Promise} Response with correction request
     */
    createCorrection: (data) => {
        return apiClient.post('/attendance/correction', data);
    },

    /**
     * Update attendance correction (Admin/Super User only)
     * @param {string} id - Correction record ID
     * @param {Object} data - Updated correction data
     *   { status, adminNote }
     * @returns {Promise} Response with updated correction
     */
    updateCorrection: (id, data) => {
        return apiClient.patch(`/attendance/${id}/correction`, data);
    },
};
