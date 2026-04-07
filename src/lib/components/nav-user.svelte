<script>
	import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
	import BellIcon from "@lucide/svelte/icons/bell";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import UserIcon from "@lucide/svelte/icons/user";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";

	import ThemeToggle from "$lib/components/shared/theme-toggle.svelte";

	import { goto } from "$app/navigation";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";

	import { authStore } from "$lib/stores/auth.store.js";

	let { user } = $props();

	const sidebar = useSidebar();

	let loggingOut = $state(false);

	// Get user data from store or fallback to prop
	let authState = $state({ user: null, isAuthenticated: false });
	authStore.subscribe((state) => {
		authState = state;
	});

	// Use auth store user if available, otherwise use prop
	let displayUser = $derived(authState.user || user);
	let userInitials = $derived(
		displayUser?.name
			? displayUser.name
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2)
			: "U",
	);

	async function handleLogout() {
		loggingOut = true;
		try {
			await authStore.logout();
			goto("/auth/login");
		} catch (error) {
			console.error("Logout failed:", error);
			// Force redirect even if logout fails
			goto("/auth/login");
		} finally {
			loggingOut = false;
		}
	}

	async function handleLogoutAll() {
		loggingOut = true;
		try {
			await authStore.logoutAll();
			goto("/auth/login");
		} catch (error) {
			console.error("Logout all failed:", error);
			// Force redirect even if logout fails
			goto("/auth/login");
		} finally {
			loggingOut = false;
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="text-white/80 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/20 data-[state=open]:text-white"
					>
						<Avatar.Root class="size-9 rounded-xl border-2 border-white/30 bg-white/10">
							<Avatar.Image
								src={displayUser?.avatar ||
									displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="rounded-xl bg-gradient-to-br from-primary to-chart-4 text-white font-semibold"
								>{userInitials}</Avatar.Fallback
							>
						</Avatar.Root>
						<div
							class="grid flex-1 text-start text-sm leading-tight"
						>
							<span class="truncate font-semibold text-white"
								>{displayUser?.name || "User"}</span
							>
							<span class="truncate text-xs text-white/60"
								>{displayUser?.email || ""}</span
							>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4 text-white/60" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div
						class="flex items-center gap-2 px-1 py-1.5 text-start text-sm"
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image
								src={displayUser?.avatar ||
									displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="rounded-lg"
								>{userInitials}</Avatar.Fallback
							>
						</Avatar.Root>
						<div
							class="grid flex-1 text-start text-sm leading-tight"
						>
							<span class="truncate font-medium"
								>{displayUser?.name || "User"}</span
							>
							<span class="truncate text-xs"
								>{displayUser?.email || ""}</span
							>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<SparklesIcon />
						Upgrade to Pro
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<BadgeCheckIcon />
						Account
					</DropdownMenu.Item>
					<a href="/dashboard/profile" class="contents">
						<DropdownMenu.Item>
							<UserIcon />
							Profile
						</DropdownMenu.Item>
					</a>
					<DropdownMenu.Item>
						<CreditCardIcon />
						Billing
					</DropdownMenu.Item>
				<DropdownMenu.Item>
					<BellIcon />
					Notifications
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
			<DropdownMenu.Item class="cursor-pointer p-0" onclick={(e) => e.preventDefault()}>
				<ThemeToggle variant="menu" class="rounded-sm" />
			</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.Item
					onclick={handleLogoutAll}
					disabled={loggingOut}
					class="text-orange-600 dark:text-orange-400 focus:bg-orange-50 dark:focus:bg-orange-950"
				>
					{#if loggingOut}
						<LoaderIcon class="animate-spin" />
						Logging out...
					{:else}
						<MonitorIcon />
						Log out all devices
					{/if}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				<DropdownMenu.Item
					onclick={handleLogout}
					disabled={loggingOut}
					class="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
				>
					{#if loggingOut}
						<LoaderIcon class="animate-spin" />
						Logging out...
					{:else}
						<LogOutIcon />
						Log out
					{/if}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
