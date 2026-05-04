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
	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		<div class="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-float"></div>
		<div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] animate-float" style="animation-delay: 2s;"></div>
		<div class="absolute inset-0 bg-grid opacity-30"></div>
	</div>

	<Card.Root class="w-full max-w-[420px] glass-card shadow-2xl relative z-10 border-0">
		<div class="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
		
		<Card.Header class="space-y-6 pt-8 pb-6">
			<div class="flex items-center justify-center">
				<div class="w-16 h-16 bg-cyan-500 flex items-center justify-center rounded-2xl shadow-lg shadow-cyan-500/25">
					<svg class="w-8 h-8 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
						<polyline points="9 22 9 12 15 12 15 22"/>
					</svg>
				</div>
			</div>
			<div class="text-center space-y-2">
				<Card.Title class="text-2xl font-bold text-white tracking-tight">Reset Password</Card.Title>
				<Card.Description class="text-slate-400 text-sm">
					Create a new password for your account
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4 pb-8">
			{#if success}
				<div class="space-y-5 text-center py-2">
					<div class="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
						<CheckCircleIcon class="h-7 w-7 text-emerald-400" />
					</div>
					<div class="space-y-1">
						<h3 class="text-lg font-semibold text-white">Password Reset!</h3>
						<p class="text-sm text-slate-400">Your password has been changed successfully. You can now login with your new password.</p>
					</div>
					<Button onclick={goToLogin} class="w-full h-11 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25 mt-2">
						Go to Login
					</Button>
				</div>
			{:else}
				{#if !token}
					<div class="text-center py-6">
						<p class="text-sm text-slate-400">Invalid or missing reset token.</p>
						<Button variant="outline" onclick={goToLogin} class="mt-4 h-11 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">Back to Login</Button>
					</div>
				{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-1.5">
						<Label for="newPassword" class="text-sm font-medium text-slate-300">New Password</Label>
						<div class="relative group">
							<LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
							<Input
								id="newPassword"
								type={showPassword ? "text" : "password"}
								placeholder="Minimum 8 characters"
								bind:value={newPassword}
								required
								disabled={loading}
								class="h-11 pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
						<Label for="confirmPassword" class="text-sm font-medium text-slate-300">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm new password"
							bind:value={confirmPassword}
							required
							disabled={loading}
							class="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
						/>
					</div>

					<Button type="submit" class="w-full h-11 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25" disabled={!token || !newPassword || !confirmPassword || !passwordsMatch() || loading}>
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
				class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors"
			>
				<ArrowLeftIcon class="h-4 w-4" />
				Back to Login
			</button>
		</Card.Footer>
	</Card.Root>
</div>
