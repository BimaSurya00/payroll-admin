import { writable } from 'svelte/store';
import { companyService } from '$lib/api/services/company.service.js';

/**
 * Company Store
 * Manages company state with API integration (Super User only)
 */
function createCompanyStore() {
    const initialState = {
        data: [],           // Array of companies
        selected: null,     // Currently selected company
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
         * Fetch all companies from API
         * @param {Object} params - Query parameters
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await companyService.getAll(params);

                update((state) => ({
                    ...state,
                    data: response.data || response,
                    pagination: {
                        currentPage: params.page || 1,
                        perPage: params.perPage || 10,
                        total: response.meta?.total || response.length || 0,
                        lastPage: response.meta?.lastPage || 1,
                    },
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch companies',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch single company by ID
         * @param {string} id - Company UUID
         */
        fetchById: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await companyService.getById(id);

                update((state) => ({
                    ...state,
                    selected: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch company',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch current user's company
         */
        fetchCurrent: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await companyService.getCurrent();

                update((state) => ({
                    ...state,
                    selected: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch current company',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Create new company
         * @param {Object} data - Company data
         */
        create: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await companyService.create(data);
                const newCompany = response.data || response;

                update((state) => ({
                    ...state,
                    data: [newCompany, ...state.data],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to create company',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update existing company
         * @param {string} id - Company UUID
         * @param {Object} data - Updated data
         */
        update: async (id, data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await companyService.update(id, data);
                const updatedCompany = response.data || response;

                update((state) => ({
                    ...state,
                    data: state.data.map((company) =>
                        company.id === id ? updatedCompany : company
                    ),
                    selected: state.selected?.id === id ? updatedCompany : state.selected,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update company',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Delete company
         * @param {string} id - Company UUID
         */
        delete: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await companyService.delete(id);

                update((state) => ({
                    ...state,
                    data: state.data.filter((company) => company.id !== id),
                    selected: state.selected?.id === id ? null : state.selected,
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to delete company',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Select a company
         * @param {Object} company - Company to select
         */
        select: (company) => {
            update((state) => ({ ...state, selected: company }));
        },

        /**
         * Clear selected company
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

export const companyStore = createCompanyStore();
