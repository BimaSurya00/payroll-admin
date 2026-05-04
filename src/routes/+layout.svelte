<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';

	let { children } = $props();

	if (browser) {
		const theme = localStorage.getItem('theme');
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else if (theme === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			// Default to light mode
			document.documentElement.classList.remove('dark');
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}