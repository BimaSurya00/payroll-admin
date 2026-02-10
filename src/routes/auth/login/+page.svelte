<script>
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { goto } from "$app/navigation";
	import LoaderIcon from "@lucide/svelte/icons/loader";

	// Import auth store
	import { authStore } from "$lib/stores/auth.store.js";

	let email = $state("");
	let password = $state("");
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

<div class="flex min-h-[100vh] items-center justify-center p-4 bg-muted/50">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl font-bold text-center">Login</Card.Title
			>
			<Card.Description class="text-center"
				>Enter your email below to login to your account</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleLogin}>
				<div class="grid gap-4">
					<!-- Error Alert -->
					{#if error}
						<div
							class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
						>
							<p class="text-sm">{error}</p>
						</div>
					{/if}

					<div class="grid gap-1">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							bind:value={email}
							oninput={clearError}
							required
							disabled={loading}
						/>
					</div>
					<div class="grid gap-1">
						<div class="flex items-center justify-between">
							<Label for="password">Password</Label>
							<a
								href="/auth/forgot-password"
								class="text-sm text-primary underline-offset-4 hover:underline"
								>Forgot password?</a
							>
						</div>
						<Input
							id="password"
							type="password"
							bind:value={password}
							oninput={clearError}
							required
							disabled={loading}
						/>
					</div>
					<Button type="submit" class="w-full" disabled={loading}>
						{#if loading}
							<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
							Signing In...
						{:else}
							Sign In
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-2">
			<div class="text-center text-sm">
				Don't have an account?
				<a
					href="/auth/register"
					class="text-primary underline-offset-4 hover:underline"
					>Sign Up</a
				>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
