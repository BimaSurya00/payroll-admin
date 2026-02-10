<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import DownloadIcon from "@lucide/svelte/icons/download";
    import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import UserIcon from "@lucide/svelte/icons/user";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import WalletIcon from "@lucide/svelte/icons/wallet";
    import ClockIcon from "@lucide/svelte/icons/clock";

    import { payrollStore } from "$lib/stores/payroll.store.js";

    let id = $derived($page.params.id);
    let storeState = $state({ selected: null, loading: false, error: null });

    payrollStore.subscribe((state) => {
        storeState = state;
    });

    let payroll = $derived(storeState.selected);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    let isForbidden = $derived(
        error?.includes("403") ||
            error?.toLowerCase().includes("forbidden") ||
            error?.toLowerCase().includes("access denied"),
    );

    onMount(async () => {
        if (id) {
            await payrollStore.fetchById(id);
        }
    });

    function goBack() {
        goto("/dashboard/payroll");
    }

    async function handleApprove() {
        try {
            await payrollStore.updateStatus(id, "APPROVED");
        } catch (err) {
            alert("Failed to approve: " + err.message);
        }
    }

    async function handleMarkPaid() {
        try {
            await payrollStore.updateStatus(id, "PAID");
        } catch (err) {
            alert("Failed to mark as paid: " + err.message);
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
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getStatusConfig(status) {
        const configs = {
            DRAFT: {
                color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
                label: "Draft",
            },
            APPROVED: {
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                label: "Approved",
            },
            PAID: {
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                label: "Paid",
            },
            REJECTED: {
                color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                label: "Rejected",
            },
        };
        return configs[status] || configs.DRAFT;
    }
</script>

<svelte:head>
    <title>Payroll Detail | Dashboard</title>
</svelte:head>

<DashboardHeader title="Payroll Detail" subtitle="View payroll information" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view this payroll."
        />
    {:else if loading}
        <div class="flex items-center justify-center py-16">
            <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
            <span class="ml-2 text-muted-foreground">Loading payroll...</span>
        </div>
    {:else if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {:else if payroll}
        <!-- Back Button -->
        <div class="flex items-center justify-between">
            <Button variant="outline" onclick={goBack}>
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Payrolls
            </Button>
            <div class="flex gap-2">
                {#if payroll.status === "DRAFT"}
                    <Button variant="outline" onclick={handleApprove}>
                        <CheckCircleIcon class="h-4 w-4 mr-2" />
                        Approve
                    </Button>
                {/if}
                {#if payroll.status === "APPROVED"}
                    <Button onclick={handleMarkPaid}>
                        <WalletIcon class="h-4 w-4 mr-2" />
                        Mark as Paid
                    </Button>
                {/if}
                <Button variant="outline">
                    <DownloadIcon class="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>
        </div>

        <!-- Payroll Card -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div
                            class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                        >
                            <UserIcon class="h-8 w-8" />
                        </div>
                        <div>
                            <Card.Title class="text-2xl"
                                >{payroll.employeeName}</Card.Title
                            >
                            <Card.Description
                                >Period: {payroll.period}</Card.Description
                            >
                        </div>
                    </div>
                    <span
                        class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {getStatusConfig(
                            payroll.status,
                        ).color}"
                    >
                        {getStatusConfig(payroll.status).label}
                    </span>
                </div>
            </Card.Header>
            <Card.Content>
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-4">
                        <div
                            class="rounded-lg bg-green-100 dark:bg-green-900/30 p-6"
                        >
                            <p class="text-sm text-muted-foreground mb-1">
                                Net Salary
                            </p>
                            <p class="text-3xl font-bold text-green-600">
                                {formatCurrency(payroll.netSalary)}
                            </p>
                        </div>
                    </div>
                    <div class="space-y-4">
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
                                    Period
                                </p>
                                <p class="font-medium">{payroll.period}</p>
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
                                    Generated At
                                </p>
                                <p class="font-medium">
                                    {formatDate(payroll.generatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="text-center py-16">
            <p class="text-muted-foreground">Payroll not found</p>
            <Button variant="outline" onclick={goBack} class="mt-4">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Payrolls
            </Button>
        </div>
    {/if}
</div>
