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
	<Sidebar.GroupLabel class="text-slate-500 font-semibold uppercase tracking-wider text-[10px] px-3 mb-2">
		Navigation
	</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-1">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="w-full text-slate-300 hover:text-white hover:bg-slate-800/80 data-[active=true]:bg-cyan-500 data-[active=true]:text-slate-900 data-[active=true]:font-semibold rounded-lg h-10 transition-all duration-200 group"
							>
								<div class="flex items-center gap-3">
									<mainItem.icon class="w-[18px] h-[18px] group-data-[active=true]:text-slate-900" />
									<span class="font-medium text-sm">{mainItem.title}</span>
								</div>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-slate-500 hover:text-white hover:bg-slate-800/80 data-[state=open]:rotate-90 data-[state=open]:text-cyan-400 transition-all duration-200 h-8 w-8 rounded-lg"
									>
										<ChevronRightIcon class="w-4 h-4" />
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-3">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-slate-400 hover:text-white hover:bg-slate-800/80 data-[active=true]:bg-cyan-500/20 data-[active=true]:text-cyan-400 data-[active=true]:font-medium rounded-lg h-8 transition-all duration-200 text-sm w-full"
											>
												<span class="flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-cyan-500 text-slate-900 text-[10px] font-bold px-1.5">
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
								class="w-full text-slate-300 hover:text-white hover:bg-slate-800/80 data-[active=true]:bg-cyan-500 data-[active=true]:text-slate-900 data-[active=true]:font-semibold rounded-lg h-10 transition-all duration-200"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props} class="flex items-center gap-3 w-full">
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
