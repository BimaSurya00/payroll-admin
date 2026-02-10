<script>
  import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
  import StatCard from "$lib/components/dashboard/stat-card.svelte";
</script>

<DashboardHeader title="Dashboard" subtitle="Welcome back!" />
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  <div class="grid auto-rows-min gap-4 md:grid-cols-3">
    <StatCard title="Total Revenue" value="$12,345" change="+5%" />
    <StatCard title="Total Users" value="1,234" change="+12%" />
    <StatCard title="Conversion" value="3.5%" change="-2%" />
  </div>
</div>
