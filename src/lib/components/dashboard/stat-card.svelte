<script>
  let { title = "Title", value = "0", change = "+0%" } = $props();
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
  <p class="text-sm font-medium text-muted-foreground">{title}</p>
  <p class="text-2xl font-bold mt-2">{value}</p>
  <p class="text-xs text-green-600 mt-2">{change}</p>
</div>
