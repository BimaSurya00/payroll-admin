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
	<Sidebar.GroupLabel class="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] px-3 mb-2">
		Menu
	</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-0">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="w-full text-neutral-700 hover:text-black hover:bg-neutral-100 data-[active=true]:bg-black data-[active=true]:text-white h-10 transition-colors duration-150 group"
							>
								<div class="flex items-center gap-3">
									<mainItem.icon class="w-[18px] h-[18px]" />
									<span class="font-medium text-sm">{mainItem.title}</span>
								</div>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-neutral-400 hover:text-black hover:bg-neutral-100 data-[state=open]:rotate-90 transition-all duration-150 h-8 w-8"
									>
										<ChevronRightIcon class="w-4 h-4" />
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-4 mt-0 space-y-0 border-l-2 border-neutral-200 pl-3">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-neutral-600 hover:text-black hover:bg-neutral-100 data-[active=true]:bg-black data-[active=true]:text-white h-9 transition-colors duration-150 text-sm w-full"
											>
												<span class="flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-5 min-w-[20px] items-center justify-center bg-black text-white text-[10px] font-bold px-1.5">
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
								class="w-full text-neutral-700 hover:text-black hover:bg-neutral-100 data-[active=true]:bg-black data-[active=true]:text-white h-10 transition-colors duration-150"
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
