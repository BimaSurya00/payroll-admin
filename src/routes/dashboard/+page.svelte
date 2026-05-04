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
        superUserSummary: null,
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

    let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');

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
    let superUserSummary = $derived(storeState.superUserSummary);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        if (isSuperUser) {
            try {
                await dashboardStore.fetchSuperUserSummary();
            } catch (err) {
                console.log('Error fetching superuser dashboard:', err.message);
            }
        } else if (isAdmin) {
            try {
                await dashboardStore.fetchAll();
                try {
                    await companyStore.fetchCurrent();
                } catch (err) {
                    console.log('Could not fetch company:', err.message);
                }
            } catch (err) {
                console.log('Error fetching dashboard data:', err.message);
            }
        }
    });

    // Refresh function
    async function handleRefresh() {
        if (isSuperUser) {
            await dashboardStore.fetchSuperUserSummary();
        } else if (isAdmin) {
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

<div class="relative">
	<div class="px-6 py-6 md:px-8 md:py-8">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div class="space-y-2">
				<div class="flex items-center gap-3">
					<h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
					{#if currentCompany}
						<span class="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
							<BuildingIcon class="h-3.5 w-3.5" />
							{currentCompany.name}
						</span>
					{/if}
				</div>
				<p class="text-muted-foreground flex items-center gap-2">
					<span class="w-1.5 h-1.5 rounded-full bg-success"></span>
					Welcome back, <span class="font-medium text-foreground">{authState.user?.name || 'User'}</span>
				</p>
			</div>
			
			<div class="flex items-center gap-3">
				<Button 
					variant="outline" 
					onclick={handleRefresh} 
					disabled={loading}
					class="rounded-lg px-4 h-10"
				>
					{#if loading}
						<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
						Updating...
					{:else}
						<RefreshCwIcon class="h-4 w-4 mr-2" />
						Refresh
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>

<div class="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pt-0">
    {#if isSuperUser}
        {#if loading && !superUserSummary}
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                {#each Array(4) as _}
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
        {:else if superUserSummary}
            <!-- Superuser Summary Cards -->
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Companies</Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BuildingIcon class="h-4 w-4 text-primary" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">{formatNumber(superUserSummary.totalCompanies)}</div>
                        <p class="text-xs text-muted-foreground mt-1.5">
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                                {formatNumber(superUserSummary.activeCompanies)} active
                            </span>
                        </p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Users</Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                            <UsersIcon class="h-4 w-4 text-info" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">{formatNumber(superUserSummary.totalUsers)}</div>
                        <p class="text-xs text-muted-foreground mt-1.5 flex gap-1">
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                                {formatNumber(superUserSummary.totalAdmins)} admins
                            </span>
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-chart-4/10 text-chart-4 text-[10px] font-medium">
                                {formatNumber(superUserSummary.totalSuperUsers)} super
                            </span>
                        </p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Employees</Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                            <UserCheckIcon class="h-4 w-4 text-success" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">{formatNumber(superUserSummary.totalEmployees)}</div>
                        <p class="text-xs text-muted-foreground mt-1.5">Across all companies</p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg per Company</Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                            <ActivityIcon class="h-4 w-4 text-warning" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">
                            {superUserSummary.totalCompanies > 0 ? formatNumber(Math.round(superUserSummary.totalEmployees / superUserSummary.totalCompanies)) : '0'}
                        </div>
                        <p class="text-xs text-muted-foreground mt-1.5">Employees per company</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <!-- Company Stats Table -->
            <Card.Root class="stat-card">
                <Card.Header>
                    <Card.Title class="flex items-center gap-2 text-sm font-semibold">
                        <BuildingIcon class="h-4 w-4 text-primary" />
                        Company Overview
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    {#if superUserSummary.companyStats?.length > 0}
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-border/50 text-left text-muted-foreground">
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider">Company</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider">Plan</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Status</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Users</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Employees</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Max</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each superUserSummary.companyStats as company}
                                        <tr class="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                            <td class="py-3 font-medium text-foreground">{company.companyName}</td>
                                            <td class="py-3">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                    {company.plan === 'enterprise' ? 'bg-chart-4/10 text-chart-4' :
                                                      company.plan === 'pro' ? 'bg-primary/10 text-primary' :
                                                      company.plan === 'starter' ? 'bg-chart-2/10 text-chart-2' :
                                                      'bg-muted text-muted-foreground'}">
                                                    {company.plan}
                                                </span>
                                            </td>
                                            <td class="py-3 text-center">
                                                {#if company.isActive}
                                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                                                        Active
                                                    </span>
                                                {:else}
                                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                                                        Inactive
                                                    </span>
                                                {/if}
                                            </td>
                                            <td class="py-3 text-center tabular-nums">{formatNumber(company.userCount)}</td>
                                            <td class="py-3 text-center tabular-nums">{formatNumber(company.employeeCount)}</td>
                                            <td class="py-3 text-center tabular-nums">{formatNumber(company.maxEmployees)}</td>
                                            <td class="py-3 text-muted-foreground">{formatDate(company.createdAt)}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <p class="text-muted-foreground text-center py-8 text-sm">No companies registered yet</p>
                    {/if}
                </Card.Content>
            </Card.Root>
        {:else if error}
            <div class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3" role="alert">
                <div class="flex-1">
                    <p class="text-sm font-medium text-destructive">{error}</p>
                </div>
            </div>
        {/if}
    {:else if !isAdmin}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view the admin dashboard."
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
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                <!-- Total Employees Card -->
                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Total Employees
                        </Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <UsersIcon class="h-4 w-4 text-primary" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">
                            {employeeStats ? formatNumber(employeeStats.totalCount || 0) : '-'}
                        </div>
                        <p class="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            {#if employeeStats}
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                                    {formatNumber(employeeStats.totalCount - (employeeStats.statusBreakdown?.resigned || 0))} active
                                </span>
                            {:else}
                                Active employees
                            {/if}
                        </p>
                    </Card.Content>
                </Card.Root>

                <!-- Present Today Card -->
                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Present Today
                        </Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                            <UserCheckIcon class="h-4 w-4 text-success" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">
                            {formatNumber(summary.attendance?.todayPresent || 0)}
                        </div>
                        <p class="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            {#if summary.attendance}
                                {@const total = summary.attendance.totalEmployees || 1}
                                {@const present = summary.attendance.todayPresent || 0}
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
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
                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Monthly Payroll
                        </Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                            <DollarSignIcon class="h-4 w-4 text-info" />
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-xl font-bold text-foreground">
                            {formatCurrency(summary.payroll?.totalNetSalary || 0)}
                        </div>
                        <p class="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            {#if summary.payroll}
                                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium">
                                    {formatNumber(summary.payroll.draftCount || 0)} pending
                                </span>
                            {:else}
                                Pending payouts
                            {/if}
                        </p>
                    </Card.Content>
                </Card.Root>

                <!-- Pending Requests Card -->
                <Card.Root class="stat-card">
                    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Pending Requests
                        </Card.Title>
                        <div class="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center relative">
                            <ClockIcon class="h-4 w-4 text-warning" />
                            {#if summary.leave?.pendingRequests > 0}
                                <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning text-white text-[9px] font-bold flex items-center justify-center">
                                    {Math.min(summary.leave.pendingRequests, 9)}
                                </span>
                            {/if}
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="text-2xl font-bold text-foreground">
                            {formatNumber(summary.leave?.pendingRequests || 0)}
                        </div>
                        <p class="text-xs text-muted-foreground mt-1.5">Leave requests awaiting approval</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <!-- Detailed Statistics -->
            <div class="space-y-8">
                <!-- Overview Section -->
                <div class="grid gap-4 md:grid-cols-2">
                    <!-- Employee Status Breakdown -->
                    <Card.Root class="stat-card">
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2 text-sm font-semibold">
                                <BriefcaseIcon class="h-4 w-4 text-chart-2" />
                                Employee Status
                            </Card.Title>
                        </Card.Header>
                        <Card.Content>
                            {#if employeeStats?.statusBreakdown}
                                <div class="space-y-3">
                                    {#each Object.entries(employeeStats.statusBreakdown) as [status, count]}
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm text-foreground capitalize">{status}</span>
                                            <div class="flex items-center gap-2">
                                                <div class="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        class="h-full bg-primary transition-all duration-500" 
                                                        style="width: {(count / (employeeStats.totalCount || 1)) * 100}%"
                                                    ></div>
                                                </div>
                                                <span class="text-sm font-medium w-10 text-right tabular-nums">{formatNumber(count)}</span>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-muted-foreground text-sm">No data available</p>
                            {/if}
                        </Card.Content>
                    </Card.Root>

                    <!-- Department Distribution -->
                    <Card.Root class="stat-card">
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2 text-sm font-semibold">
                                <BuildingIcon class="h-4 w-4 text-chart-3" />
                                Department Distribution
                            </Card.Title>
                        </Card.Header>
                        <Card.Content>
                            {#if employeeStats?.departmentStats}
                                <div class="space-y-3">
                                    {#each employeeStats.departmentStats.slice(0, 5) as dept}
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm text-foreground truncate max-w-[140px]">{dept.departmentName}</span>
                                            <div class="flex items-center gap-2">
                                                <div class="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        class="h-full bg-chart-3 transition-all duration-500" 
                                                        style="width: {(dept.employeeCount / (employeeStats.totalCount || 1)) * 100}%"
                                                    ></div>
                                                </div>
                                                <span class="text-sm font-medium w-10 text-right tabular-nums">{formatNumber(dept.employeeCount)}</span>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p class="text-muted-foreground text-sm">No data available</p>
                            {/if}
                        </Card.Content>
                    </Card.Root>

                    <!-- Recent Activities -->
                    <Card.Root class="md:col-span-2 stat-card">
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2 text-sm font-semibold">
                                <ActivityIcon class="h-4 w-4 text-primary" />
                                Recent Activities
                            </Card.Title>
                        </Card.Header>
                        <Card.Content>
                            {#if recentActivities?.activities?.length > 0}
                                <div class="space-y-2">
                                    {#each recentActivities.activities.slice(0, 10) as activity}
                                        <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm {getActivityColor(activity.action)}">
                                                {getActivityIcon(activity.action)}
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p class="text-sm font-medium text-foreground">{activity.description}</p>
                                                <p class="text-xs text-muted-foreground">
                                                    By {activity.userName} • {formatDate(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    {/each}
                                </div>                            {:else}
                                <p class="text-muted-foreground text-sm">No recent activities</p>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>

                <!-- Attendance Section -->
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarIcon class="h-4 w-4 text-primary" />
                    </div>
                    <h3 class="text-base font-semibold text-foreground">Attendance Statistics</h3>
                </div>

                {#if attendanceStats?.summary}
                    <div class="grid gap-4 md:grid-cols-4">
                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Present</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-success">
                                    {formatNumber(attendanceStats.summary.totalPresent || 0)}
                                </div>
                                <p class="text-xs text-muted-foreground mt-1">
                                    Avg: {attendanceStats.summary.avgPresent?.toFixed(1) || 0}/day
                                </p>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Late</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-warning">
                                    {formatNumber(attendanceStats.summary.totalLate || 0)}
                                </div>
                                <p class="text-xs text-muted-foreground mt-1">
                                    Avg: {attendanceStats.summary.avgLate?.toFixed(1) || 0}/day
                                </p>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Absent</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-destructive">
                                    {formatNumber(attendanceStats.summary.totalAbsent || 0)}
                                </div>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">On Leave</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-chart-4">
                                    {formatNumber(attendanceStats.summary.totalLeave || 0)}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </div>
                {:else}
                    <Card.Root class="stat-card">
                        <Card.Content class="py-8 text-center">
                            <p class="text-muted-foreground text-sm">No attendance data available</p>
                        </Card.Content>
                    </Card.Root>
                {/if}

                <!-- Payroll Section -->
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                        <DollarSignIcon class="h-4 w-4 text-info" />
                    </div>
                    <h3 class="text-base font-semibold text-foreground">Payroll Statistics</h3>
                </div>

                {#if payrollStats}
                    <div class="grid gap-4 md:grid-cols-3">
                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Payroll</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-foreground">
                                    {formatNumber(payrollStats.totalPayrolls || 0)}
                                </div>
                                <p class="text-xs text-muted-foreground mt-1">employees processed</p>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-info">
                                    {formatCurrency(payrollStats.totalAmount || 0)}
                                </div>
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="stat-card">
                            <Card.Header class="pb-2">
                                <Card.Title class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Average Salary</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-2xl font-bold text-foreground">
                                    {formatCurrency(payrollStats.averageSalary || 0)}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </div>

                    <Card.Root class="stat-card">
                        <Card.Header>
                            <Card.Title class="text-sm font-semibold">Status Breakdown</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <div class="grid gap-4 md:grid-cols-3">
                                <div class="p-4 rounded-lg bg-muted/50 border border-border/50">
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Draft</p>
                                    <p class="text-xl font-bold text-foreground mt-1">{formatNumber(payrollStats.statusBreakdown?.draftCount || 0)}</p>
                                    <p class="text-sm text-muted-foreground mt-1">{formatCurrency(payrollStats.statusBreakdown?.draftAmount || 0)}</p>
                                </div>
                                <div class="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <p class="text-xs font-medium text-primary uppercase tracking-wider">Approved</p>
                                    <p class="text-xl font-bold text-primary mt-1">{formatNumber(payrollStats.statusBreakdown?.approvedCount || 0)}</p>
                                    <p class="text-sm text-primary/70 mt-1">{formatCurrency(payrollStats.statusBreakdown?.approvedAmount || 0)}</p>
                                </div>
                                <div class="p-4 rounded-lg bg-success/5 border border-success/20">
                                    <p class="text-xs font-medium text-success uppercase tracking-wider">Paid</p>
                                    <p class="text-xl font-bold text-success mt-1">{formatNumber(payrollStats.statusBreakdown?.paidCount || 0)}</p>
                                    <p class="text-sm text-success/70 mt-1">{formatCurrency(payrollStats.statusBreakdown?.paidAmount || 0)}</p>
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
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
                        <UsersIcon class="h-4 w-4 text-chart-4" />
                    </div>
                    <h3 class="text-base font-semibold text-foreground">Employee Details</h3>
                </div>

                {#if employeeStats}
                    <div class="grid gap-4 md:grid-cols-2">
                        <Card.Root class="stat-card">
                            <Card.Header>
                                <Card.Title class="text-sm font-semibold">Job Level Distribution</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                {#if employeeStats.jobLevelStats?.length > 0}
                                    <div class="space-y-3">
                                        {#each employeeStats.jobLevelStats as level}
                                            <div class="flex items-center justify-between">
                                                <span class="text-sm text-foreground">{level.level}</span>
                                                <div class="flex items-center gap-2">
                                                    <div class="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            class="h-full bg-primary transition-all duration-500" 
                                                            style="width: {(level.employeeCount / (employeeStats.totalCount || 1)) * 100}%"
                                                        ></div>
                                                    </div>
                                                    <span class="text-sm font-medium w-10 text-right tabular-nums">{formatNumber(level.employeeCount)}</span>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <p class="text-muted-foreground text-sm">No job level data available</p>
                                {/if}
                            </Card.Content>
                        </Card.Root>

                        <Card.Root class="stat-card">
                            <Card.Header>
                                <Card.Title class="text-sm font-semibold">Recent Hires</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                {#if employeeStats.recentHires?.length > 0}
                                    <div class="space-y-2">
                                        {#each employeeStats.recentHires as hire}
                                            <div class="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span class="text-xs font-semibold text-primary">{hire.employeeName?.charAt(0) || '?'}</span>
                                                    </div>
                                                    <div>
                                                        <p class="text-sm font-medium text-foreground">{hire.employeeName}</p>
                                                        <p class="text-xs text-muted-foreground">{hire.position}</p>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <p class="text-xs text-muted-foreground">Joined</p>
                                                    <p class="text-xs font-medium text-foreground">{formatDate(hire.joinDate)}</p>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <p class="text-muted-foreground text-sm">No recent hires</p>
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