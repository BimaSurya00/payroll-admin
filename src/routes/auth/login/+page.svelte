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
	<title>Login | HRIS Enterprise</title>
</svelte:head>

<div class="flex min-h-[100dvh] items-center justify-center p-4 relative overflow-hidden auth-bg">
	<!-- Animated Background Elements -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		<div class="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-float"></div>
		<div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] animate-float" style="animation-delay: 2s;"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]"></div>
		<div class="absolute inset-0 bg-grid opacity-30"></div>
	</div>

	<!-- Login Card -->
	<Card.Root class="w-full max-w-[420px] glass-card shadow-2xl relative z-10 border-0">
		<!-- Top Glow Line -->
		<div class="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
		
		<Card.Header class="space-y-6 pt-8 pb-6">
			<!-- Logo -->
			<div class="flex items-center justify-center">
				<div class="w-16 h-16 bg-cyan-500 flex items-center justify-center rounded-2xl shadow-lg shadow-cyan-500/25 animate-pulse-glow">
					<svg class="w-8 h-8 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
			</div>
			
			<div class="text-center space-y-2">
				<Card.Title class="text-2xl font-bold text-white tracking-tight">Welcome Back</Card.Title>
				<Card.Description class="text-slate-400 text-sm">
					Sign in to access your dashboard
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-5 pb-8">
			<form onsubmit={handleLogin} class="space-y-4">
				<!-- Error Alert -->
				{#if error}
					<div class="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-start gap-3" role="alert">
						<AlertCircleIcon class="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
						<p class="text-sm text-rose-300">{error}</p>
					</div>
				{/if}

				<div class="space-y-1.5">
					<Label for="email" class="text-sm font-medium text-slate-300">Email Address</Label>
					<div class="relative group">
						<MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
						<Input
							id="email"
							type="email"
							placeholder="name@company.com"
							bind:value={email}
							oninput={clearError}
							required
							disabled={loading}
							class="h-11 pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
						/>
					</div>
				</div>

				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<Label for="password" class="text-sm font-medium text-slate-300">Password</Label>
						<a href="/auth/forgot-password" class="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
							Forgot password?
						</a>
					</div>
					<div class="relative group">
						<LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							bind:value={password}
							oninput={clearError}
							required
							disabled={loading}
							class="h-11 pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
					class="w-full h-11 text-sm font-semibold mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25"
					disabled={loading}
				>
					{#if loading}
						<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
						Signing in...
					{:else}
						Sign In
					{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Footer -->
	<div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10">
		<p class="text-xs text-slate-600">
			2024 HRIS Enterprise. All rights reserved.
		</p>
	</div>
</div>
