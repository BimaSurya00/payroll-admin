<script>
    import { onMount } from 'svelte';
    import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import LoaderIcon from '@lucide/svelte/icons/loader';
    import CalendarIcon from '@lucide/svelte/icons/calendar';
    import ClockIcon from '@lucide/svelte/icons/clock';
    import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
    import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
    import CalendarOffIcon from '@lucide/svelte/icons/calendar-off';

    import { attendanceStore } from '$lib/stores/attendance.store.js';

    let storeState = $state({
        monthlySummary: null,
        loading: false,
        error: null,
    });

    // Current month and year
    let currentDate = new Date();
    let selectedMonth = $state(currentDate.getMonth() + 1);
    let selectedYear = $state(currentDate.getFullYear());

    attendanceStore.subscribe((state) => {
        storeState = state;
    });

    let monthlySummary = $derived(storeState.monthlySummary);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    // Generate year options (current year and 2 years back)
    const years = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() - i);

    onMount(async () => {
        await fetchMonthlySummary();
    });

    async function fetchMonthlySummary() {
        try {
            await attendanceStore.getMyMonthlySummary({
                month: selectedMonth,
                year: selectedYear,
            });
        } catch (err) {
            console.error('Error fetching monthly summary:', err);
        }
    }

    function handleMonthChange(e) {
        selectedMonth = parseInt(e.target.value);
        fetchMonthlySummary();
    }

    function handleYearChange(e) {
        selectedYear = parseInt(e.target.value);
        fetchMonthlySummary();
    }

    function formatNumber(num) {
        if (!num && num !== 0) return '-';
        return new Intl.NumberFormat('id-ID').format(num);
    }

    function getWorkingDaysInMonth(year, month) {
        const daysInMonth = new Date(year, month, 0).getDate();
        let workingDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
        }
        return workingDays;
    }

    let workingDays = $derived(getWorkingDaysInMonth(selectedYear, selectedMonth));
</script>

<svelte:head>
    <title>My Attendance Summary | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="My Attendance Summary"
    subtitle="View your monthly attendance statistics"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Month/Year Selector -->
    <Card.Root>
        <Card.Header>
            <Card.Title class="flex items-center gap-2">
                <CalendarIcon class="h-5 w-5" />
                Select Period
            </Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="flex flex-wrap gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Month</label>
                    <select
                        class="rounded-md border border-input bg-background px-3 py-2"
                        value={selectedMonth}
                        onchange={handleMonthChange}
                    >
                        {#each months as month}
                            <option value={month.value}>{month.label}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Year</label>
                    <select
                        class="rounded-md border border-input bg-background px-3 py-2"
                        value={selectedYear}
                        onchange={handleYearChange}
                    >
                        {#each years as year}
                            <option value={year}>{year}</option>
                        {/each}
                    </select>
                </div>
            </div>
        </Card.Content>
    </Card.Root>

    {#if loading}
        <div class="flex items-center justify-center py-12">
            <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
            <span class="ml-2 text-muted-foreground">Loading summary...</span>
        </div>
    {:else if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {:else if monthlySummary}
        <!-- Summary Cards -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium text-muted-foreground"
                        >Working Days</Card.Title>
                    <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">{formatNumber(workingDays)}</div>
                    <p class="text-xs text-muted-foreground">Days in month</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium text-muted-foreground"
                        >Present</Card.Title>
                    <CheckCircleIcon class="h-4 w-4 text-green-600" />
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold text-green-600"
                        >{formatNumber(monthlySummary.presentDays || 0)}</div>
                    <p class="text-xs text-muted-foreground">Days attended</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium text-muted-foreground"
                        >Late</Card.Title>
                    <ClockIcon class="h-4 w-4 text-orange-600" />
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold text-orange-600"
                        >{formatNumber(monthlySummary.lateDays || 0)}</div>
                    <p class="text-xs text-muted-foreground">Late arrivals</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Card.Title class="text-sm font-medium text-muted-foreground"
                        >Absent</Card.Title>
                    <AlertCircleIcon class="h-4 w-4 text-red-600" />
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold text-red-600"
                        >{formatNumber(monthlySummary.absentDays || 0)}</div>
                    <p class="text-xs text-muted-foreground">Days missed</p>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Detailed Stats -->
        <div class="grid gap-4 md:grid-cols-2">
            <Card.Root>
                <Card.Header>
                    <Card.Title>Attendance Breakdown</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div class="flex items-center gap-3">
                                <CheckCircleIcon class="h-5 w-5 text-green-600" />
                                <span>Present (On Time)</span>
                            </div>
                            <span class="font-bold text-green-600"
                                >{formatNumber(monthlySummary.presentDays || 0)}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                            <div class="flex items-center gap-3">
                                <ClockIcon class="h-5 w-5 text-orange-600" />
                                <span>Late</span>
                            </div>
                            <span class="font-bold text-orange-600"
                                >{formatNumber(monthlySummary.lateDays || 0)}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <div class="flex items-center gap-3">
                                <AlertCircleIcon class="h-5 w-5 text-red-600" />
                                <span>Absent</span>
                            </div>
                            <span class="font-bold text-red-600"
                                >{formatNumber(monthlySummary.absentDays || 0)}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <div class="flex items-center gap-3">
                                <CalendarOffIcon class="h-5 w-5 text-purple-600" />
                                <span>On Leave</span>
                            </div>
                            <span class="font-bold text-purple-600"
                                >{formatNumber(monthlySummary.leaveDays || 0)}</span>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Attendance Rate</Card.Title>
                </Card.Header>
                <Card.Content>
                    {#if workingDays > 0}
                        {@const attendanceRate = ((monthlySummary.presentDays || 0) / workingDays) * 100}
                        {@const lateRate = ((monthlySummary.lateDays || 0) / workingDays) * 100}
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm font-medium">Attendance Rate</span>
                                    <span class="text-sm font-bold">{attendanceRate.toFixed(1)}%</span>
                                </div>
                                <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        class="h-full bg-green-500 transition-all"
                                        style="width: {Math.min(attendanceRate, 100)}%"
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between mb-2">
                                    <span class="text-sm font-medium">Punctuality Rate</span>
                                    <span class="text-sm font-bold">{(100 - lateRate).toFixed(1)}%</span>
                                </div>
                                <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        class="h-full bg-blue-500 transition-all"
                                        style="width: {Math.max(0, 100 - lateRate)}%"
                                    ></div>
                                </div>
                            </div>

                            <p class="text-sm text-muted-foreground mt-4">
                                Based on {workingDays} working days in {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                            </p>
                        </div>
                    {:else}
                        <p class="text-muted-foreground">No data available</p>
                    {/if}
                </Card.Content>
            </Card.Root>
        </div>
    {:else}
        <Card.Root>
            <Card.Content class="py-8 text-center">
                <p class="text-muted-foreground">No attendance data available for this period</p>
            </Card.Content>
        </Card.Root>
    {/if}
</div>