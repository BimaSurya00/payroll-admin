<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	let { children } = $props();

	if (browser) {
		const theme = localStorage.getItem('theme');
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}