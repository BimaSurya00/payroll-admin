<script>
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import Alert from "$lib/components/shared/alert.svelte";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import LockIcon from "@lucide/svelte/icons/lock";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";

	import { authService } from "$lib/api/services/auth.service.js";
	import { toast } from "svelte-sonner";

	let token = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");
	let showPassword = $state(false);
	let loading = $state(false);
	let success = $state(false);

	let tokenFromUrl = $derived($page.url.searchParams.get("token") || "");

	onMount(() => {
		if (tokenFromUrl) token = tokenFromUrl;
	});

	function passwordsMatch() {
		return newPassword && confirmPassword && newPassword === confirmPassword;
	}

	async function handleSubmit(e) {
		e.preventDefault();

		if (!token) {
			toast.error("Reset token is required");
			return;
		}

		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		if (!passwordsMatch()) {
			toast.error("Passwords do not match");
			return;
		}

		loading = true;
		try {
			await authService.resetPassword(token, newPassword);
			success = true;
			toast.success("Password reset successfully");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to reset password");
		} finally {
			loading = false;
		}
	}

	function goToLogin() {
		goto("/auth/login");
	}
</script>

<svelte:head>
	<title>Reset Password | SaaS Payroll</title>
</svelte:head>

<div class="flex min-h-[100vh] items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/30">
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-float"></div>
		<div class="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-chart-4/20 rounded-full blur-[100px] animate-float" style="animation-delay: 2s;"></div>
		<div class="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-chart-2/20 rounded-full blur-[100px] animate-float" style="animation-delay: 4s;"></div>
		<div class="absolute inset-0 bg-grid opacity-50"></div>
	</div>

	<Card.Root class="w-full max-w-md glass-card shadow-2xl relative z-10 animate-scale-in border-0">
		<div class="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

		<Card.Header class="space-y-4 pt-8">
			<div class="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-2 shadow-glow relative overflow-hidden group animate-pulse-glow">
				<div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
				<LockIcon class="w-8 h-8 text-white relative z-10" />
			</div>
			<div class="text-center space-y-1">
				<Card.Title class="text-3xl font-bold gradient-text">Reset Password</Card.Title>
				<Card.Description class="text-muted-foreground">
					Enter your new password
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4">
			{#if success}
				<div class="space-y-4 text-center py-4">
					<div class="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
						<SparklesIcon class="h-8 w-8 text-success" />
					</div>
					<h3 class="text-lg font-semibold">Password Reset!</h3>
					<p class="text-sm text-muted-foreground">Your password has been changed successfully. You can now login with your new password.</p>
					<Button onclick={goToLogin} class="w-full mt-4">
						Go to Login
					</Button>
				</div>
			{:else}
				{#if !token}
					<div class="text-center py-4">
						<p class="text-sm text-muted-foreground">Invalid or missing reset token.</p>
						<Button variant="outline" onclick={goToLogin} class="mt-4">Back to Login</Button>
					</div>
				{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-2">
						<Label for="newPassword">New Password</Label>
						<div class="relative">
							<Input
								id="newPassword"
								type={showPassword ? "text" : "password"}
								placeholder="Enter new password (min 8 chars)"
								bind:value={newPassword}
								required
								disabled={loading}
								class="pr-10"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							>
								{#if showPassword}
									<EyeOffIcon class="h-4 w-4" />
								{:else}
									<EyeIcon class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirm New Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm new password"
							bind:value={confirmPassword}
							required
							disabled={loading}
						/>
					</div>

					<Button type="submit" class="w-full" disabled={!token || !newPassword || !confirmPassword || !passwordsMatch() || loading}>
						{#if loading}
							<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
							Resetting...
						{:else}
							Reset Password
						{/if}
					</Button>
				</form>
				{/if}
			{/if}
		</Card.Content>

		<Card.Footer class="flex justify-center pb-6">
			<button
				type="button"
				onclick={goToLogin}
				class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeftIcon class="h-4 w-4" />
				Back to Login
			</button>
		</Card.Footer>
	</Card.Root>
</div>
