import axios from 'axios';

// API Base URL - sesuaikan dengan backend kamu
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://8.215.33.70:8080/api/v1';

// Create axios instance dengan default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor - tambahkan auth token ke setiap request
apiClient.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - handle response dan errors secara global
apiClient.interceptors.response.use(
    (response) => {
        // Return langsung data dari response
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // Handle 401 - try to refresh token
        if (status === 401 && !originalRequest._retry) {
            // Don't try to refresh if this is already an auth request
            if (originalRequest.url?.includes('/auth/')) {
                return Promise.reject({
                    status,
                    message,
                    data: error.response?.data,
                });
            }

            if (isRefreshing) {
                // Queue the request while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const userId = userData ? JSON.parse(userData).id : null;

            if (!refreshToken || !userId) {
                // No refresh token or userId, redirect to login
                isRefreshing = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/login';
                }
                return Promise.reject({
                    status,
                    message: 'No refresh token or user data available',
                    data: error.response?.data,
                });
            }

            try {
                // Call refresh endpoint directly (avoid interceptors)
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                    userId,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data?.data || response.data;

                if (accessToken) {
                    // Store new tokens
                    localStorage.setItem('token', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Update authorization header
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Process queued requests
                    processQueue(null, accessToken);
                    isRefreshing = false;

                    // Retry original request
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                processQueue(refreshError, null);
                isRefreshing = false;

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/login';
                }

                return Promise.reject({
                    status: 401,
                    message: 'Session expired. Please login again.',
                    data: refreshError.response?.data,
                });
            }
        }

        // Handle other errors
        switch (status) {
            case 403:
                // Forbidden - tidak punya akses
                console.error('Access forbidden:', message);
                break;
            case 404:
                // Not found
                console.error('Resource not found:', message);
                break;
            case 405:
                // Method Not Allowed - endpoint not implemented or wrong HTTP method
                console.error('Method Not Allowed:', message);
                break;
            case 500:
                // Server error
                console.error('Server error:', message);
                break;
            default:
                console.error('API Error:', message);
        }

        return Promise.reject({
            status,
            message,
            data: error.response?.data,
        });
    }
);

export default apiClient;
