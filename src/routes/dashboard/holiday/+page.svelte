<script>
    import { onMount } from 'svelte';
    import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
    import ErrorForbidden from '$lib/components/error-forbidden.svelte';
    import * as Table from '$lib/components/ui/table/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import CalendarIcon from '@lucide/svelte/icons/calendar';
    import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

    import LoaderIcon from '@lucide/svelte/icons/loader';
    import PencilIcon from '@lucide/svelte/icons/pencil';
    import TrashIcon from '@lucide/svelte/icons/trash';

    import { holidayStore } from '$lib/stores/holiday.store.js';
    import { authStore } from '$lib/stores/auth.store.js';
    import HolidayCreateDialog from '$lib/components/dashboard/holiday-create-dialog.svelte';

    // Reactive state
    let storeState = $state({ data: [], loading: false, error: null });
    let authState = $state({ user: null });
    let selectedYear = $state(new Date().getFullYear());

    // Subscribe to stores
    holidayStore.subscribe((state) => {
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

    // Use API data only
    let holidays = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await holidayStore.fetchByYear(selectedYear);
        } catch (err) {
            console.error('Failed to fetch holiday data:', err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await holidayStore.fetchByYear(selectedYear);
    }

    // Delete function
    async function handleDelete(id) {
        if (confirm('Are you sure you want to delete this holiday?')) {
            try {
                await holidayStore.delete(id);
            } catch (err) {
                alert('Failed to delete holiday: ' + err.message);
            }
        }
    }

    // Change year
    async function handleYearChange(year) {
        selectedYear = year;
        await holidayStore.fetchByYear(year);
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function getYearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 2; i <= currentYear + 2; i++) {
            years.push(i);
        }
        return years;
    }

    // Stats
    let totalHolidays = $derived(holidays.length);
    let recurringCount = $derived(holidays.filter((h) => h.isRecurring).length);
    let upcomingCount = $derived(
        holidays.filter((h) => new Date(h.date) > new Date()).length
    );
</script>

<svelte:head>
    <title>Holiday Management | Dashboard</title>
</svelte:head>

<DashboardHeader title="Holiday Management" subtitle="Manage company holidays and time off" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Forbidden Error -->
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to manage holidays. This feature requires Admin access."
        />
    {:else}
        <!-- Regular Error Alert -->
        {#if error && !isForbidden}
            <div
                class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
                <p class="text-sm font-medium">Error: {error}</p>
                <p class="text-xs mt-1">Click refresh to retry.</p>
            </div>
        {/if}

        <!-- Stats Cards -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">Total Holidays</p>
                <p class="text-2xl font-bold mt-1">{totalHolidays}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">Recurring</p>
                <p class="text-2xl font-bold mt-1 text-blue-600">{recurringCount}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p class="text-2xl font-bold mt-1 text-green-600">{upcomingCount}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">Selected Year</p>
                <p class="text-2xl font-bold mt-1 text-purple-600">{selectedYear}</p>
            </div>
        </div>

        <!-- Holiday Table Card -->
        <Card.Root class="flex-1">
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <Card.Title class="text-xl font-semibold">Holiday List</Card.Title>
                    <Card.Description>
                        Company holidays for {selectedYear}
                        {#if storeState.data.length === 0 && !loading}

                        {/if}
                    </Card.Description>
                </div>
                <div class="flex gap-2">
                    <!-- Year Selector -->
                    <select
                        class="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedYear}
                        onchange={(e) => handleYearChange(parseInt(e.target.value))}
                    >
                        {#each getYearOptions() as year}
                            <option value={year}>{year}</option>
                        {/each}
                    </select>
                    <Button variant="outline" onclick={handleRefresh} disabled={loading}>
                        {#if loading}
                            <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        {:else}
                            <RefreshCwIcon class="h-4 w-4 mr-2" />
                        {/if}
                        Refresh
                    </Button>
                    <HolidayCreateDialog />
                </div>
            </Card.Header>
            <Card.Content>
                {#if loading && storeState.data.length === 0}
                    <div class="flex items-center justify-center py-8">
                        <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
                        <span class="ml-2 text-muted-foreground">Loading holidays...</span>
                    </div>
                {:else}
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Date</Table.Head>
                                <Table.Head>Name</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Type</Table.Head>
                                <Table.Head class="text-right">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each holidays as holiday (holiday.id)}
                                <Table.Row>
                                    <Table.Cell>
                                        <div class="flex items-center gap-2">
                                            <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                                            <span class="font-medium">{formatDate(holiday.date)}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="font-semibold">{holiday.name}</span>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground">
                                        {holiday.description || '-'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {#if holiday.isRecurring}
                                            <span
                                                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                            >
                                                Recurring
                                            </span>
                                        {:else}
                                            <span
                                                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                            >
                                                One-time
                                            </span>
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" class="h-8 w-8">
                                                <PencilIcon class="h-4 w-4" />
                                                <span class="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8 text-destructive"
                                                onclick={() => handleDelete(holiday.id)}
                                            >
                                                <TrashIcon class="h-4 w-4" />
                                                <span class="sr-only">Delete</span>
                                            </Button>
                                        </div>
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
