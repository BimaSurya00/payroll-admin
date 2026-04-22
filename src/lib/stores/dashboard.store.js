import { writable } from 'svelte/store';
import { dashboardService } from '$lib/api/services/dashboard.service.js';

const createDashboardStore = () => {
    const { subscribe, set, update } = writable({
        summary: null,
        attendanceStats: null,
        payrollStats: null,
        employeeStats: null,
        recentActivities: null,
        superUserSummary: null,
        loading: false,
        error: null,
    });

    return {
        subscribe,

        /**
         * Fetch dashboard summary
         */
        fetchSummary: async () => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await dashboardService.getSummary();
                update((s) => ({
                    ...s,
                    summary: response.data || null,
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch dashboard summary',
                }));
                throw error;
            }
        },

        /**
         * Fetch attendance statistics
         * @param {Object} params - { startDate, endDate }
         */
        fetchAttendanceStats: async (params = {}) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await dashboardService.getAttendanceStats(params);
                update((s) => ({
                    ...s,
                    attendanceStats: response.data || null,
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch attendance stats',
                }));
                throw error;
            }
        },

        /**
         * Fetch payroll statistics
         * @param {Object} params - { month, year }
         */
        fetchPayrollStats: async (params = {}) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await dashboardService.getPayrollStats(params);
                update((s) => ({
                    ...s,
                    payrollStats: response.data || null,
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch payroll stats',
                }));
                throw error;
            }
        },

        /**
         * Fetch employee statistics
         */
        fetchEmployeeStats: async () => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await dashboardService.getEmployeeStats();
                update((s) => ({
                    ...s,
                    employeeStats: response.data || null,
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch employee stats',
                }));
                throw error;
            }
        },

        /**
         * Fetch recent activities
         * @param {Object} params - { limit }
         */
        fetchRecentActivities: async (params = {}) => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await dashboardService.getRecentActivities(params);
                update((s) => ({
                    ...s,
                    recentActivities: response.data || null,
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch recent activities',
                }));
                throw error;
            }
        },

        /**
         * Fetch all dashboard data
         */
        fetchAll: async () => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                
                const [summary, attendanceStats, payrollStats, employeeStats, recentActivities] = await Promise.all([
                    dashboardService.getSummary(),
                    dashboardService.getAttendanceStats({
                        startDate: startOfMonth.toISOString().split('T')[0],
                        endDate: endOfMonth.toISOString().split('T')[0]
                    }),
                    dashboardService.getPayrollStats({
                        month: now.getMonth() + 1,
                        year: now.getFullYear()
                    }),
                    dashboardService.getEmployeeStats(),
                    dashboardService.getRecentActivities({ limit: 10 })
                ]);

                update((s) => ({
                    ...s,
                    summary: summary.data || null,
                    attendanceStats: attendanceStats.data || null,
                    payrollStats: payrollStats.data || null,
                    employeeStats: employeeStats.data || null,
                    recentActivities: recentActivities.data || null,
                    loading: false,
                    error: null,
                }));
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch dashboard data',
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

        /**
         * Reset store state
         */
        reset: () => {
            set({
                summary: null,
                attendanceStats: null,
                payrollStats: null,
                employeeStats: null,
                recentActivities: null,
                superUserSummary: null,
                loading: false,
                error: null,
            });
        },

        fetchSuperUserSummary: async () => {
            update((s) => ({ ...s, loading: true, error: null }));
            try {
                const response = await dashboardService.getSuperUserSummary();
                update((s) => ({
                    ...s,
                    superUserSummary: response.data || null,
                    loading: false,
                    error: null,
                }));
                return response.data;
            } catch (error) {
                update((s) => ({
                    ...s,
                    loading: false,
                    error: error.message || 'Failed to fetch superuser dashboard',
                }));
                throw error;
            }
        },
    };
};

export const dashboardStore = createDashboardStore();
