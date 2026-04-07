/**
 * Formatting utilities for dates, numbers, and currency
 * Uses Indonesian locale by default but easily configurable
 */

const DEFAULT_LOCALE = 'id-ID';
const DEFAULT_CURRENCY = 'IDR';

/**
 * Format a date to a human-readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
	if (!date) return '-';
	
	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';
	
	const defaultOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		...options,
	};
	
	return d.toLocaleDateString(DEFAULT_LOCALE, defaultOptions);
}

/**
 * Format a date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
	if (!date) return '-';
	
	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';
	
	return d.toLocaleDateString(DEFAULT_LOCALE, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Format a time only
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
export function formatTime(date) {
	if (!date) return '-';
	
	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';
	
	return d.toLocaleTimeString(DEFAULT_LOCALE, {
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: IDR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
	if (amount === null || amount === undefined || isNaN(amount)) {
		return currency === 'IDR' ? 'Rp 0' : '0';
	}
	
	return new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

/**
 * Format a number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
	if (num === null || num === undefined || isNaN(num)) {
		return '0';
	}
	
	return new Intl.NumberFormat(DEFAULT_LOCALE).format(num);
}

/**
 * Format a percentage
 * @param {number} value - Value to format (0-100 or 0-1)
 * @param {boolean} isDecimal - Whether value is already decimal (0-1)
 * @returns {string} Formatted percentage
 */
export function formatPercent(value, isDecimal = false) {
	if (value === null || value === undefined || isNaN(value)) {
		return '0%';
	}
	
	const percent = isDecimal ? value * 100 : value;
	return `${Math.round(percent)}%`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
	if (!date) return '-';
	
	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';
	
	const now = new Date();
	const diffInSeconds = Math.floor((now - d) / 1000);
	
	if (diffInSeconds < 60) return 'Just now';
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
	
	return formatDate(d);
}

/**
 * Format duration in hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(minutes) {
	if (!minutes || isNaN(minutes)) return '0h 0m';
	
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}

/**
 * Format phone number to Indonesian format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
	if (!phone) return '-';
	
	// Remove non-numeric characters
	const cleaned = phone.replace(/\D/g, '');
	
	// Indonesian format: +62 xxx-xxxx-xxxx or 08xx-xxxx-xxxx
	if (cleaned.startsWith('62')) {
		return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
	}
	if (cleaned.startsWith('0')) {
		return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
	}
	
	return phone;
}
