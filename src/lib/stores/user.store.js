import { writable } from 'svelte/store';
import { userService } from '$lib/api/services/user.service.js';

/**
 * User Store
 * Manages user list state with API integration
 */
function createUserStore() {
    const initialState = {
        data: [],           // Array of users
        selected: null,     // Currently selected user
        currentUser: null,  // Logged in user profile
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
         * Fetch current user profile
         */
        fetchMe: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.getMe();

                update((state) => ({
                    ...state,
                    currentUser: response.data || response,
                    loading: false,
                }));

                return response;
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
         * Fetch all users from API
         * @param {Object} params - Query parameters { page, perPage }
         */
        fetchAll: async (params = {}) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.getAll(params);

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
                    error: error.message || 'Failed to fetch users',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Fetch single user by ID
         * @param {string} id - User UUID
         */
        fetchById: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.getById(id);

                update((state) => ({
                    ...state,
                    selected: response.data || response,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to fetch user',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Create new user
         * @param {Object} data - User data
         */
        create: async (data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.create(data);
                const newUser = response.data || response;

                update((state) => ({
                    ...state,
                    data: [newUser, ...state.data],
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to create user',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update existing user
         * @param {string} id - User UUID
         * @param {Object} data - Updated data
         */
        update: async (id, data) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.update(id, data);
                const updatedUser = response.data || response;

                update((state) => ({
                    ...state,
                    data: state.data.map((user) =>
                        user.id === id ? updatedUser : user
                    ),
                    selected: state.selected?.id === id ? updatedUser : state.selected,
                    loading: false,
                }));

                return response;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update user',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Delete user
         * @param {string} id - User UUID
         */
        delete: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await userService.delete(id);

                update((state) => ({
                    ...state,
                    data: state.data.filter((user) => user.id !== id),
                    selected: state.selected?.id === id ? null : state.selected,
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to delete user',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Select a user
         * @param {Object} user - User to select
         */
        select: (user) => {
            update((state) => ({ ...state, selected: user }));
        },

        /**
         * Upload profile image
         * @param {string} id - User UUID
         * @param {File} file - Image file
         */
        uploadProfileImage: async (id, file) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.uploadProfileImage(id, file);

                // Update current user if uploading own profile
                update((state) => ({
                    ...state,
                    currentUser: state.currentUser?.id === id
                        ? { ...state.currentUser, profileImage: response.data.imageUrl }
                        : state.currentUser,
                    selected: state.selected?.id === id
                        ? { ...state.selected, profileImage: response.data.imageUrl }
                        : state.selected,
                    loading: false,
                }));

                return response.data;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to upload profile image',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Update profile image
         * @param {string} id - User UUID
         * @param {File} file - Image file
         */
        updateProfileImage: async (id, file) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const response = await userService.updateProfileImage(id, file);

                // Update current user if updating own profile
                update((state) => ({
                    ...state,
                    currentUser: state.currentUser?.id === id
                        ? { ...state.currentUser, profileImage: response.data.imageUrl }
                        : state.currentUser,
                    selected: state.selected?.id === id
                        ? { ...state.selected, profileImage: response.data.imageUrl }
                        : state.selected,
                    loading: false,
                }));

                return response.data;
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to update profile image',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Delete profile image
         * @param {string} id - User UUID
         */
        deleteProfileImage: async (id) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                await userService.deleteProfileImage(id);

                // Update current user if deleting own profile
                update((state) => ({
                    ...state,
                    currentUser: state.currentUser?.id === id
                        ? { ...state.currentUser, profileImage: null }
                        : state.currentUser,
                    selected: state.selected?.id === id
                        ? { ...state.selected, profileImage: null }
                        : state.selected,
                    loading: false,
                }));
            } catch (error) {
                update((state) => ({
                    ...state,
                    error: error.message || 'Failed to delete profile image',
                    loading: false,
                }));
                throw error;
            }
        },

        /**
         * Clear selected user
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

export const userStore = createUserStore();
