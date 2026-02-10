import { writable } from 'svelte/store';
import { attendanceService } from '$lib/api/services/attendance.service.js';

/**
 * Attendance Store
 * Manages attendance state with API integration
 */
function createAttendanceStore() {
    const initialState = {
        data: [],           // Array of all attendances (admin)
        history: [],        // Own attendance history
        todayAttendance: null, // Today's attendance record
        loading: false,     // Loading state
        error: null,        // Error message
        pagination: {
            currentPage: 1,
            perPage: 10,
            total: 0,
            lastPage: 1,
        },
        filters: {
            employeeId: null,
            scheduleId: null,
            status: null,
            dateFrom: null,
            dateTo: null,
        },
    };

    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,

        /**
         * Clock in for current user
         * @param {number} lat - Latitude
         * @param {number} long - Longitude
         */
        clockIn: async (lat, long) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await attendanceService.clockIn(lat, long);

                update((state) => ({
                    ...state,
                    todayAttendance: response.data || response,
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
         * Clock out for current user
         * @param {number} lat - Latitude
         * @param {number} long - Longitude
         */
        clockOut: async (lat, long) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await attendanceService.clockOut(lat, long);

                update((state) => ({
                    ...state,
                    todayAttendance: {
                        ...state.todayAttendance,
                        ...(response.data || response),
                    },
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
         * Fetch own attendance history
         * @param {Object} params - Query parameters
         */
        fetchHistory: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await attendanceService.getHistory(params);

                update((state) => ({
                    ...state,
                    history: response.data || response,
                    pagination: response.pagination || state.pagination,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch history',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch all attendances (Admin only)
         * @param {Object} params - Query parameters with filters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await attendanceService.getAll(params);

                update((state) => ({
                    ...state,
                    data: response.data || response,
                    pagination: response.pagination || state.pagination,
                    filters: {
                        employeeId: params.employeeId || null,
                        scheduleId: params.scheduleId || null,
                        status: params.status || null,
                        dateFrom: params.dateFrom || null,
                        dateTo: params.dateTo || null,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch attendances',
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
         * Clear error
         */
        clearError: () => {
            update((state) => ({ ...state, error: null }));
        },

        /**
         * Reset store to initial state
         */
        reset: () => {
            set(initialState);
        },
    };
}

export const attendanceStore = createAttendanceStore();
