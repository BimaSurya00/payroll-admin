/**
 * API Response Handler
 * Standardized response handling for all API calls
 */

/**
 * Standard API Response Format:
 * {
 *   success: boolean,
 *   statusCode: number,
 *   message: string,
 *   data: any | null,
 *   pagination?: {
 *     currentPage: number,
 *     perPage: number,
 *     total: number,
 *     lastPage: number,
 *     ...
 *   },
 *   error?: string | array
 * }
 */

/**
 * Extract data from API response
 * @param {Object} response - Raw API response
 * @returns {Object} Extracted data with pagination if available
 */
export function extractData(response) {
    // Response sudah di-intercept oleh axios, jadi langsung data
    if (response?.data !== undefined) {
        return {
            data: response.data,
            pagination: response.pagination || null,
            message: response.message || 'Success',
        };
    }
    // Fallback jika response langsung data array
    return {
        data: response,
        pagination: null,
        message: 'Success',
    };
}

/**
 * Handle API error response
 * @param {Object} error - Error from API
 * @returns {Object} Standardized error object
 */
export function handleError(error) {
    return {
        success: false,
        status: error.status || 500,
        message: error.message || 'An error occurred',
        errors: error.data?.error || null,
    };
}

/**
 * Build query params for pagination
 * @param {Object} params - Query parameters
 * @returns {Object} Formatted params for API
 */
export function buildPaginationParams(params = {}) {
    const { page = 1, perPage = 10, ...rest } = params;
    return {
        page,
        per_page: perPage,
        ...rest,
    };
}
