<script>
	import { goto } from "$app/navigation"; import { onMount } from "svelte"; import * as Card from "$lib/components/ui/card/index.js"; import { Button } from "$lib/components/ui/button/index.js"; import { Input } from "$lib/components/ui/input/index.js"; import { Label } from "$lib/components/ui/label/index.js"; import LoaderIcon from "@lucide/svelte/icons/loader"; import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left"; import MailIcon from "@lucide/svelte/icons/mail"; import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
	import { authService } from "$lib/api/services/auth.service.js"; import { toast } from "svelte-sonner";

	let email = $state(""), loading = $state(false), success = $state(false);
	onMount(() => { if (localStorage.getItem("token")) goto("/dashboard", { replaceState: true }); });
	async function handleSubmit(e) { e.preventDefault(); if (!email) return; loading = true; try { await authService.forgotPassword(email); success = true; toast.success("Reset link sent."); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { loading = false; } }
	async function handleResend() { loading = true; try { await authService.forgotPassword(email); toast.success("Reset link resent."); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { loading = false; } }
	function goToLogin() { window.location.replace("/auth/login"); }
</script>

<svelte:head><title>Forgot Password | HRIS</title></svelte:head>

<div class="flex min-h-[100dvh] items-center justify-center p-4 auth-bg">
	<div class="w-full max-w-[420px]">
		<div class="text-center mb-8">
			<div class="flex items-center justify-center mb-6"><div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/15"><svg class="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div></div>
			<h1 class="text-2xl font-bold text-foreground tracking-tight">Forgot password</h1>
			<p class="text-muted-foreground text-sm mt-1.5">We'll send you a reset link</p>
		</div>
		<Card.Root class="surface-elevated"><Card.Content class="p-6 sm:p-8">
			{#if success}
				<div class="space-y-6"><div class="text-center py-3"><div class="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4"><CheckCircleIcon class="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div><p class="text-sm font-semibold text-foreground">Check your email</p><p class="text-sm text-muted-foreground mt-1">If an account exists for <span class="text-foreground font-medium">{email}</span>, we've sent a reset link.</p></div>
				<div class="flex flex-col gap-2.5"><Button onclick={handleResend} variant="outline" class="w-full h-11 border-border bg-card text-foreground hover:bg-accent rounded-xl" disabled={loading}>{#if loading}<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />Sending...{:else}Resend Link{/if}</Button><Button variant="ghost" onclick={goToLogin} class="w-full h-11 text-muted-foreground hover:text-foreground rounded-xl">Back to Login</Button></div></div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-5">
					<div class="space-y-2"><Label for="email" class="text-sm font-medium text-foreground">Email</Label><div class="relative"><MailIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="Enter your email" bind:value={email} required disabled={loading} class="h-11 pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" /></div></div>
					<Button type="submit" class="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/15" disabled={!email||loading}>{#if loading}<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />Processing...{:else}Send Reset Link{/if}</Button>
				</form>
			{/if}
		</Card.Content></Card.Root>
		<div class="text-center mt-8"><button type="button" onclick={goToLogin} class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"><ArrowLeftIcon class="h-4 w-4" />Back to Login</button></div>
	</div>
</div>