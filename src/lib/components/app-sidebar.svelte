<script module>
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
  import WalletIcon from "@lucide/svelte/icons/wallet";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import CalendarOffIcon from "@lucide/svelte/icons/calendar-off";
  import BuildingIcon from "@lucide/svelte/icons/building";

  const adminNavData = {
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
          { title: "Departments", url: "/dashboard/department" },
          { title: "Employees", url: "/dashboard/employee" },
        ],
      },
      {
        title: "Time Management",
        url: "#",
        icon: CalendarClockIcon,
        isActive: false,
        items: [
          { title: "Attendance", url: "/dashboard/attendance" },
          { title: "Work Schedules", url: "/dashboard/schedule" },
          { title: "Leave & Time Off", url: "/dashboard/leave" },
          { title: "Overtime", url: "/dashboard/overtime" },
          { title: "Holidays", url: "/dashboard/holiday" },
        ],
      },
      {
        title: "Leave Config",
        url: "#",
        icon: CalendarOffIcon,
        isActive: false,
        items: [
          { title: "Leave Types", url: "/dashboard/leave/types" },
        ],
      },
      {
        title: "Payroll",
        url: "#",
        icon: WalletIcon,
        isActive: false,
        items: [
          { title: "Payroll Management", url: "/dashboard/payroll" },
          { title: "My Payslips", url: "/dashboard/my-payroll" },
        ],
      },
    ],
  };

  const superUserNavData = {
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
          { title: "Companies", url: "/dashboard/company" },
        ],
      },
      {
        title: "Administration",
        url: "#",
        icon: Settings2Icon,
        isActive: false,
        items: [
          { title: "Users", url: "/dashboard/user" },
          { title: "Audit Logs", url: "/dashboard/audit" },
        ],
      },
    ],
  };

  export function getNavData(isSuperUser = false) {
    return isSuperUser ? superUserNavData : adminNavData;
  }
</script>

<script>
  import NavMain from "./nav-main.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { authStore } from "$lib/stores/auth.store.js";

  let { ref = $bindable(null), ...restProps } = $props();

  let authState = $state({ user: null });
  authStore.subscribe((state) => {
    authState = state;
  });

  let isSuperUser = $derived(authState.user?.role === "SUPER_USER");
  let navData = $derived(getNavData(isSuperUser));
  let currentUser = $derived(authState.user || { name: "User", email: "" });
</script>

<Sidebar.Root bind:ref variant="sidebar" class="bg-[#f1f5f9] border-r border-[#cbd5e1] text-[#0f172a]" {...restProps}>
  <Sidebar.Header class="px-5 py-6 border-b border-[#cbd5e1]">
    <a href="/dashboard" class="flex items-center gap-3">
      <div class="bg-[#2563eb] text-white flex h-10 w-10 items-center justify-center shadow-sm">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div class="flex flex-col">
        <span class="text-base font-bold text-[#0f172a] tracking-tight leading-none">HRIS</span>
        <span class="text-[11px] text-[#64748b] font-medium leading-tight mt-1">Enterprise</span>
      </div>
    </a>
  </Sidebar.Header>
  
  <Sidebar.Content class="px-3 py-4">
    <NavMain items={navData.navMain} />
  </Sidebar.Content>
  
  <Sidebar.Footer class="border-t border-[#cbd5e1] p-4 mt-auto bg-[#e2e8f0]">
    <NavUser user={currentUser} />
  </Sidebar.Footer>
</Sidebar.Root>
