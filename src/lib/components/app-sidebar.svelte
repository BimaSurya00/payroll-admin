<script module>
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
  import WalletIcon from "@lucide/svelte/icons/wallet";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";

  import CalendarOffIcon from "@lucide/svelte/icons/calendar-off";
  import BuildingIcon from "@lucide/svelte/icons/building";

  // Base navigation data - will be filtered based on user role
  const baseNavData = {
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
        superUserOnly: false,
      },
      // Organization Structure (Admin/Super User)
      {
        title: "Organization",
        url: "#",
        icon: BuildingIcon,
        isActive: false,
        superUserOnly: false,
        items: [
          {
            title: "Companies",
            url: "/dashboard/company",
            superUserOnly: true, // Only SUPER_USER can access
          },
          {
            title: "Departments",
            url: "/dashboard/department",
            superUserOnly: false,
          },
          {
            title: "Employees",
            url: "/dashboard/employee",
            superUserOnly: false,
          },
        ],
      },
      // Time Management (Core HR Functions)
      {
        title: "Time Management",
        url: "#",
        icon: CalendarClockIcon,
        isActive: false,
        superUserOnly: false,
        items: [
          {
            title: "Attendance",
            url: "/dashboard/attendance",
            superUserOnly: false,
          },
          {
            title: "Work Schedules",
            url: "/dashboard/schedule",
            superUserOnly: true, // Only SUPER_USER can access
          },
          {
            title: "Leave & Time Off",
            url: "/dashboard/leave",
            superUserOnly: false,
          },
          {
            title: "Overtime",
            url: "/dashboard/overtime",
            superUserOnly: false,
          },
          {
            title: "Holidays",
            url: "/dashboard/holiday",
            superUserOnly: false,
          },
        ],
      },
      // Leave Configuration (Admin Only)
      {
        title: "Leave Config",
        url: "#",
        icon: CalendarOffIcon,
        isActive: false,
        superUserOnly: false,
        items: [
          {
            title: "Leave Types",
            url: "/dashboard/leave/types",
            superUserOnly: false,
          },
        ],
      },
      // Payroll & Compensation
      {
        title: "Payroll",
        url: "#",
        icon: WalletIcon,
        isActive: false,
        superUserOnly: false,
        items: [
          {
            title: "Payroll Management",
            url: "/dashboard/payroll",
            superUserOnly: false,
          },
          {
            title: "My Payslips",
            url: "/dashboard/my-payroll",
            superUserOnly: false,
          },
        ],
      },
      // User Management & Audit (Super User Only)
      {
        title: "Administration",
        url: "#",
        icon: Settings2Icon,
        isActive: false,
        superUserOnly: true, // Only SUPER_USER can access this section
        items: [
          {
            title: "Users",
            url: "/dashboard/user",
            superUserOnly: true,
          },
          {
            title: "Audit Logs",
            url: "/dashboard/audit",
            superUserOnly: true,
          },
        ],
      },
    ],
  };

  /**
   * Filter navigation items based on user role
   * @param {boolean} isSuperUser - Whether current user is SUPER_USER
   * @returns {Object} Filtered navigation data
   */
  export function getNavData(isSuperUser = false) {
    // Filter main navigation items
    const filteredNavMain = baseNavData.navMain
      .filter((item) => {
        // If item is superUserOnly, only show for SUPER_USER
        if (item.superUserOnly && !isSuperUser) {
          return false;
        }
        return true;
      })
      .map((item) => {
        // If item has children, filter them too
        if (item.items && item.items.length > 0) {
          const filteredItems = item.items.filter((subItem) => {
            // If subItem is superUserOnly, only show for SUPER_USER
            if (subItem.superUserOnly && !isSuperUser) {
              return false;
            }
            return true;
          });

          // If no items left after filtering, return null to remove parent
          if (filteredItems.length === 0) {
            return null;
          }

          return {
            ...item,
            items: filteredItems,
          };
        }
        return item;
      })
      .filter(Boolean); // Remove null items

    return {
      user: baseNavData.user,
      navMain: filteredNavMain,
    };
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
