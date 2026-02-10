<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import TimerIcon from "@lucide/svelte/icons/timer";
    import MapPinIcon from "@lucide/svelte/icons/map-pin";
    import FileTextIcon from "@lucide/svelte/icons/file-text";

    import { scheduleStore } from "$lib/stores/schedule.store.js";

    let id = $derived($page.params.id);
    let storeState = $state({ selected: null, loading: false, error: null });

    scheduleStore.subscribe((state) => {
        storeState = state;
    });

    let schedule = $derived(storeState.selected);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    let isForbidden = $derived(
        error?.includes("403") ||
            error?.toLowerCase().includes("forbidden") ||
            error?.toLowerCase().includes("access denied"),
    );

    onMount(async () => {
        if (id) {
            await scheduleStore.fetchById(id);
        }
    });

    function goBack() {
        goto("/dashboard/schedule");
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this schedule?")) {
            try {
                await scheduleStore.delete(id);
                goto("/dashboard/schedule");
            } catch (err) {
                alert("Failed to delete schedule: " + err.message);
            }
        }
    }
</script>

<svelte:head>
    <title>{schedule?.name || "Schedule Detail"} | Dashboard</title>
</svelte:head>

<DashboardHeader title="Schedule Detail" subtitle="View schedule information" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view this schedule."
        />
    {:else if loading}
        <div class="flex items-center justify-center py-16">
            <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
            <span class="ml-2 text-muted-foreground">Loading schedule...</span>
        </div>
    {:else if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {:else if schedule}
        <!-- Back Button -->
        <div class="flex items-center justify-between">
            <Button variant="outline" onclick={goBack}>
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Schedules
            </Button>
            <div class="flex gap-2">
                <Button variant="outline">
                    <PencilIcon class="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button variant="destructive" onclick={handleDelete}>
                    <TrashIcon class="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>

        <!-- Schedule Card -->
        <Card.Root>
            <div class="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <Card.Header>
                <Card.Title class="text-2xl">{schedule.name}</Card.Title>
                <Card.Description
                    >{schedule.description || "Work schedule"}</Card.Description
                >
            </Card.Header>
            <Card.Content>
                <div class="grid gap-6 md:grid-cols-2">
                    <!-- Time In/Out -->
                    <div class="flex gap-4">
                        <div
                            class="flex-1 rounded-lg bg-green-100 dark:bg-green-900/30 p-4"
                        >
                            <div
                                class="flex items-center gap-2 text-sm text-muted-foreground mb-2"
                            >
                                <ClockIcon class="h-4 w-4 text-green-600" />
                                <span>Clock In</span>
                            </div>
                            <p class="text-3xl font-bold text-green-600">
                                {schedule.timeIn}
                            </p>
                        </div>
                        <div
                            class="flex-1 rounded-lg bg-red-100 dark:bg-red-900/30 p-4"
                        >
                            <div
                                class="flex items-center gap-2 text-sm text-muted-foreground mb-2"
                            >
                                <ClockIcon class="h-4 w-4 text-red-600" />
                                <span>Clock Out</span>
                            </div>
                            <p class="text-3xl font-bold text-red-600">
                                {schedule.timeOut}
                            </p>
                        </div>
                    </div>

                    <!-- Settings -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30"
                            >
                                <TimerIcon class="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Late Tolerance
                                </p>
                                <p class="font-medium">
                                    {schedule.allowedLateMinutes} minutes
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
                            >
                                <MapPinIcon class="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Check-in Radius
                                </p>
                                <p class="font-medium">
                                    {schedule.allowedRadiusMeters} meters
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <FileTextIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Schedule ID
                                </p>
                                <p class="font-mono text-sm">{schedule.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="text-center py-16">
            <p class="text-muted-foreground">Schedule not found</p>
            <Button variant="outline" onclick={goBack} class="mt-4">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Schedules
            </Button>
        </div>
    {/if}
</div>
