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
	<title>Forgot Password | SaaS Payroll</title>
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
				<KeyRoundIcon class="w-8 h-8 text-white relative z-10" />
			</div>
			<div class="text-center space-y-1">
				<Card.Title class="text-3xl font-bold gradient-text">Forgot Password</Card.Title>
				<Card.Description class="text-muted-foreground">
					We'll send you a password reset link
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4">
			{#if success}
				<div class="space-y-4">
					<div class="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
						<MailIcon class="h-10 w-10 text-success mx-auto mb-3" />
						<p class="text-sm font-medium text-success">Check your email</p>
						<p class="text-xs text-muted-foreground mt-2">
							If an account exists for <span class="font-medium text-foreground">{email}</span>,
							we've sent a password reset link to your inbox.
						</p>
					</div>
					<p class="text-xs text-muted-foreground text-center">
						Didn't receive the email? Check your spam folder.
					</p>
					<div class="flex flex-col gap-2">
						<Button onclick={handleResend} variant="outline" class="w-full" disabled={loading}>
							{#if loading}
								<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
								Sending...
							{:else}
								Resend Reset Link
							{/if}
						</Button>
						<Button variant="outline" onclick={goToLogin} class="w-full">
							Back to Login
						</Button>
					</div>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<div class="relative">
							<MailIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								bind:value={email}
								required
								disabled={loading}
								class="pl-10"
							/>
						</div>
					</div>

					<Button type="submit" class="w-full" disabled={!email || loading}>
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
