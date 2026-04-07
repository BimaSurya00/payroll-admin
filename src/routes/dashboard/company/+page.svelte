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
	import LoaderIcon from '@lucide/svelte/icons/loader';

	import { companyStore } from '$lib/stores/company.store.js';
	import { authStore } from '$lib/stores/auth.store.js';
	import { toast } from 'svelte-sonner';

	// Reactive state
	let storeState = $state({ data: [], loading: false, error: null });
	let authState = $state({ user: null });
	
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let selectedCompany = $state(null);

	let formData = $state({
		name: '',
		slug: '',
		address: '',
		phone: '',
		email: '',
		website: '',
		taxId: '',
		description: '',
		isActive: true,
	});

	companyStore.subscribe((state) => {
		storeState = state;
	});

	authStore.subscribe((state) => {
		authState = state;
	});

	let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');
	let companies = $derived(storeState.data);
	let loading = $derived(storeState.loading);
	let error = $derived(storeState.error);

	onMount(() => {
		if (isSuperUser) {
			companyStore.fetchAll();
		}
	});

	function resetForm() {
		formData = {
			name: '',
			slug: '',
			address: '',
			phone: '',
			email: '',
			website: '',
			taxId: '',
			description: '',
			isActive: true,
		};
	}

	function generateSlug(name) {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
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
			address: company.address || '',
			phone: company.phone || '',
			email: company.email || '',
			website: company.website || '',
			taxId: company.taxId || '',
			description: company.description || '',
			isActive: company.isActive ?? true,
		};
		editDialogOpen = true;
	}

	function openDeleteDialog(company) {
		selectedCompany = company;
		deleteDialogOpen = true;
	}

	async function handleCreate() {
		try {
			await companyStore.create(formData);
			toast.success('Company created successfully');
			createDialogOpen = false;
			resetForm();
		} catch (err) {
			toast.error(err.message || 'Failed to create company');
		}
	}

	async function handleUpdate() {
		try {
			await companyStore.update(selectedCompany.id, formData);
			toast.success('Company updated successfully');
			editDialogOpen = false;
			resetForm();
		} catch (err) {
			toast.error(err.message || 'Failed to update company');
		}
	}

	async function handleDelete() {
		try {
			await companyStore.delete(selectedCompany.id);
			toast.success('Company deleted successfully');
			deleteDialogOpen = false;
			selectedCompany = null;
		} catch (err) {
			toast.error(err.message || 'Failed to delete company');
		}
	}

	function getStatusColor(isActive) {
		return isActive
			? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
	}
</script>

<svelte:head>
	<title>Companies | Dashboard</title>
</svelte:head>

<DashboardHeader
	title="Companies"
	subtitle="Manage companies in the system (Super User only)"
/>

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
	{#if error}
		<Alert variant="error" message={error} dismissible onDismiss={() => companyStore.clearError?.()} />
	{/if}

	{#if !isSuperUser}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<Building2Icon class="h-12 w-12 text-muted-foreground mb-4" />
				<h3 class="text-lg font-semibold">Access Restricted</h3>
				<p class="text-muted-foreground text-center max-w-md">
					Company management is only available to Super Users. Please contact your system administrator if you need access.
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
					<Button variant="outline" size="icon" onclick={() => companyStore.fetchAll()} disabled={loading}>
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
								<Table.Head class="w-[250px]">Company</Table.Head>
								<Table.Head>Slug</Table.Head>
								<Table.Head>Contact</Table.Head>
								<Table.Head class="w-[100px]">Status</Table.Head>
								<Table.Head class="w-[100px] text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each companies as company (company.id)}
								<Table.Row class="group">
									<Table.Cell>
										<div class="flex items-center gap-3">
											<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
												<Building2Icon class="h-5 w-5 text-primary" />
											</div>
											<div>
												<p class="font-medium">{company.name}</p>
												{#if company.description}
													<p class="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">{company.description}</p>
												{/if}
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<code class="text-sm bg-muted px-2 py-1 rounded">{company.slug}</code>
									</Table.Cell>
									<Table.Cell>
										<div class="space-y-1">
											{#if company.email}
												<div class="text-sm flex items-center gap-1">
													<MailIcon class="h-3 w-3 text-muted-foreground" />
													{company.email}
												</div>
											{/if}
											{#if company.phone}
												<div class="text-sm text-muted-foreground flex items-center gap-1">
													<PhoneIcon class="h-3 w-3" />
													{company.phone}
												</div>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {getStatusColor(company.isActive)}">
											{company.isActive ? 'Active' : 'Inactive'}
										</span>
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8"
												onclick={() => openEditDialog(company)}
											>
												<PencilIcon class="h-4 w-4" />
												<span class="sr-only">Edit</span>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-destructive hover:text-destructive"
												onclick={() => openDeleteDialog(company)}
											>
												<TrashIcon class="h-4 w-4" />
												<span class="sr-only">Delete</span>
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
					<Input
						id="create-name"
						bind:value={formData.name}
						oninput={handleNameChange}
						placeholder="e.g., Acme Corporation"
					/>
				</div>
				<div class="space-y-2">
					<Label for="create-slug">Slug *</Label>
					<Input id="create-slug" bind:value={formData.slug} placeholder="e.g., acme-corporation" />
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
				<Label for="create-address">Address</Label>
				<Textarea id="create-address" bind:value={formData.address} placeholder="Full company address" rows="2" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="create-taxId">Tax ID</Label>
					<Input id="create-taxId" bind:value={formData.taxId} placeholder="Tax identification number" />
				</div>
				<div class="flex items-end">
					<div class="flex items-center space-x-2">
						<Switch id="create-isActive" bind:checked={formData.isActive} />
						<Label for="create-isActive">Active</Label>
					</div>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="create-description">Description</Label>
				<Textarea id="create-description" bind:value={formData.description} placeholder="Company description" rows="3" />
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
				<Label for="edit-address">Address</Label>
				<Textarea id="edit-address" bind:value={formData.address} placeholder="Full company address" rows="2" />
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-taxId">Tax ID</Label>
					<Input id="edit-taxId" bind:value={formData.taxId} placeholder="Tax identification number" />
				</div>
				<div class="flex items-end">
					<div class="flex items-center space-x-2">
						<Switch id="edit-isActive" bind:checked={formData.isActive} />
						<Label for="edit-isActive">Active</Label>
					</div>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="edit-description">Description</Label>
				<Textarea id="edit-description" bind:value={formData.description} placeholder="Company description" rows="3" />
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
