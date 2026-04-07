<script>
	import { cn } from '$lib/utils.js';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import InfoIcon from '@lucide/svelte/icons/info';
	import XIcon from '@lucide/svelte/icons/x';
	
	/**
	 * @typedef {Object} Props
	 * @property {'error' | 'success' | 'warning' | 'info'} [variant] - Alert variant
	 * @property {string} [title] - Alert title
	 * @property {string} message - Alert message
	 * @property {boolean} [dismissible] - Whether alert can be dismissed
	 * @property {Function} [onDismiss] - Dismiss callback
	 * @property {string} [class] - Additional classes
	 */
	
	/** @type {Props} */
	let { 
		variant = 'error',
		title = '',
		message,
		dismissible = false,
		onDismiss = null,
		class: className = ''
	} = $props();
	
	const variants = {
		error: {
			container: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
			icon: AlertTriangleIcon,
			iconColor: 'text-red-600 dark:text-red-400'
		},
		success: {
			container: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300',
			icon: CheckCircleIcon,
			iconColor: 'text-green-600 dark:text-green-400'
		},
		warning: {
			container: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
			icon: AlertTriangleIcon,
			iconColor: 'text-amber-600 dark:text-amber-400'
		},
		info: {
			container: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
			icon: InfoIcon,
			iconColor: 'text-blue-600 dark:text-blue-400'
		}
	};
	
	const Icon = variants[variant].icon;
</script>

<div 
	class={cn(
		'relative rounded-lg border p-4',
		variants[variant].container,
		className
	)}
	role="alert"
>
	<div class="flex items-start gap-3">
		<Icon class={cn('h-5 w-5 shrink-0 mt-0.5', variants[variant].iconColor)} />
		
		<div class="flex-1 min-w-0">
			{#if title}
				<h4 class="font-medium text-sm">{title}</h4>
			{/if}
			<p class="text-sm mt-1" class:mt-0={!title}>{message}</p>
		</div>
		
		{#if dismissible}
			<button 
				type="button"
				class="shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
				onclick={onDismiss}
				aria-label="Dismiss alert"
			>
				<XIcon class="h-4 w-4" />
			</button>
		{/if}
	</div>
</div>
