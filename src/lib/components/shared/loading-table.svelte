<script>
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	
	/**
	 * @typedef {Object} Props
	 * @property {number} [rows] - Number of skeleton rows
	 * @property {boolean} [showHeader] - Show header skeleton
	 */
	
	/** @type {Props} */
	let { 
		rows = 5,
		showHeader = true
	} = $props();
</script>

<div class="space-y-3">
	{#if showHeader}
		<div class="flex gap-4 pb-4 border-b">
			{#each Array(4) as _, i}
				<Skeleton class="h-4 flex-1" />
			{/each}
		</div>
	{/if}
	
	{#each Array(rows) as _, i}
		<div class="flex gap-4 py-3">
			<Skeleton class="h-4 flex-1" />
			<Skeleton class="h-4 flex-1" />
			<Skeleton class="h-4 flex-1" />
			<Skeleton class="h-4 flex-1" />
		</div>
	{/each}
</div>
