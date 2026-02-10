<script>
  import { page } from "$app/stores";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  // Map route segments to readable names
  const routeNames = {
    dashboard: "Dashboard",
    user: "User Management",
    employee: "Employee Management",
    schedule: "Schedule Management",
    attendance: "Attendance",
    payroll: "Payroll",
    settings: "Settings",
    profile: "Profile",
    analytics: "Analytics",
  };

  // Generate breadcrumb items from current path
  function getBreadcrumbs(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += "/" + segment;

      const name =
        routeNames[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
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
