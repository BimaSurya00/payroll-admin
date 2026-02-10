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
    import UserIcon from "@lucide/svelte/icons/user";
    import MailIcon from "@lucide/svelte/icons/mail";
    import PhoneIcon from "@lucide/svelte/icons/phone";
    import MapPinIcon from "@lucide/svelte/icons/map-pin";
    import WalletIcon from "@lucide/svelte/icons/wallet";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import ClockIcon from "@lucide/svelte/icons/clock";

    import { employeeStore } from "$lib/stores/employee.store.js";

    let id = $derived($page.params.id);
    let storeState = $state({ selected: null, loading: false, error: null });

    employeeStore.subscribe((state) => {
        storeState = state;
    });

    let employee = $derived(storeState.selected);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    let isForbidden = $derived(
        error?.includes("403") ||
            error?.toLowerCase().includes("forbidden") ||
            error?.toLowerCase().includes("access denied"),
    );

    onMount(async () => {
        if (id) {
            await employeeStore.fetchById(id);
        }
    });

    function goBack() {
        goto("/dashboard/employee");
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                await employeeStore.delete(id);
                goto("/dashboard/employee");
            } catch (err) {
                alert("Failed to delete employee: " + err.message);
            }
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
</script>

<svelte:head>
    <title>{employee?.name || "Employee Detail"} | Dashboard</title>
</svelte:head>

<DashboardHeader title="Employee Detail" subtitle="View employee information" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view this employee."
        />
    {:else if loading}
        <div class="flex items-center justify-center py-16">
            <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
            <span class="ml-2 text-muted-foreground">Loading employee...</span>
        </div>
    {:else if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {:else if employee}
        <!-- Back Button -->
        <div class="flex items-center justify-between">
            <Button variant="outline" onclick={goBack}>
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Employees
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

        <!-- Employee Card -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-4">
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                    >
                        <UserIcon class="h-8 w-8" />
                    </div>
                    <div>
                        <Card.Title class="text-2xl">{employee.name}</Card.Title
                        >
                        <Card.Description>{employee.email}</Card.Description>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <MailIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p class="font-medium">{employee.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <PhoneIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Phone
                                </p>
                                <p class="font-medium">
                                    {employee.phoneNumber || "-"}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <MapPinIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Address
                                </p>
                                <p class="font-medium">
                                    {employee.address || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"
                            >
                                <WalletIcon class="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Base Salary
                                </p>
                                <p class="font-medium text-green-600">
                                    {formatCurrency(employee.salaryBase)}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <CalendarIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Join Date
                                </p>
                                <p class="font-medium">
                                    {formatDate(employee.joinDate)}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <ClockIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Schedule
                                </p>
                                {#if employee.schedule}
                                    <p class="font-medium">
                                        {employee.schedule.name}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {employee.schedule.timeIn} - {employee
                                            .schedule.timeOut}
                                        {employee.schedule.allowedLateMinutes
                                            ? ` (Late Tolerance: ${employee.schedule.allowedLateMinutes} min)`
                                            : ""}
                                    </p>
                                    <p
                                        class="text-xs text-muted-foreground font-mono"
                                    >
                                        ID: {employee.scheduleId}
                                    </p>
                                {:else}
                                    <p
                                        class="font-medium text-muted-foreground"
                                    >
                                        No Schedule
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="text-center py-16">
            <p class="text-muted-foreground">Employee not found</p>
            <Button variant="outline" onclick={goBack} class="mt-4">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Employees
            </Button>
        </div>
    {/if}
</div>
