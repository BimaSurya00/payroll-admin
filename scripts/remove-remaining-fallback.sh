#!/bin/bash

# Quick script to remove fallback data from remaining 3 pages

# 1. My-Payroll page
sed -i '/const fallbackPayrolls = \[/,/\];/d' src/routes/dashboard/my-payroll/+page.svelte
sed -i 's/storeState\.data\.length > 0 ? storeState\.data : fallbackPayrolls/storeState.data/g' src/routes/dashboard/my-payroll/+page.svelte
sed -i '/Using fallback data/d' src/routes/dashboard/my-payroll/+page.svelte
sed -i '/Showing demo data/d' src/routes/dashboard/my-payroll/+page.svelte

# 2. User page
sed -i '/const fallbackUsers = \[/,/\];/d' src/routes/dashboard/user/+page.svelte
sed -i 's/storeState\.data\.length > 0 ? storeState\.data : fallbackUsers/storeState.data/g' src/routes/dashboard/user/+page.svelte
sed -i '/Using fallback data/d' src/routes/dashboard/user/+page.svelte
sed -i '/Showing demo data/d' src/routes/dashboard/user/+page.svelte

# 3. Attendance/Reports page
sed -i '/const fallbackReport = {/,/};/d' src/routes/dashboard/attendance/reports/+page.svelte
sed -i '/response.data || fallbackReport/d' src/routes/dashboard/attendance/reports/+page.svelte
sed -i '/reportData = fallbackReport/d' src/routes/dashboard/attendance/reports/+page.svelte
sed -i '/Using fallback data/d' src/routes/dashboard/attendance/reports/+page.svelte

echo "✅ All fallback data removed from remaining 3 pages!"
