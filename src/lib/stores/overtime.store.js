import { writable } from 'svelte/store';
import { overtimeService } from '$lib/api/services/overtime.service.js';

/**
 * Overtime Store
 * Manages overtime state with API integration
 */
function createOvertimeStore() {
    const initialState = {
        policies: [],       // Overtime policies
        requests: [],       // Overtime requests
        pending: [],        // Pending requests (admin)
        selected: null,     // Currently selected request
        loading: false,     // Loading state
        error: null,        // Error message
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
        },
    };

    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,

        /**
         * Fetch overtime policies
         */
        fetchPolicies: async () => {
            try {
                const response = await overtimeService.getPolicies();

                update((state) => ({
                    ...state,
                    policies: response.data || response || [],
                }));

                return response;
            } catch (error) {
                console.error('Failed to fetch overtime policies:', error);
            }
        },

        /**
         * Fetch own overtime requests
         * @param {Object} params - Query parameters
         */
        fetchMyRequests: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await overtimeService.getMyRequests(params);

                update((state) => ({
                    ...state,
                    requests: response.data || response,
                    pagination: {
                        page: params.page || 1,
                        limit: params.perPage || 10,
                        total: response.pagination?.total || response.length || 0,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch overtime requests',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch all overtime requests (Admin)
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await overtimeService.getAll(params);

                update((state) => ({
                    ...state,
                    requests: response.data || response,
                    pagination: {
                        page: params.page || 1,
                        limit: params.perPage || 10,
                        total: response.pagination?.total || response.length || 0,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch overtime requests',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch pending requests (Admin)
         */
        fetchPending: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await overtimeService.getPending();

                update((state) => ({
                    ...state,
                    pending: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch pending requests',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Create new overtime request
         * @param {Object} data - Overtime request data
         */
        create: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await overtimeService.create(data);
                const newRequest = response.data || response;

                update((state) => ({
                    ...state,
                    requests: [newRequest, ...state.requests],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to create overtime request',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Clock in for overtime
         * @param {string} id - Request ID
         * @param {string} notes - Optional notes
         */
        clockIn: async (id, notes = '') => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await overtimeService.clockIn(id, notes);

                update((state) => ({
                    ...state,
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, actualStartTime: response.data?.actualStartTime || new Date().toISOString() } : req
                    ),
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to clock in',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Clock out from overtime
         * @param {string} id - Request ID
         * @param {string} notes - Optional notes
         */
        clockOut: async (id, notes = '') => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await overtimeService.clockOut(id, notes);

                update((state) => ({
                    ...state,
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, actualEndTime: response.data?.actualEndTime || new Date().toISOString(), status: 'COMPLETED' } : req
                    ),
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to clock out',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Approve overtime request (Admin)
         * @param {string} id - Request ID
         */
        approve: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await overtimeService.approve(id);

                update((state) => ({
                    ...state,
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, status: 'APPROVED' } : req
                    ),
                    pending: state.pending.filter((req) => req.id !== id),
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to approve request',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Reject overtime request (Admin)
         * @param {string} id - Request ID
         * @param {string} reason - Rejection reason
         */
        reject: async (id, reason) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await overtimeService.reject(id, reason);

                update((state) => ({
                    ...state,
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, status: 'REJECTED' } : req
                    ),
                    pending: state.pending.filter((req) => req.id !== id),
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to reject request',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Select an overtime request
         */
        select: (request) => {
            update((state) => ({ ...state, selected: request }));
        },

        /**
         * Clear selected
         */
        clearSelected: () => {
            update((state) => ({ ...state, selected: null }));
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

export const overtimeStore = createOvertimeStore();
