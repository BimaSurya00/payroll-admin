<script>
    import { cn } from "$lib/utils.js";

    let { class: className, children, ...restProps } = $props();
</script>

<td
    class={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
    )}
    {...restProps}
>
    {@render children?.()}
</td>
