<script>
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import MailIcon from "@lucide/svelte/icons/mail";
	import LockIcon from "@lucide/svelte/icons/lock";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";

	import { authStore } from "$lib/stores/auth.store.js";

	let email = $state("");
	let password = $state("");
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state(null);

	authStore.subscribe((state) => {
		loading = state.loading;
		error = state.error;
	});

	onMount(() => {
		if (authStore.checkAuth()) {
			goto("/dashboard", { replaceState: true });
		}
	});

	async function handleLogin(e) {
		e.preventDefault();

		if (!email || !password) {
			error = "Please fill in all fields";
			return;
		}

		try {
			await authStore.login(email, password);
			goto("/dashboard");
		} catch (err) {
			console.error("Login failed:", err.message);
		}
	}

	function clearError() {
		authStore.clearError();
		error = null;
	}
</script>

<svelte:head>
	<title>Login | HRIS</title>
</svelte:head>

<div class="flex min-h-[100dvh] items-center justify-center p-4 auth-bg">
	<div class="w-full max-w-[420px]">
		<div class="text-center mb-8">
			<div class="flex items-center justify-center mb-6">
				<div class="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-card">
					<svg class="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
			</div>
			<h1 class="text-2xl font-bold text-foreground tracking-tight dark:text-white">Welcome back</h1>
			<p class="text-muted-foreground text-sm mt-1.5">Sign in to your account to continue</p>
		</div>

		<Card.Root class="surface-elevated p-0">
			<Card.Content class="p-6 sm:p-8">
				<form onsubmit={handleLogin} class="space-y-5">
					{#if error}
						<div class="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm rounded-xl" role="alert">
							<AlertCircleIcon class="w-4 h-4 flex-shrink-0" />
							<span>{error}</span>
						</div>
					{/if}

					<div class="space-y-2">
						<Label for="email" class="text-sm font-medium text-foreground">Email</Label>
						<div class="relative">
							<MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="name@company.com"
								bind:value={email}
								oninput={clearError}
								required
								disabled={loading}
								class="h-11 pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label for="password" class="text-sm font-medium text-foreground">Password</Label>
							<a href="/auth/forgot-password" class="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
								Forgot password?
							</a>
						</div>
						<div class="relative">
							<LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								bind:value={password}
								oninput={clearError}
								required
								disabled={loading}
								class="h-11 pl-9 pr-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{#if showPassword}
									<EyeOffIcon class="w-4 h-4" />
								{:else}
									<EyeIcon class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</div>

					<Button 
						type="submit" 
						class="w-full h-11 text-sm font-semibold mt-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-card"
						disabled={loading}
					>
						{#if loading}
							<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
							Signing in...
						{:else}
							Sign in
						{/if}
					</Button>
				</form>
			</Card.Content>
		</Card.Root>

		<p class="text-center text-sm text-muted-foreground mt-8">
			&copy; {new Date().getFullYear()} HRIS Payroll. All rights reserved.
		</p>
	</div>
</div>