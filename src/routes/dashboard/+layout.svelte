<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { getRouteLabel } from "$lib/utils/constants.js";
  import { authStore } from "$lib/stores/auth.store.js";

  const superUserOnlyRoutes = ['/dashboard/company','/dashboard/user','/dashboard/audit'];
  const adminOnlyRoutes = ['/dashboard/department','/dashboard/employee','/dashboard/attendance','/dashboard/schedule','/dashboard/leave','/dashboard/overtime','/dashboard/holiday','/dashboard/payroll','/dashboard/my-payroll','/dashboard/profile','/dashboard/my-attendance'];

  function isSuperUserOnlyRoute(p) { return superUserOnlyRoutes.some(r => p.startsWith(r)); }
  function isAdminOnlyRoute(p) { return adminOnlyRoutes.some(r => p.startsWith(r)); }

  let authState = $state({ user: null });
  authStore.subscribe((s) => { authState = s; });
  let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');

  $effect(() => { if (!isSuperUser && isSuperUserOnlyRoute($page.url.pathname)) goto('/dashboard'); if (isSuperUser && isAdminOnlyRoute($page.url.pathname)) goto('/dashboard'); });

  function getBreadcrumbs(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = []; let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]; currentPath += "/" + segment;
      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) continue;
      const name = getRouteLabel(segment); const isLast = i === segments.length - 1;
      breadcrumbs.push({ name, href: currentPath, isLast });
    }
    return breadcrumbs;
  }
  let breadcrumbs = $derived(getBreadcrumbs($page.url.pathname));
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="bg-background min-h-screen">
    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card sticky top-0 z-30 px-6">
      <Sidebar.Trigger class="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors h-8 w-8" />
      <Separator orientation="vertical" class="h-4 bg-border" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          {#each breadcrumbs as crumb (crumb.href)}
            {#if crumb.isLast}
              <Breadcrumb.Item><Breadcrumb.Page class="font-medium text-foreground text-sm">{crumb.name}</Breadcrumb.Page></Breadcrumb.Item>
            {:else}
              <Breadcrumb.Item class="hidden md:block">
                <Breadcrumb.Link href={crumb.href} class="text-muted-foreground hover:text-foreground transition-colors text-sm">{crumb.name}</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator class="hidden md:block text-muted-foreground/30" />
            {/if}
          {/each}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>
    <main class="flex-1 p-6 lg:p-8">
      <slot />
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>