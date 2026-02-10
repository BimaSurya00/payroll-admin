import { writable } from 'svelte/store';
import { leaveService } from '$lib/api/services/leave.service.js';

/**
 * Leave Store
 * Manages leave state with API integration
 */
function createLeaveStore() {
    const initialState = {
        balances: [],       // Leave balances per type
        requests: [],       // Leave requests
        pending: [],        // Pending requests (admin)
        leaveTypes: [],     // Available leave types
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
         * Fetch leave balances for current user
         * @param {number} year - Year to fetch balances for
         */
        fetchBalances: async (year) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.getMyBalances(year);

                update((state) => ({
                    ...state,
                    balances: response.data?.balances || response.balances || [],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch leave balances',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch leave types
         */
        fetchLeaveTypes: async () => {
            try {
                const response = await leaveService.getLeaveTypes();

                update((state) => ({
                    ...state,
                    leaveTypes: response.data || response || [],
                }));

                return response;
            } catch (error) {
                console.error('Failed to fetch leave types:', error);
            }
        },

        /**
         * Fetch own leave requests
         * @param {Object} params - Query parameters
         */
        fetchMyRequests: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.getMyRequests(params);

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
                    error: error.message || 'Failed to fetch leave requests',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch all leave requests (Admin)
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.getAll(params);

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
                    error: error.message || 'Failed to fetch leave requests',
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
                const response = await leaveService.getPending();

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
         * Create new leave request
         * @param {Object} data - Leave request data
         */
        create: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.create(data);
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
                    error: error.message || 'Failed to create leave request',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Approve leave request (Admin)
         * @param {string} id - Request ID
         * @param {string} note - Approval note
         */
        approve: async (id, note = '') => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await leaveService.approve(id, note);

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
         * Reject leave request (Admin)
         * @param {string} id - Request ID
         * @param {string} reason - Rejection reason
         */
        reject: async (id, reason) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await leaveService.reject(id, reason);

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
         * Cancel own leave request
         * @param {string} id - Request ID
         */
        cancel: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await leaveService.cancel(id);

                update((state) => ({
                    ...state,
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, status: 'CANCELLED' } : req
                    ),
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to cancel request',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Select a leave request
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

export const leaveStore = createLeaveStore();
