<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import MailIcon from "@lucide/svelte/icons/mail";
	import CheckCircleIcon from "@lucide/svelte/icons/check-circle";

	import { authService } from "$lib/api/services/auth.service.js";
	import { toast } from "svelte-sonner";

	let email = $state("");
	let loading = $state(false);
	let success = $state(false);

	onMount(() => {
		if (localStorage.getItem("token")) {
			goto("/dashboard", { replaceState: true });
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();
		if (!email) return;

		loading = true;
		try {
			await authService.forgotPassword(email);
			success = true;
			toast.success("If an account exists, a reset link has been sent.");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to process request");
		} finally {
			loading = false;
		}
	}

	async function handleResend() {
		loading = true;
		try {
			await authService.forgotPassword(email);
			toast.success("Reset link resent successfully.");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to resend");
		} finally {
			loading = false;
		}
	}

	function goToLogin() {
		window.location.replace("/auth/login");
	}
</script>

<svelte:head>
	<title>Forgot Password | HRIS Enterprise</title>
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
				<Card.Title class="text-2xl font-bold text-white tracking-tight">Forgot Password</Card.Title>
				<Card.Description class="text-slate-400 text-sm">
					We'll send you a reset link
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4 pb-8">
			{#if success}
				<div class="space-y-5">
					<div class="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
						<div class="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
							<CheckCircleIcon class="h-6 w-6 text-emerald-400" />
						</div>
						<p class="text-sm font-semibold text-white">Check your email</p>
						<p class="text-xs text-slate-400 mt-1">
							If an account exists for <span class="text-white font-medium">{email}</span>, we've sent a reset link.
						</p>
					</div>
					<div class="flex flex-col gap-2">
						<Button onclick={handleResend} variant="outline" class="w-full h-11 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl" disabled={loading}>
							{#if loading}
								<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
								Sending...
							{:else}
								Resend Link
							{/if}
						</Button>
						<Button variant="ghost" onclick={goToLogin} class="w-full h-11 text-slate-400 hover:text-white rounded-xl">
							Back to Login
						</Button>
					</div>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-1.5">
						<Label for="email" class="text-sm font-medium text-slate-300">Email Address</Label>
						<div class="relative group">
							<MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								bind:value={email}
								required
								disabled={loading}
								class="h-11 pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
							/>
						</div>
					</div>

					<Button type="submit" class="w-full h-11 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25" disabled={!email || loading}>
						{#if loading}
							<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
							Processing...
						{:else}
							Send Reset Link
						{/if}
					</Button>
				</form>
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
