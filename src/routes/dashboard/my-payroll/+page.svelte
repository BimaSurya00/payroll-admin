<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
    import * as Table from '$lib/components/ui/table/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import EyeIcon from '@lucide/svelte/icons/eye';
    import DownloadIcon from '@lucide/svelte/icons/download';
    import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
    import LoaderIcon from '@lucide/svelte/icons/loader';
    import CalendarIcon from '@lucide/svelte/icons/calendar';
    import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';

    import { payrollStore } from '$lib/stores/payroll.store.js';

    // Reactive state
    let storeState = $state({ data: [], selected: null, loading: false, error: null });
    let selectedPayrollId = $state(null);

    // Subscribe to store
    payrollStore.subscribe((state) => {
        storeState = state;
    });

    let payrolls = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch payrolls on mount
    onMount(async () => {
        try {
            await payrollStore.fetchMyPayrolls();
        } catch (err) {
            console.error('Failed to fetch my payroll data:', err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await payrollStore.fetchMyPayrolls();
    }

    // View payroll details
    async function viewDetails(id) {
        selectedPayrollId = id;
        try {
            await payrollStore.fetchMyPayrollById(id);
        } catch (err) {
            alert('Failed to load payroll details: ' + err.message);
        }
    }

    // Close detail view
    function closeDetails() {
        selectedPayrollId = null;
        payrollStore.clearSelected();
    }

    // Download payslip (placeholder)
    function downloadPayslip(payroll) {
        alert(`Download payslip for ${payroll.period}\n\nThis feature will be implemented soon!`);
    }

    function formatCurrency(amount) {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function getStatusConfig(status) {
        const configs = {
            PAID: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                icon: '✓',
                label: 'Paid',
            },
            APPROVED: {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                icon: '●',
                label: 'Approved',
            },
            DRAFT: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                icon: '○',
                label: 'Draft',
            },
        };
        return configs[status] || configs.DRAFT;
    }

    // Stats
    let totalNetSalary = $derived(
        payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0)
    );
    let avgNetSalary = $derived(
        payrolls.length > 0 ? totalNetSalary / payrolls.length : 0
    );
    let latestPayroll = $derived(payrolls.length > 0 ? payrolls[0] : null);
</script>

<svelte:head>
    <title>My Payslips | Dashboard</title>
</svelte:head>

<DashboardHeader title="My Payslips" subtitle="View your salary history and details" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Error Alert (tampilkan error nyata, bukan employee not found) -->
    {#if error && !error.includes('Employee record not found')}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
            <p class="text-xs mt-1">Click refresh to retry.</p>
        </div>
    {/if}

    <!-- Info untuk user tanpa employee profile -->
    {#if error && error.includes('Employee record not found')}
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <p class="text-sm font-medium">Employee Profile Required</p>
            <p class="text-xs mt-1">
                {error}
            </p>
        </div>
    {/if}

    <!-- Stats Cards -->
    <div class="grid auto-rows-min gap-4 md:grid-cols-4">
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <div class="flex items-center gap-2">
                <CalendarIcon class="h-5 w-5 text-muted-foreground" />
                <div>
                    <p class="text-sm font-medium text-muted-foreground">Total Payslips</p>
                    <p class="text-2xl font-bold">{payrolls.length}</p>
                </div>
            </div>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <div class="flex items-center gap-2">
                <DollarSignIcon class="h-5 w-5 text-green-600" />
                <div>
                    <p class="text-sm font-medium text-muted-foreground">Latest Salary</p>
                    <p class="text-xl font-bold text-green-600">
                        {latestPayroll ? formatCurrency(latestPayroll.netSalary) : '-'}
                    </p>
                </div>
            </div>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <div class="flex items-center gap-2">
                <DollarSignIcon class="h-5 w-5 text-blue-600" />
                <div>
                    <p class="text-sm font-medium text-muted-foreground">Average Salary</p>
                    <p class="text-xl font-bold text-blue-600">
                        {formatCurrency(avgNetSalary)}
                    </p>
                </div>
            </div>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <div class="flex items-center gap-2">
                <DollarSignIcon class="h-5 w-5 text-purple-600" />
                <div>
                    <p class="text-sm font-medium text-muted-foreground">Total Earned</p>
                    <p class="text-xl font-bold text-purple-600">
                        {formatCurrency(totalNetSalary)}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Detail View (Modal) -->
    {#if selectedPayrollId && storeState.selected}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Payslip Details</h2>
                    <Button variant="ghost" size="icon" onclick={closeDetails}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-6 w-6"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>
                </div>

                <div class="space-y-6">
                    <!-- Payroll Info -->
                    <div class="grid gap-4 md:grid-cols-2">
                        <div>
                            <p class="text-sm text-muted-foreground">Period</p>
                            <p class="font-semibold text-lg">
                                {storeState.selected.period || '-'}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Status</p>
                            <span
                                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusConfig(
                                    storeState.selected.status
                                ).color}"
                            >
                                <span>{getStatusConfig(storeState.selected.status).icon}</span>
                                {getStatusConfig(storeState.selected.status).label}
                            </span>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Period Start</p>
                            <p class="font-medium">
                                {formatDate(storeState.selected.periodStart)}
                            </p>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Period End</p>
                            <p class="font-medium">
                                {formatDate(storeState.selected.periodEnd)}
                            </p>
                        </div>
                    </div>

                    <hr class="border-border" />

                    <!-- Earnings -->
                    <div>
                        <h3 class="text-lg font-semibold mb-3">Earnings</h3>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Base Salary</span>
                                <span class="font-medium">
                                    {formatCurrency(storeState.selected.baseSalary)}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Allowances</span>
                                <span class="font-medium text-green-600">
                                    +{formatCurrency(storeState.selected.totalAllowance || 0)}
                                </span>
                            </div>
                            <hr class="border-border" />
                            <div class="flex justify-between text-lg font-bold">
                                <span>Total Earnings</span>
                                <span class="text-green-600">
                                    {formatCurrency(
                                        (storeState.selected.baseSalary || 0) +
                                            (storeState.selected.totalAllowance || 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Deductions -->
                    {#if (storeState.selected.totalDeduction || 0) > 0}
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Deductions</h3>
                            <div class="space-y-2">
                                {#if storeState.selected.items}
                                    {#each storeState.selected.items.filter(
                                          (item) => item.type === 'DEDUCTION'
                                      ) as item}
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">{item.name}</span>
                                            <span class="font-medium text-red-600">
                                                -{formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                    {/each}
                                {/if}
                                <hr class="border-border" />
                                <div class="flex justify-between text-lg font-bold">
                                    <span>Total Deductions</span>
                                    <span class="text-red-600">
                                        -{formatCurrency(storeState.selected.totalDeduction || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Net Salary -->
                    <div class="rounded-lg bg-primary/10 p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-muted-foreground">Net Salary</p>
                                <p class="text-xs text-muted-foreground">
                                    (Take-home pay after deductions)
                                </p>
                            </div>
                            <p class="text-3xl font-bold text-primary">
                                {formatCurrency(storeState.selected.netSalary)}
                            </p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <Button variant="outline" class="flex-1">
                            <DownloadIcon class="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button variant="outline" class="flex-1" onclick={closeDetails}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Payroll List -->
    <Card.Root class="flex-1">
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
                <Card.Title class="text-xl font-semibold">Payslip History</Card.Title>
                <Card.Description>
                    Your salary history and payment records
                    {#if storeState.data.length === 0 && !loading}

                    {/if}
                </Card.Description>
            </div>
            <Button variant="outline" onclick={handleRefresh} disabled={loading}>
                {#if loading}
                    <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                {:else}
                    <RefreshCwIcon class="h-4 w-4 mr-2" />
                {/if}
                Refresh
            </Button>
        </Card.Header>
        <Card.Content>
            {#if loading && storeState.data.length === 0}
                <div class="flex items-center justify-center py-8">
                    <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
                    <span class="ml-2 text-muted-foreground">Loading payslips...</span>
                </div>
            {:else}
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Period</Table.Head>
                            <Table.Head>Net Salary</Table.Head>
                            <Table.Head>Status</Table.Head>
                            <Table.Head>Paid Date</Table.Head>
                            <Table.Head class="text-right">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each payrolls as payroll (payroll.id)}
                            <Table.Row>
                                <Table.Cell>
                                    <div class="flex items-center gap-2">
                                        <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                                        <span class="font-semibold">{payroll.period}</span>
                                    </div>
                                    <p class="text-xs text-muted-foreground">
                                        {formatDate(payroll.periodStart)} - {formatDate(
                                            payroll.periodEnd
                                        )}
                                    </p>
                                </Table.Cell>
                                <Table.Cell>
                                    <span class="font-bold text-lg">
                                        {formatCurrency(payroll.netSalary)}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusConfig(
                                            payroll.status
                                        ).color}"
                                    >
                                        <span>{getStatusConfig(payroll.status).icon}</span>
                                        {getStatusConfig(payroll.status).label}
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {payroll.paidAt ? formatDate(payroll.paidAt) : '-'}
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onclick={() => viewDetails(payroll.id)}
                                        >
                                            <EyeIcon class="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onclick={() => downloadPayslip(payroll)}
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
</div>
