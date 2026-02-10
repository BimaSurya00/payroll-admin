<script module>
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import UsersIcon from "@lucide/svelte/icons/users";
  import BriefcaseIcon from "@lucide/svelte/icons/briefcase";
  import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
  import WalletIcon from "@lucide/svelte/icons/wallet";
  import ClipboardCheckIcon from "@lucide/svelte/icons/clipboard-check";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
  import SendIcon from "@lucide/svelte/icons/send";
  import CalendarOffIcon from "@lucide/svelte/icons/calendar-off";
  import ClockIcon from "@lucide/svelte/icons/clock";

  const data = {
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
        title: "User Management",
        url: "/dashboard/user",
        icon: UsersIcon,
        isActive: false,
        items: [
          {
            title: "User List",
            url: "/dashboard/user",
          },
        ],
      },
      {
        title: "Employee Management",
        url: "/dashboard/employee",
        icon: BriefcaseIcon,
        isActive: false,
        items: [
          {
            title: "Employee List",
            url: "/dashboard/employee",
          },
        ],
      },
      {
        title: "Schedule Management",
        url: "/dashboard/schedule",
        icon: CalendarClockIcon,
        isActive: false,
        items: [
          {
            title: "Work Schedules",
            url: "/dashboard/schedule",
          },
        ],
      },
      {
        title: "Attendance",
        url: "/dashboard/attendance",
        icon: ClipboardCheckIcon,
        isActive: true,
        items: [
          {
            title: "Attendance Log",
            url: "/dashboard/attendance",
          },
        ],
      },
      {
        title: "Leave Management",
        url: "/dashboard/leave",
        icon: CalendarOffIcon,
        isActive: false,
        items: [
          {
            title: "Leave Requests",
            url: "/dashboard/leave",
          },
        ],
      },
      {
        title: "Overtime",
        url: "/dashboard/overtime",
        icon: ClockIcon,
        isActive: false,
        items: [
          {
            title: "Overtime Requests",
            url: "/dashboard/overtime",
          },
        ],
      },
      {
        title: "Payroll",
        url: "/dashboard/payroll",
        icon: WalletIcon,
        isActive: false,
        items: [
          {
            title: "Payroll List",
            url: "/dashboard/payroll",
          },
        ],
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2Icon,
        isActive: false,
        items: [
          {
            title: "General",
            url: "/dashboard/settings",
          },
          {
            title: "Profile",
            url: "/dashboard/profile",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoyIcon,
      },
      {
        title: "Feedback",
        url: "#",
        icon: SendIcon,
      },
    ],
    projects: [],
  };
</script>

<script>
  import NavMain from "./nav-main.svelte";
  import NavProjects from "./nav-projects.svelte";
  import NavSecondary from "./nav-secondary.svelte";
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

  // Use authenticated user or fallback to default
  let currentUser = $derived(authState.user || data.user);
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="##" {...props}>
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <CommandIcon class="size-4" />
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-medium">Hris</span>
                <span class="truncate text-xs">Enterprise</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} />
    <NavProjects projects={data.projects} />
    <NavSecondary items={data.navSecondary} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser user={currentUser} />
  </Sidebar.Footer>
</Sidebar.Root>
