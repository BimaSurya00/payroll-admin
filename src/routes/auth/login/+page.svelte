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
	<div class="w-full max-w-[400px]">
		<div class="text-center mb-8">
			<div class="flex items-center justify-center mb-6">
				<div class="w-10 h-10 bg-primary flex items-center justify-center">
					<svg class="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
			</div>
			<h1 class="text-xl font-semibold text-white tracking-tight">Welcome back</h1>
			<p class="text-sm text-zinc-500 mt-1.5">Sign in to your account to continue</p>
		</div>

		<Card.Root class="surface-card">
			<Card.Content class="p-6">
				<form onsubmit={handleLogin} class="space-y-4">
					{#if error}
						<div class="flex items-center gap-2.5 p-3 bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm" role="alert">
							<AlertCircleIcon class="w-4 h-4 flex-shrink-0" />
							<span>{error}</span>
						</div>
					{/if}

					<div class="space-y-1.5">
						<Label for="email" class="text-sm text-zinc-400">Email</Label>
						<div class="relative">
							<MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
							<Input
								id="email"
								type="email"
								placeholder="name@company.com"
								bind:value={email}
								oninput={clearError}
								required
								disabled={loading}
								class="h-10 pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20"
							/>
						</div>
					</div>

					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label for="password" class="text-sm text-zinc-400">Password</Label>
							<a href="/auth/forgot-password" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
								Forgot password?
							</a>
						</div>
						<div class="relative">
							<LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								bind:value={password}
								oninput={clearError}
								required
								disabled={loading}
								class="h-10 pl-9 pr-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
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
						class="w-full h-10 text-sm font-medium mt-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
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

		<p class="text-center text-xs text-zinc-600 mt-6">
			&copy; {new Date().getFullYear()} HRIS. All rights reserved.
		</p>
	</div>
</div>