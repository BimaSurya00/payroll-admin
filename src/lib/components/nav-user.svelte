<script>
	import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
	import BellIcon from "@lucide/svelte/icons/bell";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import UserIcon from "@lucide/svelte/icons/user";
	import LoaderIcon from "@lucide/svelte/icons/loader";

	import ThemeToggle from "$lib/components/shared/theme-toggle.svelte";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import { authStore } from "$lib/stores/auth.store.js";

	let { user } = $props();
	const sidebar = useSidebar();
	let loggingOut = $state(false);

	let authState = $state({ user: null, isAuthenticated: false });
	authStore.subscribe((state) => {
		authState = state;
	});

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
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			loggingOut = false;
		}
	}

	async function handleLogoutAll() {
		loggingOut = true;
		try {
			await authStore.logoutAll();
		} catch (error) {
			console.error("Logout all failed:", error);
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
						class="text-[#0f172a] hover:bg-[#cbd5e1] data-[state=open]:bg-white data-[state=open]:shadow-sm transition-all duration-150 h-auto py-3 w-full"
					>
						<Avatar.Root class="size-10 border-2 border-[#cbd5e1] bg-[#e2e8f0]">
							<Avatar.Image
								src={displayUser?.avatar || displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="bg-[#2563eb] text-white font-bold text-sm">
								{userInitials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-bold text-[#0f172a]">{displayUser?.name || "User"}</span>
							<span class="truncate text-xs text-[#64748b]">{displayUser?.email || ""}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4 text-[#64748b]" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 border border-[#cbd5e1]">
							<Avatar.Image
								src={displayUser?.avatar || displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="bg-[#2563eb] text-white text-xs font-bold">
								{userInitials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-bold text-[#0f172a]">{displayUser?.name || "User"}</span>
							<span class="truncate text-xs text-[#64748b]">{displayUser?.email || ""}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<a href="/dashboard/profile" class="contents">
						<DropdownMenu.Item class="cursor-pointer text-[#334155]">
							<UserIcon class="size-4" />
							Profile
						</DropdownMenu.Item>
					</a>
					<DropdownMenu.Item class="cursor-pointer text-[#334155]">
						<BadgeCheckIcon class="size-4" />
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer text-[#334155]">
						<CreditCardIcon class="size-4" />
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer text-[#334155]">
						<BellIcon class="size-4" />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="cursor-pointer p-0" onclick={(e) => e.preventDefault()}>
						<ThemeToggle variant="menu" />
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						onclick={handleLogoutAll}
						disabled={loggingOut}
						class="text-[#d97706] focus:bg-[#fef3c7] cursor-pointer"
					>
						{#if loggingOut}
							<LoaderIcon class="animate-spin size-4" />
							Logging out...
						{:else}
							<MonitorIcon class="size-4" />
							Log out all devices
						{/if}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						onclick={handleLogout}
						disabled={loggingOut}
						class="text-[#dc2626] focus:bg-[#fee2e2] cursor-pointer"
					>
						{#if loggingOut}
							<LoaderIcon class="animate-spin size-4" />
							Logging out...
						{:else}
							<LogOutIcon class="size-4" />
							Log out
						{/if}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
