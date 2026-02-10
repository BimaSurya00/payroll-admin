<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(async () => {
        if (browser) {
            await goto("auth/login");
        }
    });
</script>
