import apiClient from '../client.js';

/**
 * Employee Service
 * Handles all API calls related to employees
 */
export const employeeService = {
    /**
     * Get all employees with optional pagination and filters
     * @param {Object} params - Query parameters (page, limit, search, etc.)
     * @returns {Promise} Response with employees data
     */
    getAll: (params = {}) => {
        return apiClient.get('/employees', { params });
    },

    /**
     * Get single employee by ID
     * @param {string} id - Employee ID
     * @returns {Promise} Response with employee data
     */
    getById: (id) => {
        return apiClient.get(`/employees/${id}`);
    },

    /**
     * Create new employee
     * @param {Object} data - Employee data
     * @returns {Promise} Response with created employee
     */
    create: (data) => {
        return apiClient.post('/employees', data);
    },

    /**
     * Update existing employee
     * @param {string} id - Employee ID
     * @param {Object} data - Updated employee data
     * @returns {Promise} Response with updated employee
     */
    update: (id, data) => {
        return apiClient.patch(`/employees/${id}`, data);
    },

    /**
     * Delete employee
     * @param {string} id - Employee ID
     * @returns {Promise} Response confirmation
     */
    delete: (id) => {
        return apiClient.delete(`/employees/${id}`);
    },

    /**
     * Get own employee profile
     * @returns {Promise} Response with own employee data
     */
    getMyProfile: () => {
        return apiClient.get('/employees/me');
    },

    /**
     * Update own employee profile
     * @param {Object} data - Updated profile data (phone, address)
     * @returns {Promise} Response with updated employee data
     */
    updateMyProfile: (data) => {
        return apiClient.patch('/employees/me', data);
    },

    /**
     * Search employees by name or email
     * @param {string} query - Search query
     * @returns {Promise} Response with matching employees
     */
    search: (query) => {
        return apiClient.get('/employees/search', { params: { q: query } });
    },
};
