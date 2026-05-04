<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { ROUTE_NAMES, getRouteLabel } from "$lib/utils/constants.js";
  import { authStore } from "$lib/stores/auth.store.js";

  const superUserOnlyRoutes = [
    '/dashboard/company',
    '/dashboard/user',
    '/dashboard/audit',
  ];

  const adminOnlyRoutes = [
    '/dashboard/department',
    '/dashboard/employee',
    '/dashboard/attendance',
    '/dashboard/schedule',
    '/dashboard/leave',
    '/dashboard/overtime',
    '/dashboard/holiday',
    '/dashboard/payroll',
    '/dashboard/my-payroll',
    '/dashboard/profile',
    '/dashboard/my-attendance',
  ];

  function isSuperUserOnlyRoute(pathname) {
    return superUserOnlyRoutes.some(route => pathname.startsWith(route));
  }

  function isAdminOnlyRoute(pathname) {
    return adminOnlyRoutes.some(route => pathname.startsWith(route));
  }

  let authState = $state({ user: null });
  authStore.subscribe((state) => {
    authState = state;
  });

  let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');

  $effect(() => {
    if (!isSuperUser && isSuperUserOnlyRoute($page.url.pathname)) {
      goto('/dashboard');
    }
    if (isSuperUser && isAdminOnlyRoute($page.url.pathname)) {
      goto('/dashboard');
    }
  });

  function getBreadcrumbs(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += "/" + segment;

      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        continue;
      }

      const name = getRouteLabel(segment);
      const isLast = i === segments.length - 1;

      breadcrumbs.push({
        name,
        href: currentPath,
        isLast,
      });
    }

    return breadcrumbs;
  }

  let breadcrumbs = $derived(getBreadcrumbs($page.url.pathname));
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="bg-slate-950 min-h-screen relative">
    <!-- Background Glow -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
    
    <header class="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 px-6">
      <Sidebar.Trigger class="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors h-9 w-9" />
      <Separator orientation="vertical" class="h-5 bg-slate-700" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          {#each breadcrumbs as crumb, i (crumb.href)}
            {#if crumb.isLast}
              <Breadcrumb.Item>
                <Breadcrumb.Page class="font-semibold text-white text-sm">{crumb.name}</Breadcrumb.Page>
              </Breadcrumb.Item>
            {:else}
              <Breadcrumb.Item class="hidden md:block">
                <Breadcrumb.Link href={crumb.href} class="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                  {crumb.name}
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator class="hidden md:block text-slate-600" />
            {/if}
          {/each}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>
    <main class="flex-1 p-6 relative z-10">
      <slot />
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
