import { writable } from 'svelte/store';
import { employeeService } from '$lib/api/services/employee.service.js';

/**
 * Employee Store
 * Manages employee state with API integration
 */
function createEmployeeStore() {
    const initialState = {
        data: [],           // Array of employees
        selected: null,     // Currently selected employee
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
         * Fetch all employees from API
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await employeeService.getAll(params);

                update((state) => ({
                    ...state,
                    data: response.data || response,
                    pagination: {
                        page: params.page || 1,
                        limit: params.limit || 10,
                        total: response.meta?.total || response.length || 0,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch employees',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch single employee by ID
         * @param {string} id - Employee ID
         */
        fetchById: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await employeeService.getById(id);

                update((state) => ({
                    ...state,
                    selected: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch employee',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Create new employee
         * @param {Object} data - Employee data
         */
        create: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await employeeService.create(data);
                const newEmployee = response.data || response;

                update((state) => ({
                    ...state,
                    data: [newEmployee, ...state.data],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to create employee',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update existing employee
         * @param {string} id - Employee ID
         * @param {Object} data - Updated data
         */
        update: async (id, data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await employeeService.update(id, data);
                const updatedEmployee = response.data || response;

                update((state) => ({
                    ...state,
                    data: state.data.map((emp) =>
                        emp.id === id ? updatedEmployee : emp
                    ),
                    selected: state.selected?.id === id ? updatedEmployee : state.selected,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update employee',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Delete employee
         * @param {string} id - Employee ID
         */
        delete: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await employeeService.delete(id);

                update((state) => ({
                    ...state,
                    data: state.data.filter((emp) => emp.id !== id),
                    selected: state.selected?.id === id ? null : state.selected,
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to delete employee',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Get own employee profile
         */
        getMyProfile: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await employeeService.getMyProfile();

                update((state) => ({
                    ...state,
                    selected: response.data,
                    loading: false,
                }));

                return response.data;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch profile',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update own employee profile
         * @param {Object} data - Profile data to update
         */
        updateMyProfile: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await employeeService.updateMyProfile(data);

                update((state) => ({
                    ...state,
                    selected: response.data,
                    loading: false,
                }));

                return response.data;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update profile',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Select an employee
         * @param {Object} employee - Employee to select
         */
        select: (employee) => {
            update((state) => ({ ...state, selected: employee }));
        },

        /**
         * Clear selected employee
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

export const employeeStore = createEmployeeStore();
