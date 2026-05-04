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
  <Sidebar.Inset class="bg-[#09090b] min-h-screen">
    <header class="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 px-5">
      <Sidebar.Trigger class="text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-md transition-colors h-7 w-7" />
      <Separator orientation="vertical" class="h-4 bg-zinc-800" />
      <Breadcrumb.Root>
        <Breadcrumb.List>
          {#each breadcrumbs as crumb, i (crumb.href)}
            {#if crumb.isLast}
              <Breadcrumb.Item>
                <Breadcrumb.Page class="font-medium text-zinc-200 text-[13px]">{crumb.name}</Breadcrumb.Page>
              </Breadcrumb.Item>
            {:else}
              <Breadcrumb.Item class="hidden md:block">
                <Breadcrumb.Link href={crumb.href} class="text-zinc-500 hover:text-zinc-300 transition-colors text-[13px]">
                  {crumb.name}
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator class="hidden md:block text-zinc-700" />
            {/if}
          {/each}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>
    <main class="flex-1 p-6">
      <slot />
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>