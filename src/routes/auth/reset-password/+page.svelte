<script>
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import LockIcon from "@lucide/svelte/icons/lock";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import CheckCircleIcon from "@lucide/svelte/icons/check-circle";

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
	<title>Reset Password | HRIS Enterprise</title>
</svelte:head>

<div class="flex min-h-[100dvh] items-center justify-center p-4 relative overflow-hidden auth-bg">
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute inset-0 bg-grid opacity-40"></div>
	</div>

	<Card.Root class="w-full max-w-[400px] shadow-elevation-2 border-border bg-card relative z-10">
		<Card.Header class="space-y-5 pt-8 pb-6">
			<div class="flex items-center gap-3">
				<div class="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg shadow-sm">
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
				<div>
					<h1 class="text-lg font-bold text-foreground tracking-tight">HRIS Enterprise</h1>
					<p class="text-[11px] text-muted-foreground">Human Resource Information System</p>
				</div>
			</div>
			<div class="space-y-1">
				<Card.Title class="text-xl font-semibold text-foreground">Reset Password</Card.Title>
				<Card.Description class="text-sm text-muted-foreground">
					Enter your new password
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4 pb-8">
			{#if success}
				<div class="space-y-5 text-center py-2">
					<div class="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
						<CheckCircleIcon class="h-6 w-6 text-success" />
					</div>
					<div class="space-y-1">
						<h3 class="text-lg font-semibold text-foreground">Password Reset!</h3>
						<p class="text-sm text-muted-foreground">Your password has been changed. You can now login with your new password.</p>
					</div>
					<Button onclick={goToLogin} class="w-full h-10 text-sm font-semibold mt-2">
						Go to Login
					</Button>
				</div>
			{:else}
				{#if !token}
					<div class="text-center py-6">
						<p class="text-sm text-muted-foreground">Invalid or missing reset token.</p>
						<Button variant="outline" onclick={goToLogin} class="mt-4 h-10">Back to Login</Button>
					</div>
				{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-1.5">
						<Label for="newPassword" class="text-sm font-medium text-foreground">New Password</Label>
						<div class="relative">
							<LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="newPassword"
								type={showPassword ? "text" : "password"}
								placeholder="Minimum 8 characters"
								bind:value={newPassword}
								required
								disabled={loading}
								class="h-10 pl-10 pr-10 bg-background border-input focus-visible:ring-2 focus-visible:ring-ring"
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

					<div class="space-y-1.5">
						<Label for="confirmPassword" class="text-sm font-medium text-foreground">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm new password"
							bind:value={confirmPassword}
							required
							disabled={loading}
							class="h-10 bg-background border-input focus-visible:ring-2 focus-visible:ring-ring"
						/>
					</div>

					<Button type="submit" class="w-full h-10 text-sm font-semibold" disabled={!token || !newPassword || !confirmPassword || !passwordsMatch() || loading}>
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

		<Card.Footer class="flex justify-center pb-6 pt-0">
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
