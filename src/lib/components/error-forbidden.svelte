<script>
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button/index.js";
    import ShieldOffIcon from "@lucide/svelte/icons/shield-off";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import LogOutIcon from "@lucide/svelte/icons/log-out";

    import { authStore } from "$lib/stores/auth.store.js";

    let {
        title = "Access Denied",
        message = "You don't have permission to access this resource.",
        showLogout = true,
        showBack = true,
    } = $props();

    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            goto("/dashboard");
        }
    }

    async function handleLogout() {
        await authStore.logout();
        goto("/auth/login");
    }
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] p-8">
    <div class="flex flex-col items-center text-center max-w-md">
        <!-- Icon -->
        <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6"
        >
            <ShieldOffIcon class="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-bold text-foreground mb-2">
            {title}
        </h1>

        <!-- Message -->
        <p class="text-muted-foreground mb-6">
            {message}
        </p>

        <!-- Error Code Badge -->
        <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-medium mb-8"
        >
            <span>Error 403</span>
            <span class="text-red-500">•</span>
            <span>Forbidden</span>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
            {#if showBack}
                <Button variant="outline" onclick={goBack}>
                    <ArrowLeftIcon class="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            {/if}
            {#if showLogout}
                <Button variant="destructive" onclick={handleLogout}>
                    <LogOutIcon class="h-4 w-4 mr-2" />
                    Logout & Login Again
                </Button>
            {/if}
        </div>

        <!-- Help Text -->
        <p class="text-xs text-muted-foreground mt-8">
            If you believe this is an error, please contact your administrator.
        </p>
    </div>
</div>
