<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { formatTime } from "$lib/utils.js";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import UserIcon from "@lucide/svelte/icons/user";
    import MailIcon from "@lucide/svelte/icons/mail";
    import PhoneIcon from "@lucide/svelte/icons/phone";
    import MapPinIcon from "@lucide/svelte/icons/map-pin";
    import WalletIcon from "@lucide/svelte/icons/wallet";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import BriefcaseIcon from "@lucide/svelte/icons/briefcase";
    import BuildingIcon from "@lucide/svelte/icons/building";
    import AwardIcon from "@lucide/svelte/icons/award";
    import UsersIcon from "@lucide/svelte/icons/users";
    import LandMarkIcon from "@lucide/svelte/icons/landmark";
    import CreditCardIcon from "@lucide/svelte/icons/credit-card";
    import HistoryIcon from "@lucide/svelte/icons/history";

    import { employeeStore } from "$lib/stores/employee.store.js";
    import { auditStore } from "$lib/stores/audit.store.js";
    import EmployeeEditDialog from "$lib/components/dashboard/employee-edit-dialog.svelte";

    let id = $derived($page.params.id);
    let storeState = $state({ selected: null, loading: false, error: null });
    let auditState = $state({ logs: [], loading: false, error: null });

    employeeStore.subscribe((state) => {
        storeState = state;
    });

    auditStore.subscribe((state) => {
        auditState = state;
    });

    let employee = $derived(storeState.selected);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    let isForbidden = $derived(
        error?.includes("403") ||
            error?.toLowerCase().includes("forbidden") ||
            error?.toLowerCase().includes("access denied"),
    );

    onMount(async () => {
        if (id) {
            await employeeStore.fetchById(id);
            // Fetch audit logs for this employee
            await auditStore.fetchByResource('employee', id);
        }
    });

    function getActivityIcon(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return '➕';
            case 'UPDATE': return '✏️';
            case 'DELETE': return '🗑️';
            case 'APPROVE': return '✅';
            case 'REJECT': return '❌';
            default: return '📋';
        }
    }

    function getActivityColor(action) {
        switch (action?.toUpperCase()) {
            case 'CREATE': return 'text-green-600 bg-green-50';
            case 'UPDATE': return 'text-blue-600 bg-blue-50';
            case 'DELETE': return 'text-red-600 bg-red-50';
            case 'APPROVE': return 'text-green-600 bg-green-50';
            case 'REJECT': return 'text-orange-600 bg-orange-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    }

    function goBack() {
        goto("/dashboard/employee");
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                await employeeStore.delete(id);
                goto("/dashboard/employee");
            } catch (err) {
                alert("Failed to delete employee: " + err.message);
            }
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function getEmploymentStatusColor(status) {
        switch (status?.toUpperCase()) {
            case 'PERMANENT': return 'text-green-600 bg-green-50';
            case 'CONTRACT': return 'text-blue-600 bg-blue-50';
            case 'PROBATION': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    }

    function getEmploymentStatusLabel(status) {
        switch (status?.toUpperCase()) {
            case 'PERMANENT': return 'Permanent';
            case 'CONTRACT': return 'Contract';
            case 'PROBATION': return 'Probation';
            default: return status || '-';
        }
    }

    function getJobLevelColor(level) {
        switch (level?.toUpperCase()) {
            case 'CEO': return 'text-purple-600 bg-purple-50';
            case 'MANAGER': return 'text-blue-600 bg-blue-50';
            case 'SUPERVISOR': return 'text-teal-600 bg-teal-50';
            case 'STAFF': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    }

    function getJobLevelLabel(level) {
        switch (level?.toUpperCase()) {
            case 'CEO': return 'CEO';
            case 'MANAGER': return 'Manager';
            case 'SUPERVISOR': return 'Supervisor';
            case 'STAFF': return 'Staff';
            default: return level || '-';
        }
    }

    function getGenderLabel(gender) {
        switch (gender?.toUpperCase()) {
            case 'MALE': return 'Male';
            case 'FEMALE': return 'Female';
            default: return gender || '-';
        }
    }
</script>

<svelte:head>
    <title>{employee?.userName || "Employee Detail"} | Dashboard</title>
</svelte:head>

<DashboardHeader title="Employee Detail" subtitle="View employee information" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view this employee."
        />
    {:else if loading}
        <div class="flex items-center justify-center py-16">
            <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
            <span class="ml-2 text-muted-foreground">Loading employee...</span>
        </div>
    {:else if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {:else if employee}
        <!-- Back Button -->
        <div class="flex items-center justify-between">
            <Button variant="outline" onclick={goBack}>
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Employees
            </Button>
            <div class="flex gap-2">
                <EmployeeEditDialog {employee} />
                <Button variant="destructive" onclick={handleDelete}>
                    <TrashIcon class="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>

        <!-- Employee Profile Card -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-4">
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                    >
                        <UserIcon class="h-8 w-8" />
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <Card.Title class="text-2xl">{employee.name}</Card.Title>
                            {#if employee.jobLevel}
                                <span class="px-2 py-0.5 rounded text-xs font-medium {getJobLevelColor(employee.jobLevel)}">
                                    {getJobLevelLabel(employee.jobLevel)}
                                </span>
                            {/if}
                        </div>
                        <Card.Description class="flex items-center gap-2 flex-wrap mt-1">
                            <span>{employee.userEmail}</span>
                            {#if employee.employmentStatus}
                                <span class="px-2 py-0.5 rounded text-xs font-medium {getEmploymentStatusColor(employee.employmentStatus)}">
                                    {getEmploymentStatusLabel(employee.employmentStatus)}
                                </span>
                            {/if}
                        </Card.Description>
                    </div>
                </div>
            </Card.Header>
            <Card.Content class="space-y-6">
                <!-- Employment Details Section -->
                <div class="border-b pb-6">
                    <h3 class="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                        <BriefcaseIcon class="h-4 w-4" />
                        Employment Details
                    </h3>
                    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <AwardIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Position</p>
                                <p class="font-medium">{employee.position || "-"}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <BuildingIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Department</p>
                                <p class="font-medium">
                                    {employee.departmentName || "-"}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <ClockIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Work Schedule</p>
                                {#if employee.schedule}
                                    <p class="font-medium">{employee.schedule.name}</p>
                                    <p class="text-xs text-muted-foreground">
                                        {formatTime(employee.schedule.timeIn)} - {formatTime(employee.schedule.timeOut)}
                                    </p>
                                {:else}
                                    <p class="font-medium text-muted-foreground">No Schedule</p>
                                {/if}
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <CalendarIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Join Date</p>
                                <p class="font-medium">{formatDate(employee.joinDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Personal Information Section -->
                <div class="border-b pb-6">
                    <h3 class="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                        <UsersIcon class="h-4 w-4" />
                        Personal Information
                    </h3>
                    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <MailIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Email</p>
                                <p class="font-medium">{employee.userEmail}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <PhoneIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Phone</p>
                                <p class="font-medium">{employee.phoneNumber || "-"}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <UserIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Gender</p>
                                <p class="font-medium">{getGenderLabel(employee.gender)}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 md:col-span-2 lg:col-span-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <MapPinIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Address</p>
                                <p class="font-medium">{employee.address || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Compensation Section -->
                <div class="border-b pb-6">
                    <h3 class="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                        <WalletIcon class="h-4 w-4" />
                        Compensation
                    </h3>
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <WalletIcon class="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Base Salary</p>
                                <p class="font-medium text-green-600">{formatCurrency(employee.salaryBase)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bank Information Section -->
                <div>
                    <h3 class="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                        <LandMarkIcon class="h-4 w-4" />
                        Bank Information
                    </h3>
                    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <LandMarkIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Bank Name</p>
                                <p class="font-medium">{employee.bankName || "-"}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <CreditCardIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Account Number</p>
                                <p class="font-medium">{employee.bankAccountNumber || "-"}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <UserIcon class="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Account Holder</p>
                                <p class="font-medium">{employee.bankAccountHolder || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Audit History -->
        <Card.Root>
            <Card.Header>
                <Card.Title class="flex items-center gap-2">
                    <HistoryIcon class="h-5 w-5" />
                    Audit History
                </Card.Title>
                <Card.Description>Recent activities and changes for this employee</Card.Description>
            </Card.Header>
            <Card.Content>
                {#if auditState.loading}
                    <div class="flex items-center justify-center py-8">
                        <LoaderIcon class="h-6 w-6 animate-spin text-muted-foreground" />
                        <span class="ml-2 text-muted-foreground">Loading audit logs...</span>
                    </div>
                {:else if auditState.logs?.length > 0}
                    <div class="space-y-3">
                        {#each auditState.logs.slice(0, 10) as log}
                            <div class="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg {getActivityColor(log.action)}">
                                    {getActivityIcon(log.action)}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium">{log.description}</p>
                                    <p class="text-xs text-muted-foreground">
                                        By {log.userName} • {formatDate(log.createdAt || log.timestamp)}
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="text-muted-foreground text-center py-8">No audit history available for this employee</p>
                {/if}
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="text-center py-16">
            <p class="text-muted-foreground">Employee not found</p>
            <Button variant="outline" onclick={goBack} class="mt-4">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Employees
            </Button>
        </div>
    {/if}
</div>
