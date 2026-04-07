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
	data-slot="sidebar-header"
	data-sidebar="header"
	class={cn("flex flex-col gap-2 px-4 pt-4 pb-3", className)}
	{...restProps}
>
	{@render children?.()}
</div>