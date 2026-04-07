import { writable } from 'svelte/store';
import { departmentService } from '$lib/api/services/department.service.js';

const createDepartmentStore = () => {
    const { subscribe, set, update } = writable({
        data: [],
        loading: false,
        error: null,
    });

    return {
        subscribe,

        /**
         * Fetch all departments
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                console.log('[Department Store] Fetching departments with params:', params);
                const response = await departmentService.getAll(params);
                console.log('[Department Store] Response received:', response);
                
                update((s) => ({
                    ...s,
                    data: response.data || [],
                    loading: false,
                    error: null,
                }));
            } catch (error) {
                console.error('[Department Store] Fetch error:', error);
                console.error('[Department Store] Error response:', error.response?.data);
                
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch departments',
                }));
            }
        },

        /**
         * Create new department
         * @param {Object} data - Department data
         */
        create: async (data) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await departmentService.create(data);
                update((s) => ({
                    ...s,
                    data: [...s.data, response.data],
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to create department',
                }));
                throw error;
            }
        },

        /**
         * Update existing department
         * @param {string} id - Department UUID
         * @param {Object} data - Updated department data
         */
        update: async (id, data) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await departmentService.update(id, data);
                update((s) => ({
                    ...s,
                    data: s.data.map((item) => (item.id === id ? response.data : item)),
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to update department',
                }));
                throw error;
            }
        },

        /**
         * Delete department
         * @param {string} id - Department UUID
         */
        delete: async (id) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                await departmentService.delete(id);
                update((s) => ({
                    ...s,
                    data: s.data.filter((item) => item.id !== id),
                    loading: false,
                    error: null,
                }));
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to delete department',
                }));
                throw error;
            }
        },

        /**
         * Clear error state
         */
        clearError: () => {
            update((s) => ({ ...s, error: null }));
        },
    };
};

export const departmentStore = createDepartmentStore();
