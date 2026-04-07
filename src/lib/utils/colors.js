/**
 * Status color utilities for consistent theming across the application
 * Uses semantic color tokens that work in both light and dark mode
 */

/**
 * Get color classes for employee positions
 */
export const positionColors = {
	'Manager': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
	'Software Engineer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
	'Product Designer': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
	'QA Engineer': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
	'DevOps Engineer': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
	'HR Specialist': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
	'Finance Analyst': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
	'Sales Representative': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
	'CEO': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
	'CTO': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

/**
 * Get color classes for departments
 */
export const departmentColors = {
	'Engineering': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
	'Product': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
	'Design': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
	'Marketing': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
	'Sales': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
	'HR': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
	'Finance': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
	'Operations': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

/**
 * Get color classes for attendance status
 */
export const attendanceColors = {
	'PRESENT': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
	'ABSENT': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
	'LATE': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
	'ON_LEAVE': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
	'HALF_DAY': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
	'WFH': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

/**
 * Get color classes for payroll status
 */
export const payrollColors = {
	'PAID': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
	'APPROVED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
	'PENDING': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
	'DRAFT': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
	'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

/**
 * Get color classes for leave status
 */
export const leaveColors = {
	'PENDING': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
	'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
	'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
	'CANCELLED': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
};

/**
 * Get color classes for overtime status
 */
export const overtimeColors = {
	'PENDING': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
	'APPROVED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
	'REJECTED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
	'COMPLETED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

/**
 * Get color classes for user roles
 */
export const roleColors = {
	'SUPER_USER': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
	'ADMIN': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
	'EMPLOYEE': 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
	'MANAGER': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

/**
 * Default color for unknown statuses
 */
export const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';

/**
 * Get color classes for any status type
 * @param {string} category - Category: 'position', 'department', 'attendance', 'payroll', 'leave', 'overtime', 'role'
 * @param {string} status - The status value
 * @returns {string} Tailwind color classes
 */
export function getStatusColor(category, status) {
	const colorMap = {
		position: positionColors,
		department: departmentColors,
		attendance: attendanceColors,
		payroll: payrollColors,
		leave: leaveColors,
		overtime: overtimeColors,
		role: roleColors,
	};
	
	return colorMap[category]?.[status] || defaultColor;
}

/**
 * Get a human-readable label for a status
 * @param {string} status - The status value
 * @returns {string} Formatted status label
 */
export function formatStatus(status) {
	if (!status) return '-';
	return status
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (l) => l.toUpperCase());
}
