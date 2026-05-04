<script>
    import { onMount } from 'svelte';
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

    let storeState = $state({ summary: null, attendanceStats: null, payrollStats: null, employeeStats: null, recentActivities: null, superUserSummary: null, loading: false, error: null });
    let authState = $state({ user: null });
    let companyState = $state({ data: [], selected: null });

    dashboardStore.subscribe((s) => { storeState = s; });
    authStore.subscribe((s) => { authState = s; });
    companyStore.subscribe((s) => { companyState = s; });

    let currentCompany = $derived(companyState.selected);
    let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');
    let { summary, attendanceStats, employeeStats, recentActivities, superUserSummary, loading } = $derived(storeState);

    onMount(() => { if (!isSuperUser) dashboardStore.fetchAll(); else dashboardStore.fetchSuperUserSummary(); });
    async function handleRefresh() { if (isSuperUser) await dashboardStore.fetchSuperUserSummary(); else await dashboardStore.fetchAll(); }

    function formatNumber(num) { if (num === null || num === undefined) return '-'; return new Intl.NumberFormat('en-US').format(num); }
    function formatCurrency(amount) { if (amount === null || amount === undefined) return '-'; return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount); }
    function formatDate(dateString) { if (!dateString) return '-'; return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }

    function getActivityIcon(action) {
        switch (action?.toUpperCase()) { case 'CREATE': return '+'; case 'UPDATE': return '·'; case 'DELETE': return '×'; case 'APPROVE': return '✓'; case 'REJECT': return '✕'; case 'LOGIN': return '→'; case 'LOGOUT': return '←'; default: return '•'; }
    }
    const activityStyles = {
        CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        UPDATE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        DELETE: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
        APPROVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        REJECT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        LOGIN: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
        LOGOUT: 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20',
        default: 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-500/10 dark:text-stone-400 dark:border-stone-500/20',
    };
    function getActivityStyle(action) { return activityStyles[action?.toUpperCase()] || activityStyles.default; }
</script>

<svelte:head><title>Dashboard | HRIS</title></svelte:head>

