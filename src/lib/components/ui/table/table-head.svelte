<script>
    import { cn } from "$lib/utils.js";

    let { class: className, children, ...restProps } = $props();
</script>

<th
    class={cn(
        "h-11 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-widest text-muted-foreground [&:has([role=checkbox])]:pe-0",
        className
    )}
    {...restProps}
>
    {@render children?.()}
</th>
