<script>
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		placeholder = "Select an option",
		...restProps
	} = $props();
</script>

<SelectPrimitive.Value
	bind:ref
	data-slot="select-value"
	class={cn("line-clamp-1 flex items-center gap-2", className)}
	{placeholder}
	{...restProps}
>
	{@render children?.()}
</SelectPrimitive.Value>
