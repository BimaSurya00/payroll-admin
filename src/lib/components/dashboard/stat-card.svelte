<script>
  export let title = "Title";
  export let value = "0";
  export let change = "+0%";
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
  <p class="text-sm font-medium text-muted-foreground">{title}</p>
  <p class="text-2xl font-bold mt-2">{value}</p>
  <p class="text-xs text-green-600 mt-2">{change}</p>
</div>
