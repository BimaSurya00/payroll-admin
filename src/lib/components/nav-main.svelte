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
	<Sidebar.GroupLabel class="text-zinc-500 font-medium uppercase tracking-widest text-[10px] px-2 mb-1">
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
								class="w-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] data-[active=true]:bg-white/[0.06] data-[active=true]:text-white rounded-none h-8 transition-colors duration-150 group"
							>
								<div class="flex items-center gap-2.5">
									<mainItem.icon class="w-4 h-4" />
									<span class="text-[13px] font-medium">{mainItem.title}</span>
								</div>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] data-[state=open]:rotate-90 data-[state=open]:text-zinc-300 transition-all duration-150 h-6 w-6 rounded-none"
									>
										<ChevronRightIcon class="w-3.5 h-3.5" />
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-3 mt-0.5 space-y-0 border-l border-zinc-800 pl-2.5">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] data-[active=true]:text-primary data-[active=true]:bg-primary/[0.08] rounded-none h-7 transition-colors duration-150 text-[13px] w-full"
											>
												<span class="flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-4 min-w-[16px] items-center justify-center bg-primary text-primary-foreground text-[10px] font-semibold px-1">
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
								class="w-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] data-[active=true]:bg-white/[0.06] data-[active=true]:text-white rounded-none h-8 transition-colors duration-150"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props} class="flex items-center gap-2.5 w-full">
										<mainItem.icon class="w-4 h-4" />
										<span class="text-[13px] font-medium">{mainItem.title}</span>
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