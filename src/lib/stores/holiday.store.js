import { writable } from 'svelte/store';
import { holidayService } from '$lib/api/services/holiday.service.js';

const createHolidayStore = () => {
    const { subscribe, set, update } = writable({
        data: [],
        loading: false,
        error: null,
    });

    return {
        subscribe,
        
        /**
         * Fetch all holidays with optional filters
         * @param {Object} params - Query parameters (page, perPage, year)
         */
        fetchAll: async (params = {}) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await holidayService.getAll(params);
                set({
                    data: response.data || [],
                    loading: false,
                    error: null,
                });
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch holidays',
                }));
            }
        },

        /**
         * Fetch holidays by year
         * @param {number} year - Year to filter
         */
        fetchByYear: async (year) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await holidayService.getByYear(year);
                set({
                    data: response.data || [],
                    loading: false,
                    error: null,
                });
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch holidays',
                }));
            }
        },

        /**
         * Create new holiday
         * @param {Object} data - Holiday data
         */
        create: async (data) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await holidayService.create(data);
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
                    error: error.message || 'Failed to create holiday',
                }));
                throw error;
            }
        },

        /**
         * Update existing holiday
         * @param {string} id - Holiday UUID
         * @param {Object} data - Updated holiday data
         */
        update: async (id, data) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await holidayService.update(id, data);
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
                    error: error.message || 'Failed to update holiday',
                }));
                throw error;
            }
        },

        /**
         * Delete holiday
         * @param {string} id - Holiday UUID
         */
        delete: async (id) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                await holidayService.delete(id);
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
                    error: error.message || 'Failed to delete holiday',
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

export const holidayStore = createHolidayStore();
