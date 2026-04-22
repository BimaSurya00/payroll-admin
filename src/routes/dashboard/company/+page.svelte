<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
	import EmptyState from '$lib/components/shared/empty-state.svelte';
	import Alert from '$lib/components/shared/alert.svelte';
	import LoadingTable from '$lib/components/shared/loading-table.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import MailIcon from '@lucide/svelte/icons/mail';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import UsersIcon from '@lucide/svelte/icons/users';
	import UserCheckIcon from '@lucide/svelte/icons/user-check';

	import { companyService } from '$lib/api/services/company.service.js';
	import { authStore } from '$lib/stores/auth.store.js';
	import { toast } from 'svelte-sonner';

	let authState = $state({ user: null });
	let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');

	let companies = $state([]);
	let loading = $state(false);
	let error = $state(null);

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let selectedCompany = $state(null);
	let togglingId = $state(null);

	let formData = $state({
		name: '',
		slug: '',
		plan: 'free',
		maxEmployees: 25,
		email: '',
		website: '',
		description: '',
		isActive: true,
		officeLat: '',
		officeLong: '',
		allowedRadiusMeters: '100',
	});

	authStore.subscribe((state) => { authState = state; });

	async function fetchCompanies() {
		loading = true;
		error = null;
		try {
			const response = await companyService.getAllWithStats();
			companies = response.data || [];
		} catch (err) {
			error = err.message || 'Failed to fetch companies';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (isSuperUser) fetchCompanies();
	});

	function resetForm() {
		formData = {
			name: '', slug: '', plan: 'free', maxEmployees: 25,
			email: '', website: '', description: '', isActive: true,
			officeLat: '', officeLong: '', allowedRadiusMeters: '100',
		};
	}

	function generateSlug(name) {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	}

	function handleNameChange() {
		if (!formData.slug || formData.slug === generateSlug(formData.name.slice(0, -1))) {
			formData.slug = generateSlug(formData.name);
		}
	}

	function openEditDialog(company) {
		selectedCompany = company;
		formData = {
			name: company.name,
			slug: company.slug,
			plan: company.plan || 'free',
			maxEmployees: company.maxEmployees || 25,
			email: company.email || '',
			website: company.website || '',
			description: company.description || '',
			isActive: company.isActive ?? true,
			officeLat: company.officeLat?.toString() || '',
			officeLong: company.officeLong?.toString() || '',
			allowedRadiusMeters: company.allowedRadiusMeters?.toString() || '100',
		};
		editDialogOpen = true;
	}

	function openDeleteDialog(company) {
		selectedCompany = company;
		deleteDialogOpen = true;
	}

	async function handleCreate() {
		try {
			await companyService.create(formData);
			toast.success('Company created successfully');
			createDialogOpen = false;
			resetForm();
			await fetchCompanies();
		} catch (err) {
			toast.error(err.message || 'Failed to create company');
		}
	}

	async function handleUpdate() {
		try {
			await companyService.update(selectedCompany.id, formData);
			toast.success('Company updated successfully');
			editDialogOpen = false;
			resetForm();
			await fetchCompanies();
		} catch (err) {
			toast.error(err.message || 'Failed to update company');
		}
	}

	async function handleDelete() {
		try {
			await companyService.delete(selectedCompany.id);
			toast.success('Company deleted successfully');
			deleteDialogOpen = false;
			selectedCompany = null;
			await fetchCompanies();
		} catch (err) {
			toast.error(err.message || 'Failed to delete company');
		}
	}

	async function toggleStatus(company) {
		togglingId = company.id;
		try {
			await companyService.update(company.id, { isActive: !company.isActive });
			await fetchCompanies();
			toast.success(`Company ${!company.isActive ? 'activated' : 'deactivated'}`);
		} catch (err) {
			toast.error(err.message || 'Failed to update status');
		} finally {
			togglingId = null;
		}
	}

	function getPlanBadge(plan) {
		switch (plan) {
			case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
			case 'pro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
			case 'starter': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
			default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
		}
	}

	function getUsageColor(used, max) {
		if (max === 0) return 'bg-gray-200';
		const pct = (used / max) * 100;
		if (pct >= 90) return 'bg-red-500';
		if (pct >= 70) return 'bg-yellow-500';
		return 'bg-primary';
	}
</script>

<svelte:head>
	<title>Companies | Dashboard</title>
</svelte:head>

