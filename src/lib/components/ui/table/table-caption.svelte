<script>
    import { cn } from "$lib/utils.js";

    let { class: className, children, ...restProps } = $props();
</script>

<caption
    class={cn("mt-4 text-sm text-muted-foreground", className)}
    {...restProps}
>
    {@render children?.()}
</caption>
