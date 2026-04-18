<script>
    import { onMount } from 'svelte';
    import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
    import ErrorForbidden from '$lib/components/error-forbidden.svelte';
    import * as Table from '$lib/components/ui/table/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
    import CalendarIcon from '@lucide/svelte/icons/calendar';
    import DownloadIcon from '@lucide/svelte/icons/download';
    import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
    import LoaderIcon from '@lucide/svelte/icons/loader';
    import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
    import TrendingDownIcon from '@lucide/svelte/icons/trending-down';

    import { attendanceStore } from '$lib/stores/attendance.store.js';
    import { authStore } from '$lib/stores/auth.store.js';

    // Reactive state
    let storeState = $state({ loading: false, error: null });
    let authState = $state({ user: null });

    let reportData = $state(null);
    let selectedMonth = $state(new Date().getMonth() + 1);
    let selectedYear = $state(new Date().getFullYear());
    let selectedEmployee = $state(null);

    // Subscribe to stores
    attendanceStore.subscribe((state) => {
        storeState = state;
    });

    authStore.subscribe((state) => {
        authState = state;
    });

    // Check if user is admin
    let isAdmin = $derived(
        authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPER_USER'
    );

    // Check if error is forbidden
    let isForbidden = $derived(
        storeState.error?.includes('403') ||
            storeState.error?.toLowerCase().includes('forbidden') ||
            storeState.error?.toLowerCase().includes('access denied')
    );

    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch report on mount and when filters change
    async function fetchReport() {
        if (!isAdmin) return;

        storeState.loading = true;
        storeState.error = null;

        try {
            const params = {
                month: selectedMonth,
                year: selectedYear,
            };

            if (selectedEmployee) {
                params.employee_id = selectedEmployee;
            }

            const response = await attendanceStore.getMonthlyReport(params);
            reportData = response.data;
        } catch (err) {
            console.error('Failed to fetch attendance report:', err.message);
        } finally {
            storeState.loading = false;
        }
    }

    onMount(() => {
        fetchReport();
    });

    // Refresh function
    function handleRefresh() {
        fetchReport();
    }

    // Export CSV
    function exportCSV() {
        if (!reportData) return;

        const headers = ['Employee Name', 'Total Days', 'Present', 'Late', 'Absent', 'Present Rate'];
        const rows = reportData.records.map((record) => [
            record.employeeName,
            record.totalDays,
            record.presentDays,
            record.lateDays,
            record.absentDays,
            `${record.presentRate}%`,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_report_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    function getMonthName(month) {
        return new Date(selectedYear, month - 1).toLocaleDateString('id-ID', { month: 'long' });
    }

    function getPresentRateColor(rate) {
        if (rate >= 95) return 'text-green-600';
        if (rate >= 85) return 'text-yellow-600';
        return 'text-red-600';
    }

    // Calculated from report
    let summary = $derived(
        reportData?.summary || {
            totalEmployees: 0,
            avgPresentRate: 0,
            totalPresentDays: 0,
            totalLateDays: 0,
            totalAbsentDays: 0,
        }
    );

    let records = $derived(reportData?.records || []);
</script>

<svelte:head>
    <title>Attendance Reports | Dashboard</title>
</svelte:head>

<DashboardHeader title="Attendance Reports" subtitle="Monthly attendance summaries" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Back Button -->
    <Button variant="ghost" href="/dashboard/attendance" class="w-fit">
        <ArrowLeftIcon class="h-4 w-4 mr-2" />
        Back to Attendance
    </Button>

    <!-- Forbidden Error -->
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view attendance reports. This feature requires Admin access."
        />
    {:else}
        <!-- Regular Error Alert -->
        {#if error && !isForbidden}
            <div
                class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
                <p class="text-sm font-medium">Error: {error}</p>
            </div>
        {/if}

        <!-- Filters -->
        <Card.Root>
            <Card.Header>
                <Card.Title class="text-lg font-semibold">Report Filters</Card.Title>
            </Card.Header>
            <Card.Content>
                <div class="flex flex-wrap gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Month</label>
                        <select
                            class="rounded-md border border-input bg-background px-3 py-2"
                            bind:value={selectedMonth}
                            onchange={fetchReport}
                        >
                            {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as m}
                                <option value={m}>{getMonthName(m)}</option>
                            {/each}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Year</label>
                        <select
                            class="rounded-md border border-input bg-background px-3 py-2"
                            bind:value={selectedYear}
                            onchange={fetchReport}
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <Button variant="outline" onclick={handleRefresh} disabled={loading}>
                            {#if loading}
                                <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                            {:else}
                                <RefreshCwIcon class="h-4 w-4 mr-2" />
                            {/if}
                            Generate Report
                        </Button>
                        <Button onclick={exportCSV} disabled={loading || !reportData}>
                            <DownloadIcon class="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Summary Stats -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-5">
            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium text-muted-foreground">
                        Report Period
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <p class="text-xl font-bold">
                        {getMonthName(selectedMonth)} {selectedYear}
                    </p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium text-muted-foreground">
                        Employees
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <p class="text-2xl font-bold">{summary.totalEmployees}</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium text-muted-foreground">
                        Avg Present Rate
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <p class="text-2xl font-bold {getPresentRateColor(summary.avgPresentRate)}">
                        {summary.avgPresentRate.toFixed(1)}%
                    </p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium text-muted-foreground">
                        Total Late
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center gap-1">
                        <TrendingUpIcon class="h-4 w-4 text-orange-600" />
                        <p class="text-2xl font-bold text-orange-600">{summary.totalLateDays}</p>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-3">
                    <Card.Title class="text-sm font-medium text-muted-foreground">
                        Total Absent
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center gap-1">
                        <TrendingDownIcon class="h-4 w-4 text-red-600" />
                        <p class="text-2xl font-bold text-red-600">{summary.totalAbsentDays}</p>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Report Table -->
        <Card.Root class="flex-1">
            <Card.Header>
                <Card.Title class="text-xl font-semibold">
                    Attendance Report - {getMonthName(selectedMonth)} {selectedYear}
                </Card.Title>
                <Card.Description>
                    Monthly attendance summary by employee
                </Card.Description>
            </Card.Header>
            <Card.Content>
                {#if loading && !reportData}
                    <div class="flex items-center justify-center py-8">
                        <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
                        <span class="ml-2 text-muted-foreground">Loading report...</span>
                    </div>
                {:else}
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Employee</Table.Head>
                                <Table.Head class="text-center">Total Days</Table.Head>
                                <Table.Head class="text-center">Present</Table.Head>
                                <Table.Head class="text-center">Late</Table.Head>
                                <Table.Head class="text-center">Absent</Table.Head>
                                <Table.Head class="text-center">Present Rate</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each records as record (record.employeeId)}
                                <Table.Row>
                                    <Table.Cell>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                                            >
                                                {record.employeeName.charAt(0)}
                                            </div>
                                            <span class="font-medium">{record.employeeName}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <span class="font-medium">{record.totalDays}</span>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <span class="text-green-600 font-semibold">
                                            {record.presentDays}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <span class="text-orange-600 font-semibold">
                                            {record.lateDays}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <span class="text-red-600 font-semibold">
                                            {record.absentDays}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="text-center">
                                        <span
                                            class="text-lg font-bold {getPresentRateColor(
                                                record.presentRate
                                            )}"
                                        >
                                            {record.presentRate.toFixed(1)}%
                                        </span>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                {/if}
            </Card.Content>
        </Card.Root>
    {/if}
</div>
