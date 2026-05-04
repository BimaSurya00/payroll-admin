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
            case 'CREATE': return 'text-emerald-400';
            case 'UPDATE': return 'text-blue-400';
            case 'DELETE': return 'text-red-400';
            case 'APPROVE': return 'text-emerald-400';
            case 'REJECT': return 'text-amber-400';
            case 'LOGIN': return 'text-violet-400';
            case 'LOGOUT': return 'text-zinc-500';
            default: return 'text-zinc-400';
        }
    }

    function getActivityBg(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'UPDATE': return 'bg-blue-500/10 border-blue-500/20';
            case 'DELETE': return 'bg-red-500/10 border-red-500/20';
            case 'APPROVE': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'REJECT': return 'bg-amber-500/10 border-amber-500/20';
            case 'LOGIN': return 'bg-violet-500/10 border-violet-500/20';
            case 'LOGOUT': return 'bg-zinc-500/10 border-zinc-500/20';
            default: return 'bg-zinc-500/10 border-zinc-500/20';
        }
    }
</script>

<svelte:head>
    <title>Dashboard | HRIS</title>
</svelte:head>

<div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-1">
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
                {#if currentCompany}
                    <span class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <BuildingIcon class="h-3 w-3" />
                        {currentCompany.name}
                    </span>
                {/if}
            </div>
            <p class="text-zinc-500 text-sm">
                Welcome back, <span class="text-zinc-300 font-medium">{authState.user?.name || 'User'}</span>
            </p>
        </div>
        
        <Button 
            variant="outline" 
            onclick={handleRefresh} 
            disabled={loading}
            class="rounded-md px-3.5 h-8 border-white/[0.08] bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] hover:border-white/[0.12] transition-colors text-[13px]"
        >
            {#if loading}
                <LoaderIcon class="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Updating...
            {:else}
                <RefreshCwIcon class="h-3.5 w-3.5 mr-1.5" />
                Refresh
            {/if}
        </Button>
    </div>
</div>

<div class="flex flex-1 flex-col gap-6">
    {#if isSuperUser}
        {#if loading && !superUserSummary}
            <div class="grid auto-rows-min gap-3 md:grid-cols-2 lg:grid-cols-4">
                {#each Array(4) as _}
                    <div class="stat-card p-5">
                        <div class="h-3.5 w-20 bg-zinc-800 mb-4"></div>
                        <div class="h-7 w-16 bg-zinc-800 mb-2"></div>
                        <div class="h-3 w-28 bg-zinc-800/50"></div>
                    </div>
                {/each}
            </div>
        {:else if superUserSummary}
            <div class="grid auto-rows-min gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Companies</span>
                            <div class="w-8 h-8 bg-primary/10 flex items-center justify-center">
                                <BuildingIcon class="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">{formatNumber(superUserSummary.totalCompanies)}</div>
                        <div class="flex items-center gap-1.5 text-sm">
                            <span class="text-emerald-400 flex items-center gap-1">
                                <TrendingUpIcon class="h-3 w-3" />
                                {formatNumber(superUserSummary.activeCompanies)}
                            </span>
                            <span class="text-zinc-600">active</span>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Users</span>
                            <div class="w-8 h-8 bg-violet-500/10 flex items-center justify-center">
                                <UsersIcon class="h-4 w-4 text-violet-400" />
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">{formatNumber(superUserSummary.totalUsers)}</div>
                        <div class="flex gap-1.5 text-sm">
                            <span class="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] font-medium">{formatNumber(superUserSummary.totalAdmins)} admins</span>
                            <span class="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 text-[11px] font-medium">{formatNumber(superUserSummary.totalSuperUsers)} super</span>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Employees</span>
                            <div class="w-8 h-8 bg-emerald-500/10 flex items-center justify-center">
                                <UserCheckIcon class="h-4 w-4 text-emerald-400" />
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">{formatNumber(superUserSummary.totalEmployees)}</div>
                        <p class="text-sm text-zinc-600">Across all companies</p>
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg per Company</span>
                            <div class="w-8 h-8 bg-amber-500/10 flex items-center justify-center">
                                <ActivityIcon class="h-4 w-4 text-amber-400" />
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">
                            {superUserSummary.totalCompanies > 0 ? formatNumber(Math.round(superUserSummary.totalEmployees / superUserSummary.totalCompanies)) : '0'}
                        </div>
                        <p class="text-sm text-zinc-600">Employees per company</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <Card.Root class="surface-card">
                <Card.Header class="pb-4">
                    <Card.Title class="text-sm font-medium text-zinc-200 flex items-center gap-2">
                        <BuildingIcon class="h-4 w-4 text-zinc-500" />
                        Company Overview
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    {#if superUserSummary.companyStats?.length > 0}
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-white/[0.06] text-left text-zinc-500">
                                        <th class="pb-3 font-medium text-[11px] uppercase tracking-wider">Company</th>
                                        <th class="pb-3 font-medium text-[11px] uppercase tracking-wider">Plan</th>
                                        <th class="pb-3 font-medium text-[11px] uppercase tracking-wider text-center">Status</th>
                                        <th class="pb-3 font-medium text-[11px] uppercase tracking-wider text-center">Users</th>
                                        <th class="pb-3 font-medium text-[11px] uppercase tracking-wider text-center">Employees</th>
                                        <th class="pb-3 font-medium text-[11px] uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each superUserSummary.companyStats as company}
                                        <tr class="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                            <td class="py-3 font-medium text-zinc-200">{company.companyName}</td>
                                            <td class="py-3">
                                                <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium
                                                    {company.plan === 'enterprise' ? 'bg-violet-500/10 text-violet-400' :
                                                      company.plan === 'pro' ? 'bg-primary/10 text-primary' :
                                                      company.plan === 'starter' ? 'bg-emerald-500/10 text-emerald-400' :
                                                      'bg-zinc-800 text-zinc-500'}">
                                                    {company.plan}
                                                </span>
                                            </td>
                                            <td class="py-3 text-center">
                                                {#if company.isActive}
                                                    <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        Active
                                                    </span>
                                                {:else}
                                                    <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400">
                                                        <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                        Inactive
                                                    </span>
                                                {/if}
                                            </td>
                                            <td class="py-3 text-center text-zinc-300 tabular-nums">{formatNumber(company.userCount)}</td>
                                            <td class="py-3 text-center text-zinc-300 tabular-nums">{formatNumber(company.employeeCount)}</td>
                                            <td class="py-3 text-zinc-500">{formatDate(company.createdAt)}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <p class="text-zinc-600 text-center py-8">No companies registered yet</p>
                    {/if}
                </Card.Content>
            </Card.Root>
        {/if}
    {:else}
        {#if loading && !summary}
            <div class="grid auto-rows-min gap-3 md:grid-cols-2 lg:grid-cols-4">
                {#each Array(4) as _}
                    <div class="stat-card p-5">
                        <div class="h-3.5 w-20 bg-zinc-800 mb-4"></div>
                        <div class="h-7 w-16 bg-zinc-800 mb-2"></div>
                        <div class="h-3 w-28 bg-zinc-800/50"></div>
                    </div>
                {/each}
            </div>
        {:else if summary}
            <div class="grid auto-rows-min gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Employees</span>
                            <div class="w-8 h-8 bg-primary/10 flex items-center justify-center">
                                <UsersIcon class="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">
                            {employeeStats ? formatNumber(employeeStats.totalCount || 0) : '-'}
                        </div>
                        {#if employeeStats}
                            <span class="text-emerald-400 text-sm flex items-center gap-1">
                                <TrendingUpIcon class="h-3 w-3" />
                                {formatNumber(employeeStats.totalCount - (employeeStats.statusBreakdown?.resigned || 0))} active
                            </span>
                        {:else}
                            <span class="text-zinc-600 text-sm">Active employees</span>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Present Today</span>
                            <div class="w-8 h-8 bg-emerald-500/10 flex items-center justify-center">
                                <UserCheckIcon class="h-4 w-4 text-emerald-400" />
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">
                            {formatNumber(summary.attendance?.todayPresent || 0)}
                        </div>
                        {#if summary.attendance}
                            {@const total = summary.attendance.totalEmployees || 1}
                            {@const present = summary.attendance.todayPresent || 0}
                            <span class="text-zinc-500 text-sm">
                                {((present / total) * 100).toFixed(1)}% attendance rate
                            </span>
                        {:else}
                            <span class="text-zinc-600 text-sm">Attendance rate</span>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Monthly Payroll</span>
                            <div class="w-8 h-8 bg-violet-500/10 flex items-center justify-center">
                                <DollarSignIcon class="h-4 w-4 text-violet-400" />
                            </div>
                        </div>
                        <div class="text-xl font-semibold text-white mb-1">
                            {formatCurrency(summary.payroll?.totalNetSalary || 0)}
                        </div>
                        {#if summary.payroll}
                            <span class="text-amber-400 text-sm flex items-center gap-1">
                                <ClockIcon class="h-3 w-3" />
                                {formatNumber(summary.payroll.draftCount || 0)} pending
                            </span>
                        {:else}
                            <span class="text-zinc-600 text-sm">Pending payouts</span>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="stat-card">
                    <Card.Content class="p-5">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pending Requests</span>
                            <div class="w-8 h-8 bg-amber-500/10 flex items-center justify-center relative">
                                <ClockIcon class="h-4 w-4 text-amber-400" />
                                {#if summary.leave?.pendingRequests > 0}
                                    <span class="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold px-1">
                                        {Math.min(summary.leave.pendingRequests, 9)}
                                    </span>
                                {/if}
                            </div>
                        </div>
                        <div class="text-2xl font-semibold text-white mb-1">
                            {formatNumber(summary.leave?.pendingRequests || 0)}
                        </div>
                        <p class="text-zinc-600 text-sm">Leave requests awaiting approval</p>
                    </Card.Content>
                </Card.Root>
            </div>

            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <CalendarIcon class="h-4 w-4 text-zinc-500" />
                    <h3 class="text-sm font-medium text-zinc-300">Attendance Statistics</h3>
                </div>

                {#if attendanceStats?.summary}
                    <div class="grid gap-3 md:grid-cols-4">
                        {#each [
                            { label: 'Total Present', value: attendanceStats.summary.totalPresent || 0, avg: attendanceStats.summary.avgPresent?.toFixed(1), color: 'emerald', icon: UserCheckIcon },
                            { label: 'Total Late', value: attendanceStats.summary.totalLate || 0, avg: attendanceStats.summary.avgLate?.toFixed(1), color: 'amber', icon: ClockIcon },
                            { label: 'Total Absent', value: attendanceStats.summary.totalAbsent || 0, avg: null, color: 'red', icon: MinusIcon },
                            { label: 'On Leave', value: attendanceStats.summary.totalLeave || 0, avg: null, color: 'violet', icon: CalendarIcon }
                        ] as stat}
                            <Card.Root class="stat-card">
                                <Card.Content class="p-4">
                                    <p class="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">{stat.label}</p>
                                    <div class="text-xl font-semibold text-white mb-0.5">
                                        {formatNumber(stat.value)}
                                    </div>
                                    {#if stat.avg}
                                        <p class="text-xs text-zinc-600">Avg: {stat.avg}/day</p>
                                    {/if}
                                </Card.Content>
                            </Card.Root>
                        {/each}
                    </div>
                {:else}
                    <div class="surface-card p-8 text-center">
                        <p class="text-zinc-600 text-sm">No attendance data available</p>
                    </div>
                {/if}
            </div>

            <div class="grid gap-3 md:grid-cols-2">
                <Card.Root class="surface-card">
                    <Card.Header class="pb-3">
                        <Card.Title class="text-sm font-medium text-zinc-200 flex items-center gap-2">
                            <ActivityIcon class="h-4 w-4 text-zinc-500" />
                            Recent Activities
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {#if recentActivities?.activities?.length > 0}
                            <div class="space-y-1">
                                {#each recentActivities.activities.slice(0, 10) as activity}
                                    <div class="flex items-start gap-3 p-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
                                        <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold border {getActivityBg(activity.action)} {getActivityColor(activity.action)}">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm text-zinc-300">{activity.description}</p>
                                            <p class="text-xs text-zinc-600">
                                                By {activity.userName} · {formatDate(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-zinc-600 text-sm text-center py-8">No recent activities</p>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <Card.Root class="surface-card">
                    <Card.Header class="pb-3">
                        <Card.Title class="text-sm font-medium text-zinc-200 flex items-center gap-2">
                            <BriefcaseIcon class="h-4 w-4 text-zinc-500" />
                            Employee Status
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {#if employeeStats?.statusBreakdown}
                            <div class="space-y-4">
                                {#each Object.entries(employeeStats.statusBreakdown) as [status, count]}
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-zinc-400 capitalize">{status}</span>
                                        <div class="flex items-center gap-3">
                                            <div class="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    class="h-full bg-primary transition-all duration-500" 
                                                    style="width: {(count / (employeeStats.totalCount || 1)) * 100}%"
                                                ></div>
                                            </div>
                                            <span class="text-sm font-medium text-zinc-300 w-8 text-right tabular-nums">{formatNumber(count)}</span>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-zinc-600 text-sm text-center py-8">No data available</p>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </div>
        {/if}
    {/if}
</div>