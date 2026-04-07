<script>
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

	let {
		items,
	} = $props();

	// Check if item has children
	function hasChildren(item) {
		return item.items && item.items.length > 0;
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
												<span class="text-sm">{subItem.title}</span>
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
