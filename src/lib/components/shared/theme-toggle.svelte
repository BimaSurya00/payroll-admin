<script>
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { cn } from '$lib/utils.js';
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class] - Additional CSS classes
	 * @property {'icon' | 'button' | 'menu'} [variant] - Display variant
	 */
	
	/** @type {Props} */
	let { 
		class: className = '',
		variant = 'icon'
	} = $props();
	
	let isDark = $state(false);
	let mounted = $state(false);
	
	$effect(() => {
		if (browser) {
			mounted = true;
			// Check initial theme
			isDark = document.documentElement.classList.contains('dark') ||
				localStorage.getItem('theme') === 'dark' ||
				(!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
			
			// Apply initial theme
			document.documentElement.classList.toggle('dark', isDark);
		}
	});
	
	function toggleTheme() {
		isDark = !isDark;
		if (browser) {
			document.documentElement.classList.toggle('dark', isDark);
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		}
	}
</script>

{#if variant === 'icon'}
	<Button
		variant="ghost"
		size="icon"
		class={cn('h-9 w-9', className)}
		onclick={toggleTheme}
		title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		disabled={!mounted}
	>
		{#if mounted}
			{#if isDark}
				<MoonIcon class="h-4 w-4" />
			{:else}
				<SunIcon class="h-4 w-4" />
			{/if}
		{/if}
		<span class="sr-only">Toggle theme</span>
	</Button>
{:else if variant === 'menu'}
	<!-- For use in dropdown menus -->
	<button
		class={cn(
			'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full',
			className
		)}
		onclick={toggleTheme}
		disabled={!mounted}
		type="button"
	>
		{#if mounted}
			{#if isDark}
				<MoonIcon class="h-4 w-4 mr-2" />
				<span>Dark mode</span>
			{:else}
				<SunIcon class="h-4 w-4 mr-2" />
				<span>Light mode</span>
			{/if}
		{/if}
	</button>
{:else}
	<Button
		variant="ghost"
		class={cn('gap-2', className)}
		onclick={toggleTheme}
		disabled={!mounted}
	>
		{#if mounted}
			{#if isDark}
				<MoonIcon class="h-4 w-4" />
				<span>Dark mode</span>
			{:else}
				<SunIcon class="h-4 w-4" />
				<span>Light mode</span>
			{/if}
		{/if}
	</Button>
{/if}
