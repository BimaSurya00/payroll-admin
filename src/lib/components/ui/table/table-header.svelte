<script>
    import { cn } from "$lib/utils.js";

    let { class: className, children, ...restProps } = $props();
</script>

<thead class={cn("bg-muted/40 border-b", className)} {...restProps}>
    {@render children?.()}
</thead>
