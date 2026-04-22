<script>
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { goto } from "$app/navigation";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import MailIcon from "@lucide/svelte/icons/mail";
	import LockIcon from "@lucide/svelte/icons/lock";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";

	// Import auth store
	import { authStore } from "$lib/stores/auth.store.js";

	let email = $state("");
	let password = $state("");
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state(null);

	// Subscribe to auth store
	authStore.subscribe((state) => {
		loading = state.loading;
		error = state.error;
	});

	async function handleLogin(e) {
		e.preventDefault();

		if (!email || !password) {
			error = "Please fill in all fields";
			return;
		}

		try {
			await authStore.login(email, password);
			// Redirect to dashboard on success
			goto("/dashboard");
		} catch (err) {
			// Error is handled by the store
			console.error("Login failed:", err.message);
		}
	}

	function clearError() {
		authStore.clearError();
		error = null;
	}
</script>

<svelte:head>
	<title>Login | SaaS Payroll</title>
</svelte:head>

<div class="flex min-h-[100vh] items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/30">
	<!-- Animated Background -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<!-- Gradient Orbs -->
		<div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-float"></div>
		<div class="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-chart-4/20 rounded-full blur-[100px] animate-float" style="animation-delay: 2s;"></div>
		<div class="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-chart-2/20 rounded-full blur-[100px] animate-float" style="animation-delay: 4s;"></div>
		
		<!-- Grid Pattern -->
		<div class="absolute inset-0 bg-grid opacity-50"></div>
		
		<!-- Particles -->
		{#each Array(20) as _, i}
			<div 
				class="absolute w-1 h-1 bg-primary/40 rounded-full animate-pulse"
				style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; animation-delay: {Math.random() * 3}s; animation-duration: {2 + Math.random() * 2}s;"
			></div>
		{/each}
	</div>
	
	<!-- Login Card -->
	<Card.Root class="w-full max-w-md glass-card shadow-2xl relative z-10 animate-scale-in border-0">
		<div class="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
		
		<Card.Header class="space-y-4 pt-8">
			<div class="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-2 shadow-glow relative overflow-hidden group animate-pulse-glow">
				<div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
				<SparklesIcon class="w-8 h-8 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
			</div>
			
			<div class="text-center space-y-1">
				<Card.Title class="text-3xl font-bold gradient-text">Welcome Back</Card.Title>
				<Card.Description class="text-muted-foreground text-base">
					Enter your credentials to continue
				</Card.Description>
			</div>
		</Card.Header>
		
		<Card.Content class="space-y-6">
			<form onsubmit={handleLogin} class="space-y-5">
				<!-- Error Alert -->
				{#if error}
					<div
						class="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 animate-slide-up"
						role="alert"
					>
						<AlertCircleIcon class="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
						<div class="flex-1">
							<p class="text-sm font-medium text-destructive">{error}</p>
						</div>
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="email" class="text-sm font-medium flex items-center gap-2">
						<MailIcon class="w-4 h-4 text-muted-foreground" />
						Email Address
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@company.com"
						bind:value={email}
						oninput={clearError}
						required
						disabled={loading}
						class="h-12"
					/>
				</div>
				
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="password" class="text-sm font-medium flex items-center gap-2">
							<LockIcon class="w-4 h-4 text-muted-foreground" />
							Password
						</Label>
						<a
							href="/auth/forgot-password"
							class="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
						>
							Forgot password?
						</a>
					</div>
					<div class="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							bind:value={password}
							oninput={clearError}
							required
							disabled={loading}
							class="h-12 pr-10"
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{#if showPassword}
								<EyeOffIcon class="w-5 h-5" />
							{:else}
								<EyeIcon class="w-5 h-5" />
							{/if}
						</button>
					</div>
				</div>
				
				<Button 
					type="submit" 
					class="w-full h-12 text-base font-semibold mt-2" 
					disabled={loading}
				>
					{#if loading}
						<LoaderIcon class="h-5 w-5 mr-2 animate-spin" />
						Signing in...
					{:else}
						Sign In
					{/if}
				</Button>
			</form>
		</Card.Content>
		
		<Card.Footer class="flex flex-col gap-4 pb-8">
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			
			<div class="text-center text-sm">
				<span class="text-muted-foreground">Don't have an account?</span>
				<a
					href="/auth/register"
					class="text-primary font-semibold hover:underline ml-1 transition-all hover:text-primary/80"
				>
					Sign up
				</a>
			</div>
		</Card.Footer>
	</Card.Root>
	
	<!-- Decorative Elements -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
		<p class="text-xs text-muted-foreground/60">
			© 2024 HRIS Enterprise. All rights reserved.
		</p>
	</div>
</div>
