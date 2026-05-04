<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();

	if (browser) {
		const theme = localStorage.getItem('theme');
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster position="top-right" richColors />
{@render children()}