<DashboardHeader title="Companies" subtitle="Manage companies in the system" />

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
	{#if error}
		<Alert variant="error" message={error} dismissible onDismiss={() => error = null} />
	{/if}

	{#if !isSuperUser}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<Building2Icon class="h-12 w-12 text-muted-foreground mb-4" />
				<h3 class="text-lg font-semibold">Access Restricted</h3>
				<p class="text-muted-foreground text-center max-w-md">
					Company management is only available to Super Users.
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root class="flex-1">
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title>All Companies</Card.Title>
					<Card.Description>Manage companies in the system</Card.Description>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" size="icon" onclick={fetchCompanies} disabled={loading}>
						<RefreshCwIcon class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
					</Button>
					<Button onclick={() => { createDialogOpen = true; resetForm(); }}>
						<PlusIcon class="h-4 w-4 mr-2" />
						Add Company
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				{#if loading}
					<LoadingTable rows={5} />
				{:else if companies.length === 0}
					<EmptyState
						icon={Building2Icon}
						title="No companies found"
						description="Add your first company to get started."
						actionLabel="Add Company"
						onAction={() => { createDialogOpen = true; resetForm(); }}
					/>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[220px]">Company</Table.Head>
								<Table.Head>Plan</Table.Head>
								<Table.Head class="text-center">Users</Table.Head>
								<Table.Head class="min-w-[160px]">Employees</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each companies as company (company.id)}
								<Table.Row class="group">
									<Table.Cell>
										<div class="flex items-center gap-3">
											<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
												<Building2Icon class="h-5 w-5 text-primary" />
											</div>
											<div class="min-w-0">
												<button
													class="font-medium text-left hover:underline cursor-pointer truncate block"
													onclick={() => goto(`/dashboard/company/${company.id}`)}
												>
													{company.name}
												</button>
												<code class="text-xs text-muted-foreground">{company.slug}</code>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold {getPlanBadge(company.plan)}">
											{company.plan}
										</span>
									</Table.Cell>
									<Table.Cell class="text-center">
										<span class="text-sm font-medium">{company.userCount ?? 0}</span>
									</Table.Cell>
									<Table.Cell>
										<div class="space-y-1">
											<div class="flex items-center justify-between text-sm">
												<span class="font-medium">{company.employeeCount ?? 0}</span>
												<span class="text-xs text-muted-foreground">/ {company.maxEmployees ?? 25}</span>
											</div>
											<div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
												<div
													class="h-full rounded-full transition-all {getUsageColor(company.employeeCount ?? 0, company.maxEmployees ?? 25)}"
													style="width: {Math.min(((company.employeeCount ?? 0) / (company.maxEmployees || 25)) * 100, 100)}%"
												></div>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-2">
											{#if togglingId === company.id}
												<LoaderIcon class="h-4 w-4 animate-spin text-muted-foreground" />
											{:else}
												<Switch
													checked={company.isActive}
													onchange={() => toggleStatus(company)}
												/>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => goto(`/dashboard/company/${company.id}`)}>
												<EyeIcon class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => openEditDialog(company)}>
												<PencilIcon class="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" onclick={() => openDeleteDialog(company)}>
												<TrashIcon class="h-4 w-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Create Company</Dialog.Title>
			<Dialog.Description>Add a new company to the system.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="create-name">Company Name *</Label>
					<Input id="create-name" bind:value={formData.name} oninput={handleNameChange} placeholder="e.g., Acme Corporation" />
				</div>
				<div class="space-y-2">
					<Label for="create-slug">Slug *</Label>
					<Input id="create-slug" bind:value={formData.slug} placeholder="e.g., acme-corporation" />
				</div>
			</div>
			<div class="grid grid-cols-3 gap-4">
				<div class="space-y-2">
					<Label for="create-plan">Plan</Label>
					<Select.Root type="single" bind:value={formData.plan}>
						<Select.Trigger class="w-full">
							{formData.plan ? formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1) : 'Select plan'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="free">Free</Select.Item>
							<Select.Item value="starter">Starter</Select.Item>
							<Select.Item value="pro">Pro</Select.Item>
							<Select.Item value="enterprise">Enterprise</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="create-maxEmployees">Max Employees</Label>
					<Input id="create-maxEmployees" type="number" bind:value={formData.maxEmployees} min="1" />
				</div>
				<div class="flex items-end">
					<div class="flex items-center space-x-2">
						<Switch id="create-isActive" bind:checked={formData.isActive} />
						<Label for="create-isActive">Active</Label>
					</div>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="create-email">Email</Label>
					<div class="relative">
						<MailIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input id="create-email" type="email" bind:value={formData.email} placeholder="company@example.com" class="pl-10" />
					</div>
				</div>
				<div class="space-y-2">
					<Label for="create-phone">Phone</Label>
					<div class="relative">
						<PhoneIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input id="create-phone" bind:value={formData.phone} placeholder="+1 234 567 890" class="pl-10" />
					</div>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="create-website">Website</Label>
				<div class="relative">
					<GlobeIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input id="create-website" bind:value={formData.website} placeholder="https://www.example.com" class="pl-10" />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="create-description">Description</Label>
				<Textarea id="create-description" bind:value={formData.description} placeholder="Company description" rows="2" />
			</div>
			<div class="border-t pt-4">
				<h4 class="text-sm font-medium mb-3">Office Location</h4>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="create-officeLat">Latitude</Label>
						<Input id="create-officeLat" type="number" step="any" placeholder="-6.2088" bind:value={formData.officeLat} />
					</div>
					<div class="space-y-2">
						<Label for="create-officeLong">Longitude</Label>
						<Input id="create-officeLong" type="number" step="any" placeholder="106.8456" bind:value={formData.officeLong} />
					</div>
				</div>
				<div class="space-y-2 mt-4">
					<Label for="create-allowedRadiusMeters">Allowed Radius (meters)</Label>
					<Input id="create-allowedRadiusMeters" type="number" placeholder="100" bind:value={formData.allowedRadiusMeters} min="10" max="1000" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { createDialogOpen = false; resetForm(); }}>Cancel</Button>
			<Button onclick={handleCreate} disabled={!formData.name || !formData.slug}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Edit Company</Dialog.Title>
			<Dialog.Description>Update company information.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-name">Company Name *</Label>
					<Input id="edit-name" bind:value={formData.name} placeholder="e.g., Acme Corporation" />
				</div>
				<div class="space-y-2">
					<Label for="edit-slug">Slug *</Label>
					<Input id="edit-slug" bind:value={formData.slug} placeholder="e.g., acme-corporation" />
				</div>
			</div>
			<div class="grid grid-cols-3 gap-4">
				<div class="space-y-2">
					<Label for="edit-plan">Plan</Label>
					<Select.Root type="single" bind:value={formData.plan}>
						<Select.Trigger class="w-full">
							{formData.plan ? formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1) : 'Select plan'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="free">Free</Select.Item>
							<Select.Item value="starter">Starter</Select.Item>
							<Select.Item value="pro">Pro</Select.Item>
							<Select.Item value="enterprise">Enterprise</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="edit-maxEmployees">Max Employees</Label>
					<Input id="edit-maxEmployees" type="number" bind:value={formData.maxEmployees} min="1" />
				</div>
				<div class="flex items-end">
					<div class="flex items-center space-x-2">
						<Switch id="edit-isActive" bind:checked={formData.isActive} />
						<Label for="edit-isActive">Active</Label>
					</div>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-email">Email</Label>
					<div class="relative">
						<MailIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input id="edit-email" type="email" bind:value={formData.email} placeholder="company@example.com" class="pl-10" />
					</div>
				</div>
				<div class="space-y-2">
					<Label for="edit-phone">Phone</Label>
					<div class="relative">
						<PhoneIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input id="edit-phone" bind:value={formData.phone} placeholder="+1 234 567 890" class="pl-10" />
					</div>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="edit-website">Website</Label>
				<div class="relative">
					<GlobeIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input id="edit-website" bind:value={formData.website} placeholder="https://www.example.com" class="pl-10" />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="edit-description">Description</Label>
				<Textarea id="edit-description" bind:value={formData.description} placeholder="Company description" rows="2" />
			</div>
			<div class="border-t pt-4">
				<h4 class="text-sm font-medium mb-3">Office Location</h4>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-officeLat">Latitude</Label>
						<Input id="edit-officeLat" type="number" step="any" placeholder="-6.2088" bind:value={formData.officeLat} />
					</div>
					<div class="space-y-2">
						<Label for="edit-officeLong">Longitude</Label>
						<Input id="edit-officeLong" type="number" step="any" placeholder="106.8456" bind:value={formData.officeLong} />
					</div>
				</div>
				<div class="space-y-2 mt-4">
					<Label for="edit-allowedRadiusMeters">Allowed Radius (meters)</Label>
					<Input id="edit-allowedRadiusMeters" type="number" placeholder="100" bind:value={formData.allowedRadiusMeters} min="10" max="1000" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { editDialogOpen = false; resetForm(); }}>Cancel</Button>
			<Button onclick={handleUpdate} disabled={!formData.name || !formData.slug}>Update</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>Delete Company</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{selectedCompany?.name}"? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { deleteDialogOpen = false; selectedCompany = null; }}>Cancel</Button>
			<Button variant="destructive" onclick={handleDelete}>Delete</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
