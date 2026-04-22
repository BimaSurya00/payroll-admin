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

<Sidebar.Root bind:ref variant="inset" class="text-white" {...restProps}>
  <Sidebar.Header class="relative z-10">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton 
          size="lg" 
          class="text-white hover:bg-white/10 data-[active=true]:bg-white/20"
        >
          {#snippet child({ props })}
            <a href="##" {...props}>
              <div
                class="bg-white/20 backdrop-blur-sm border border-white/30 text-white flex aspect-square size-10 items-center justify-center rounded-xl shadow-lg"
              >
                <span class="text-lg font-bold">H</span>
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-bold text-white text-base">HRIS</span>
                <span class="truncate text-xs text-white/60">Enterprise</span>
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
  <Sidebar.Footer class="relative z-10">
    <NavUser user={currentUser} />
  </Sidebar.Footer>
</Sidebar.Root>
