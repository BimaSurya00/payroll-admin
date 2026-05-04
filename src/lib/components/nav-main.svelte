<script>
	import { onMount } from "svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { leaveStore } from "$lib/stores/leave.store.js";

	let { items } = $props();
	let pendingCount = $state(0);

	leaveStore.subscribe((state) => { pendingCount = state.pending?.length || 0; });
	onMount(async () => { try { await leaveStore.fetchPending(); } catch (e) {} });

	function hasChildren(item) { return item.items && item.items.length > 0; }
	function isLeavePage(url) { return url === "/dashboard/leave"; }
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel class="px-3 mb-3 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
		Main
	</Sidebar.GroupLabel>
	<Sidebar.Menu class="space-y-0.5">
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={hasChildren(mainItem) ? true : mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						{#if hasChildren(mainItem)}
							<Sidebar.MenuButton 
								tooltipContent={mainItem.title}
								class="w-full text-sidebar-foreground hover:text-foreground hover:bg-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground rounded-lg h-9 transition-all duration-150 group"
							>
								<div class="flex items-center gap-3">
									<mainItem.icon class="w-4 h-4 opacity-60 group-data-[active=true]:opacity-100 group-hover:opacity-80" />
									<span class="text-[13px] font-medium">{mainItem.title}</span>
								</div>
							</Sidebar.MenuButton>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="text-muted-foreground/40 hover:text-foreground hover:bg-accent data-[state=open]:rotate-90 transition-all duration-200 h-7 w-7 rounded-md"
									>
										<ChevronRightIcon class="w-3.5 h-3.5" />
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub class="ml-5 mt-0.5 space-y-0.5">
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton 
												href={subItem.url}
												class="text-sidebar-foreground/70 hover:text-foreground hover:bg-accent data-[active=true]:text-primary data-[active=true]:font-medium rounded-md h-8 transition-all duration-150 text-[13px] w-full"
											>
												<span class="flex items-center justify-between w-full">
													{subItem.title}
													{#if isLeavePage(subItem.url) && pendingCount > 0}
														<span class="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5">
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
								class="w-full text-sidebar-foreground hover:text-foreground hover:bg-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground rounded-lg h-9 transition-all duration-150 group"
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props} class="flex items-center gap-3 w-full">
										<mainItem.icon class="w-4 h-4 opacity-60 group-data-[active=true]:opacity-100 group-hover:opacity-80" />
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