<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import EmptyState from "$lib/components/shared/empty-state.svelte";
    import Alert from "$lib/components/shared/alert.svelte";
    import LoadingTable from "$lib/components/shared/loading-table.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import DownloadIcon from "@lucide/svelte/icons/download";
    import SendIcon from "@lucide/svelte/icons/send";
    import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
    import FileTextIcon from "@lucide/svelte/icons/file-text";
    import WalletIcon from "@lucide/svelte/icons/wallet";
    import ClockIcon from "@lucide/svelte/icons/clock";

    import { payrollStore } from "$lib/stores/payroll.store.js";
    import { formatCurrency, formatDateTime } from "$lib/utils/format.js";
    import { getStatusColor } from "$lib/utils/colors.js";

    let storeState = $state({
        data: [],
        loading: false,
        generating: false,
        exporting: false,
        error: null,
    });

    payrollStore.subscribe((state) => {
        storeState = state;
    });

    let isForbidden = $derived(
        storeState.error?.includes("403") ||
        storeState.error?.toLowerCase().includes("forbidden")
    );

    let payrolls = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let generating = $derived(storeState.generating);
    let exporting = $derived(storeState.exporting);
    let error = $derived(storeState.error);

    onMount(async () => {
        try {
            await payrollStore.fetchAll();
        } catch (err) {
            console.error("Failed to fetch payroll data:", err.message);
        }
    });

    async function handleRefresh() {
        await payrollStore.fetchAll();
    }

    async function handleGenerate() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            await payrollStore.generate(month, year);
            alert(`Payroll generated successfully for ${month}/${year}`);
            await payrollStore.fetchAll();
        } catch (err) {
            alert("Failed to generate payroll: " + err.message);
        }
    }

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

    async function handleUpdateStatus(id, newStatus) {
        try {
            await payrollStore.updateStatus(id, newStatus);
        } catch (err) {
            alert("Failed to update status: " + err.message);
        }
    }

    let totalPayroll = $derived(payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0));
    let paidCount = $derived(payrolls.filter((p) => p.status === "PAID").length);
    let pendingCount = $derived(
        payrolls.filter((p) => ["DRAFT", "APPROVED"].includes(p.status)).length
    );
</script>

<svelte:head>
    <title>Payroll Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Payroll Management"
    subtitle="Manage employee salaries and payments"
/>

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to manage payrolls. This feature requires Admin access."
        />
    {:else}
        {#if error && !isForbidden}
            <Alert variant="error" message={error} dismissible onDismiss={() => payrollStore.clearError?.()} />
        {/if}

        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-4">
            <Card.Root>
                <Card.Content class="p-6">
                    <div class="flex items-center gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <FileTextIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-muted-foreground">Total Records</p>
                            <p class="text-2xl font-bold">{payrolls.length}</p>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Content class="p-6">
                    <div class="flex items-center gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <DollarSignIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-muted-foreground">Total Amount</p>
                            <p class="text-xl font-bold text-green-600">{formatCurrency(totalPayroll)}</p>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Content class="p-6">
                    <div class="flex items-center gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <WalletIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-muted-foreground">Paid</p>
                            <p class="text-2xl font-bold text-green-600">{paidCount}</p>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Content class="p-6">
                    <div class="flex items-center gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <ClockIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-muted-foreground">Pending/Draft</p>
                            <p class="text-2xl font-bold text-amber-600">{pendingCount}</p>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Payroll Table -->
        <Card.Root class="flex-1">
            <Card.Header class="flex flex-row items-center justify-between">
                <div>
                    <Card.Title>Payroll Records</Card.Title>
                    <Card.Description>Manage employee salary payments</Card.Description>
                </div>
                <div class="flex gap-2">
                    <Button variant="outline" size="icon" onclick={handleRefresh} disabled={loading}>
                        <RefreshCwIcon class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
                    </Button>
                    <Button variant="outline" onclick={handleExport} disabled={exporting}>
                        <DownloadIcon class="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button onclick={handleGenerate} disabled={generating}>
                        {generating ? 'Generating...' : 'Generate Payroll'}
                    </Button>
                </div>
            </Card.Header>
            <Card.Content>
                {#if loading}
                    <LoadingTable rows={5} />
                {:else if payrolls.length === 0}
                    <EmptyState
                        icon={FileTextIcon}
                        title="No payroll records"
                        description="Generate payroll to see records here."
                        actionLabel="Generate Payroll"
                        onAction={handleGenerate}
                    />
                {:else}
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head class="w-[200px]">Employee</Table.Head>
                                <Table.Head>Period</Table.Head>
                                <Table.Head class="w-[150px]">Net Salary</Table.Head>
                                <Table.Head class="w-[120px]">Status</Table.Head>
                                <Table.Head class="w-[150px]">Generated</Table.Head>
                                <Table.Head class="w-[150px] text-right">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each payrolls as payroll (payroll.id)}
                                <Table.Row class="group">
                                    <Table.Cell>
                                        <div class="flex items-center gap-3">
                                            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                                                {payroll.employeeName?.charAt(0) || '?'}
                                            </div>
                                            <p class="font-medium">{payroll.employeeName}</p>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                            {payroll.period}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="font-semibold">{formatCurrency(payroll.netSalary)}</Table.Cell>
                                    <Table.Cell>
                                        <span class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium {getStatusColor('payroll', payroll.status)}">
                                            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                                            {payroll.status}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground">
                                        {formatDateTime(payroll.generatedAt)}
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => goto(`/dashboard/payroll/${payroll.id}`)}>
                                                <EyeIcon class="h-4 w-4" />
                                                <span class="sr-only">View</span>
                                            </Button>
                                            {#if payroll.status === "DRAFT"}
                                                <Button variant="ghost" size="icon" class="h-8 w-8 text-blue-600" onclick={() => handleUpdateStatus(payroll.id, "APPROVED")}>
                                                    <SendIcon class="h-4 w-4" />
                                                    <span class="sr-only">Approve</span>
                                                </Button>
                                            {/if}
                                            {#if payroll.status === "APPROVED"}
                                                <Button variant="ghost" size="icon" class="h-8 w-8 text-green-600" onclick={() => handleUpdateStatus(payroll.id, "PAID")}>
                                                    <CheckCircleIcon class="h-4 w-4" />
                                                    <span class="sr-only">Mark Paid</span>
                                                </Button>
                                            {/if}
                                            <Button variant="ghost" size="icon" class="h-8 w-8">
                                                <DownloadIcon class="h-4 w-4" />
                                                <span class="sr-only">Download</span>
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
