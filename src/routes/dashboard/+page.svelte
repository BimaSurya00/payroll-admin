<script>
    import { onMount } from 'svelte';
    import ErrorForbidden from '$lib/components/error-forbidden.svelte';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
    import LoaderIcon from '@lucide/svelte/icons/loader';
    import UsersIcon from '@lucide/svelte/icons/users';
    import UserCheckIcon from '@lucide/svelte/icons/user-check';
    import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
    import ClockIcon from '@lucide/svelte/icons/clock';
    import BuildingIcon from '@lucide/svelte/icons/building';
    import CalendarIcon from '@lucide/svelte/icons/calendar';
    import BriefcaseIcon from '@lucide/svelte/icons/briefcase';
    import ActivityIcon from '@lucide/svelte/icons/activity';

    import { dashboardStore } from '$lib/stores/dashboard.store.js';
    import { authStore } from '$lib/stores/auth.store.js';
    import { companyStore } from '$lib/stores/company.store.js';

    // Reactive state
    let storeState = $state({ 
        summary: null, 
        attendanceStats: null,
        payrollStats: null,
        employeeStats: null,
        recentActivities: null,
        loading: false, 
        error: null 
    });
    let authState = $state({ user: null });
    let companyState = $state({ data: [], selected: null });

    // Subscribe to stores
    dashboardStore.subscribe((state) => {
        storeState = state;
    });

    authStore.subscribe((state) => {
        authState = state;
    });

    companyStore.subscribe((state) => {
        companyState = state;
    });

    // Get current user's company
    let currentCompany = $derived(companyState.selected);

    // Check if user is admin
    let isAdmin = $derived(
        authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPER_USER'
    );

    // Check if error is forbidden
    let isForbidden = $derived(
        storeState.error?.includes('403') ||
            storeState.error?.toLowerCase().includes('forbidden') ||
            storeState.error?.toLowerCase().includes('access denied')
    );

    // Derived data
    let summary = $derived(storeState.summary);
    let attendanceStats = $derived(storeState.attendanceStats);
    let payrollStats = $derived(storeState.payrollStats);
    let employeeStats = $derived(storeState.employeeStats);
    let recentActivities = $derived(storeState.recentActivities);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        if (isAdmin) {
            try {
                await dashboardStore.fetchAll();
                // Fetch current company data
                try {
                    await companyStore.fetchCurrent();
                } catch (err) {
                    // Silently fail if user doesn't have company access
                    console.log('Could not fetch company:', err.message);
                }
            } catch (err) {
                console.log('Error fetching dashboard data:', err.message);
            }
        }
    });

    // Refresh function
    async function handleRefresh() {
        if (isAdmin) {
            await dashboardStore.fetchAll();
        }
    }

    function formatNumber(num) {
        if (!num) return '0';
        return new Intl.NumberFormat('id-ID').format(num);
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
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    function getActivityIcon(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return '➕';
            case 'UPDATE': return '✏️';
            case 'DELETE': return '🗑️';
            case 'APPROVE': return '✅';
            case 'REJECT': return '❌';
            case 'LOGIN': return '🔑';
            case 'LOGOUT': return '🚪';
            default: return '📋';
        }
    }

    function getActivityColor(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return 'text-green-600 bg-green-50';
            case 'UPDATE': return 'text-blue-600 bg-blue-50';
            case 'DELETE': return 'text-red-600 bg-red-50';
            case 'APPROVE': return 'text-green-600 bg-green-50';
            case 'REJECT': return 'text-orange-600 bg-orange-50';
            case 'LOGIN': return 'text-purple-600 bg-purple-50';
            case 'LOGOUT': return 'text-gray-600 bg-gray-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    }
</script>

<svelte:head>
    <title>Dashboard | HRIS</title>
</svelte:head>

<div class="relative overflow-hidden">
	<!-- Background decoration -->
	<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-4/5"></div>
	<div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
	
	<div class="relative px-6 py-8">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div class="space-y-1">
				<h1 class="text-4xl font-extrabold tracking-tight gradient-text">Dashboard</h1>
				<div class="flex items-center gap-3 text-muted-foreground flex-wrap">
					<span class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
						Welcome back, <span class="font-semibold text-foreground">{authState.user?.name || 'User'}</span>
					</span>
					{#if currentCompany}
						<span class="hidden md:inline text-muted-foreground/30">|</span>
						<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-glow-sm">
							<BuildingIcon class="h-4 w-4 text-primary" />
							<span class="font-medium text-foreground">{currentCompany.name}</span>
						</div>
					{/if}
				</div>
			</div>
			
			<div class="flex items-center gap-3">
				<Button 
					variant="outline" 
					onclick={handleRefresh} 
					disabled={loading}
					class="rounded-full px-6"
				>
					{#if loading}
						<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
						Updating...
					{:else}
						<RefreshCwIcon class="h-4 w-4 mr-2" />
						Refresh Data
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if !isAdmin}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view the admin dashboard. This feature requires Admin or Super User access."
        />
    {:else if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view dashboard statistics."
        />
    {:else}
        {#if error}
            <div class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 animate-slide-up" role="alert">
                <div class="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-destructive text-xs">!</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-destructive">{error}</p>
                    <p class="text-xs text-destructive/70 mt-1">Click refresh to retry.</p>
                </div>
            </div>
        {/if}

        {#if loading && !summary}
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                {#each Array(4) as _, i}
                    <Card.Root class="relative overflow-hidden">
                        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div class="h-4 w-24 skeleton rounded"></div>
                            <div class="w-8 h-8 rounded-lg skeleton"></div>
                        </Card.Header>
                        <Card.Content>
                            <div class="h-8 w-20 skeleton rounded mb-2"></div>
                            <div class="h-3 w-32 skeleton rounded"></div>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        {:else if summary}
            <!-- Summary Cards -->
            <div class="grid auto-rows-min gap-5 md:grid-cols-2 lg:grid-cols-4">
                <!-- Total Employees Card -->
                <Card.Root class="card-hover card-3d relative overflow-hidden group border-0 shadow-soft bg-gradient-to-br from-card to-background">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-chart-4"></div>
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                        <Card.Title class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Employees
                        </Card.Title>
                        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow-sm">
                            <UsersIcon class="h-5 w-5 text-primary" />
                        </div>
                    </Card.Header>
                    <Card.Content class="relative">
                        <div class="text-3xl font-extrabold gradient-text">
                            {employeeStats ? formatNumber(employeeStats.totalCount || 0) : '-'}
                        </div>
                        <p class="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            {#if employeeStats}
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                                    <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                                    {formatNumber(employeeStats.totalCount - (employeeStats.statusBreakdown?.resigned || 0))} active
                                </span>
                            {:else}
                                Active employees
                            {/if}
                        </p>
                    </Card.Content>
                </Card.Root>

                <!-- Present Today Card -->
                <Card.Root class="card-hover card-3d relative overflow-hidden group border-0 shadow-soft bg-gradient-to-br from-card to-background">
                    <div class="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-chart-2"></div>
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                        <Card.Title class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Present Today
                        </Card.Title>
                        <div class="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <UserCheckIcon class="h-5 w-5 text-success" />
                        </div>
                    </Card.Header>
                    <Card.Content class="relative">
                        <div class="text-3xl font-extrabold text-success">
                            {formatNumber(summary.attendance?.todayPresent || 0)}
                        </div>
                        <p class="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            {#if summary.attendance}
                                {@const total = summary.attendance.totalEmployees || 1}
                                {@const present = summary.attendance.todayPresent || 0}
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                                    {((present / total) * 100).toFixed(1)}%
                                </span>
                                <span>attendance rate</span>
                            {:else}
                                Attendance rate
                            {/if}
                        </p>
                    </Card.Content>
                </Card.Root>

                <!-- Monthly Payroll Card -->
                <Card.Root class="card-hover card-3d relative overflow-hidden group border-0 shadow-soft bg-gradient-to-br from-card to-background">
                    <div class="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-info to-primary"></div>
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                        <Card.Title class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Monthly Payroll
                        </Card.Title>
                        <div class="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <DollarSignIcon class="h-5 w-5 text-info" />
                        </div>
                    </Card.Header>
                    <Card.Content class="relative">
                        <div class="text-2xl font-extrabold text-info">
                            {formatCurrency(summary.payroll?.totalNetSalary || 0)}
                        </div>
                        <p class="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            {#if summary.payroll}
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                                    <span class="w-1.5 h-1.5 rounded-full bg-warning"></span>
                                    {formatNumber(summary.payroll.draftCount || 0)} pending
                                </span>
                            {:else}
                                Pending payouts
                            {/if}
                        </p>
                    </Card.Content>
                </Card.Root>

                <!-- Pending Requests Card -->
                <Card.Root class="card-hover card-3d relative overflow-hidden group border-0 shadow-soft bg-gradient-to-br from-card to-background">
                    <div class="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-chart-3"></div>
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                        <Card.Title class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Pending Requests
                        </Card.Title>
                        <div class="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                            <ClockIcon class="h-5 w-5 text-warning" />
                            {#if summary.leave?.pendingRequests > 0}
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning text-white text-[10px] font-bold flex items-center justify-center">
                                    {Math.min(summary.leave.pendingRequests, 9)}
                                </span>
                            {/if}
                        </div>
                    </Card.Header>
                    <Card.Content class="relative">
                        <div class="text-3xl font-extrabold text-warning">
                            {formatNumber(summary.leave?.pendingRequests || 0)}
                        </div>
                        <p class="text-sm text-muted-foreground mt-2">Leave requests awaiting approval</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <!-- Detailed Statistics -->
            <div class="space-y-8">
                <!-- Overview Section -->
                <div class="grid gap-4 md:grid-cols-2">
                    <!-- Employee Status Breakdown -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                <BriefcaseIcon class="h-5 w-5" />
                                Employee Status
                            </Card.Title>
                        </Card.Header>
                        <Card.Content>
                            {#if employeeStats?.statusBreakdown}
                                <div class="space-y-3">
                                    {#each Object.entries(employeeStats.statusBreakdown) as [status, count]}
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm capitalize">{status}</span>
                                            <div class="flex items-center gap-2">
                                                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        class="h-full bg-primary transition-all" 
                                                        style="width: {(count / (employeeStats.totalCount || 1)) * 100}%"
                                                    ></div>
                                                </div>
                                                <span class="text-sm font-medium w-12 text-right">{formatNumber(count)}</span>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-muted-foreground">No data available</p>
                            {/if}
                        </Card.Content>
                    </Card.Root>

                    <!-- Department Distribution -->
                    <Card.Root>
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                <BuildingIcon class="h-5 w-5" />
                                Department Distribution
                            </Card.Title>
                        </Card.Header>
                        <Card.Content>
                            {#if employeeStats?.departmentStats}
                                <div class="space-y-3">
                                    {#each employeeStats.departmentStats.slice(0, 5) as dept}
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm truncate max-w-[150px]">{dept.departmentName}</span>
                                            <div class="flex items-center gap-2">
                                                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        class="h-full bg-primary transition-all" 
                                                        style="width: {(dept.employeeCount / (employeeStats.totalCount || 1)) * 100}%"
                                                    ></div>
                                                </div>
                                                <span class="text-sm font-medium w-12 text-right">{formatNumber(dept.employeeCount)}</span>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-muted-foreground">No data available</p>
                            {/if}
                        </Card.Content>
                    </Card.Root>

                    <!-- Recent Activities -->
                    <Card.Root class="md:col-span-2">
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                <ActivityIcon class="h-5 w-5" />
                                Recent Activities
                            </Card.Title>
                        </Card.Header>
                        <Card.Content>
                            {#if recentActivities?.activities?.length > 0}
                                <div class="space-y-3">
                                    {#each recentActivities.activities.slice(0, 10) as activity}
                                        <div class="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg {getActivityColor(activity.action)}">
                                                {getActivityIcon(activity.action)}
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p class="text-sm font-medium">{activity.description}</p>
                                                <p class="text-xs text-muted-foreground">
                                                    By {activity.userName} • {formatDate(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    {/each}
                                </div>                            {:else}
                                <p class="text-muted-foreground">No recent activities</p>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>

                <!-- Attendance Section -->
                <h3 class="text-lg font-semibold flex items-center gap-2">
                    <CalendarIcon class="h-5 w-5" />
                    Attendance Statistics
                </h3>

                <Card.Root>
                    <Card.Header>
                        <Card.Title class="flex items-center gap-2">
                            <CalendarIcon class="h-5 w-5" />
                            Attendance Summary
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {#if attendanceStats?.summary}
                            <div class="grid gap-4 md:grid-cols-4">
                                <Card.Root>
                                    <Card.Header class="pb-2">
                                        <Card.Title class="text-sm text-muted-foreground">Total Present</Card.Title>
                                    </Card.Header>
                                    <Card.Content>
                                        <div class="text-2xl font-bold text-green-600">
                                            {formatNumber(attendanceStats.summary.totalPresent || 0)}
                                        </div>
                                        <p class="text-xs text-muted-foreground">
                                            Avg: {attendanceStats.summary.avgPresent?.toFixed(1) || 0}/day
                                        </p>
                                    </Card.Content>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Header class="pb-2">
                                        <Card.Title class="text-sm text-muted-foreground">Total Late</Card.Title>
                                    </Card.Header>
                                    <Card.Content>
                                        <div class="text-2xl font-bold text-orange-600">
                                            {formatNumber(attendanceStats.summary.totalLate || 0)}
                                        </div>
                                        <p class="text-xs text-muted-foreground">
                                            Avg: {attendanceStats.summary.avgLate?.toFixed(1) || 0}/day
                                        </p>
                                    </Card.Content>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Header class="pb-2">
                                        <Card.Title class="text-sm text-muted-foreground">Total Absent</Card.Title>
                                    </Card.Header>
                                    <Card.Content>
                                        <div class="text-2xl font-bold text-red-600">
                                            {formatNumber(attendanceStats.summary.totalAbsent || 0)}
                                        </div>
                                    </Card.Content>
                                </Card.Root>

                                <Card.Root>
                                    <Card.Header class="pb-2">
                                        <Card.Title class="text-sm text-muted-foreground">On Leave</Card.Title>
                                    </Card.Header>
                                    <Card.Content>
                                        <div class="text-2xl font-bold text-purple-600">
                                            {formatNumber(attendanceStats.summary.totalLeave || 0)}
                                        </div>
                                    </Card.Content>
                                </Card.Root>
                            </div>
                        {:else}
                            <p class="text-muted-foreground">No attendance data available</p>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <!-- Payroll Section -->
                <h3 class="text-lg font-semibold flex items-center gap-2">
                    <DollarSignIcon class="h-5 w-5" />
                    Payroll Statistics
                </h3>

                {#if payrollStats}
                    <div class="grid gap-4 md:grid-cols-3">
                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-sm text-muted-foreground">Total Payroll</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold">
                                    {formatNumber(payrollStats.totalPayrolls || 0)}
                                </div>
                                <p class="text-xs text-muted-foreground">employees</p>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-sm text-muted-foreground">Total Amount</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-blue-600">
                                    {formatCurrency(payrollStats.totalAmount || 0)}
                                </div>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root>
                            <Card.Header>
                                <Card.Title class="text-sm text-muted-foreground">Average Salary</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold">
                                    {formatCurrency(payrollStats.averageSalary || 0)}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </div>

                    <Card.Root>
                        <Card.Header>
                            <Card.Title>Status Breakdown</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="grid gap-4 md:grid-cols-3">
                                <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                                    <p class="text-sm text-muted-foreground">Draft</p>
                                    <p class="text-xl font-bold">{formatNumber(payrollStats.statusBreakdown?.draftCount || 0)}</p>
                                    <p class="text-sm text-muted-foreground">{formatCurrency(payrollStats.statusBreakdown?.draftAmount || 0)}</p>
                                </div>
                                <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
                                    <p class="text-sm text-blue-600">Approved</p>
                                    <p class="text-xl font-bold text-blue-600">{formatNumber(payrollStats.statusBreakdown?.approvedCount || 0)}</p>
                                    <p class="text-sm text-blue-600">{formatCurrency(payrollStats.statusBreakdown?.approvedAmount || 0)}</p>
                                </div>
                                <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900">
                                    <p class="text-sm text-green-600">Paid</p>
                                    <p class="text-xl font-bold text-green-600">{formatNumber(payrollStats.statusBreakdown?.paidCount || 0)}</p>
                                    <p class="text-sm text-green-600">{formatCurrency(payrollStats.statusBreakdown?.paidAmount || 0)}</p>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>

                    {#if payrollStats.departmentStats?.length > 0}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>Department Payroll</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="space-y-3">
                                    {#each payrollStats.departmentStats as dept}
                                        <div class="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <p class="font-medium">{dept.departmentName}</p>
                                                <p class="text-sm text-muted-foreground">{formatNumber(dept.employeeCount)} employees</p>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-bold">{formatCurrency(dept.totalPayroll)}</p>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/if}
                {:else}
                    <Card.Root>
                        <Card.Content class="py-8 text-center">
                            <p class="text-muted-foreground">No payroll data available</p>
                        </Card.Content>
                    </Card.Root>
                {/if}

                <!-- Employees Section -->
                <h3 class="text-lg font-semibold flex items-center gap-2">
                    <UsersIcon class="h-5 w-5" />
                    Employee Details
                </h3>

                {#if employeeStats}
                    <div class="grid gap-4 md:grid-cols-2">
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>Job Level Distribution</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                {#if employeeStats.jobLevelStats?.length > 0}
                                    <div class="space-y-3">
                                        {#each employeeStats.jobLevelStats as level}
                                            <div class="flex items-center justify-between">
                                                <span class="text-sm">{level.level}</span>
                                                <div class="flex items-center gap-2">
                                                    <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            class="h-full bg-primary transition-all" 
                                                            style="width: {(level.employeeCount / (employeeStats.totalCount || 1)) * 100}%"
                                                        ></div>
                                                    </div>
                                                    <span class="text-sm font-medium w-12 text-right">{formatNumber(level.employeeCount)}</span>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <p class="text-muted-foreground">No job level data available</p>
                                {/if}
                            </Card.Content>
                        </Card.Root>

                        <Card.Root>
                            <Card.Header>
                                <Card.Title>Recent Hires</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                {#if employeeStats.recentHires?.length > 0}
                                    <div class="space-y-3">
                                        {#each employeeStats.recentHires as hire}
                                            <div class="flex items-center justify-between p-3 rounded-lg border">
                                                <div>
                                                    <p class="font-medium">{hire.employeeName}</p>
                                                    <p class="text-sm text-muted-foreground">{hire.position}</p>
                                                </div>
                                                <div class="text-right">
                                                    <p class="text-sm text-muted-foreground">Joined</p>
                                                    <p class="text-sm font-medium">{formatDate(hire.joinDate)}</p>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <p class="text-muted-foreground">No recent hires</p>
                                {/if}
                            </Card.Content>
                        </Card.Root>
                    </div>
                {:else}
                    <Card.Root>
                        <Card.Content class="py-8 text-center">
                            <p class="text-muted-foreground">No employee data available</p>
                        </Card.Content>
                    </Card.Root>
                {/if}
            </div>
        {/if}
    {/if}
</div>