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
	<title>Reset Password | HRIS</title>
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
			<h1 class="text-xl font-semibold text-white tracking-tight">Reset password</h1>
			<p class="text-sm text-zinc-500 mt-1.5">Create a new password for your account</p>
		</div>

		<Card.Root class="surface-card">
			<Card.Content class="p-6">
				{#if success}
					<div class="space-y-5 text-center py-2">
						<div class="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
							<CheckCircleIcon class="h-5 w-5 text-emerald-400" />
						</div>
						<div class="space-y-1">
							<h3 class="text-base font-medium text-white">Password reset</h3>
							<p class="text-sm text-zinc-500">Your password has been changed successfully. You can now sign in with your new password.</p>
						</div>
						<Button onclick={goToLogin} class="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors mt-2">
							Go to Login
						</Button>
					</div>
				{:else}
					{#if !token}
						<div class="text-center py-6">
							<p class="text-sm text-zinc-500">Invalid or missing reset token.</p>
							<Button variant="outline" onclick={goToLogin} class="mt-4 h-10 border-white/[0.08] bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] hover:border-white/[0.12]">Back to Login</Button>
						</div>
					{:else}
						<form onsubmit={handleSubmit} class="space-y-4">
							<div class="space-y-1.5">
								<Label for="newPassword" class="text-sm text-zinc-400">New Password</Label>
								<div class="relative">
									<LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
									<Input
										id="newPassword"
										type={showPassword ? "text" : "password"}
										placeholder="Minimum 8 characters"
										bind:value={newPassword}
										required
										disabled={loading}
										class="h-10 pl-9 pr-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20"
									/>
									<button
										type="button"
										onclick={() => showPassword = !showPassword}
										class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
									>
										{#if showPassword}
											<EyeOffIcon class="h-4 h-4" />
										{:else}
											<EyeIcon class="h-4 w-4" />
										{/if}
									</button>
								</div>
							</div>

							<div class="space-y-1.5">
								<Label for="confirmPassword" class="text-sm text-zinc-400">Confirm Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Confirm new password"
									bind:value={confirmPassword}
									required
									disabled={loading}
									class="h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20"
								/>
							</div>

							<Button type="submit" class="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors" disabled={!token || !newPassword || !confirmPassword || !passwordsMatch() || loading}>
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
		</Card.Root>

		<div class="text-center mt-6">
			<button
				type="button"
				onclick={goToLogin}
				class="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
			>
				<ArrowLeftIcon class="h-3.5 w-3.5" />
				Back to Login
			</button>
		</div>
	</div>
</div>