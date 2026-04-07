<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').ComponentType} icon - Lucide icon component
	 * @property {string} title - Empty state title
	 * @property {string} [description] - Optional description
	 * @property {string} [actionLabel] - Action button label
	 * @property {Function} [onAction] - Action button click handler
	 * @property {boolean} [compact] - Compact mode for smaller spaces
	 */
	
	/** @type {Props} */
	let { 
		icon: Icon,
		title,
		description = '',
		actionLabel = '',
		onAction = null,
		compact = false
	} = $props();
</script>

<div class={cn("flex flex-col items-center justify-center py-12 text-center", compact && "py-8")}>
	<div 
		class={cn(
			"rounded-full bg-muted flex items-center justify-center mb-4",
			compact ? "w-12 h-12" : "w-16 h-16"
		)}
	>
		<Icon 
			class={cn(
				"text-muted-foreground",
				compact ? "w-5 h-5" : "w-8 h-8"
			)} 
		/>
	</div>
	
	<h3 class={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>
		{title}
	</h3>
	
	{#if description}
		<p class="text-sm text-muted-foreground mt-1 max-w-sm">
			{description}
		</p>
	{/if}
	
	{#if actionLabel && onAction}
		<Button class="mt-4" size={compact ? 'sm' : 'default'} onclick={onAction}>
			{actionLabel}
		</Button>
	{/if}
</div>
