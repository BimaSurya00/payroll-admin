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
	<!-- Subtle Background Pattern -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute inset-0 bg-grid opacity-30"></div>
		<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
		<div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-chart-2/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
	</div>

	<!-- Login Card -->
	<Card.Root class="w-full max-w-[420px] shadow-elevation-3 border-border/60 bg-card/80 backdrop-blur-sm relative z-10">
		<Card.Header class="space-y-5 pt-8 pb-6">
			<div class="flex items-center gap-3">
				<div class="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-md">
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
				<div>
					<h1 class="text-xl font-bold text-foreground tracking-tight">HRIS Enterprise</h1>
					<p class="text-xs text-muted-foreground">Human Resource Information System</p>
				</div>
			</div>
			<div class="space-y-1">
				<Card.Title class="text-2xl font-semibold text-foreground">Welcome back</Card.Title>
				<Card.Description class="text-sm text-muted-foreground">
					Enter your credentials to access the dashboard
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-5 pb-8">
			<form onsubmit={handleLogin} class="space-y-4">
				<!-- Error Alert -->
				{#if error}
					<div
						class="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2.5"
						role="alert"
					>
						<AlertCircleIcon class="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
						<p class="text-sm text-destructive">{error}</p>
					</div>
				{/if}

				<div class="space-y-1.5">
					<Label for="email" class="text-sm font-medium text-foreground">Email Address</Label>
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
							class="h-11 pl-10 bg-background border-input focus-visible:ring-primary/30 focus-visible:ring-2"
						/>
					</div>
				</div>

				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<Label for="password" class="text-sm font-medium text-foreground">Password</Label>
						<a
							href="/auth/forgot-password"
							class="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
						>
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
							class="h-11 pl-10 pr-10 bg-background border-input focus-visible:ring-primary/30 focus-visible:ring-2"
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
					class="w-full h-11 text-sm font-semibold mt-2"
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
		<p class="text-xs text-muted-foreground/60">
			© 2024 HRIS Enterprise. All rights reserved.
		</p>
	</div>
</div>
