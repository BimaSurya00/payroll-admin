<script module>
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
  import WalletIcon from "@lucide/svelte/icons/wallet";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";

  import CalendarOffIcon from "@lucide/svelte/icons/calendar-off";
  import BuildingIcon from "@lucide/svelte/icons/building";

  // Admin navigation data - company-scoped features
  const adminNavData = {
    user: {
      name: "Admin",
      email: "admin@example.com",
      avatar: "/avatars/admin.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
        isActive: false,
        items: [],
      },
      {
        title: "Organization",
        url: "#",
        icon: BuildingIcon,
        isActive: false,
        items: [
          {
            title: "Departments",
            url: "/dashboard/department",
          },
          {
            title: "Employees",
            url: "/dashboard/employee",
          },
        ],
      },
      {
        title: "Time Management",
        url: "#",
        icon: CalendarClockIcon,
        isActive: false,
        items: [
          {
            title: "Attendance",
            url: "/dashboard/attendance",
          },
          {
            title: "Work Schedules",
            url: "/dashboard/schedule",
          },
          {
            title: "Leave & Time Off",
            url: "/dashboard/leave",
          },
          {
            title: "Overtime",
            url: "/dashboard/overtime",
          },
          {
            title: "Holidays",
            url: "/dashboard/holiday",
          },
        ],
      },
      {
        title: "Leave Config",
        url: "#",
        icon: CalendarOffIcon,
        isActive: false,
        items: [
          {
            title: "Leave Types",
            url: "/dashboard/leave/types",
          },
        ],
      },
      {
        title: "Payroll",
        url: "#",
        icon: WalletIcon,
        isActive: false,
        items: [
          {
            title: "Payroll Management",
            url: "/dashboard/payroll",
          },
          {
            title: "My Payslips",
            url: "/dashboard/my-payroll",
          },
        ],
      },
    ],
  };

  // Superuser navigation data - multi-company platform management
  const superUserNavData = {
    user: {
      name: "Super User",
      email: "super@platform.com",
      avatar: "/avatars/super.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
        isActive: false,
        items: [],
      },
      {
        title: "Organization",
        url: "#",
        icon: BuildingIcon,
        isActive: false,
        items: [
          {
            title: "Companies",
            url: "/dashboard/company",
          },
        ],
      },
      {
        title: "Administration",
        url: "#",
        icon: Settings2Icon,
        isActive: false,
        items: [
          {
            title: "Users",
            url: "/dashboard/user",
          },
          {
            title: "Audit Logs",
            url: "/dashboard/audit",
          },
        ],
      },
    ],
  };

  /**
   * Get navigation data based on user role
   * @param {boolean} isSuperUser - Whether current user is SUPER_USER
   * @returns {Object} Navigation data
   */
  export function getNavData(isSuperUser = false) {
    return isSuperUser ? superUserNavData : adminNavData;
  }
</script>

<script>
  import NavMain from "./nav-main.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CommandIcon from "@lucide/svelte/icons/command";
  import { authStore } from "$lib/stores/auth.store.js";

  let { ref = $bindable(null), ...restProps } = $props();

  // Subscribe to auth store for user data
  let authState = $state({ user: null });
  authStore.subscribe((state) => {
    authState = state;
  });

  // Check if user is SUPER_USER
  let isSuperUser = $derived(authState.user?.role === "SUPER_USER");

  // Get filtered navigation data based on user role
  let navData = $derived(getNavData(isSuperUser));

  // Use authenticated user or fallback to default
  let currentUser = $derived(authState.user || navData.user);
</script>

<Sidebar.Root bind:ref variant="inset" class="text-white border-r border-white/[0.06] sidebar-gradient" {...restProps}>
  <Sidebar.Header class="relative z-10 pb-5 pt-2">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton 
          size="lg" 
          class="text-white hover:bg-white/[0.06] data-[active=true]:bg-white/10 h-auto py-3"
        >
          {#snippet child({ props })}
            <a href="/dashboard" {...props}>
              <div
                class="bg-primary text-primary-foreground flex aspect-square size-11 items-center justify-center rounded-xl shadow-lg relative overflow-hidden"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <svg class="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-bold text-white text-base tracking-tight">HRIS</span>
                <span class="truncate text-xs text-white/40 font-medium">Enterprise</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content class="relative z-10">
    <NavMain items={navData.navMain} />
  </Sidebar.Content>
  <Sidebar.Footer class="relative z-10 border-t border-white/[0.06] pt-4 mt-auto">
    <NavUser user={currentUser} />
  </Sidebar.Footer>
</Sidebar.Root>