<div class="mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
                {#if currentCompany}
                    <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"><BuildingIcon class="h-3 w-3" />{currentCompany.name}</span>
                {/if}
            </div>
            <p class="text-muted-foreground text-sm">Welcome back, <span class="text-foreground font-medium">{authState.user?.name || 'User'}</span></p>
        </div>
        <Button variant="outline" onclick={handleRefresh} disabled={loading} class="rounded-lg px-4 h-9 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm shadow-card self-start sm:self-auto">
            {#if loading}<LoaderIcon class="h-3.5 w-3.5 mr-2 animate-spin" />Updating...{:else}<RefreshCwIcon class="h-3.5 w-3.5 mr-2" />Refresh{/if}
        </Button>
    </div>
</div>

<div class="flex flex-1 flex-col gap-6">
    {#if isSuperUser}
        {#if loading && !superUserSummary}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{#each Array(4) as _}<div class="stat-card p-6"><div class="h-3.5 w-20 bg-muted rounded mb-4" /><div class="h-8 w-24 bg-muted rounded mb-2" /><div class="h-3 w-28 bg-muted/70 rounded" /></div>{/each}</div>
        {:else if superUserSummary}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Companies</span><div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><BuildingIcon class="h-5 w-5 text-primary" /></div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{formatNumber(superUserSummary.totalCompanies)}</div>
                    <div class="flex items-center gap-1.5 text-sm"><span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium"><TrendingUpIcon class="h-3.5 w-3.5" />{formatNumber(superUserSummary.activeCompanies)}</span><span class="text-muted-foreground">active</span></div>
                </Card.Content></Card.Root>
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Users</span><div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center"><UsersIcon class="h-5 w-5 text-violet-600 dark:text-violet-400" /></div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{formatNumber(superUserSummary.totalUsers)}</div>
                    <div class="flex gap-2 text-sm"><span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">{formatNumber(superUserSummary.totalAdmins)} admin</span><span class="px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 text-xs font-semibold">{formatNumber(superUserSummary.totalSuperUsers)} super</span></div>
                </Card.Content></Card.Root>
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employees</span><div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><UserCheckIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{formatNumber(superUserSummary.totalEmployees)}</div>
                    <p class="text-sm text-muted-foreground">Across all companies</p>
                </Card.Content></Card.Root>
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg / Company</span><div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><ActivityIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" /></div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{superUserSummary.totalCompanies > 0 ? formatNumber(Math.round(superUserSummary.totalEmployees / superUserSummary.totalCompanies)) : '0'}</div>
                    <p class="text-sm text-muted-foreground">Employees per company</p>
                </Card.Content></Card.Root>
            </div>
            <Card.Root class="surface-elevated"><Card.Header class="pb-4"><Card.Title class="text-base font-semibold text-foreground flex items-center gap-2"><BuildingIcon class="h-5 w-5 text-muted-foreground" />Company Overview</Card.Title></Card.Header>
                <Card.Content>
                    {#if superUserSummary.companyStats?.length > 0}
                        <div class="overflow-x-auto"><table class="w-full text-sm">
                            <thead><tr class="border-b border-border text-left text-muted-foreground"><th class="pb-3 font-medium text-xs uppercase tracking-wider">Company</th><th class="pb-3 font-medium text-xs uppercase tracking-wider">Plan</th><th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Status</th><th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Users</th><th class="pb-3 font-medium text-xs uppercase tracking-wider text-center">Employees</th><th class="pb-3 font-medium text-xs uppercase tracking-wider">Created</th></tr></thead>
                            <tbody>{#each superUserSummary.companyStats as company}
                                <tr class="border-b border-border/60 hover:bg-muted/50 transition-colors">
                                    <td class="py-3.5 font-medium text-foreground">{company.companyName}</td>
                                    <td class="py-3.5"><span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold {company.plan==='enterprise'?'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400':company.plan==='pro'?'bg-primary/10 text-primary':company.plan==='starter'?'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400':'bg-muted text-muted-foreground'}">{company.plan}</span></td>
                                    <td class="py-3.5 text-center">{#if company.isActive}<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>{:else}<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"><span class="w-1.5 h-1.5 rounded-full bg-red-500" />Inactive</span>{/if}</td>
                                    <td class="py-3.5 text-center text-foreground tabular-nums">{formatNumber(company.userCount)}</td>
                                    <td class="py-3.5 text-center text-foreground tabular-nums">{formatNumber(company.employeeCount)}</td>
                                    <td class="py-3.5 text-muted-foreground">{formatDate(company.createdAt)}</td>
                                </tr>
                            {/each}</tbody>
                        </table></div>
                    {:else}<p class="text-muted-foreground text-center py-12">No companies registered yet</p>{/if}
                </Card.Content>
            </Card.Root>
        {/if}
    {:else}
        {#if loading && !summary}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{#each Array(4) as _}<div class="stat-card p-6"><div class="h-3.5 w-20 bg-muted rounded mb-4" /><div class="h-8 w-24 bg-muted rounded mb-2" /><div class="h-3 w-28 bg-muted/70 rounded" /></div>{/each}</div>
        {:else if summary}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-sm font-semibold text-foreground/80">Employees</span><div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><UsersIcon class="h-5 w-5 text-primary" /></div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{employeeStats ? formatNumber(employeeStats.totalCount || 0) : '-'}</div>
                    {#if employeeStats}<span class="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1 font-medium"><TrendingUpIcon class="h-3.5 w-3.5" />{formatNumber(employeeStats.totalCount - (employeeStats.statusBreakdown?.resigned || 0))} active</span>{:else}<span class="text-muted-foreground text-sm">Active employees</span>{/if}
                </Card.Content></Card.Root>
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-sm font-semibold text-foreground/80">Present Today</span><div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><UserCheckIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{formatNumber(summary.attendance?.todayPresent || 0)}</div>
                    {#if summary.attendance}{@const total = summary.attendance.totalEmployees || 1}{@const present = summary.attendance.todayPresent || 0}<span class="text-muted-foreground text-sm">{((present / total) * 100).toFixed(1)}% attendance</span>{:else}<span class="text-muted-foreground text-sm">Attendance rate</span>{/if}
                </Card.Content></Card.Root>
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-sm font-semibold text-foreground/80">Monthly Payroll</span><div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center"><DollarSignIcon class="h-5 w-5 text-violet-600 dark:text-violet-400" /></div></div>
                    <div class="text-2xl font-bold text-foreground mb-1">{formatCurrency(summary.payroll?.totalNetSalary || 0)}</div>
                    {#if summary.payroll}<span class="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1 font-medium"><ClockIcon class="h-3.5 w-3.5" />{formatNumber(summary.payroll.draftCount || 0)} pending</span>{:else}<span class="text-muted-foreground text-sm">Pending payouts</span>{/if}
                </Card.Content></Card.Root>
                <Card.Root class="stat-card"><Card.Content class="p-6">
                    <div class="flex items-center justify-between mb-4"><span class="text-sm font-semibold text-foreground/80">Pending Requests</span><div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center relative"><ClockIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />{#if summary.leave?.pendingRequests > 0}<span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 shadow-card">{Math.min(summary.leave.pendingRequests, 99)}</span>{/if}</div></div>
                    <div class="text-3xl font-bold text-foreground mb-1">{formatNumber(summary.leave?.pendingRequests || 0)}</div>
                    <p class="text-muted-foreground text-sm">Awaiting approval</p>
                </Card.Content></Card.Root>
            </div>
            <div class="space-y-4">
                <div class="flex items-center gap-2"><CalendarIcon class="h-5 w-5 text-muted-foreground" /><h3 class="text-base font-semibold text-foreground">Attendance Statistics</h3></div>
                {#if attendanceStats?.summary}
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {#each [{ label: 'Present', value: attendanceStats.summary.totalPresent || 0, avg: attendanceStats.summary.avgPresent?.toFixed(1), icon: UserCheckIcon, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },{ label: 'Late', value: attendanceStats.summary.totalLate || 0, avg: attendanceStats.summary.avgLate?.toFixed(1), icon: ClockIcon, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },{ label: 'Absent', value: attendanceStats.summary.totalAbsent || 0, avg: null, icon: MinusIcon, cls: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },{ label: 'On Leave', value: attendanceStats.summary.totalLeave || 0, avg: null, icon: CalendarIcon, cls: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' }] as stat}
                            <Card.Root class="stat-card"><Card.Content class="p-5">
                                <div class="flex items-center justify-between mb-3"><span class="text-sm font-semibold text-foreground/80">{stat.label}</span><div class="w-9 h-9 rounded-lg {stat.cls} flex items-center justify-center"><stat.icon class="h-4 w-4" /></div></div>
                                <div class="text-2xl font-bold text-foreground mb-0.5">{formatNumber(stat.value)}</div>
                                {#if stat.avg}<p class="text-xs text-muted-foreground">Avg: {stat.avg}/day</p>{/if}
                            </Card.Content></Card.Root>
                        {/each}
                    </div>
                {:else}<div class="surface-card p-12 text-center"><p class="text-muted-foreground">No attendance data</p></div>{/if}
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <Card.Root class="surface-elevated"><Card.Header class="pb-3"><Card.Title class="text-base font-semibold text-foreground flex items-center gap-2"><ActivityIcon class="h-5 w-5 text-muted-foreground" />Recent Activities</Card.Title></Card.Header>
                    <Card.Content>
                        {#if recentActivities?.activities?.length > 0}
                            <div class="space-y-1">{#each recentActivities.activities.slice(0, 10) as activity}
                                <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div class="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border {getActivityStyle(activity.action)}">{getActivityIcon(activity.action)}</div>
                                    <div class="flex-1 min-w-0"><p class="text-sm text-foreground">{activity.description}</p><p class="text-xs text-muted-foreground mt-0.5">By {activity.userName} · {formatDate(activity.timestamp)}</p></div>
                                </div>
                            {/each}</div>
                        {:else}
                            <div class="py-10 flex flex-col items-center justify-center text-center">
                                <ActivityIcon class="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p class="text-sm font-medium text-foreground">No recent activities</p>
                                <p class="text-xs text-muted-foreground mt-1">Activities will appear here once users start interacting.</p>
                            </div>
                        {/if}
                    </Card.Content>
                </Card.Root>
                <Card.Root class="surface-elevated"><Card.Header class="pb-3"><Card.Title class="text-base font-semibold text-foreground flex items-center gap-2"><BriefcaseIcon class="h-5 w-5 text-muted-foreground" />Employee Status</Card.Title></Card.Header>
                    <Card.Content>
                        {#if employeeStats?.statusBreakdown}
                            <div class="space-y-5">{#each Object.entries(employeeStats.statusBreakdown) as [status, count]}
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-foreground capitalize">{status}</span>
                                    <div class="flex items-center gap-3">
                                        <div class="w-32 h-2 bg-muted rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full transition-all duration-500" style="width: {(count / (employeeStats.totalCount || 1)) * 100}%" /></div>
                                        <span class="text-sm font-semibold text-foreground w-8 text-right tabular-nums">{formatNumber(count)}</span>
                                    </div>
                                </div>
                            {/each}</div>
                        {:else}<p class="text-muted-foreground text-sm text-center py-12">No data</p>{/if}
                    </Card.Content>
                </Card.Root>
            </div>
        {/if}
    {/if}
</div>