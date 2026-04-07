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
        fetchBalances: async (year, isAdmin = false) => {
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
                // Handle "Employee record not found" - common for admin users without employee profile
                if (error.message?.includes('Employee record not found')) {
                    update((state) => ({
                        ...state,
                        balances: [], // Empty balances for admin without employee profile
                        error: isAdmin ? null : error.message, // Don't show error for admin
                        loading: false,
                    }));
                    // Don't throw error for this case - it's expected for admin users
                    return { data: { balances: [] } };
                }

                // Handle 405 Method Not Allowed - endpoint not implemented
                if (error.status === 405 || error.message?.includes('Method Not Allowed')) {
                    console.warn('Leave balances endpoint not available (405). Backend may not be implemented yet.');
                    update((state) => ({
                        ...state,
                        balances: [],
                        error: isAdmin ? null : 'Leave service temporarily unavailable',
                        loading: false,
                    }));
                    return { data: { balances: [] } };
                }

                // Handle 500 Server Error
                if (error.status === 500) {
                    console.warn('Server error when fetching leave balances.');
                    update((state) => ({
                        ...state,
                        balances: [],
                        error: isAdmin ? null : 'Leave service temporarily unavailable',
                        loading: false,
                    }));
                    return { data: { balances: [] } };
                }
                
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch leave balances',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch active leave types
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
         * Fetch all leave types including inactive (Admin/Super User only)
         */
        fetchAllLeaveTypes: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.getAllLeaveTypes();

                update((state) => ({
                    ...state,
                    leaveTypes: response.data || response || [],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch leave types',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Create new leave type (Admin/Super User only)
         * @param {Object} data - Leave type data
         */
        createLeaveType: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.createLeaveType(data);
                const newLeaveType = response.data || response;

                update((state) => ({
                    ...state,
                    leaveTypes: [newLeaveType, ...state.leaveTypes],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to create leave type',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update leave type (Admin/Super User only)
         * @param {string} id - Leave type ID
         * @param {Object} data - Updated data
         */
        updateLeaveType: async (id, data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await leaveService.updateLeaveType(id, data);
                const updatedLeaveType = response.data || response;

                update((state) => ({
                    ...state,
                    leaveTypes: state.leaveTypes.map((type) =>
                        type.id === id ? updatedLeaveType : type
                    ),
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update leave type',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Delete leave type (Admin/Super User only)
         * @param {string} id - Leave type ID
         */
        deleteLeaveType: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await leaveService.deleteLeaveType(id);

                update((state) => ({
                    ...state,
                    leaveTypes: state.leaveTypes.filter((type) => type.id !== id),
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to delete leave type',
                    loading: false,
                }));
                throw error;
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
                // Handle 405 Method Not Allowed - endpoint not implemented
                if (error.status === 405 || error.message?.includes('Method Not Allowed')) {
                    console.warn('My leave requests endpoint not available (405). Backend may not be implemented yet.');
                    update((state) => ({
                        ...state,
                        requests: [],
                        error: null,
                        loading: false,
                    }));
                    return { data: [], pagination: { total: 0 } };
                }

                // Handle employee not found error
                if (error.message?.includes('Employee record not found')) {
                    update((state) => ({
                        ...state,
                        requests: [],
                        error: 'Employee record not found. Please contact HR to set up your employee profile.',
                        loading: false,
                    }));
                    return { data: [], pagination: { total: 0 } };
                }

                // Handle 500 Server Error - backend routing issue
                if (error.status === 500) {
                    console.warn('Server error when fetching leave requests. Backend routing may be misconfigured.');
                    update((state) => ({
                        ...state,
                        requests: [],
                        error: null, // Don't show error to user
                        loading: false,
                    }));
                    return { data: [], pagination: { total: 0 } };
                }

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
                // Handle 405 Method Not Allowed - endpoint not implemented or different method required
                if (error.status === 405 || error.message?.includes('Method Not Allowed')) {
                    console.warn('Leave requests endpoint not available (405). Admin may need to use different endpoint or backend not implemented yet.');
                    update((state) => ({
                        ...state,
                        requests: [], // Empty list when endpoint not available
                        error: null, // Don't show error to user, just empty state
                        loading: false,
                    }));
                    return { data: [], pagination: { total: 0 } };
                }
                
                // Handle 500 Server Error - backend routing issue
                if (error.status === 500) {
                    console.warn('Server error when fetching leave requests. Backend routing may be misconfigured.');
                    update((state) => ({
                        ...state,
                        requests: [],
                        error: null, // Don't show error to user
                        loading: false,
                    }));
                    return { data: [], pagination: { total: 0 } };
                }
                
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
                // Handle 405 Method Not Allowed - endpoint not implemented
                if (error.status === 405 || error.message?.includes('Method Not Allowed')) {
                    console.warn('Pending requests endpoint not available (405). Backend may not be implemented yet.');
                    update((state) => ({
                        ...state,
                        pending: [],
                        error: null,
                        loading: false,
                    }));
                    return { data: [] };
                }

                // Handle 500 Server Error - backend routing issue
                if (error.status === 500 || error.message?.includes('Failed to get')) {
                    console.warn('Server error when fetching pending requests. Backend routing may be misconfigured.');
                    update((state) => ({
                        ...state,
                        pending: [],
                        error: null,
                        loading: false,
                    }));
                    return { data: [] };
                }

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
