<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
	import ErrorForbidden from '$lib/components/error-forbidden.svelte';
	import EmptyState from '$lib/components/shared/empty-state.svelte';
	import Alert from '$lib/components/shared/alert.svelte';
	import LoadingTable from '$lib/components/shared/loading-table.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BuildingIcon from '@lucide/svelte/icons/building';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import Building2Icon from '@lucide/svelte/icons/building-2';

	import { departmentStore } from '$lib/stores/department.store.js';
	import { employeeStore } from '$lib/stores/employee.store.js';
	import { authStore } from '$lib/stores/auth.store.js';
	import { formatDate } from '$lib/utils/format.js';
	import { getStatusColor } from '$lib/utils/colors.js';

	// Reactive state
	let storeState = $state({ data: [], loading: false, error: null });
	let employeeStoreState = $state({ data: [] });
	let authState = $state({ user: null });

	// Dialog states
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let selectedDepartment = $state(null);
	let formData = $state({
		name: '',
		code: '',
		description: '',
	});
	let formErrors = $state({});
	let submitting = $state(false);

	// Subscribe to stores
	departmentStore.subscribe((state) => {
		storeState = state;
	});

	employeeStore.subscribe((state) => {
		employeeStoreState = state;
	});

	authStore.subscribe((state) => {
		authState = state;
	});

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

	// Use API data only
	let departments = $derived(storeState.data);
	let loading = $derived(storeState.loading);
	let error = $derived(storeState.error);

	// Fetch data on mount
	onMount(async () => {
		try {
			await departmentStore.fetchAll();
			await employeeStore.fetchAll({ page: 1, perPage: 1000 });
		} catch (err) {
			console.error('Failed to fetch department data:', err.message);
		}
	});

	// Refresh function
	async function handleRefresh() {
		await departmentStore.fetchAll();
		await employeeStore.fetchAll({ page: 1, perPage: 1000 });
	}

	// Delete function
	async function handleDelete(id) {
		const dept = departments.find((d) => d.id === id);
		const employeeCount = dept?.employeeCount || 0;

		if (employeeCount > 0) {
			alert(
				`Cannot delete department "${dept?.name}" because it has ${employeeCount} employees. Please reassign employees first.`
			);
			return;
		}

		if (confirm(`Are you sure you want to delete department "${dept?.name}"?`)) {
			try {
				await departmentStore.delete(id);
			} catch (err) {
				alert('Failed to delete department: ' + err.message);
			}
		}
	}

	// Open create dialog
	function openCreateDialog() {
		formData = { name: '', code: '', description: '' };
		formErrors = {};
		createDialogOpen = true;
	}

	// Open edit dialog
	function openEditDialog(department) {
		selectedDepartment = department;
		formData = {
			name: department.name,
			code: department.code || '',
			description: department.description || '',
		};
		formErrors = {};
		editDialogOpen = true;
	}

	// Close dialogs
	function closeCreateDialog() {
		createDialogOpen = false;
		formData = { name: '', code: '', description: '' };
		formErrors = {};
	}

	function closeEditDialog() {
		editDialogOpen = false;
		selectedDepartment = null;
		formData = { name: '', code: '', description: '' };
	}

	// Validate form
	function validateForm() {
		formErrors = {};
		if (!formData.name || formData.name.trim() === '') {
			formErrors.name = 'Department name is required';
		}
		if (formData.name && formData.name.length < 3) {
			formErrors.name = 'Department name must be at least 3 characters';
		}
		if (!formData.code || formData.code.trim() === '') {
			formErrors.code = 'Department code is required';
		}
		if (formData.code && formData.code.length < 2) {
			formErrors.code = 'Department code must be at least 2 characters';
		}
		return Object.keys(formErrors).length === 0;
	}

	// Submit create
	async function submitCreate() {
		if (!validateForm()) return;

		submitting = true;
		try {
			await departmentStore.create(formData);
			closeCreateDialog();
		} catch (err) {
			alert('Failed to create department: ' + err.message);
		} finally {
			submitting = false;
		}
	}

	// Submit update
	async function submitUpdate() {
		if (!validateForm()) return;

		submitting = true;
		try {
			await departmentStore.update(selectedDepartment.id, formData);
			closeEditDialog();
		} catch (err) {
			alert('Failed to update department: ' + err.message);
		} finally {
			submitting = false;
		}
	}

	// Calculate stats
	let totalDepartments = $derived(departments.length);
	let totalEmployees = $derived(
		departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)
	);
	let avgEmployeesPerDept = $derived(
		totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0
	);
</script>

<svelte:head>
	<title>Department Management | Dashboard</title>
</svelte:head>

<DashboardHeader
	title="Department Management"
	subtitle="Manage organizational departments and teams"
