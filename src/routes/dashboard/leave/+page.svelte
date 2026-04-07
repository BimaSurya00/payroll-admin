<script>
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import XCircleIcon from "@lucide/svelte/icons/x-circle";

    import { leaveStore } from "$lib/stores/leave.store.js";
    import { authStore } from "$lib/stores/auth.store.js";
    import LeaveRequestDialog from "$lib/components/dashboard/leave-request-dialog.svelte";
    import LeaveApprovalDialog from "$lib/components/dashboard/leave-approval-dialog.svelte";

    // Reactive state from store
    let storeState = $state({
        requests: [],
        balances: [],
        pending: [],
        loading: false,
        error: null,
    });
    let authState = $state({ user: null });

    leaveStore.subscribe((state) => {
        storeState = state;
    });

    authStore.subscribe((state) => {
        authState = state;
    });

    // Check if user is admin
    let isAdmin = $derived(
        authState.user?.role === "ADMIN" ||
            authState.user?.role === "SUPER_USER",
    );

    // Use API data only
    let requests = $derived(storeState.requests);
    let balances = $derived(storeState.balances);
    let pending = $derived(storeState.pending || []);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            // Only fetch balances for non-admin users or admin with employee profile
            await leaveStore.fetchBalances(new Date().getFullYear(), isAdmin);
            if (isAdmin) {
                await leaveStore.fetchAll();
                await leaveStore.fetchPending();
            } else {
                await leaveStore.fetchMyRequests();
            }
        } catch (err) {
            console.error("Failed to fetch leave data:", err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await leaveStore.fetchBalances(new Date().getFullYear(), isAdmin);
        if (isAdmin) {
            await leaveStore.fetchAll();
            await leaveStore.fetchPending();
        } else {
            await leaveStore.fetchMyRequests();
        }
    }

    // Cancel request
    async function handleCancel(id) {
        if (confirm("Apakah Anda yakin ingin membatalkan pengajuan ini?")) {
            try {
                await leaveStore.cancel(id);
            } catch (err) {
                alert("Gagal membatalkan: " + err.message);
            }
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function getStatusColor(status) {
        const colors = {
            PENDING:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            APPROVED:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            REJECTED:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            CANCELLED:
                "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        };
        return colors[status] || colors.PENDING;
    }
</script>

<svelte:head>
    <title>Leave Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Leave Management"
    subtitle="Kelola pengajuan cuti dan izin"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Error Alert -->
    {#if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
            <p class="text-xs mt-1">
                Click refresh to retry.
            </p>
        </div>
    {/if}

    <!-- Admin without Employee Profile -->
    {#if isAdmin && balances.length === 0 && !loading}
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <p class="text-sm font-medium">Admin Mode</p>
            <p class="text-xs mt-1">
                Anda login sebagai admin. Leave balances hanya tersedia untuk karyawan dengan profil employee.
            </p>
        </div>
    {/if}

    <!-- Leave Balance Cards -->
    <div class="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
        {#each balances as balance}
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    {balance.leaveTypeName || balance.leaveType?.name}
                </p>
                <p class="text-3xl font-bold mt-2 text-primary">
                    {balance.available}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                    dari {balance.balance} hari • Terpakai: {balance.used}
                    {#if balance.pending > 0}
                        • Pending: {balance.pending}
                    {/if}
                </p>
            </div>
        {/each}
    </div>

    <!-- Pending Requests (Admin Only) -->
    {#if isAdmin && pending.length > 0}
        <Card.Root>
            <Card.Header>
                <Card.Title
                    class="text-lg font-semibold flex items-center gap-2"
                >
                    <span
                        class="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white text-xs"
                    >
                        {pending.length}
                    </span>
                    Menunggu Persetujuan
                </Card.Title>
            </Card.Header>
            <Card.Content>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Karyawan</Table.Head>
                            <Table.Head>Tipe</Table.Head>
                            <Table.Head>Tanggal</Table.Head>
                            <Table.Head>Durasi</Table.Head>
                            <Table.Head>Alasan</Table.Head>
                            <Table.Head class="text-right">Aksi</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each pending as request (request.id)}
                            <Table.Row>
                                <Table.Cell class="font-medium">
                                    {request.employeeName}
                                </Table.Cell>
                                <Table.Cell>
                                    {request.leaveTypeName ||
                                        request.leaveType?.name}
                                </Table.Cell>
                                <Table.Cell>
                                    {formatDate(request.startDate)} - {formatDate(
                                        request.endDate,
                                    )}
                                </Table.Cell>
                                <Table.Cell>{request.totalDays} hari</Table.Cell
                                >
                                <Table.Cell class="max-w-[200px] truncate">
                                    {request.reason}
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    <LeaveApprovalDialog {request} />
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- Leave Requests Table -->
    <Card.Root class="flex-1">
        <Card.Header
            class="flex flex-row items-center justify-between space-y-0 pb-4"
        >
            <div>
                <Card.Title class="text-xl font-semibold">
                    {isAdmin ? "Semua Pengajuan Cuti" : "Pengajuan Cuti Saya"}
                </Card.Title>
                <Card.Description>
                    {isAdmin
                        ? "Daftar semua pengajuan cuti karyawan"
                        : "Riwayat pengajuan cuti Anda"}
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
                <LeaveRequestDialog />
            </div>
        </Card.Header>
        <Card.Content>
            {#if loading && storeState.requests.length === 0}
                <div class="flex items-center justify-center py-8">
                    <LoaderIcon
                        class="h-8 w-8 animate-spin text-muted-foreground"
                    />
                    <span class="ml-2 text-muted-foreground"
                        >Loading requests...</span
                    >
                </div>
            {:else}
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            {#if isAdmin}
                                <Table.Head>Karyawan</Table.Head>
                            {/if}
                            <Table.Head>Tipe Cuti</Table.Head>
                            <Table.Head>Tanggal</Table.Head>
                            <Table.Head>Durasi</Table.Head>
                            <Table.Head>Alasan</Table.Head>
                            <Table.Head>Status</Table.Head>
                            <Table.Head class="text-right">Aksi</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each requests as request (request.id)}
                            <Table.Row>
                                {#if isAdmin}
                                    <Table.Cell class="font-medium">
                                        {request.employeeName}
                                    </Table.Cell>
                                {/if}
                                <Table.Cell>
                                    {request.leaveTypeName ||
                                        request.leaveType?.name}
                                </Table.Cell>
                                <Table.Cell>
                                    {formatDate(request.startDate)} - {formatDate(
                                        request.endDate,
                                    )}
                                </Table.Cell>
                                <Table.Cell>{request.totalDays} hari</Table.Cell
                                >
                                <Table.Cell class="max-w-[200px] truncate">
                                    {request.reason}
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
                                            request.status,
                                        )}"
                                    >
                                        {request.status}
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    {#if request.status === "PENDING"}
                                        {#if isAdmin}
                                            <LeaveApprovalDialog {request} />
                                        {:else}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8 text-red-600"
                                                onclick={() =>
                                                    handleCancel(request.id)}
                                            >
                                                <XCircleIcon class="h-4 w-4" />
                                                <span class="sr-only"
                                                    >Cancel</span
                                                >
                                            </Button>
                                        {/if}
                                    {:else}
                                        <span
                                            class="text-muted-foreground text-xs"
                                            >-</span
                                        >
                                    {/if}
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
