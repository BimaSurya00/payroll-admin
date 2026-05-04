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
    import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
    import MinusIcon from '@lucide/svelte/icons/minus';

    import { dashboardStore } from '$lib/stores/dashboard.store.js';
    import { authStore } from '$lib/stores/auth.store.js';
    import { companyStore } from '$lib/stores/company.store.js';

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

    dashboardStore.subscribe((state) => {
        storeState = state;
    });

    authStore.subscribe((state) => {
        authState = state;
    });

    companyStore.subscribe((state) => {
        companyState = state;
    });

    let currentCompany = $derived(companyState.selected);
    let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');
    
    let { summary, attendanceStats, payrollStats, employeeStats, recentActivities, superUserSummary, loading, error } = $derived(storeState);

    onMount(() => {
        if (!isSuperUser) {
            dashboardStore.fetchDashboardSummary();
        } else {
            dashboardStore.fetchSuperUserSummary();
        }
    });

    async function handleRefresh() {
        if (isSuperUser) {
            await dashboardStore.fetchSuperUserSummary();
        } else {
            await dashboardStore.fetchDashboardSummary();
        }
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return '-';
        return new Intl.NumberFormat('en-US').format(num);
    }

    function formatCurrency(amount) {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getActivityIcon(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return '+';
            case 'UPDATE': return '↻';
            case 'DELETE': return '×';
            case 'APPROVE': return '✓';
            case 'REJECT': return '✕';
            case 'LOGIN': return '→';
            case 'LOGOUT': return '←';
            default: return '•';
        }
    }

    function getActivityColor(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'UPDATE': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'DELETE': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'APPROVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'REJECT': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'LOGIN': return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
            case 'LOGOUT': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            default: return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
        }
    }
</script>

<svelte:head>
    <title>Dashboard | HRIS</title>
</svelte:head>

<!-- Dashboard Header -->
<div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-1">
            <div class="flex items-center gap-3">
                <h1 class="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                {#if currentCompany}
                    <span class="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium border border-cyan-500/20">
                        <BuildingIcon class="h-3.5 w-3.5" />
                        {currentCompany.name}
                    </span>
                {/if}
            </div>
            <p class="text-slate-400 flex items-center gap-2 text-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                Welcome back, <span class="font-semibold text-white">{authState.user?.name || 'User'}</span>
            </p>
        </div>
        
        <Button 
            variant="outline" 
            onclick={handleRefresh} 
            disabled={loading}
            class="rounded-xl px-4 h-10 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-cyan-500/50 transition-all"
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

