<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import MapPinIcon from "@lucide/svelte/icons/map-pin";
    import TimerIcon from "@lucide/svelte/icons/timer";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    // Import store
    import { scheduleStore } from "$lib/stores/schedule.store.js";
    import ScheduleCreateDialog from "$lib/components/dashboard/schedule-create-dialog.svelte";
    import ScheduleEditDialog from "$lib/components/dashboard/schedule-edit-dialog.svelte";

    // Reactive state from store
    let storeState = $state({ data: [], loading: false, error: null });

    // Subscribe to store
    scheduleStore.subscribe((state) => {
        storeState = state;
    });

    // Check if error is forbidden
    let isForbidden = $derived(
        storeState.error?.includes("403") ||
            storeState.error?.toLowerCase().includes("forbidden") ||
            storeState.error?.toLowerCase().includes("access denied"),
    );

    // Use API data only
    let schedules = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await scheduleStore.fetchAll();
        } catch (err) {
            console.error("Failed to fetch schedule data:", err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await scheduleStore.fetchAll();
    }

    // Delete function
    async function handleDelete(id) {
        if (confirm("Are you sure you want to delete this schedule?")) {
            try {
                await scheduleStore.delete(id);
            } catch (err) {
                alert("Failed to delete schedule: " + err.message);
            }
        }
    }

    function getShiftColor(name) {
        const colors = {
            "Morning Shift": "from-amber-500 to-orange-500",
            "Afternoon Shift": "from-blue-500 to-cyan-500",
            "Night Shift": "from-indigo-500 to-purple-500",
            "Flexible Hours": "from-green-500 to-emerald-500",
            "Office Hours": "from-teal-500 to-cyan-500",
        };
        return colors[name] || "from-gray-500 to-slate-500";
    }

    function getShiftBgColor(name) {
        const colors = {
            "Morning Shift": "bg-amber-100 dark:bg-amber-900/30",
            "Afternoon Shift": "bg-blue-100 dark:bg-blue-900/30",
            "Night Shift": "bg-indigo-100 dark:bg-indigo-900/30",
            "Flexible Hours": "bg-green-100 dark:bg-green-900/30",
            "Office Hours": "bg-teal-100 dark:bg-teal-900/30",
        };
        return colors[name] || "bg-gray-100 dark:bg-gray-900/30";
    }

    // Calculate stats
    let avgLateTolerance = $derived(
        schedules.length > 0
            ? Math.round(
                  schedules.reduce((sum, s) => sum + s.allowedLateMinutes, 0) /
                      schedules.length,
              )
            : 0,
    );
    let avgRadius = $derived(
        schedules.length > 0
            ? Math.round(
                  schedules.reduce((sum, s) => sum + s.allowedRadiusMeters, 0) /
                      schedules.length,
              )
            : 0,
    );
</script>

<svelte:head>
    <title>Schedule Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Schedule Management"
    subtitle="Manage work shifts and schedules"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Forbidden Error -->
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to manage schedules. This feature requires Admin access."
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

        <!-- Stats Cards -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Total Schedules
                </p>
                <p class="text-2xl font-bold mt-1">{schedules.length}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Morning Shifts
                </p>
                <p class="text-2xl font-bold mt-1 text-amber-600">
                    {schedules.filter(
                        (s) => s.name.includes("Morning") || s.timeIn < "12:00",
                    ).length}
                </p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Avg Late Tolerance
                </p>
                <p class="text-2xl font-bold mt-1 text-blue-600">
                    {avgLateTolerance} min
                </p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Avg Radius
                </p>
                <p class="text-2xl font-bold mt-1 text-green-600">
                    {avgRadius} m
                </p>
            </div>
        </div>

        <!-- Header with Add Button -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold">Work Schedules</h2>
                <p class="text-sm text-muted-foreground">
                    Configure shift times and attendance rules
                    {#if storeState.data.length === 0 && !loading && !error}

                    {/if}
                </p>
            </div>
            <div class="flex gap-2">
                <Button
                    variant="outline"
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
                <ScheduleCreateDialog />
            </div>
        </div>

        <!-- Loading State -->
        {#if loading && storeState.data.length === 0}
            <div class="flex items-center justify-center py-8">
                <LoaderIcon
                    class="h-8 w-8 animate-spin text-muted-foreground"
                />
                <span class="ml-2 text-muted-foreground"
                    >Loading schedules...</span
                >
            </div>
        {:else}
            <!-- Schedule Cards Grid -->
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {#each schedules as schedule (schedule.id)}
                    <Card.Root class="overflow-hidden">
                        <div
                            class="h-2 bg-gradient-to-r {getShiftColor(
                                schedule.name,
                            )}"
                        ></div>

                        <Card.Header class="pb-3">
                            <div class="flex items-start justify-between">
                                <div>
                                    <Card.Title class="text-lg"
                                        >{schedule.name}</Card.Title
                                    >
                                    <Card.Description class="mt-1"
                                        >{schedule.description ||
                                            "Work schedule"}</Card.Description
                                    >
                                </div>
                                <div class="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8"
                                        onclick={() =>
                                            goto(
                                                `/dashboard/schedule/${schedule.id}`,
                                            )}
                                    >
                                        <EyeIcon class="h-4 w-4" />
                                    </Button>
                                    <ScheduleEditDialog {schedule} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8 text-destructive"
                                        onclick={() =>
                                            handleDelete(schedule.id)}
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Content class="space-y-4">
                            <div class="flex items-center gap-4">
                                <div
                                    class="flex-1 rounded-lg {getShiftBgColor(
                                        schedule.name,
                                    )} p-3"
                                >
                                    <div
                                        class="flex items-center gap-2 text-sm text-muted-foreground mb-1"
                                    >
                                        <ClockIcon class="h-4 w-4" />
                                        <span>Time In</span>
                                    </div>
                                    <p class="text-xl font-bold">
                                        {schedule.timeIn}
                                    </p>
                                </div>
                                <div
                                    class="flex-1 rounded-lg {getShiftBgColor(
                                        schedule.name,
                                    )} p-3"
                                >
                                    <div
                                        class="flex items-center gap-2 text-sm text-muted-foreground mb-1"
                                    >
                                        <ClockIcon class="h-4 w-4" />
                                        <span>Time Out</span>
                                    </div>
                                    <p class="text-xl font-bold">
                                        {schedule.timeOut}
                                    </p>
                                </div>
                            </div>

                            <div class="flex gap-4">
                                <div class="flex items-center gap-2 text-sm">
                                    <div
                                        class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"
                                    >
                                        <TimerIcon
                                            class="h-4 w-4 text-orange-600"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-muted-foreground text-xs"
                                        >
                                            Late Tolerance
                                        </p>
                                        <p class="font-medium">
                                            {schedule.allowedLateMinutes} min
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 text-sm">
                                    <div
                                        class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
                                    >
                                        <MapPinIcon
                                            class="h-4 w-4 text-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <p
                                            class="text-muted-foreground text-xs"
                                        >
                                            Check-in Radius
                                        </p>
                                        <p class="font-medium">
                                            {schedule.allowedRadiusMeters} m
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    {/if}
</div>
