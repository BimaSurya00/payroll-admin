<script>
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import PlayIcon from "@lucide/svelte/icons/play";
    import SquareIcon from "@lucide/svelte/icons/square";

    import { overtimeStore } from "$lib/stores/overtime.store.js";
    import { authStore } from "$lib/stores/auth.store.js";
    import OvertimeRequestDialog from "$lib/components/dashboard/overtime-request-dialog.svelte";
    import OvertimeApprovalDialog from "$lib/components/dashboard/overtime-approval-dialog.svelte";
    import OvertimeCalculateDialog from "$lib/components/dashboard/overtime-calculate-dialog.svelte";

    // Reactive state from store
    let storeState = $state({
        requests: [],
        pending: [],
        policies: [],
        loading: false,
        error: null,
    });
    let authState = $state({ user: null });

    overtimeStore.subscribe((state) => {
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
    let pending = $derived(storeState.pending || []);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await overtimeStore.fetchPolicies();
            if (isAdmin) {
                await overtimeStore.fetchAll();
                await overtimeStore.fetchPending();
            } else {
                await overtimeStore.fetchMyRequests();
            }
        } catch (err) {
            console.error("Failed to fetch overtime data:", err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        if (isAdmin) {
            await overtimeStore.fetchAll();
            await overtimeStore.fetchPending();
        } else {
            await overtimeStore.fetchMyRequests();
        }
    }

    // Clock in
    async function handleClockIn(id) {
        try {
            await overtimeStore.clockIn(id);
        } catch (err) {
            alert("Gagal clock in: " + err.message);
        }
    }

    // Clock out
    async function handleClockOut(id) {
        try {
            await overtimeStore.clockOut(id);
        } catch (err) {
            alert("Gagal clock out: " + err.message);
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function formatTime(timeString) {
        if (!timeString) return '-';
        return timeString.substring(0, 5);
    }

    function getStatusColor(status) {
        const colors = {
            PENDING:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            APPROVED:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            IN_PROGRESS:
                "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            COMPLETED:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            REJECTED:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
        return colors[status] || colors.PENDING;
    }

    // Stats
    let totalHoursThisMonth = $derived(
        requests
            .filter((r) => r.status === "COMPLETED")
            .reduce((sum, r) => sum + (r.actualHours || r.totalHours || 0), 0),
    );
    let pendingCount = $derived(
        requests.filter((r) => r.status === "PENDING").length,
    );
    let approvedCount = $derived(
        requests.filter((r) => r.status === "APPROVED").length,
    );
</script>

<svelte:head>
    <title>Overtime Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Overtime Management"
    subtitle="Kelola pengajuan dan pencatatan lembur"
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

    <!-- Stats Cards -->
    <div class="grid auto-rows-min gap-4 md:grid-cols-4">
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Total Jam Lembur (Bulan Ini)
            </p>
            <p class="text-2xl font-bold mt-1 text-primary">
                {totalHoursThisMonth} jam
            </p>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Menunggu Persetujuan
            </p>
            <p class="text-2xl font-bold mt-1 text-yellow-600">
                {pendingCount}
            </p>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Disetujui (Belum Dikerjakan)
            </p>
            <p class="text-2xl font-bold mt-1 text-blue-600">{approvedCount}</p>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Total Pengajuan
            </p>
            <p class="text-2xl font-bold mt-1">{requests.length}</p>
        </div>
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
                            <Table.Head>Tanggal</Table.Head>
                            <Table.Head>Jam</Table.Head>
                            <Table.Head>Durasi</Table.Head>
                            <Table.Head>Policy</Table.Head>
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
                                <Table.Cell
                                    >{formatDate(
                                        request.overtimeDate,
                                    )}</Table.Cell
                                >
                                <Table.Cell
                                    >{formatTime(request.startTime)} - {formatTime(request.endTime)}</Table.Cell
                                >
                                <Table.Cell>{request.totalHours} jam</Table.Cell
                                >
                                <Table.Cell>
                                    <span
                                        class="text-xs bg-muted px-2 py-1 rounded"
                                    >
                                        {request.overtimePolicy
                                            ?.rateMultiplier || 1.5}x
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="max-w-[200px] truncate">
                                    {request.reason}
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    <OvertimeApprovalDialog {request} />
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- Overtime Requests Table -->
    <Card.Root class="flex-1">
        <Card.Header
            class="flex flex-row items-center justify-between space-y-0 pb-4"
        >
            <div>
                <Card.Title class="text-xl font-semibold">
                    {isAdmin
                        ? "Semua Pengajuan Lembur"
                        : "Pengajuan Lembur Saya"}
                </Card.Title>
                <Card.Description>
                    {isAdmin
                        ? "Daftar semua pengajuan lembur karyawan"
                        : "Riwayat pengajuan lembur Anda"}
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
                {#if isAdmin}
                    <OvertimeCalculateDialog />
                {/if}
                <OvertimeRequestDialog />
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
                            <Table.Head>Tanggal</Table.Head>
                            <Table.Head>Jam</Table.Head>
                            <Table.Head>Durasi</Table.Head>
                            <Table.Head>Rate</Table.Head>
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
                                <Table.Cell
                                    >{formatDate(
                                        request.overtimeDate,
                                    )}</Table.Cell
                                >
                                <Table.Cell
                                    >{formatTime(request.startTime)} - {formatTime(request.endTime)}</Table.Cell
                                >
                                <Table.Cell>{request.totalHours} jam</Table.Cell
                                >
                                <Table.Cell>
                                    <span
                                        class="text-xs bg-muted px-2 py-1 rounded"
                                    >
                                        {request.overtimePolicy
                                            ?.rateMultiplier || 1.5}x
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="max-w-[150px] truncate">
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
                                    {#if request.status === "PENDING" && isAdmin}
                                        <OvertimeApprovalDialog {request} />
                                    {:else if request.status === "APPROVED" && !isAdmin}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            class="text-green-600"
                                            onclick={() =>
                                                handleClockIn(request.id)}
                                        >
                                            <PlayIcon class="h-4 w-4 mr-1" />
                                            Mulai
                                        </Button>
                                    {:else if request.status === "IN_PROGRESS" && !isAdmin}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            class="text-red-600"
                                            onclick={() =>
                                                handleClockOut(request.id)}
                                        >
                                            <SquareIcon class="h-4 w-4 mr-1" />
                                            Selesai
                                        </Button>
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
