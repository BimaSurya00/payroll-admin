<script>
	import { onMount } from "svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { leaveStore } from "$lib/stores/leave.store.js";

	let {
		items,
	} = $props();

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
	<Sidebar.GroupLabel class="text-white/40 font-semibold uppercase tracking-wider text-[10px] px-3 mb-2">Menu</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-0.5">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-lg h-10 transition-colors"
							>
								<mainItem.icon class="w-[18px] h-[18px]" />
								<span class="font-medium text-sm">{mainItem.title}</span>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-white/40 hover:text-white hover:bg-white/10 data-[state=open]:rotate-90 rounded-md transition-all"
									>
										<ChevronRightIcon class="w-3.5 h-3.5" />
										<span class="sr-only">Toggle</span>
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-white/60 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-md h-8 transition-colors"
											>
												<span class="text-sm flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-warning text-white text-[9px] font-bold px-1">
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
								class="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-lg h-10 transition-colors"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props}>
										<mainItem.icon class="w-[18px] h-[18px]" />
										<span class="font-medium text-sm">{mainItem.title}</span>
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
