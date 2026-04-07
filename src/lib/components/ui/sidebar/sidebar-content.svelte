<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-content"
	data-sidebar="content"
	class={cn(
		"flex min-h-0 flex-1 flex-col gap-1.5 overflow-auto px-3 group-data-[collapsible=icon]:overflow-hidden",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>