<div class="flex flex-1 flex-col gap-6">
    {#if isSuperUser}
        {#if loading && !superUserSummary}
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                {#each Array(4) as _}
                    <div class="stat-card p-5">
                        <div class="h-4 w-24 bg-slate-700/50 rounded mb-4"></div>
                        <div class="h-8 w-20 bg-slate-700/50 rounded mb-2"></div>
                        <div class="h-3 w-32 bg-slate-700/50 rounded"></div>
                    </div>
                {/each}
            </div>
        {:else if superUserSummary}
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Companies</span>
                            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <BuildingIcon class="h-5 w-5 text-cyan-400" />
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">{formatNumber(superUserSummary.totalCompanies)}</div>
                        <div class="flex items-center gap-2 text-sm">
                            <span class="text-emerald-400 flex items-center gap-1">
                                <TrendingUpIcon class="h-3 w-3" />
                                {formatNumber(superUserSummary.activeCompanies)}
                            </span>
                            <span class="text-slate-500">active</span>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Users</span>
                            <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                <UsersIcon class="h-5 w-5 text-violet-400" />
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">{formatNumber(superUserSummary.totalUsers)}</div>
                        <div class="flex gap-2 text-sm">
                            <span class="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium">{formatNumber(superUserSummary.totalAdmins)} admins</span>
                            <span class="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-xs font-medium">{formatNumber(superUserSummary.totalSuperUsers)} super</span>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Employees</span>
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <UserCheckIcon class="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">{formatNumber(superUserSummary.totalEmployees)}</div>
                        <p class="text-sm text-slate-500">Across all companies</p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg per Company</span>
                            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <ActivityIcon class="h-5 w-5 text-amber-400" />
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">
                            {superUserSummary.totalCompanies > 0 ? formatNumber(Math.round(superUserSummary.totalEmployees / superUserSummary.totalCompanies)) : '0'}
                        </div>
                        <p class="text-sm text-slate-500">Employees per company</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <Card.Root class="glass-card">
                <Card.Header class="pb-4">
                    <Card.Title class="text-lg font-semibold text-white flex items-center gap-2">
                        <BuildingIcon class="h-5 w-5 text-cyan-400" />
                        Company Overview
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    {#if superUserSummary.companyStats?.length > 0}
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-slate-700/50 text-left text-slate-400">
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider">Company</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider">Plan</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Status</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Users</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Employees</th>
                                        <th class="pb-3 font-medium text-xs uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each superUserSummary.companyStats as company}
                                        <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td class="py-3 font-medium text-white">{company.companyName}</td>
                                            <td class="py-3">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium
                                                    {company.plan === 'enterprise' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                                                      company.plan === 'pro' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                                      company.plan === 'starter' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                      'bg-slate-700/50 text-slate-400 border border-slate-600'}">
                                                    {company.plan}
                                                </span>
                                            </td>
                                            <td class="py-3 text-center">
                                                {#if company.isActive}
                                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                                                        Active
                                                    </span>
                                                {:else}
                                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                                        Inactive
                                                    </span>
                                                {/if}
                                            </td>
                                            <td class="py-3 text-center text-slate-300 tabular-nums">{formatNumber(company.userCount)}</td>
                                            <td class="py-3 text-center text-slate-300 tabular-nums">{formatNumber(company.employeeCount)}</td>
                                            <td class="py-3 text-slate-400">{formatDate(company.createdAt)}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <p class="text-slate-500 text-center py-8">No companies registered yet</p>
                    {/if}
                </Card.Content>
            </Card.Root>
        {/if}
    {:else}
        {#if loading && !summary}
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                {#each Array(4) as _}
                    <div class="stat-card p-5">
                        <div class="h-4 w-24 bg-slate-700/50 rounded mb-4"></div>
                        <div class="h-8 w-20 bg-slate-700/50 rounded mb-2"></div>
                        <div class="h-3 w-32 bg-slate-700/50 rounded"></div>
                    </div>
                {/each}
            </div>
        {:else if summary}
            <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Employees</span>
                            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <UsersIcon class="h-5 w-5 text-cyan-400" />
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">
                            {employeeStats ? formatNumber(employeeStats.totalCount || 0) : '-'}
                        </div>
                        {#if employeeStats}
                            <span class="text-emerald-400 text-sm flex items-center gap-1">
                                <TrendingUpIcon class="h-3 w-3" />
                                {formatNumber(employeeStats.totalCount - (employeeStats.statusBreakdown?.resigned || 0))} active
                            </span>
                        {:else}
                            <span class="text-slate-500 text-sm">Active employees</span>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Present Today</span>
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <UserCheckIcon class="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">
                            {formatNumber(summary.attendance?.todayPresent || 0)}
                        </div>
                        {#if summary.attendance}
                            {@const total = summary.attendance.totalEmployees || 1}
                            {@const present = summary.attendance.todayPresent || 0}
                            <span class="text-emerald-400 text-sm">
                                {((present / total) * 100).toFixed(1)}% attendance rate
                            </span>
                        {:else}
                            <span class="text-slate-500 text-sm">Attendance rate</span>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Payroll</span>
                            <div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                                <DollarSignIcon class="h-5 w-5 text-violet-400" />
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-white mb-1">
                            {formatCurrency(summary.payroll?.totalNetSalary || 0)}
                        </div>
                        {#if summary.payroll}
                            <span class="text-amber-400 text-sm flex items-center gap-1">
                                <ClockIcon class="h-3 w-3" />
                                {formatNumber(summary.payroll.draftCount || 0)} pending
                            </span>
                        {:else}
                            <span class="text-slate-500 text-sm">Pending payouts</span>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Requests</span>
                            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 relative">
                                <ClockIcon class="h-5 w-5 text-amber-400" />
                                {#if summary.leave?.pendingRequests > 0}
                                    <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold flex items-center justify-center shadow-lg shadow-amber-400/50">
                                        {Math.min(summary.leave.pendingRequests, 9)}
                                    </span>
                                {/if}
                            </div>
                        </div>
                        <div class="text-3xl font-bold text-white mb-1">
                            {formatNumber(summary.leave?.pendingRequests || 0)}
                        </div>
                        <p class="text-slate-500 text-sm">Leave requests awaiting approval</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <div class="space-y-4">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <CalendarIcon class="h-4 w-4 text-cyan-400" />
                    </div>
                    <h3 class="text-base font-semibold text-white">Attendance Statistics</h3>
                </div>

                {#if attendanceStats?.summary}
                    <div class="grid gap-4 md:grid-cols-4">
                        {#each [
                            { label: 'Total Present', value: attendanceStats.summary.totalPresent || 0, avg: attendanceStats.summary.avgPresent?.toFixed(1), color: 'emerald', icon: UserCheckIcon },
                            { label: 'Total Late', value: attendanceStats.summary.totalLate || 0, avg: attendanceStats.summary.avgLate?.toFixed(1), color: 'amber', icon: ClockIcon },
                            { label: 'Total Absent', value: attendanceStats.summary.totalAbsent || 0, avg: null, color: 'rose', icon: MinusIcon },
                            { label: 'On Leave', value: attendanceStats.summary.totalLeave || 0, avg: null, color: 'violet', icon: CalendarIcon }
                        ] as stat}
                            <Card.Root class="stat-card">
                                <Card.Content class="p-4">
                                    <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                                    <div class="text-2xl font-bold text-white mb-1">
                                        {formatNumber(stat.value)}
                                    </div>
                                    {#if stat.avg}
                                        <p class="text-xs text-slate-500">Avg: {stat.avg}/day</p>
                                    {/if}
                                </Card.Content>
                            </Card.Root>
                        {/each}
                    </div>
                {:else}
                    <div class="stat-card p-8 text-center">
                        <p class="text-slate-500 text-sm">No attendance data available</p>
                    </div>
                {/if}
            </div>

            <div class="grid gap-6 md:grid-cols-2">
                <Card.Root class="glass-card">
                    <Card.Header class="pb-4">
                        <Card.Title class="text-sm font-semibold text-white flex items-center gap-2">
                            <ActivityIcon class="h-4 w-4 text-cyan-400" />
                            Recent Activities
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {#if recentActivities?.activities?.length > 0}
                            <div class="space-y-3">
                                {#each recentActivities.activities.slice(0, 10) as activity}
                                    <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                                        <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border {getActivityColor(activity.action)}">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium text-slate-200">{activity.description}</p>
                                            <p class="text-xs text-slate-500">
                                                By {activity.userName} • {formatDate(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-slate-500 text-sm text-center py-8">No recent activities</p>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="glass-card">
                    <Card.Header class="pb-4">
                        <Card.Title class="text-sm font-semibold text-white flex items-center gap-2">
                            <BriefcaseIcon class="h-4 w-4 text-emerald-400" />
                            Employee Status
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {#if employeeStats?.statusBreakdown}
                            <div class="space-y-4">
                                {#each Object.entries(employeeStats.statusBreakdown) as [status, count]}
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-slate-300 capitalize">{status}</span>
                                        <div class="flex items-center gap-3">
                                            <div class="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    class="h-full bg-cyan-500 transition-all duration-500 shadow-lg shadow-cyan-500/30" 
                                                    style="width: {(count / (employeeStats.totalCount || 1)) * 100}%"
                                                ></div>
                                            </div>
                                            <span class="text-sm font-semibold text-white w-10 text-right tabular-nums">{formatNumber(count)}</span>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-slate-500 text-sm text-center py-8">No data available</p>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </div>
        {/if}
    {/if}
</div>
