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
	<Sidebar.GroupLabel class="text-white/50 font-semibold uppercase tracking-wider text-xs px-3">Platform</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-1.5">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:text-white rounded-lg"
							>
								<mainItem.icon class="w-5 h-5" />
								<span class="font-medium">{mainItem.title}</span>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-white/60 hover:text-white hover:bg-white/10 data-[state=open]:rotate-90 rounded-lg"
									>
										<ChevronRightIcon class="w-4 h-4" />
										<span class="sr-only">Toggle</span>
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-4 mt-1.5 space-y-1 border-l-0">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:text-white rounded-lg"
											>
												<span class="text-sm flex items-center gap-2">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-500 text-white text-[10px] font-bold px-1">
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
								class="text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:text-white rounded-lg"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props}>
										<mainItem.icon class="w-5 h-5" />
										<span class="font-medium">{mainItem.title}</span>
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
