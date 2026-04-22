<script>
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import EmptyState from "$lib/components/shared/empty-state.svelte";
    import Alert from "$lib/components/shared/alert.svelte";
    import LoadingTable from "$lib/components/shared/loading-table.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import CalendarOffIcon from "@lucide/svelte/icons/calendar-off";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
    import XCircleIcon from "@lucide/svelte/icons/x-circle";
    import FilterIcon from "@lucide/svelte/icons/filter";
    import SearchIcon from "@lucide/svelte/icons/search";
    import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
    import UserIcon from "@lucide/svelte/icons/user";
    import PlusIcon from "@lucide/svelte/icons/plus";

    import { leaveStore } from "$lib/stores/leave.store.js";
    import { authStore } from "$lib/stores/auth.store.js";
    import LeaveRequestDialog from "$lib/components/dashboard/leave-request-dialog.svelte";
    import LeaveApprovalDialog from "$lib/components/dashboard/leave-approval-dialog.svelte";
    import LeaveDetailDialog from "$lib/components/dashboard/leave-detail-dialog.svelte";

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

    let isAdmin = $derived(
        authState.user?.role === "ADMIN" ||
            authState.user?.role === "SUPER_USER",
    );

    let requests = $derived(storeState.requests);
    let balances = $derived(storeState.balances);
    let pending = $derived(storeState.pending || []);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);
    let pagination = $derived(storeState.pagination);

    let filterStatus = $state("ALL");
    let searchQuery = $state("");
    let currentPage = $state(1);

    let filteredRequests = $derived(() => {
        let result = requests;

        if (filterStatus !== "ALL") {
            result = result.filter((r) => r.status === filterStatus);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (r) =>
                    r.employeeName?.toLowerCase().includes(q) ||
                    r.leaveTypeName?.toLowerCase().includes(q) ||
                    r.reason?.toLowerCase().includes(q),
            );
        }

        return result;
    });

    let pendingCount = $derived(pending.length);
    let approvedCount = $derived(requests.filter((r) => r.status === "APPROVED").length);
    let rejectedCount = $derived(requests.filter((r) => r.status === "REJECTED").length);
    let totalRequests = $derived(requests.length);

    onMount(async () => {
        try {
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

    async function handleRefresh() {
        searchQuery = "";
        filterStatus = "ALL";
        await leaveStore.fetchBalances(new Date().getFullYear(), isAdmin);
        if (isAdmin) {
            await leaveStore.fetchAll();
            await leaveStore.fetchPending();
        } else {
            await leaveStore.fetchMyRequests();
        }
    }

    async function handleAction() {
        if (isAdmin) {
            await leaveStore.fetchAll();
            await leaveStore.fetchPending();
        }
    }

    async function handleFilterChange(status) {
        filterStatus = status;
        currentPage = 1;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function getStatusColor(status) {
        const colors = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
            CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
        };
        return colors[status] || colors.PENDING;
    }

    function getStatusLabel(status) {
        const labels = {
            PENDING: "Menunggu",
            APPROVED: "Disetujui",
            REJECTED: "Ditolak",
            CANCELLED: "Dibatalkan",
        };
        return labels[status] || status;
    }
</script>

<svelte:head>
    <title>Leave Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Leave Management"
    subtitle={isAdmin ? "Kelola persetujuan pengajuan cuti karyawan" : "Kelola pengajuan cuti Anda"}
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if error}
        <Alert variant="error" message={error} dismissible onDismiss={() => leaveStore.clearError()} />
    {/if}

    <!-- Leave Balance Cards -->
    {#if balances.length > 0}
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
                        dari {balance.balance} hari &bull; Terpakai: {balance.used}
                        {#if balance.pending > 0}
                            &bull; Pending: {balance.pending}
                        {/if}
                    </p>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Stats Cards (Admin) -->
    {#if isAdmin}
        <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-muted-foreground">Menunggu Persetujuan</p>
                    <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <ClockIcon class="h-4 w-4 text-yellow-600" />
                    </div>
                </div>
                <p class="text-2xl font-bold mt-2 text-yellow-600">{pendingCount}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-muted-foreground">Disetujui</p>
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircleIcon class="h-4 w-4 text-green-600" />
                    </div>
                </div>
                <p class="text-2xl font-bold mt-2 text-green-600">{approvedCount}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-muted-foreground">Ditolak</p>
                    <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <XCircleIcon class="h-4 w-4 text-red-600" />
                    </div>
                </div>
                <p class="text-2xl font-bold mt-2 text-red-600">{rejectedCount}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-muted-foreground">Total Pengajuan</p>
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CalendarOffIcon class="h-4 w-4 text-blue-600" />
                    </div>
                </div>
                <p class="text-2xl font-bold mt-2">{totalRequests}</p>
            </div>
        </div>
    {/if}

    <!-- Pending Requests (Admin Only) -->
    {#if isAdmin && pending.length > 0}
        <Card.Root class="border-yellow-200 dark:border-yellow-900/50">
            <Card.Header class="pb-3">
                <Card.Title class="text-lg font-semibold flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-white text-xs font-bold">
                        {pending.length}
                    </span>
                    Pengajuan Menunggu Persetujuan
                </Card.Title>
                <Card.Description>
                    Klik tombol centang untuk menyetujui atau silang untuk menolak pengajuan cuti.
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="rounded-lg overflow-hidden border">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row class="bg-muted/50">
                                <Table.Head>Karyawan</Table.Head>
                                <Table.Head>Tipe Cuti</Table.Head>
                                <Table.Head>Tanggal</Table.Head>
                                <Table.Head>Durasi</Table.Head>
                                <Table.Head>Alasan</Table.Head>
                                <Table.Head class="text-right">Aksi</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each pending as request (request.id)}
                                <Table.Row class="hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10">
                                    <Table.Cell>
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon class="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p class="font-medium text-sm">{request.employeeName}</p>
                                                {#if request.employeePosition}
                                                    <p class="text-xs text-muted-foreground">{request.employeePosition}</p>
                                                {/if}
                                            </div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                            {request.leaveTypeName || request.leaveType?.name}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <p class="text-sm">{formatDate(request.startDate)}</p>
                                        <p class="text-xs text-muted-foreground">s/d {formatDate(request.endDate)}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                            {request.totalDays} hari
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="max-w-[200px]">
                                        <p class="text-sm truncate">{request.reason}</p>
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div class="flex items-center justify-end gap-1">
                                            <LeaveApprovalDialog {request} onApproved={handleAction} onRejected={handleAction} />
                                            <LeaveDetailDialog {request} isAdmin={isAdmin} onAction={handleAction} />
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- All Requests Table -->
    <Card.Root class="flex-1">
        <Card.Header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
            <div>
                <Card.Title class="text-xl font-semibold">
                    {isAdmin ? "Semua Pengajuan Cuti" : "Riwayat Pengajuan Cuti Saya"}
                </Card.Title>
                <Card.Description>
                    {isAdmin
                        ? "Daftar semua pengajuan cuti karyawan"
                        : "Riwayat pengajuan cuti Anda"}
                </Card.Description>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div class="relative">
                    <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari karyawan, tipe, alasan..."
                        class="pl-8 w-full sm:w-[250px]"
                        bind:value={searchQuery}
                    />
                </div>
                <Select.Root type="single" value={filterStatus} onValueChange={handleFilterChange}>
                    <Select.Trigger class="w-full sm:w-[160px]">
                        <div class="flex items-center gap-2">
                            <FilterIcon class="h-4 w-4" />
                            {getStatusLabel(filterStatus)}
                        </div>
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="ALL">Semua Status</Select.Item>
                        <Select.Item value="PENDING">Menunggu</Select.Item>
                        <Select.Item value="APPROVED">Disetujui</Select.Item>
                        <Select.Item value="REJECTED">Ditolak</Select.Item>
                        <Select.Item value="CANCELLED">Dibatalkan</Select.Item>
                    </Select.Content>
                </Select.Root>
                <div class="flex gap-2">
                    <Button variant="outline" size="icon" onclick={handleRefresh} disabled={loading}>
                        <RefreshCwIcon class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
                    </Button>
                    {#if !isAdmin}
                        <LeaveRequestDialog />
                    {/if}
                </div>
            </div>
        </Card.Header>
        <Card.Content>
            {#if loading && storeState.requests.length === 0}
                <LoadingTable rows={6} />
            {:else if filteredRequests().length === 0}
                <EmptyState
                    icon={CalendarOffIcon}
                    title={searchQuery || filterStatus !== "ALL" ? "Tidak ada hasil" : "Belum ada pengajuan cuti"}
                    description={searchQuery || filterStatus !== "ALL" ? "Coba ubah filter atau kata kunci pencarian." : (isAdmin ? "Pengajuan cuti dari karyawan akan muncul di sini." : "Anda belum memiliki pengajuan cuti.")}
                    actionLabel={!isAdmin ? "Ajukan Cuti" : null}
                    onAction={!isAdmin ? () => {} : null}
                />
            {:else}
                <div class="rounded-lg overflow-hidden border">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row class="bg-muted/50">
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
                            {#each filteredRequests() as request (request.id)}
                                <Table.Row class="group">
                                    {#if isAdmin}
                                        <Table.Cell>
                                            <div class="flex items-center gap-2">
                                                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <UserIcon class="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p class="font-medium text-sm">{request.employeeName}</p>
                                                    {#if request.employeePosition}
                                                        <p class="text-xs text-muted-foreground">{request.employeePosition}</p>
                                                    {/if}
                                                </div>
                                            </div>
                                        </Table.Cell>
                                    {/if}
                                    <Table.Cell>
                                        <span class="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                            {request.leaveTypeName || request.leaveType?.name}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <p class="text-sm">{formatDate(request.startDate)}</p>
                                        <p class="text-xs text-muted-foreground">s/d {formatDate(request.endDate)}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="text-sm font-medium">{request.totalDays} hari</span>
                                    </Table.Cell>
                                    <Table.Cell class="max-w-[200px]">
                                        <p class="text-sm truncate">{request.reason}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(request.status)}">
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="text-right">
                                        <div class="flex items-center justify-end gap-1">
                                            {#if request.status === "PENDING" && isAdmin}
                                                <LeaveApprovalDialog {request} onApproved={handleAction} onRejected={handleAction} />
                                            {/if}
                                            <LeaveDetailDialog {request} isAdmin={isAdmin} onAction={handleAction} />
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>

                <!-- Pagination -->
                {#if pagination.total > pagination.limit}
                    <div class="flex items-center justify-between mt-4">
                        <p class="text-sm text-muted-foreground">
                            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
                        </p>
                        <div class="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onclick={() => {
                                    currentPage = pagination.page - 1;
                                    leaveStore.fetchAll({ page: currentPage });
                                }}
                            >
                                <ChevronLeftIcon class="h-4 w-4" />
                            </Button>
                            <span class="text-sm font-medium">Halaman {pagination.page}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.lastPage}
                                onclick={() => {
                                    currentPage = pagination.page + 1;
                                    leaveStore.fetchAll({ page: currentPage });
                                }}
                            >
                                <ChevronRightIcon class="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                {/if}
            {/if}
        </Card.Content>
    </Card.Root>
</div>
