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
	<Sidebar.GroupLabel class="text-[#64748b] font-bold uppercase tracking-widest text-[10px] px-3 mb-3">
		Main Menu
	</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-1">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="w-full text-[#334155] hover:text-[#0f172a] hover:bg-[#e2e8f0] data-[active=true]:bg-white data-[active=true]:text-[#2563eb] data-[active=true]:border-l-4 data-[active=true]:border-l-[#2563eb] data-[active=true]:shadow-sm h-10 transition-all duration-150 group justify-between"
							>
								<div class="flex items-center gap-3">
									<mainItem.icon class="w-5 h-5 group-data-[active=true]:text-[#2563eb]" />
									<span class="font-semibold text-sm">{mainItem.title}</span>
								</div>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-[#94a3b8] hover:text-[#334155] hover:bg-[#e2e8f0] data-[state=open]:rotate-90 data-[state=open]:text-[#2563eb] transition-all duration-150 h-8 w-8 flex items-center justify-center"
									>
										<ChevronRightIcon class="w-4 h-4" />
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-4 mt-1 space-y-1 border-l-2 border-[#cbd5e1] pl-4">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] data-[active=true]:bg-white data-[active=true]:text-[#2563eb] data-[active=true]:border-l-4 data-[active=true]:border-l-[#2563eb] data-[active=true]:font-semibold h-9 transition-all duration-150 text-sm w-full"
											>
												<span class="flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-5 min-w-[20px] items-center justify-center bg-[#2563eb] text-white text-[10px] font-bold px-1.5">
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
								class="w-full text-[#334155] hover:text-[#0f172a] hover:bg-[#e2e8f0] data-[active=true]:bg-white data-[active=true]:text-[#2563eb] data-[active=true]:border-l-4 data-[active=true]:border-l-[#2563eb] data-[active=true]:shadow-sm h-10 transition-all duration-150"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props} class="flex items-center gap-3 w-full">
										<mainItem.icon class="w-5 h-5" />
										<span class="font-semibold text-sm">{mainItem.title}</span>
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
