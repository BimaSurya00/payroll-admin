<script>
    import { cn } from "$lib/utils.js";

    let { class: className, children, ...restProps } = $props();
</script>

<td
    class={cn(
        "px-4 py-3.5 align-middle [&:has([role=checkbox])]:pe-0",
        className
    )}
    {...restProps}
>
    {@render children?.()}
</td>
