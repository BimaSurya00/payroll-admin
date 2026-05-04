<script>
	import { goto } from "$app/navigation"; import { page } from "$app/stores"; import { onMount } from "svelte"; import * as Card from "$lib/components/ui/card/index.js"; import { Button } from "$lib/components/ui/button/index.js"; import { Input } from "$lib/components/ui/input/index.js"; import { Label } from "$lib/components/ui/label/index.js"; import LoaderIcon from "@lucide/svelte/icons/loader"; import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left"; import LockIcon from "@lucide/svelte/icons/lock"; import EyeIcon from "@lucide/svelte/icons/eye"; import EyeOffIcon from "@lucide/svelte/icons/eye-off"; import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
	import { authService } from "$lib/api/services/auth.service.js"; import { toast } from "svelte-sonner";

	let token = $state(""), newPassword = $state(""), confirmPassword = $state(""), showPassword = $state(false), loading = $state(false), success = $state(false);
	let tokenFromUrl = $derived($page.url.searchParams.get("token") || "");
	onMount(() => { if (tokenFromUrl) token = tokenFromUrl; });
	function passwordsMatch() { return newPassword && confirmPassword && newPassword === confirmPassword; }
	async function handleSubmit(e) {
		e.preventDefault();
		if (!token) { toast.error("Reset token required"); return; }
		if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
		if (!passwordsMatch()) { toast.error("Passwords do not match"); return; }
		loading = true; try { await authService.resetPassword(token, newPassword); success = true; toast.success("Password reset"); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { loading = false; }
	}
	function goToLogin() { goto("/auth/login"); }
</script>

<svelte:head><title>Reset Password | HRIS</title></svelte:head>

<div class="flex min-h-[100dvh] items-center justify-center p-4 auth-bg">
	<div class="w-full max-w-[420px]">
		<div class="text-center mb-8">
			<div class="flex items-center justify-center mb-6"><div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/15"><svg class="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div></div>
			<h1 class="text-2xl font-bold text-foreground tracking-tight">Reset password</h1>
			<p class="text-muted-foreground text-sm mt-1.5">Create a new password</p>
		</div>
		<Card.Root class="surface-elevated"><Card.Content class="p-6 sm:p-8">
			{#if success}
				<div class="space-y-6 text-center py-4"><div class="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><CheckCircleIcon class="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div><div class="space-y-1.5"><h3 class="text-lg font-semibold text-foreground">Password reset</h3><p class="text-sm text-muted-foreground">You can now sign in with your new password.</p></div><Button onclick={goToLogin} class="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/15 mt-2">Go to Login</Button></div>
			{:else}{#if !token}
				<div class="text-center py-8"><p class="text-sm text-muted-foreground">Invalid or missing reset token.</p><Button variant="outline" onclick={goToLogin} class="mt-4 h-11 border-border bg-card text-foreground hover:bg-accent rounded-xl">Back to Login</Button></div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-5">
					<div class="space-y-2"><Label for="newPassword" class="text-sm font-medium text-foreground">New Password</Label><div class="relative"><LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="newPassword" type={showPassword?"text":"password"} placeholder="Minimum 8 characters" bind:value={newPassword} required disabled={loading} class="h-11 pl-9 pr-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" /><button type="button" onclick={()=>showPassword=!showPassword} class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{#if showPassword}<EyeOffIcon class="w-4 h-4" />{:else}<EyeIcon class="w-4 h-4" />{/if}</button></div></div>
					<div class="space-y-2"><Label for="confirmPassword" class="text-sm font-medium text-foreground">Confirm Password</Label><Input id="confirmPassword" type="password" placeholder="Confirm new password" bind:value={confirmPassword} required disabled={loading} class="h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" /></div>
					<Button type="submit" class="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/15" disabled={!token||!newPassword||!confirmPassword||!passwordsMatch()||loading}>{#if loading}<LoaderIcon class="h-4 w-4 mr-2 animate-spin" />Resetting...{:else}Reset Password{/if}</Button>
				</form>
			{/if}{/if}
		</Card.Content></Card.Root>
		<div class="text-center mt-8"><button type="button" onclick={goToLogin} class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"><ArrowLeftIcon class="h-4 w-4" />Back to Login</button></div>
	</div>
</div>