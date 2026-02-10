import { writable } from 'svelte/store';
import { scheduleService } from '$lib/api/services/schedule.service.js';

/**
 * Schedule Store
 * Manages schedule state with API integration
 */
function createScheduleStore() {
    const initialState = {
        data: [],           // Array of schedules
        selected: null,     // Currently selected schedule
        loading: false,     // Loading state
        error: null,        // Error message
        pagination: {
            currentPage: 1,
            perPage: 10,
            total: 0,
            lastPage: 1,
        },
    };

    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,

        /**
         * Fetch all schedules from API
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await scheduleService.getAll(params);

                update((state) => ({
                    ...state,
                    data: response.data || response,
                    pagination: response.pagination || {
                        currentPage: params.page || 1,
                        perPage: params.perPage || 10,
                        total: response.data?.length || 0,
                        lastPage: 1,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch schedules',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch single schedule by ID
         * @param {string} id - Schedule UUID
         */
        fetchById: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await scheduleService.getById(id);

                update((state) => ({
                    ...state,
                    selected: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch schedule',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Create new schedule
         * @param {Object} data - Schedule data
         */
        create: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await scheduleService.create(data);
                const newSchedule = response.data || response;

                update((state) => ({
                    ...state,
                    data: [newSchedule, ...state.data],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to create schedule',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update existing schedule
         * @param {string} id - Schedule UUID
         * @param {Object} data - Updated data
         */
        update: async (id, data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await scheduleService.update(id, data);
                const updatedSchedule = response.data || response;

                update((state) => ({
                    ...state,
                    data: state.data.map((schedule) =>
                        schedule.id === id ? updatedSchedule : schedule
                    ),
                    selected: state.selected?.id === id ? updatedSchedule : state.selected,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update schedule',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Delete schedule
         * @param {string} id - Schedule UUID
         */
        delete: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await scheduleService.delete(id);

                update((state) => ({
                    ...state,
                    data: state.data.filter((schedule) => schedule.id !== id),
                    selected: state.selected?.id === id ? null : state.selected,
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to delete schedule',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Select a schedule
         * @param {Object} schedule - Schedule to select
         */
        select: (schedule) => {
            update((state) => ({ ...state, selected: schedule }));
        },

        /**
         * Clear selected schedule
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

export const scheduleStore = createScheduleStore();
