import { writable } from 'svelte/store';
import { payrollService } from '$lib/api/services/payroll.service.js';

/**
 * Payroll Store
 * Manages payroll state with API integration
 */
function createPayrollStore() {
    const initialState = {
        data: [],           // Array of payrolls
        selected: null,     // Currently selected payroll with details
        loading: false,     // Loading state
        error: null,        // Error message
        pagination: {
            currentPage: 1,
            perPage: 15,
            total: 0,
            lastPage: 1,
        },
        generating: false,  // Generate payroll loading state
        exporting: false,   // Export CSV loading state
    };

    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,

        /**
         * Generate bulk payroll for a period
         * @param {number} periodMonth - Month (1-12)
         * @param {number} periodYear - Year
         */
        generate: async (periodMonth, periodYear) => {
            update((state) => ({ ...state, generating: true, error: null }));

            try {
                const response = await payrollService.generate(periodMonth, periodYear);

                update((state) => ({
                    ...state,
                    generating: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to generate payroll',
                    generating: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch all payrolls from API
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await payrollService.getAll(params);

                update((state) => ({
                    ...state,
                    data: response.data || response,
                    pagination: response.pagination || {
                        currentPage: params.page || 1,
                        perPage: params.perPage || 15,
                        total: response.data?.length || 0,
                        lastPage: 1,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch payrolls',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch single payroll by ID with details
         * @param {string} id - Payroll UUID
         */
        fetchById: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await payrollService.getById(id);

                update((state) => ({
                    ...state,
                    selected: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch payroll',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update payroll status
         * @param {string} id - Payroll UUID
         * @param {string} status - New status (DRAFT, APPROVED, PAID)
         */
        updateStatus: async (id, status) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await payrollService.updateStatus(id, status);

                // Update local state
                update((state) => ({
                    ...state,
                    data: state.data.map((payroll) =>
                        payroll.id === id ? { ...payroll, status } : payroll
                    ),
                    selected: state.selected?.id === id
                        ? { ...state.selected, status }
                        : state.selected,
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update status',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Export payroll to CSV
         * @param {number} month - Month (1-12)
         * @param {number} year - Year
         */
        exportCsv: async (month, year) => {
            update((state) => ({ ...state, exporting: true, error: null }));

            try {
                const blob = await payrollService.exportCsv(month, year);

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `payroll_export_${year}${String(month).padStart(2, '0')}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                update((state) => ({
                    ...state,
                    exporting: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to export CSV',
                    exporting: false,
                }));
                throw error;
            }
        },

        /**
         * Select a payroll
         * @param {Object} payroll - Payroll to select
         */
        select: (payroll) => {
            update((state) => ({ ...state, selected: payroll }));
        },

        /**
         * Clear selected payroll
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
         * Reset store to initial state
         */
        reset: () => {
            set(initialState);
        },
    };
}

export const payrollStore = createPayrollStore();
