#!/bin/bash

# Script to remove all fallback/dummy data from frontend pages

PAGES=(
  "src/routes/dashboard/leave/+page.svelte"
  "src/routes/dashboard/attendance/+page.svelte"
  "src/routes/dashboard/department/+page.svelte"
  "src/routes/dashboard/holiday/+page.svelte"
  "src/routes/dashboard/payroll/+page.svelte"
  "src/routes/dashboard/schedule/+page.svelte"
  "src/routes/dashboard/my-payroll/+page.svelte"
  "src/routes/dashboard/user/+page.svelte"
  "src/routes/dashboard/attendance/reports/+page.svelte"
)

echo "Removing fallback data from frontend pages..."

# For each page, remove fallback data arrays and update logic
for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "Processing $page..."

    # Remove fallback data arrays (const fallbackX = [...])
    sed -i '/const fallback.*=.*\[/,/\];/d' "$page"

    # Remove "Use API data if available, otherwise use fallback" comments
    sed -i '/Use API data if available, otherwise use fallback/d' "$page"

    # Remove demo data indicators
    sed -i '/Showing demo data/d' "$page"

    # Remove "Using fallback data" messages
    sed -i '/Using fallback data/d' "$page"

    # Remove "Fallback dummy data" comments
    sed -i '/Fallback dummy data/d' "$page"

    echo "✅ Cleaned $page"
  fi
done

echo ""
echo "✅ All fallback data removed!"
echo "⚠️  Note: Manual review may be needed for complex conditional logic"
