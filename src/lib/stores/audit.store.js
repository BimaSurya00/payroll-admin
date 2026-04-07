import { writable } from 'svelte/store';
import { auditService } from '$lib/api/services/audit.service.js';

/**
 * Audit Store
 * Manages audit logs and activity tracking state
 */
function createAuditStore() {
    const initialState = {
        logs: [],           // Array of audit logs
        selectedLog: null,  // Currently selected log
        loading: false,     // Loading state
        error: null,        // Error message
        pagination: {
            currentPage: 1,
            perPage: 50,
            total: 0,
            lastPage: 1,
        },
        filters: {
            action: null,
            resourceType: null,
            userId: null,
            dateFrom: null,
            dateTo: null,
        },
    };

    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,

        /**
         * Fetch audit logs with optional filters
         * @param {Object} params - Query parameters
         */
        fetchLogs: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await auditService.getAll(params);

                update((state) => ({
                    ...state,
                    logs: response.data?.data || response.data || [],
                    pagination: {
                        currentPage: response.data?.current_page || params.page || 1,
                        perPage: response.data?.per_page || params.perPage || 50,
                        total: response.data?.total || 0,
                        lastPage: response.data?.last_page || 1,
                    },
                    filters: {
                        action: params.action || null,
                        resourceType: params.resourceType || null,
                        userId: params.userId || null,
                        dateFrom: params.dateFrom || null,
                        dateTo: params.dateTo || null,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch audit logs',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch audit logs for a specific resource
         * @param {string} resourceType - Resource type
         * @param {string} resourceId - Resource ID
         */
        fetchByResource: async (resourceType, resourceId) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await auditService.getByResource(resourceType, resourceId);

                update((state) => ({
                    ...state,
                    logs: response.data?.data || response.data || [],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch resource logs',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch recent audit logs
         * @param {number} limit - Number of logs to fetch
         */
        fetchRecent: async (limit = 20) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await auditService.getRecent(limit);

                update((state) => ({
                    ...state,
                    logs: response.data?.data || response.data || [],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch recent logs',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Set filters
         * @param {Object} filters - Filter values
         */
        setFilters: (filters) => {
            update((state) => ({
                ...state,
                filters: { ...state.filters, ...filters },
            }));
        },

        /**
         * Clear filters
         */
        clearFilters: () => {
            update((state) => ({
                ...state,
                filters: initialState.filters,
            }));
        },

        /**
         * Select a log
         * @param {Object} log - Log to select
         */
        select: (log) => {
            update((state) => ({ ...state, selectedLog: log }));
        },

        /**
         * Clear selected log
         */
        clearSelected: () => {
            update((state) => ({ ...state, selectedLog: null }));
        },

        /**
         * Clear error
         */
        clearError: () => {
            update((state) => ({ ...state, error: null }));
        },

        /**
         * Reset store
         */
        reset: () => {
            set(initialState);
        },
    };
}

export const auditStore = createAuditStore();
