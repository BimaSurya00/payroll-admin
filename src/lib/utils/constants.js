/**
 * Application constants
 * Centralized configuration for routes, pagination, and UI text
 */

/**
 * Route name mappings for breadcrumbs and navigation
 */
export const ROUTE_NAMES = {
	// Main routes
	dashboard: 'Dashboard',
	
	// Management routes
	user: 'User Management',
	employee: 'Employee Management',
	department: 'Department Management',
	company: 'Company Management',
	
	// HR routes
	schedule: 'Schedule Management',
	attendance: 'Attendance',
	leave: 'Leave Management',
	overtime: 'Overtime Management',
	
	// Payroll routes
	payroll: 'Payroll',
	'my-payroll': 'My Payslips',
	
	// Other routes
	holiday: 'Holiday Management',
	audit: 'Audit Logs',
	profile: 'Profile',
	settings: 'Settings',
	
	// Detail routes (parent pages)
	types: 'Types',
	reports: 'Reports',
};

/**
 * Get breadcrumb label for a route segment
 * @param {string} segment - URL segment
 * @returns {string} Human-readable label
 */
export function getRouteLabel(segment) {
	return ROUTE_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Pagination defaults
 */
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_PER_PAGE: 10,
	MAX_PER_PAGE: 100,
	PER_PAGE_OPTIONS: [10, 25, 50, 100],
};

/**
 * Table column widths for consistent sizing
 */
export const TABLE_COLUMNS = {
	XS: 'w-16',    // Actions, icons
	SM: 'w-24',    // Status, small text
	MD: 'w-32',    // Dates, small numbers
	LG: 'w-48',    // Names, medium text
	XL: 'w-64',    // Descriptions, long text
	AUTO: '',      // Flexible
};

/**
 * Empty state messages by entity type
 */
export const EMPTY_STATE_MESSAGES = {
	employee: {
		title: 'No employees found',
		description: 'Get started by adding your first employee to the system.',
		action: 'Add Employee',
	},
	department: {
		title: 'No departments found',
		description: 'Create departments to organize your workforce.',
		action: 'Create Department',
	},
	schedule: {
		title: 'No schedules found',
		description: 'Set up work schedules for your teams.',
		action: 'Create Schedule',
	},
	attendance: {
		title: 'No attendance records',
		description: 'Attendance data will appear here once employees start clocking in.',
		action: null,
	},
	leave: {
		title: 'No leave requests',
		description: 'Leave requests from employees will appear here.',
		action: 'Request Leave',
	},
	overtime: {
		title: 'No overtime records',
		description: 'Overtime requests will appear here.',
		action: 'Request Overtime',
	},
	payroll: {
		title: 'No payroll records',
		description: 'Generate payroll to see records here.',
		action: 'Generate Payroll',
	},
	'my-payroll': {
		title: 'No payslips yet',
		description: 'Your payslips will appear here once payroll is processed.',
		action: null,
	},
	holiday: {
		title: 'No holidays set',
		description: 'Add holidays to exclude them from working days calculation.',
		action: 'Add Holiday',
	},
	user: {
		title: 'No users found',
		description: 'Add users to grant them access to the system.',
		action: 'Add User',
	},
	company: {
		title: 'No companies found',
		description: 'Create companies to manage multiple organizations.',
		action: 'Add Company',
	},
	audit: {
		title: 'No audit logs',
		description: 'System activities will be logged here.',
		action: null,
	},
};

/**
 * Get empty state config for an entity
 * @param {string} entity - Entity type
 * @returns {object} Empty state configuration
 */
export function getEmptyStateConfig(entity) {
	return EMPTY_STATE_MESSAGES[entity] || {
		title: 'No data found',
		description: 'Data will appear here once available.',
		action: null,
	};
}

/**
 * Status labels for consistent display
 */
export const STATUS_LABELS = {
	// Attendance
	PRESENT: 'Present',
	ABSENT: 'Absent',
	LATE: 'Late',
	ON_LEAVE: 'On Leave',
	HALF_DAY: 'Half Day',
	WFH: 'Work From Home',
	
	// Leave & Overtime
	PENDING: 'Pending',
	APPROVED: 'Approved',
	REJECTED: 'Rejected',
	CANCELLED: 'Cancelled',
	COMPLETED: 'Completed',
	
	// Payroll
	DRAFT: 'Draft',
	PAID: 'Paid',
	
	// User roles
	SUPER_USER: 'Super User',
	ADMIN: 'Admin',
	MANAGER: 'Manager',
	EMPLOYEE: 'Employee',
};

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = 15000;

/**
 * Debounce delay for search inputs
 */
export const SEARCH_DEBOUNCE = 300;

/**
 * Animation durations
 */
export const ANIMATION = {
	FAST: 150,
	NORMAL: 200,
	SLOW: 300,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
	THEME: 'theme',
	TOKEN: 'token',
	REFRESH_TOKEN: 'refreshToken',
	USER: 'user',
	SIDEBAR_COLLAPSED: 'sidebarCollapsed',
};
