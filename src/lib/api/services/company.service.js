import apiClient from '../client.js';
import { buildPaginationParams } from '../response-handler.js';

/**
 * Company Service
 * Handles all API calls related to company management
 */
export const companyService = {
    /**
     * Get all companies (Super User only)
     * @param {Object} params - Query parameters (page, perPage)
     * @returns {Promise} Response with companies data and pagination
     */
    getAll: (params = {}) => {
        return apiClient.get('/companies', { params: buildPaginationParams(params) });
    },

    /**
     * Get current user's company
     * @returns {Promise} Response with company data
     */
    getCurrent: () => {
        return apiClient.get('/companies/current');
    },

    /**
     * Get single company by ID
     * @param {string} id - Company UUID
     * @returns {Promise} Response with company data
     */
    getById: (id) => {
        return apiClient.get(`/companies/${id}`);
    },

    /**
     * Create new company
     * @param {Object} data - Company data
     *   { name, slug, address, phone, email, website, taxId, description, isActive }
     * @returns {Promise} Response with created company
     */
    create: (data) => {
        return apiClient.post('/companies', data);
    },

    /**
     * Update existing company
     * @param {string} id - Company UUID
     * @param {Object} data - Updated company data
     * @returns {Promise} Response with updated company
     */
    update: (id, data) => {
        return apiClient.put(`/companies/${id}`, data);
    },

    /**
     * Delete company
     * @param {string} id - Company UUID
     * @returns {Promise} Response confirmation
     */
    delete: (id) => {
        return apiClient.delete(`/companies/${id}`);
    },

    /**
     * Get company statistics
     * @param {string} id - Company UUID
     * @returns {Promise} Response with company stats (employees, departments, etc.)
     */
    getStats: (id) => {
        return apiClient.get(`/companies/${id}/stats`);
    },
};
