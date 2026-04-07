<script>
	import { onMount } from 'svelte';
	import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
	import EmptyState from '$lib/components/shared/empty-state.svelte';
	import Alert from '$lib/components/shared/alert.svelte';
	import LoadingTable from '$lib/components/shared/loading-table.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

	import { leaveStore } from '$lib/stores/leave.store.js';
	import { authStore } from '$lib/stores/auth.store.js';
	import { toast } from 'svelte-sonner';

	// Reactive state
	let leaveTypes = $state([]);
	let loading = $state(false);
	let error = $state(null);
	let authState = $state({ user: null });

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let selectedLeaveType = $state(null);

	let formData = $state({
		name: '',
		code: '',
		description: '',
		defaultDays: 0,
		isPaid: true,
		isActive: true,
		color: '#3b82f6',
	});

	leaveStore.subscribe((state) => {
		leaveTypes = state.leaveTypes || [];
		loading = state.loading;
		error = state.error;
	});

	authStore.subscribe((state) => {
		authState = state;
	});

	let isAdmin = $derived(authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPER_USER');

	onMount(() => {
		if (isAdmin) {
			leaveStore.fetchAllLeaveTypes();
		}
	});

	function resetForm() {
		formData = {
			name: '',
			code: '',
			description: '',
			defaultDays: 0,
			isPaid: true,
			isActive: true,
			color: '#3b82f6',
		};
	}

	function openEditDialog(leaveType) {
		selectedLeaveType = leaveType;
		formData = {
			name: leaveType.name,
			code: leaveType.code,
			description: leaveType.description || '',
			defaultDays: leaveType.defaultDays || 0,
			isPaid: leaveType.isPaid ?? true,
			isActive: leaveType.isActive ?? true,
			color: leaveType.color || '#3b82f6',
		};
		editDialogOpen = true;
	}

	function openDeleteDialog(leaveType) {
		selectedLeaveType = leaveType;
		deleteDialogOpen = true;
	}

	async function handleCreate() {
		try {
			await leaveStore.createLeaveType(formData);
			toast.success('Leave type created successfully');
			createDialogOpen = false;
			resetForm();
		} catch (err) {
			toast.error(err.message || 'Failed to create leave type');
		}
	}

	async function handleUpdate() {
		try {
			await leaveStore.updateLeaveType(selectedLeaveType.id, formData);
			toast.success('Leave type updated successfully');
			editDialogOpen = false;
			resetForm();
		} catch (err) {
			toast.error(err.message || 'Failed to update leave type');
		}
	}

	async function handleDelete() {
		try {
			await leaveStore.deleteLeaveType(selectedLeaveType.id);
			toast.success('Leave type deleted successfully');
			deleteDialogOpen = false;
			selectedLeaveType = null;
		} catch (err) {
			toast.error(err.message || 'Failed to delete leave type');
		}
	}

	function getPaidBadgeColor(isPaid) {
		return isPaid
			? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
	}

	function getStatusColor(isActive) {
		return isActive
			? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
	}
</script>

<svelte:head>
	<title>Leave Types | Dashboard</title>
</svelte:head>

<DashboardHeader
	title="Leave Types"
	subtitle="Manage leave types and their configurations"
/>

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
	{#if error}
		<Alert variant="error" message={error} dismissible onDismiss={() => leaveStore.clearError?.()} />
	{/if}

	<Card.Root class="flex-1">
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title>All Leave Types</Card.Title>
				<Card.Description>Configure leave types for employees</Card.Description>
			</div>
			{#if isAdmin}
				<div class="flex gap-2">
					<Button variant="outline" size="icon" onclick={() => leaveStore.fetchAllLeaveTypes()} disabled={loading}>
						<RefreshCwIcon class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
					</Button>
					<Button onclick={() => { createDialogOpen = true; resetForm(); }}>
						<PlusIcon class="h-4 w-4 mr-2" />
						Add Leave Type
					</Button>
				</div>
			{/if}
		</Card.Header>
		<Card.Content>
			{#if loading}
				<LoadingTable rows={5} />
			{:else if leaveTypes.length === 0}
				<EmptyState
					icon={CalendarIcon}
					title="No leave types found"
					description="Configure leave types for employees to request time off."
					actionLabel={isAdmin ? "Add Leave Type" : null}
					onAction={isAdmin ? () => { createDialogOpen = true; resetForm(); } : null}
				/>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[200px]">Name</Table.Head>
							<Table.Head class="w-[100px]">Code</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head class="w-[120px]">Default Days</Table.Head>
							<Table.Head class="w-[100px]">Type</Table.Head>
							<Table.Head class="w-[100px]">Status</Table.Head>
							{#if isAdmin}
								<Table.Head class="w-[100px] text-right">Actions</Table.Head>
							{/if}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each leaveTypes as leaveType (leaveType.id)}
							<Table.Row class="group">
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-full" style="background-color: {leaveType.color || '#3b82f6'}"></div>
										{leaveType.name}
									</div>
								</Table.Cell>
								<Table.Cell>
									<code class="text-sm bg-muted px-2 py-1 rounded">{leaveType.code}</code>
								</Table.Cell>
								<Table.Cell class="max-w-xs truncate text-muted-foreground">
									{leaveType.description || '-'}
								</Table.Cell>
								<Table.Cell>{leaveType.defaultDays} days</Table.Cell>
								<Table.Cell>
									<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {getPaidBadgeColor(leaveType.isPaid)}">
										{leaveType.isPaid ? 'Paid' : 'Unpaid'}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {getStatusColor(leaveType.isActive)}">
										{leaveType.isActive ? 'Active' : 'Inactive'}
									</span>
								</Table.Cell>
								{#if isAdmin}
									<Table.Cell class="text-right">
										<div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8"
												onclick={() => openEditDialog(leaveType)}
											>
												<PencilIcon class="h-4 w-4" />
												<span class="sr-only">Edit</span>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-destructive hover:text-destructive"
												onclick={() => openDeleteDialog(leaveType)}
											>
												<TrashIcon class="h-4 w-4" />
												<span class="sr-only">Delete</span>
											</Button>
										</div>
									</Table.Cell>
								{/if}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Create Leave Type</Dialog.Title>
			<Dialog.Description>Add a new leave type for employees.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="create-name">Name *</Label>
					<Input id="create-name" bind:value={formData.name} placeholder="e.g., Annual Leave" />
				</div>
				<div class="space-y-2">
					<Label for="create-code">Code *</Label>
					<Input id="create-code" bind:value={formData.code} placeholder="e.g., AL" />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="create-description">Description</Label>
				<Input id="create-description" bind:value={formData.description} placeholder="Brief description" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="create-defaultDays">Default Days *</Label>
					<Input id="create-defaultDays" type="number" bind:value={formData.defaultDays} min="0" />
				</div>
				<div class="space-y-2">
					<Label for="create-color">Color</Label>
					<div class="flex items-center gap-2">
						<Input id="create-color" type="color" bind:value={formData.color} class="w-12 h-9 p-1" />
						<span class="text-sm text-muted-foreground">{formData.color}</span>
					</div>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<Switch id="create-isPaid" bind:checked={formData.isPaid} />
					<Label for="create-isPaid">Paid Leave</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Switch id="create-isActive" bind:checked={formData.isActive} />
					<Label for="create-isActive">Active</Label>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { createDialogOpen = false; resetForm(); }}>Cancel</Button>
			<Button onclick={handleCreate} disabled={!formData.name || !formData.code}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit Leave Type</Dialog.Title>
			<Dialog.Description>Update leave type configuration.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-name">Name *</Label>
					<Input id="edit-name" bind:value={formData.name} placeholder="e.g., Annual Leave" />
				</div>
				<div class="space-y-2">
					<Label for="edit-code">Code *</Label>
					<Input id="edit-code" bind:value={formData.code} placeholder="e.g., AL" />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="edit-description">Description</Label>
				<Input id="edit-description" bind:value={formData.description} placeholder="Brief description" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-defaultDays">Default Days *</Label>
					<Input id="edit-defaultDays" type="number" bind:value={formData.defaultDays} min="0" />
				</div>
				<div class="space-y-2">
					<Label for="edit-color">Color</Label>
					<div class="flex items-center gap-2">
						<Input id="edit-color" type="color" bind:value={formData.color} class="w-12 h-9 p-1" />
						<span class="text-sm text-muted-foreground">{formData.color}</span>
					</div>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<Switch id="edit-isPaid" bind:checked={formData.isPaid} />
					<Label for="edit-isPaid">Paid Leave</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Switch id="edit-isActive" bind:checked={formData.isActive} />
					<Label for="edit-isActive">Active</Label>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { editDialogOpen = false; resetForm(); }}>Cancel</Button>
			<Button onclick={handleUpdate} disabled={!formData.name || !formData.code}>Update</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>Delete Leave Type</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{selectedLeaveType?.name}"? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { deleteDialogOpen = false; selectedLeaveType = null; }}>Cancel</Button>
			<Button variant="destructive" onclick={handleDelete}>Delete</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