/>

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
	{#if isForbidden}
		<ErrorForbidden
			title="Access Denied"
			message="You don't have permission to manage departments. This feature requires Admin access."
		/>
	{:else}
		{#if error && !isForbidden}
			<Alert 
				variant="error" 
				message={error}
				dismissible
				onDismiss={() => departmentStore.clearError()}
			/>
		{/if}

		<!-- Stats Cards -->
		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center gap-4">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
							<BuildingIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Departments</p>
							<p class="text-2xl font-bold">{totalDepartments}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center gap-4">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
							<UsersIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Employees</p>
							<p class="text-2xl font-bold">{totalEmployees}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center gap-4">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
							<UsersIcon class="h-5 w-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<p class="text-sm font-medium text-muted-foreground">Avg per Department</p>
							<p class="text-2xl font-bold">{avgEmployeesPerDept}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Departments Table -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title>Departments</Card.Title>
					<Card.Description>Manage your organizational structure</Card.Description>
				</div>
				<div class="flex gap-2">
				<Button variant="outline" size="icon" onclick={handleRefresh} disabled={loading}>
					<RefreshCwIcon class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
				</Button>
					{#if isAdmin}
						<Button onclick={openCreateDialog}>
							<PlusIcon class="h-4 w-4 mr-2" />
							Add Department
						</Button>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if loading}
					<LoadingTable rows={5} />
				{:else if departments.length === 0}
					<EmptyState
						icon={Building2Icon}
						title="No departments found"
						description="Create departments to organize your workforce and teams."
						actionLabel={isAdmin ? "Add Department" : null}
						onAction={isAdmin ? openCreateDialog : null}
					/>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[250px]">Department</Table.Head>
								<Table.Head>Description</Table.Head>
								<Table.Head class="w-[120px]">Employees</Table.Head>
								<Table.Head class="w-[120px]">Created</Table.Head>
								{#if isAdmin}
									<Table.Head class="w-[100px] text-right">Actions</Table.Head>
								{/if}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each departments as department (department.id)}
								<Table.Row>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {getStatusColor('department', department.name)}">
												{department.name}
											</span>
										</div>
									</Table.Cell>
									<Table.Cell>
										<p class="text-sm text-muted-foreground line-clamp-2">
											{department.description || '-'}
										</p>
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-1">
											<UsersIcon class="h-3.5 w-3.5 text-muted-foreground" />
											<span class="text-sm">{department.employeeCount || 0}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										{formatDate(department.createdAt)}
									</Table.Cell>
									{#if isAdmin}
										<Table.Cell class="text-right">
											<div class="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onclick={() => openEditDialog(department)}
												>
													<PencilIcon class="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													class="text-destructive hover:text-destructive"
													onclick={() => handleDelete(department.id)}
												>
													<TrashIcon class="h-4 w-4" />
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
	{/if}
</div>

<!-- Create Department Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Create New Department</Dialog.Title>
			<Dialog.Description>
				Add a new department to your organization.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="create-name">Department Name *</Label>
				<Input
					id="create-name"
					type="text"
					bind:value={formData.name}
					placeholder="e.g. Engineering"
					class={formErrors.name ? 'border-destructive' : ''}
				/>
				{#if formErrors.name}
					<p class="text-sm text-destructive">{formErrors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="create-code">Department Code *</Label>
				<Input
					id="create-code"
					type="text"
					bind:value={formData.code}
					placeholder="e.g. ENG"
					class={formErrors.code ? 'border-destructive' : ''}
					on:input={(e) => formData.code = e.target.value.toUpperCase()}
				/>
				{#if formErrors.code}
					<p class="text-sm text-destructive">{formErrors.code}</p>
				{/if}
				<p class="text-xs text-muted-foreground">Must be 2-20 uppercase characters</p>
			</div>

			<div class="space-y-2">
				<Label for="create-description">Description</Label>
				<Textarea
					id="create-description"
					bind:value={formData.description}
					placeholder="Brief description of the department"
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={closeCreateDialog} disabled={submitting}>
				Cancel
			</Button>
			<Button onclick={submitCreate} disabled={submitting}>
				{#if submitting}
					<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
				{/if}
				Create Department
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Department Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit Department</Dialog.Title>
			<Dialog.Description>
				Update department information.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="edit-name">Department Name *</Label>
				<Input
					id="edit-name"
					type="text"
					bind:value={formData.name}
					placeholder="e.g. Engineering"
					class={formErrors.name ? 'border-destructive' : ''}
				/>
				{#if formErrors.name}
					<p class="text-sm text-destructive">{formErrors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-code">Department Code *</Label>
				<Input
					id="edit-code"
					type="text"
					bind:value={formData.code}
					placeholder="e.g. ENG"
					class={formErrors.code ? 'border-destructive' : ''}
					on:input={(e) => formData.code = e.target.value.toUpperCase()}
				/>
				{#if formErrors.code}
					<p class="text-sm text-destructive">{formErrors.code}</p>
				{/if}
				<p class="text-xs text-muted-foreground">Must be 2-20 uppercase characters</p>
			</div>

			<div class="space-y-2">
				<Label for="edit-description">Description</Label>
				<Textarea
					id="edit-description"
					bind:value={formData.description}
					placeholder="Brief description of the department"
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={closeEditDialog} disabled={submitting}>
				Cancel
			</Button>
			<Button onclick={submitUpdate} disabled={submitting}>
				{#if submitting}
					<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
				{/if}
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
