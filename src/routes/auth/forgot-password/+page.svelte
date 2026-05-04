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
	import KeyRoundIcon from "@lucide/svelte/icons/key-round";
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
			toast.success("If an account exists, a reset link has been sent to your email.");
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
	<!-- Subtle Background Pattern -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute inset-0 bg-grid opacity-30"></div>
		<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
		<div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-chart-2/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
	</div>

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
				<Card.Title class="text-2xl font-semibold text-foreground">Forgot Password</Card.Title>
				<Card.Description class="text-sm text-muted-foreground">
					We'll send you a password reset link
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4 pb-8">
			{#if success}
				<div class="space-y-5">
					<div class="rounded-lg border border-success/20 bg-success/5 p-5 text-center">
						<div class="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
							<CheckCircleIcon class="h-6 w-6 text-success" />
						</div>
						<p class="text-sm font-semibold text-foreground">Check your email</p>
						<p class="text-xs text-muted-foreground mt-1.5">
							If an account exists for <span class="font-medium text-foreground">{email}</span>,
							we've sent a password reset link to your inbox.
						</p>
					</div>
					<p class="text-xs text-muted-foreground text-center">
						Didn't receive the email? Check your spam folder.
					</p>
					<div class="flex flex-col gap-2">
						<Button onclick={handleResend} variant="outline" class="w-full h-10" disabled={loading}>
							{#if loading}
								<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
								Sending...
							{:else}
								Resend Reset Link
							{/if}
						</Button>
						<Button variant="ghost" onclick={goToLogin} class="w-full h-10">
							Back to Login
						</Button>
					</div>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-1.5">
						<Label for="email" class="text-sm font-medium text-foreground">Email Address</Label>
						<div class="relative">
							<MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								bind:value={email}
								required
								disabled={loading}
								class="h-11 pl-10 bg-background border-input focus-visible:ring-primary/30 focus-visible:ring-2"
							/>
						</div>
					</div>

					<Button type="submit" class="w-full h-11 text-sm font-semibold" disabled={!email || loading}>
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
				class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeftIcon class="h-4 w-4" />
				Back to Login
			</button>
		</Card.Footer>
	</Card.Root>
</div>
