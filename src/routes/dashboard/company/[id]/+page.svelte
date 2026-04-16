<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
	import ErrorForbidden from '$lib/components/error-forbidden.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import MailIcon from '@lucide/svelte/icons/mail';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import MapPinnedIcon from '@lucide/svelte/icons/map-pinned';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import FingerprintIcon from '@lucide/svelte/icons/fingerprint';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import UsersIcon from '@lucide/svelte/icons/users';
	import LoaderIcon from '@lucide/svelte/icons/loader';

	import { companyStore } from '$lib/stores/company.store.js';

	let id = $derived($page.params.id);
	let storeState = $state({ selected: null, loading: false, error: null });

	companyStore.subscribe((state) => {
		storeState = state;
	});

	let company = $derived(storeState.selected);
	let loading = $derived(storeState.loading);
	let error = $derived(storeState.error);

	let isForbidden = $derived(
		error?.includes('403') ||
			error?.toLowerCase().includes('forbidden') ||
			error?.toLowerCase().includes('access denied'),
	);

	onMount(async () => {
		if (id) {
			await companyStore.fetchById(id);
		}
	});

	function goBack() {
		goto('/dashboard/company');
	}

	function formatDate(dateStr) {
		if (!dateStr) return '-';
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function getPlanColor(plan) {
		const colors = {
			free: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
			starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
			pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
			enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
		};
		return colors[plan] || colors.free;
	}

	function openGoogleMaps(lat, long) {
		if (!lat || !long) return;
		window.open(`https://www.google.com/maps?q=${lat},${long}`, '_blank');
	}
</script>

<svelte:head>
	<title>{company?.name || 'Company Detail'} | Dashboard</title>
</svelte:head>

<DashboardHeader title="Company Detail" subtitle="View company information" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	{#if isForbidden}
		<ErrorForbidden
			title="Access Denied"
			message="You don't have permission to view this company."
		/>
	{:else if loading}
		<div class="flex items-center justify-center py-16">
			<LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
			<span class="ml-2 text-muted-foreground">Loading company...</span>
		</div>
	{:else if error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
			<p class="text-sm font-medium">Error: {error}</p>
		</div>
	{:else if company}
		<!-- Back Button -->
		<div class="flex items-center justify-between">
			<Button variant="outline" onclick={goBack}>
				<ArrowLeftIcon class="h-4 w-4 mr-2" />
				Back to Companies
			</Button>
		</div>

		<!-- Company Card -->
		<Card.Root>
			<div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
			<Card.Header>
				<div class="flex items-center gap-4">
					<div class="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
						<Building2Icon class="h-7 w-7 text-primary" />
					</div>
					<div>
						<Card.Title class="text-2xl">{company.name}</Card.Title>
						<Card.Description>{company.description || 'No description'}</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-6 md:grid-cols-2">
					<!-- General Info -->
					<div class="space-y-4">
						<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">General Information</h4>
						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
									<FileTextIcon class="h-5 w-5 text-muted-foreground" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Slug</p>
									<code class="text-sm font-mono bg-muted px-2 py-0.5 rounded">{company.slug}</code>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
									{#if company.isActive}
										<span class="h-3 w-3 rounded-full bg-green-500"></span>
									{:else}
										<span class="h-3 w-3 rounded-full bg-gray-400"></span>
									{/if}
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Status</p>
									<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {company.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'}">
										{company.isActive ? 'Active' : 'Inactive'}
									</span>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
									<FingerprintIcon class="h-5 w-5 text-purple-600" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Plan</p>
									<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize {getPlanColor(company.plan)}">
										{company.plan || 'free'}
									</span>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
									<UsersIcon class="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Max Employees</p>
									<p class="font-medium">{company.maxEmployees ?? '-'}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Contact Info -->
					<div class="space-y-4">
						<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Information</h4>
						<div class="space-y-3">
							{#if company.email}
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
										<MailIcon class="h-5 w-5 text-orange-600" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Email</p>
										<p class="font-medium">{company.email}</p>
									</div>
								</div>
							{/if}
							{#if company.phone}
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
										<PhoneIcon class="h-5 w-5 text-teal-600" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Phone</p>
										<p class="font-medium">{company.phone}</p>
									</div>
								</div>
							{/if}
							{#if company.website}
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
										<GlobeIcon class="h-5 w-5 text-cyan-600" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Website</p>
										<p class="font-medium">{company.website}</p>
									</div>
								</div>
							{/if}
							{#if !company.email && !company.phone && !company.website}
								<p class="text-sm text-muted-foreground italic">No contact information provided.</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Separator -->
				{#if company.address || company.taxId}
					<div class="border-t pt-4">
						<div class="grid gap-4 md:grid-cols-2">
							{#if company.address}
								<div class="flex items-start gap-3">
									<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
										<MapPinIcon class="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Address</p>
										<p class="font-medium">{company.address}</p>
									</div>
								</div>
							{/if}
							{#if company.taxId}
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
										<FileTextIcon class="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Tax ID</p>
										<p class="font-mono text-sm">{company.taxId}</p>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Office Location -->
				{#if company.officeLat != null && company.officeLong != null}
					<div class="border-t pt-4">
						<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Office Location (Attendance Geofencing)</h4>
						<div class="rounded-lg border bg-muted/30 p-4">
							<div class="grid gap-4 md:grid-cols-3">
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
										<MapPinnedIcon class="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Latitude</p>
										<p class="font-mono text-sm font-medium">{company.officeLat}</p>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
										<MapPinnedIcon class="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Longitude</p>
										<p class="font-mono text-sm font-medium">{company.officeLong}</p>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
										<MapPinIcon class="h-5 w-5 text-green-600" />
									</div>
									<div>
										<p class="text-sm text-muted-foreground">Check-in Radius</p>
										<p class="font-medium">{company.allowedRadiusMeters ?? '-'} meters</p>
									</div>
								</div>
							</div>
							<div class="mt-3">
								<Button
									variant="outline"
									size="sm"
									onclick={() => openGoogleMaps(company.officeLat, company.officeLong)}
								>
									<GlobeIcon class="h-4 w-4 mr-2" />
									View on Google Maps
								</Button>
							</div>
						</div>
					</div>
				{:else}
					<div class="border-t pt-4">
						<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Office Location</h4>
						<div class="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
							<MapPinIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
							<p class="text-sm text-muted-foreground">Office location not configured.</p>
							<p class="text-xs text-muted-foreground">Set latitude, longitude, and radius in the company edit form to enable attendance geofencing.</p>
						</div>
					</div>
				{/if}

				<!-- Metadata -->
				<div class="border-t pt-4">
					<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Metadata</h4>
					<div class="grid gap-4 md:grid-cols-3">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<FileTextIcon class="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Company ID</p>
								<p class="font-mono text-xs">{company.id}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<CalendarIcon class="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Created</p>
								<p class="text-sm">{formatDate(company.createdAt)}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<CalendarIcon class="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Last Updated</p>
								<p class="text-sm">{formatDate(company.updatedAt)}</p>
							</div>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="text-center py-16">
			<p class="text-muted-foreground">Company not found</p>
			<Button variant="outline" onclick={goBack} class="mt-4">
				<ArrowLeftIcon class="h-4 w-4 mr-2" />
				Back to Companies
			</Button>
		</div>
	{/if}
</div>
