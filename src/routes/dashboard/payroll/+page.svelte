<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import DownloadIcon from "@lucide/svelte/icons/download";
    import SendIcon from "@lucide/svelte/icons/send";
    import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    // Import store
    import { payrollStore } from "$lib/stores/payroll.store.js";

    // Fallback dummy data
    const fallbackPayrolls = [
        {
            id: "aa0e8400-e29b-41d4-a716-446655440006",
            employeeName: "John Doe",
            period: "2024-01",
            netSalary: 15800000,
            status: "DRAFT",
            generatedAt: "2026-01-30T10:00:54Z",
        },
        {
            id: "aa0e8400-e29b-41d4-a716-446655440007",
            employeeName: "Jane Smith",
            period: "2024-01",
            netSalary: 18500000,
            status: "APPROVED",
            generatedAt: "2026-01-29T14:30:00Z",
        },
        {
            id: "aa0e8400-e29b-41d4-a716-446655440008",
            employeeName: "Bob Johnson",
            period: "2024-01",
            netSalary: 12200000,
            status: "PAID",
            generatedAt: "2026-01-28T09:15:00Z",
        },
        {
            id: "aa0e8400-e29b-41d4-a716-446655440009",
            employeeName: "Alice Williams",
            period: "2024-01",
            netSalary: 16300000,
            status: "DRAFT",
            generatedAt: "2026-01-30T08:45:00Z",
        },
    ];

    // Reactive state from store
    let storeState = $state({
        data: [],
        loading: false,
        generating: false,
        exporting: false,
        error: null,
    });

    // Subscribe to store
    payrollStore.subscribe((state) => {
        storeState = state;
    });

    // Check if error is forbidden
    let isForbidden = $derived(
        storeState.error?.includes("403") ||
            storeState.error?.toLowerCase().includes("forbidden") ||
            storeState.error?.toLowerCase().includes("access denied"),
    );

    // Use API data if available, otherwise use fallback
    let payrolls = $derived(
        storeState.data.length > 0
            ? storeState.data
            : isForbidden
              ? []
              : fallbackPayrolls,
    );
    let loading = $derived(storeState.loading);
    let generating = $derived(storeState.generating);
    let exporting = $derived(storeState.exporting);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await payrollStore.fetchAll();
        } catch (err) {
            console.log("Using fallback data:", err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await payrollStore.fetchAll();
    }

    // Generate payroll
    async function handleGenerate() {
        const now = new Date();
        const month = now.getMonth() + 1; // Current month
        const year = now.getFullYear();

        try {
            await payrollStore.generate(month, year);
            alert(`Payroll generated successfully for ${month}/${year}`);
            await payrollStore.fetchAll();
        } catch (err) {
            alert("Failed to generate payroll: " + err.message);
        }
    }

    // Export CSV
    async function handleExport() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            await payrollStore.exportCsv(month, year);
        } catch (err) {
            alert("Failed to export CSV: " + err.message);
        }
    }

    // Update status
    async function handleUpdateStatus(id, newStatus) {
        try {
            await payrollStore.updateStatus(id, newStatus);
        } catch (err) {
            alert("Failed to update status: " + err.message);
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getStatusConfig(status) {
        const configs = {
            DRAFT: {
                color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                icon: "○",
            },
            PENDING: {
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                icon: "◐",
            },
            APPROVED: {
                color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                icon: "●",
            },
            PAID: {
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                icon: "✓",
            },
            REJECTED: {
                color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                icon: "✕",
            },
        };
        return configs[status] || configs.DRAFT;
    }

    // Calculate stats
    let totalPayroll = $derived(
        payrolls.reduce((sum, p) => sum + p.netSalary, 0),
    );
    let paidCount = $derived(
        payrolls.filter((p) => p.status === "PAID").length,
    );
    let pendingCount = $derived(
        payrolls.filter((p) => p.status === "DRAFT" || p.status === "APPROVED")
            .length,
    );
</script>

<svelte:head>
    <title>Payroll Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Payroll Management"
    subtitle="Manage employee salaries and payments"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Forbidden Error -->
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to manage payrolls. This feature requires Admin access."
        />
    {:else}
        <!-- Regular Error Alert -->
        {#if error && !isForbidden}
            <div
                class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
                <p class="text-sm font-medium">Error: {error}</p>
                <p class="text-xs mt-1">
                    Using fallback data. Click refresh to retry.
                </p>
            </div>
        {/if}

        <!-- Stats Cards -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Total Payrolls
                </p>
                <p class="text-2xl font-bold mt-1">{payrolls.length}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Total Amount
                </p>
                <p class="text-2xl font-bold mt-1 text-blue-600">
                    {formatCurrency(totalPayroll)}
                </p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">Paid</p>
                <p class="text-2xl font-bold mt-1 text-green-600">
                    {paidCount}
                </p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Pending/Draft
                </p>
                <p class="text-2xl font-bold mt-1 text-yellow-600">
                    {pendingCount}
                </p>
            </div>
        </div>

        <!-- Payroll Table Card -->
        <Card.Root class="flex-1">
            <Card.Header
                class="flex flex-row items-center justify-between space-y-0 pb-4"
            >
                <div>
                    <Card.Title class="text-xl font-semibold"
                        >Payroll List</Card.Title
                    >
                    <Card.Description>
                        Payroll records
                        {#if storeState.data.length === 0 && !loading}
                            <span class="text-yellow-600"
                                >(Showing demo data)</span
                            >
                        {/if}
                    </Card.Description>
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
                    <Button
                        variant="outline"
                        onclick={handleExport}
                        disabled={exporting}
                    >
                        {#if exporting}
                            <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        {:else}
                            <DownloadIcon class="h-4 w-4 mr-2" />
                        {/if}
                        Export
                    </Button>
                    <Button onclick={handleGenerate} disabled={generating}>
                        {#if generating}
                            <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        {/if}
                        Generate Payroll
                    </Button>
                </div>
            </Card.Header>
            <Card.Content>
                {#if loading && storeState.data.length === 0}
                    <div class="flex items-center justify-center py-8">
                        <LoaderIcon
                            class="h-8 w-8 animate-spin text-muted-foreground"
                        />
                        <span class="ml-2 text-muted-foreground"
                            >Loading payrolls...</span
                        >
                    </div>
                {:else}
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Employee</Table.Head>
                                <Table.Head>Period</Table.Head>
                                <Table.Head>Net Salary</Table.Head>
                                <Table.Head>Status</Table.Head>
                                <Table.Head>Generated At</Table.Head>
                                <Table.Head class="text-right"
                                    >Actions</Table.Head
                                >
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each payrolls as payroll (payroll.id)}
                                <Table.Row>
                                    <Table.Cell>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                                            >
                                                {payroll.employeeName.charAt(0)}
                                            </div>
                                            <span class="font-medium"
                                                >{payroll.employeeName}</span
                                            >
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span
                                            class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                        >
                                            {payroll.period}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="font-semibold"
                                        >{formatCurrency(
                                            payroll.netSalary,
                                        )}</Table.Cell
                                    >
                                    <Table.Cell>
                                        <span
                                            class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusConfig(
                                                payroll.status,
                                            ).color}"
                                        >
                                            <span
                                                >{getStatusConfig(
                                                    payroll.status,
                                                ).icon}</span
                                            >
                                            {payroll.status}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell
                                        class="text-muted-foreground text-sm"
                                    >
                                        {formatDate(payroll.generatedAt)}
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div
                                            class="flex items-center justify-end gap-1"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8"
                                                title="View Details"
                                                onclick={() =>
                                                    goto(
                                                        `/dashboard/payroll/${payroll.id}`,
                                                    )}
                                            >
                                                <EyeIcon class="h-4 w-4" />
                                            </Button>
                                            {#if payroll.status === "DRAFT"}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    class="h-8 w-8 text-blue-600"
                                                    title="Approve"
                                                    onclick={() =>
                                                        handleUpdateStatus(
                                                            payroll.id,
                                                            "APPROVED",
                                                        )}
                                                >
                                                    <SendIcon class="h-4 w-4" />
                                                </Button>
                                            {/if}
                                            {#if payroll.status === "APPROVED"}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    class="h-8 w-8 text-green-600"
                                                    title="Mark as Paid"
                                                    onclick={() =>
                                                        handleUpdateStatus(
                                                            payroll.id,
                                                            "PAID",
                                                        )}
                                                >
                                                    <CheckCircleIcon
                                                        class="h-4 w-4"
                                                    />
                                                </Button>
                                            {/if}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8"
                                                title="Download Slip"
                                            >
                                                <DownloadIcon class="h-4 w-4" />
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
