<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { ROUTE_NAMES, getRouteLabel } from "$lib/utils/constants.js";
  import { authStore } from "$lib/stores/auth.store.js";

  // SUPER_USER only routes - these should not be accessible by ADMIN
  const superUserOnlyRoutes = [
    '/dashboard/company',
    '/dashboard/schedule',
    '/dashboard/user',
    '/dashboard/audit',
  ];

  // Check if current path is a SUPER_USER only route
  function isSuperUserOnlyRoute(pathname) {
    return superUserOnlyRoutes.some(route => pathname.startsWith(route));
  }

  // Subscribe to auth store
  let authState = $state({ user: null });
  authStore.subscribe((state) => {
    authState = state;
  });

  // Check if user is SUPER_USER
  let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');

  // Redirect if ADMIN tries to access SUPER_USER only routes
  $effect(() => {
    if (!isSuperUser && isSuperUserOnlyRoute($page.url.pathname)) {
      goto('/dashboard');
    }
  });

  // Generate breadcrumb items from current path
  function getBreadcrumbs(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += "/" + segment;

      // Skip UUID-like segments (detail pages)
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
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2">
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger class="-ms-1" />
        <Separator
          orientation="vertical"
          class="me-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb.Root>
          <Breadcrumb.List>
            {#each breadcrumbs as crumb, i (crumb.href)}
              {#if crumb.isLast}
                <Breadcrumb.Item>
                  <Breadcrumb.Page>{crumb.name}</Breadcrumb.Page>
                </Breadcrumb.Item>
              {:else}
                <Breadcrumb.Item class="hidden md:block">
                  <Breadcrumb.Link href={crumb.href}
                    >{crumb.name}</Breadcrumb.Link
                  >
                </Breadcrumb.Item>
                <Breadcrumb.Separator class="hidden md:block" />
              {/if}
            {/each}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </header>
    <slot />
  </Sidebar.Inset>
</Sidebar.Provider>
