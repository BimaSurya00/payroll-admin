<script>
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { cn } from "$lib/utils.js";
	import { SIDEBAR_WIDTH_MOBILE } from "./constants.js";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		side = "left",
		variant = "sidebar",
		collapsible = "offcanvas",
		class: className,
		children,
		...restProps
	} = $props();

	const sidebar = useSidebar();
</script>

{#if collapsible === "none"}
	<div
		class={cn(
			"bg-gradient-to-b from-[#1e3a5f] via-[#1e293b] to-[#0f172a] text-white flex h-full w-(--sidebar-width) flex-col overflow-hidden relative",
			className
		)}
		bind:this={ref}
		{...restProps}
	>
		<!-- Decorative gradient overlay -->
		<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-4/10 pointer-events-none"></div>
		<div class="relative z-10 flex flex-col h-full">
			{@render children?.()}
		</div>
	</div>
{:else if sidebar.isMobile}
	<Sheet.Root
		bind:open={() => sidebar.openMobile, (v) => sidebar.setOpenMobile(v)}
		{...restProps}
	>
		<Sheet.Content
			data-sidebar="sidebar"
			data-slot="sidebar"
			data-mobile="true"
			class="bg-gradient-to-b from-[#1e3a5f] via-[#1e293b] to-[#0f172a] text-white w-(--sidebar-width) p-0 [&>button]:hidden overflow-hidden relative"
			style="--sidebar-width: {SIDEBAR_WIDTH_MOBILE};"
			{side}
		>
			<!-- Decorative gradient overlay -->
			<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-4/10 pointer-events-none"></div>
			<Sheet.Header class="sr-only">
				<Sheet.Title>Sidebar</Sheet.Title>
				<Sheet.Description>Displays the mobile sidebar.</Sheet.Description>
			</Sheet.Header>
			<div class="flex h-full w-full flex-col">
				{@render children?.()}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{:else}
	<div
		bind:this={ref}
		class="text-sidebar-foreground group peer hidden md:block"
		data-state={sidebar.state}
		data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
		data-variant={variant}
		data-side={side}
		data-slot="sidebar"
	>
		<!-- This is what handles the sidebar gap on desktop -->
		<div
			data-slot="sidebar-gap"
			class={cn(
				"relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
				"group-data-[collapsible=offcanvas]:w-0",
				"group-data-[side=right]:rotate-180",
				variant === "floating" || variant === "inset"
					? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
					: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
			)}
		></div>
		<div
			data-slot="sidebar-container"
			class={cn(
				"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
				side === "left"
					? "start-0 group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)]"
					: "end-0 group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)]",
				// Adjust the padding for floating and inset variants.
				variant === "floating" || variant === "inset"
					? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
					: "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s",
				className
			)}
			{...restProps}
		>
			<div
				data-sidebar="sidebar"
				data-slot="sidebar-inner"
				class="bg-gradient-to-b from-[#1e3a5f] via-[#1e293b] to-[#0f172a] text-white group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col rounded-xl group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm overflow-hidden relative shadow-lg"
			>
				<!-- Decorative gradient overlay -->
				<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-4/10 pointer-events-none"
				></div>
				<!-- Content -->
				<div class="relative z-10 flex flex-col h-full">
					{@render children?.()}
				</div>
			</div>
		</div>
	</div>
{/if}