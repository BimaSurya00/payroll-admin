<script>
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import FilterIcon from "@lucide/svelte/icons/filter";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import SearchIcon from "@lucide/svelte/icons/search";
    import XIcon from "@lucide/svelte/icons/x";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import EditIcon from "@lucide/svelte/icons/edit";

    import { attendanceStore } from "$lib/stores/attendance.store.js";
    import { authStore } from "$lib/stores/auth.store.js";
    import AttendanceCorrectionDialog from "$lib/components/dashboard/attendance-correction-dialog.svelte";

    let storeState = $state({ data: [], loading: false, error: null });
    let authState = $state({ user: null });
    let showCorrectionDialog = $state(false);
    let selectedAttendance = $state(null);

    let filterDateFrom = $state(new Date().toISOString().split("T")[0]);
    let filterDateTo = $state(new Date().toISOString().split("T")[0]);
    let showFilter = $state(false);

    const today = new Date().toISOString().split("T")[0];

    attendanceStore.subscribe((state) => {
        storeState = state;
    });

    authStore.subscribe((state) => {
        authState = state;
    });

    let isAdmin = $derived(
        authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPER_USER'
    );

    let isForbidden = $derived(
        storeState.error?.includes("403") ||
            storeState.error?.toLowerCase().includes("forbidden") ||
            storeState.error?.toLowerCase().includes("access denied"),
    );

    let attendances = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    let isFiltered = $derived(filterDateFrom !== today || filterDateTo !== today);

    let filterLabel = $derived(
        isFiltered
            ? `${formatDate(filterDateFrom)}${filterDateFrom !== filterDateTo ? ' - ' + formatDate(filterDateTo) : ''}`
            : formatDate(today)
    );

    onMount(async () => {
        try {
            await attendanceStore.fetchAll({ dateFrom: filterDateFrom, dateTo: filterDateTo });
        } catch (err) {
            console.error("Failed to fetch attendance data:", err.message);
        }
    });

    async function fetchWithFilter() {
        await attendanceStore.fetchAll({ dateFrom: filterDateFrom, dateTo: filterDateTo });
    }

    async function handleRefresh() {
        await fetchWithFilter();
    }

    function handleApplyFilter() {
        showFilter = false;
        fetchWithFilter();
    }

    function handleResetFilter() {
        filterDateFrom = today;
        filterDateTo = today;
        showFilter = false;
        fetchWithFilter();
    }

    function toggleFilter() {
        showFilter = !showFilter;
    }

    function getStatusConfig(status) {
        const configs = {
            PRESENT: {
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                label: "Present",
                icon: "✓",
            },
            LATE: {
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                label: "Late",
                icon: "⏰",
            },
            ABSENT: {
                color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                label: "Absent",
                icon: "✕",
            },
            EARLY_LEAVE: {
                color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
                label: "Early Leave",
                icon: "↩",
            },
            ON_LEAVE: {
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                label: "On Leave",
                icon: "📅",
            },
        };
        return configs[status] || configs.PRESENT;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function formatDateShort(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    let presentCount = $derived(
        attendances.filter((a) => a.status === "PRESENT").length,
    );
    let lateCount = $derived(
        attendances.filter((a) => a.status === "LATE").length,
    );
    let absentCount = $derived(
        attendances.filter((a) => a.status === "ABSENT").length,
    );
    let onLeaveCount = $derived(
        attendances.filter(
            (a) => a.status === "ON_LEAVE" || a.status === "EARLY_LEAVE",
        ).length,
    );
</script>

<svelte:head>
    <title>Attendance Monitoring | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Attendance Monitoring"
    subtitle="Monitor daily employee attendance"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Forbidden Error -->
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view attendance records. This feature requires Admin access."
        />
    {:else}
        <!-- Regular Error Alert -->
        {#if error && !isForbidden}
            <div
                class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
                <p class="text-sm font-medium">Error: {error}</p>
                <p class="text-xs mt-1">
                    Click refresh to retry.
                </p>
            </div>
        {/if}

        <!-- Date filter panel -->
        {#if showFilter}
            <Card.Root>
                <Card.Content class="pt-4">
                    <div class="flex flex-wrap gap-4 items-end">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-sm font-medium text-muted-foreground">Date From</label>
                            <input
                                type="date"
                                bind:value={filterDateFrom}
                                max={filterDateTo}
                                class="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-sm font-medium text-muted-foreground">Date To</label>
                            <input
                                type="date"
                                bind:value={filterDateTo}
                                min={filterDateFrom}
                                class="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div class="flex gap-2">
                            <Button variant="default" size="sm" onclick={handleApplyFilter}>
                                <SearchIcon class="h-4 w-4 mr-1.5" />
                                Apply
                            </Button>
                            <Button variant="outline" size="sm" onclick={handleResetFilter}>
                                <XIcon class="h-4 w-4 mr-1.5" />
                                Reset
                            </Button>
                            <Button variant="ghost" size="sm" onclick={toggleFilter}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        {/if}

        <!-- Date display and actions -->
        <div
            class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
        >
            <div
                class="flex items-center gap-2 rounded-lg border bg-card p-2 px-4"
            >
                <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                <span class="font-medium">{filterLabel}</span>
                {#if isFiltered}
                    <Button variant="ghost" size="sm" class="h-6 px-2 text-xs" onclick={handleResetFilter}>
                        <XIcon class="h-3 w-3 mr-1" />
                        Clear
                    </Button>
                {/if}
                {#if storeState.data.length === 0 && !loading && !isFiltered}
                    <span class="text-yellow-600 text-sm">(No data today)</span>
                {/if}
            </div>
            <div class="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onclick={toggleFilter}
                >
                    <FilterIcon class="h-4 w-4 mr-2" />
                    Filter Date
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onclick={handleRefresh}
                    disabled={loading}
                >
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                    {:else}
                        <RefreshCwIcon class="h-4 w-4 mr-2" />
                    {/if}
                    Refresh
                </Button>
                <Button variant="outline" size="sm" href="/dashboard/attendance/reports">
                    <CalendarIcon class="h-4 w-4 mr-2" />
                    Monthly Reports
                </Button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center gap-2">
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                    >
                        <span class="text-green-600">✓</span>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">
                            Present
                        </p>
                        <p class="text-2xl font-bold text-green-600">
                            {presentCount}
                        </p>
                    </div>
                </div>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center gap-2">
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30"
                    >
                        <span class="text-yellow-600">⏰</span>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">
                            Late
                        </p>
                        <p class="text-2xl font-bold text-yellow-600">
                            {lateCount}
                        </p>
                    </div>
                </div>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center gap-2">
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                    >
                        <span class="text-red-600">✕</span>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">
                            Absent
                        </p>
                        <p class="text-2xl font-bold text-red-600">
                            {absentCount}
                        </p>
                    </div>
                </div>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center gap-2">
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
                    >
                        <span class="text-blue-600">📅</span>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">
                            On Leave
                        </p>
                        <p class="text-2xl font-bold text-blue-600">
                            {onLeaveCount}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Attendance Table Card -->
        <Card.Root class="flex-1">
            <Card.Header class="pb-4">
                <Card.Title class="text-xl font-semibold"
                    >Attendance Records</Card.Title
                >
                <Card.Description
                    >{isFiltered ? 'Filtered' : "Today's"} attendance log for all employees</Card.Description
                >
            </Card.Header>
            <Card.Content>
                {#if loading && storeState.data.length === 0}
                    <div class="flex items-center justify-center py-8">
                        <LoaderIcon
                            class="h-8 w-8 animate-spin text-muted-foreground"
                        />
                        <span class="ml-2 text-muted-foreground"
                            >Loading attendances...</span
                        >
                    </div>
                {:else}
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Employee</Table.Head>
                                <Table.Head>Date</Table.Head>
                                <Table.Head>Clock In</Table.Head>
                                <Table.Head>Clock Out</Table.Head>
                                <Table.Head>Status</Table.Head>
                                <Table.Head>Notes</Table.Head>
                                {#if isAdmin}
                                    <Table.Head class="text-right">Actions</Table.Head>
                                {/if}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each attendances as attendance (attendance.id)}
                                <Table.Row>
                                    <Table.Cell>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                                            >
                                                {(
                                                    attendance.employeeName ||
                                                    attendance.name ||
                                                    "?"
                                                ).charAt(0)}
                                            </div>
                                            <span class="font-medium"
                                                >{attendance.employeeName ||
                                                    attendance.name}</span
                                            >
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground"
                                        >{attendance.date}</Table.Cell
                                    >
                                    <Table.Cell>
                                        {#if attendance.clockInTime}
                                            <div
                                                class="flex items-center gap-1.5"
                                            >
                                                <ClockIcon
                                                    class="h-3.5 w-3.5 text-green-600"
                                                />
                                                <span class="font-medium"
                                                    >{attendance.clockInTime}</span
                                                >
                                            </div>
                                        {:else}
                                            <span class="text-muted-foreground"
                                                >-</span
                                            >
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if attendance.clockOutTime}
                                            <div
                                                class="flex items-center gap-1.5"
                                            >
                                                <ClockIcon
                                                    class="h-3.5 w-3.5 text-red-600"
                                                />
                                                <span class="font-medium"
                                                    >{attendance.clockOutTime}</span
                                                >
                                            </div>
                                        {:else}
                                            <span class="text-muted-foreground"
                                                >-</span
                                            >
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span
                                            class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusConfig(
                                                attendance.status,
                                            ).color}"
                                        >
                                            <span
                                                >{getStatusConfig(
                                                    attendance.status,
                                                ).icon}</span
                                            >
                                            {getStatusConfig(attendance.status)
                                                .label}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell
                                        class="text-muted-foreground text-sm max-w-[200px] truncate"
                                    >
                                        {attendance.notes || "-"}
                                    </Table.Cell>
                                    {#if isAdmin}
                                        <Table.Cell class="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onclick={() => {
                                                    selectedAttendance = attendance;
                                                    showCorrectionDialog = true;
                                                }}
                                            >
                                                <EditIcon class="h-4 w-4 mr-1" />
                                                Correct
                                            </Button>
                                        </Table.Cell>
                                    {/if}
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                {/if}
            </Card.Content>
        </Card.Root>
    {/if}
</div>

<!-- Attendance Correction Dialog -->
<AttendanceCorrectionDialog
    bind:open={showCorrectionDialog}
    attendance={selectedAttendance}
/>
