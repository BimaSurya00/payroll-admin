<script>
	import { onMount } from "svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { leaveStore } from "$lib/stores/leave.store.js";

	let { items } = $props();

	let pendingCount = $state(0);

	leaveStore.subscribe((state) => {
		pendingCount = state.pending?.length || 0;
	});

	onMount(async () => {
		try {
			await leaveStore.fetchPending();
		} catch (e) {
			// silent fail
		}
	});

	function hasChildren(item) {
		return item.items && item.items.length > 0;
	}

	function isLeavePage(url) {
		return url === "/dashboard/leave";
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel class="text-muted-foreground font-semibold uppercase tracking-widest text-[10px] px-2 mb-2">
		Menu
	</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-0.5">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="w-full text-sidebar-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-semibold rounded-lg h-9 transition-all duration-150 group"
							>
								<div class="flex items-center gap-2.5">
									<mainItem.icon class="w-[18px] h-[18px]" />
									<span class="font-medium text-[13px]">{mainItem.title}</span>
								</div>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-muted-foreground hover:text-foreground hover:bg-accent data-[state=open]:rotate-90 data-[state=open]:text-foreground transition-all duration-150 h-7 w-7 rounded-md"
									>
										<ChevronRightIcon class="w-4 h-4" />
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-4 mt-0.5 space-y-0.5">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-accent data-[active=true]:text-primary data-[active=true]:bg-primary/10 data-[active=true]:font-medium rounded-md h-7.5 transition-all duration-150 text-[13px] w-full"
											>
												<span class="flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
															{pendingCount > 99 ? "99+" : pendingCount}
														</span>
													{/if}
												</span>
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						{:else}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="w-full text-sidebar-foreground hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-semibold rounded-lg h-9 transition-all duration-150"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props} class="flex items-center gap-2.5 w-full">
										<mainItem.icon class="w-[18px] h-[18px]" />
										<span class="font-medium text-[13px]">{mainItem.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						{/if}
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>