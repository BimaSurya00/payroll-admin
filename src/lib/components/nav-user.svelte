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
						class="w-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] data-[state=open]:bg-white/[0.06] transition-colors duration-150 h-auto py-2 rounded-none"
					>
						<Avatar.Root class="size-7 rounded border border-zinc-700 bg-zinc-800">
							<Avatar.Image
								src={displayUser?.avatar || displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="rounded bg-primary text-primary-foreground font-semibold text-xs">
								{userInitials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium text-zinc-200 text-[13px]">{displayUser?.name || "User"}</span>
							<span class="truncate text-xs text-zinc-500">{displayUser?.email || ""}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-3.5 text-zinc-600" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2.5 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded border border-zinc-700 bg-zinc-800">
							<Avatar.Image
								src={displayUser?.avatar || displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="rounded bg-primary text-primary-foreground text-xs font-semibold">
								{userInitials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium text-zinc-200">{displayUser?.name || "User"}</span>
							<span class="truncate text-xs text-zinc-500">{displayUser?.email || ""}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator class="bg-zinc-800" />
				<DropdownMenu.Group>
					<a href="/dashboard/profile" class="contents">
						<DropdownMenu.Item class="cursor-pointer text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-md">
							<UserIcon class="size-4" />
							Profile
						</DropdownMenu.Item>
					</a>
					<DropdownMenu.Item class="cursor-pointer text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-md">
						<BadgeCheckIcon class="size-4" />
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-md">
						<CreditCardIcon class="size-4" />
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-md">
						<BellIcon class="size-4" />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator class="bg-zinc-800" />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="cursor-pointer p-0" onclick={(e) => e.preventDefault()}>
						<ThemeToggle variant="menu" class="rounded-none" />
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator class="bg-zinc-800" />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						onclick={handleLogoutAll}
						disabled={loggingOut}
						class="text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer rounded-md"
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
				<DropdownMenu.Separator class="bg-zinc-800" />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						onclick={handleLogout}
						disabled={loggingOut}
						class="text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] focus:bg-red-500/[0.08] cursor-pointer rounded-md"
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