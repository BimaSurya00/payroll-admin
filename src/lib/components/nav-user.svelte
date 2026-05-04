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
						class="w-full text-sidebar-foreground hover:bg-accent data-[state=open]:bg-accent transition-all duration-150 h-auto py-2.5 rounded-xl"
					>
						<Avatar.Root class="size-8 rounded-lg border border-border bg-muted">
							<Avatar.Image
								src={displayUser?.avatar || displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="rounded-lg bg-primary text-primary-foreground font-bold text-xs">
								{userInitials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-semibold text-foreground text-[13px]">{displayUser?.name || "User"}</span>
							<span class="truncate text-[11px] text-muted-foreground">{displayUser?.email || ""}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4 text-muted-foreground/60" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-xl bg-popover border border-border shadow-card-hover"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2.5 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg border border-border">
							<Avatar.Image
								src={displayUser?.avatar || displayUser?.profileImage}
								alt={displayUser?.name}
							/>
							<Avatar.Fallback class="rounded-lg bg-primary text-primary-foreground text-xs font-bold">
								{userInitials}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-semibold text-foreground">{displayUser?.name || "User"}</span>
							<span class="truncate text-xs text-muted-foreground">{displayUser?.email || ""}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<a href="/dashboard/profile" class="contents">
						<DropdownMenu.Item class="cursor-pointer text-foreground/80 hover:text-foreground rounded-lg">
							<UserIcon class="size-4" />
							Profile
						</DropdownMenu.Item>
					</a>
					<DropdownMenu.Item class="cursor-pointer text-foreground/80 hover:text-foreground rounded-lg">
						<BadgeCheckIcon class="size-4" />
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer text-foreground/80 hover:text-foreground rounded-lg">
						<CreditCardIcon class="size-4" />
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer text-foreground/80 hover:text-foreground rounded-lg">
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
						class="cursor-pointer text-muted-foreground hover:text-foreground rounded-lg"
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
						class="text-destructive hover:text-destructive cursor-pointer rounded-lg"
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