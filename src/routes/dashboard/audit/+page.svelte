<script>
	import { onMount } from 'svelte';
	import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
	import EmptyState from '$lib/components/shared/empty-state.svelte';
	import Alert from '$lib/components/shared/alert.svelte';
	import LoadingTable from '$lib/components/shared/loading-table.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	import { auditStore } from '$lib/stores/audit.store.js';
	import { authStore } from '$lib/stores/auth.store.js';
	import { formatDateTime } from '$lib/utils/format.js';

	// Reactive state
	let storeState = $state({ 
		logs: [], 
		loading: false, 
		error: null,
		pagination: { currentPage: 1, lastPage: 1, total: 0 }
	});
	let authState = $state({ user: null });

	let filters = $state({
		action: '',
		resourceType: '',
		userId: '',
		dateFrom: '',
		dateTo: '',
	});

	auditStore.subscribe((state) => {
		storeState = state;
	});

	authStore.subscribe((state) => {
		authState = state;
	});

	let isAdmin = $derived(authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPER_USER');
	let logs = $derived(storeState.logs);
	let loading = $derived(storeState.loading);
	let error = $derived(storeState.error);
	let pagination = $derived(storeState.pagination);

	onMount(() => {
		if (isAdmin) {
			loadLogs();
		}
	});

	async function loadLogs(page = 1) {
		const params = { page };
		if (filters.action) params.action = filters.action;
		if (filters.resourceType) params.resourceType = filters.resourceType;
		if (filters.userId) params.userId = filters.userId;
		if (filters.dateFrom) params.dateFrom = filters.dateFrom;
		if (filters.dateTo) params.dateTo = filters.dateTo;

		await auditStore.fetchLogs(params);
	}

	function handleFilter() {
		loadLogs(1);
	}

	function clearFilters() {
		filters = {
			action: '',
			resourceType: '',
			userId: '',
			dateFrom: '',
			dateTo: '',
		};
		loadLogs(1);
	}

	async function handlePageChange(newPage) {
		await loadLogs(newPage);
	}

	function getActionColor(action) {
		const colors = {
			CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
			UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
			APPROVE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
			REJECT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
			LOGIN: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
			LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
		};
		return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
	}

	function getResourceTypeIcon(type) {
		const icons = {
			employee: '👤',
			user: '🔐',
			payroll: '💰',
			attendance: '⏰',
			leave: '🏖️',
			overtime: '⏱️',
			department: '🏢',
			schedule: '📅',
			holiday: '🎉',
			company: '🏭',
		};
		return icons[type?.toLowerCase()] || '📄';
	}
</script>

<svelte:head>
	<title>Audit Logs | Dashboard</title>
</svelte:head>

<DashboardHeader
	title="Audit Logs"
	subtitle="View system activity and changes"
/>

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
	{#if error}
		<Alert variant="error" message={error} dismissible onDismiss={() => auditStore.clearError?.()} />
	{/if}

	<!-- Filters Card -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<FilterIcon class="h-5 w-5" />
				Filters
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
				<div class="space-y-2">
					<Label>Action</Label>
					<Select.Root bind:value={filters.action}>
						<Select.Trigger>
							<Select.Value placeholder="All Actions" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">All Actions</Select.Item>
							<Select.Item value="CREATE">Create</Select.Item>
							<Select.Item value="UPDATE">Update</Select.Item>
							<Select.Item value="DELETE">Delete</Select.Item>
							<Select.Item value="APPROVE">Approve</Select.Item>
							<Select.Item value="REJECT">Reject</Select.Item>
							<Select.Item value="LOGIN">Login</Select.Item>
							<Select.Item value="LOGOUT">Logout</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label>Resource Type</Label>
					<Select.Root bind:value={filters.resourceType}>
						<Select.Trigger>
							<Select.Value placeholder="All Types" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">All Types</Select.Item>
							<Select.Item value="employee">Employee</Select.Item>
							<Select.Item value="user">User</Select.Item>
							<Select.Item value="payroll">Payroll</Select.Item>
							<Select.Item value="attendance">Attendance</Select.Item>
							<Select.Item value="leave">Leave</Select.Item>
							<Select.Item value="overtime">Overtime</Select.Item>
							<Select.Item value="department">Department</Select.Item>
							<Select.Item value="schedule">Schedule</Select.Item>
							<Select.Item value="holiday">Holiday</Select.Item>
							<Select.Item value="company">Company</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label for="dateFrom">Date From</Label>
					<Input id="dateFrom" type="date" bind:value={filters.dateFrom} />
				</div>

				<div class="space-y-2">
					<Label for="dateTo">Date To</Label>
					<Input id="dateTo" type="date" bind:value={filters.dateTo} />
				</div>

				<div class="flex items-end gap-2">
					<Button onclick={handleFilter} class="flex-1">
						<FilterIcon class="mr-2 h-4 w-4" />
						Apply
					</Button>
					<Button variant="outline" size="icon" onclick={clearFilters}>
						<RefreshCwIcon class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Logs Table -->
	<Card.Root class="flex-1">
		<Card.Header>
			<Card.Title>Activity Logs</Card.Title>
			<Card.Description>System activity and changes history</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if loading}
				<LoadingTable rows={5} />
			{:else if logs.length === 0}
				<EmptyState
					icon={ClipboardListIcon}
					title="No audit logs found"
					description="System activity will be logged here."
				/>
			{:else}
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[180px]">Time</Table.Head>
								<Table.Head class="w-[150px]">User</Table.Head>
								<Table.Head class="w-[100px]">Action</Table.Head>
								<Table.Head class="w-[150px]">Resource</Table.Head>
								<Table.Head>Details</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each logs as log (log.id)}
								<Table.Row class="group">
									<Table.Cell class="whitespace-nowrap">
										<div class="flex items-center gap-2">
											<CalendarIcon class="h-4 w-4 text-muted-foreground" />
											<span class="text-sm">{formatDateTime(log.createdAt)}</span>
										</div>
									</Table.Cell>
									<Table.Cell>
										<div class="flex flex-col">
											<span class="font-medium">{log.user?.name || 'System'}</span>
											<span class="text-xs text-muted-foreground">{log.user?.email || ''}</span>
										</div>
									</Table.Cell>
									<Table.Cell>
										<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {getActionColor(log.action)}">
											{log.action}
										</span>
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<span>{getResourceTypeIcon(log.resourceType)}</span>
											<div class="flex flex-col">
												<span class="font-medium capitalize">{log.resourceType}</span>
												<span class="text-xs text-muted-foreground font-mono">
													{log.resourceId?.substring(0, 8)}...
												</span>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell class="max-w-md">
										<div class="text-sm text-muted-foreground">
											{log.description || 'No details available'}
										</div>
										{#if log.oldValues || log.newValues}
											<div class="mt-2 text-xs">
												{#if log.oldValues}
													<span class="text-red-600">Old: {JSON.stringify(log.oldValues).substring(0, 50)}...</span>
												{/if}
												{#if log.newValues}
													<span class="text-green-600 ml-2">New: {JSON.stringify(log.newValues).substring(0, 50)}...</span>
												{/if}
											</div>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				{#if pagination.lastPage > 1}
					<div class="flex items-center justify-between mt-6 pt-4 border-t">
						<div class="text-sm text-muted-foreground">
							Showing page {pagination.currentPage} of {pagination.lastPage}
							({pagination.total} total)
						</div>
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={pagination.currentPage === 1}
								onclick={() => handlePageChange(pagination.currentPage - 1)}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={pagination.currentPage === pagination.lastPage}
								onclick={() => handlePageChange(pagination.currentPage + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</Card.Content>
	</Card.Root>
</div>
