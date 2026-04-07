<script>
    export const ssr = false;
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import EmptyState from "$lib/components/shared/empty-state.svelte";
    import Alert from "$lib/components/shared/alert.svelte";
    import LoadingTable from "$lib/components/shared/loading-table.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import UsersIcon from "@lucide/svelte/icons/users";
    import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
    import UserPlusIcon from "@lucide/svelte/icons/user-plus";
    import CalendarIcon from "@lucide/svelte/icons/calendar";

    import { employeeStore } from "$lib/stores/employee.store.js";
    import EmployeeCreateDialog from "$lib/components/dashboard/employee-create-dialog.svelte";
    import EmployeeEditDialog from "$lib/components/dashboard/employee-edit-dialog.svelte";
    import { formatCurrency, formatDate } from "$lib/utils/format.js";
    import { getStatusColor } from "$lib/utils/colors.js";

    let storeState = $state({ data: [], loading: false, error: null });

    employeeStore.subscribe((state) => {
        storeState = state;
    });

    let employees = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    onMount(async () => {
        try {
            await employeeStore.fetchAll();
        } catch (err) {
            console.error("Failed to fetch employees:", err.message);
        }
    });

    async function handleRefresh() {
        await employeeStore.fetchAll();
    }

    async function handleDelete(id) {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                await employeeStore.delete(id);
            } catch (err) {
                alert("Failed to delete employee: " + err.message);
            }
        }
    }

    let totalSalary = $derived(
        employees.reduce((sum, emp) => sum + (emp.salaryBase || 0), 0)
    );
    let avgSalary = $derived(
        employees.length > 0 ? totalSalary / employees.length : 0
    );
    let newThisYear = $derived(
        employees.filter((e) => new Date(e.joinDate).getFullYear() >= 2024).length
    );
</script>

<svelte:head>
    <title>Employee Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Employee Management"
    subtitle="Manage all employees in the system"
/>

<div class="flex flex-1 flex-col gap-6 p-4 pt-0">
    {#if error}
        <Alert 
            variant="error" 
            message={error}
            dismissible
            onDismiss={() => employeeStore.clearError?.()}
        />
    {/if}

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-4">
        <Card.Root>
            <Card.Content class="p-6">
                <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <UsersIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">Total Employees</p>
                        <p class="text-2xl font-bold">{employees.length}</p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Content class="p-6">
                <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <DollarSignIcon class="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">Total Salary</p>
                        <p class="text-xl font-bold text-green-600">{formatCurrency(totalSalary)}</p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Content class="p-6">
                <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <DollarSignIcon class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">Average Salary</p>
                        <p class="text-xl font-bold text-purple-600">{formatCurrency(avgSalary)}</p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Content class="p-6">
                <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <UserPlusIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground">New This Year</p>
                        <p class="text-2xl font-bold text-amber-600">{newThisYear}</p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    </div>

    <!-- Employee Table -->
    <Card.Root class="flex-1">
        <Card.Header class="flex flex-row items-center justify-between">
            <div>
                <Card.Title>Employee List</Card.Title>
                <Card.Description>Manage your team members</Card.Description>
            </div>
            <div class="flex gap-2">
                <Button variant="outline" size="icon" onclick={handleRefresh} disabled={loading}>
                    <RefreshCwIcon class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
                </Button>
                <EmployeeCreateDialog />
            </div>
        </Card.Header>
        <Card.Content>
            {#if loading}
                <LoadingTable rows={5} />
            {:else if employees.length === 0}
                <EmptyState
                    icon={UsersIcon}
                    title="No employees found"
                    description="Add your first employee to get started with employee management."
                    actionLabel="Add Employee"
                />
            {:else}
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-[200px]">Name</Table.Head>
                            <Table.Head>Email</Table.Head>
                            <Table.Head>Position</Table.Head>
                            <Table.Head>Phone</Table.Head>
                            <Table.Head class="w-[120px]">Salary</Table.Head>
                            <Table.Head class="w-[120px]">Join Date</Table.Head>
                            <Table.Head class="w-[120px] text-right">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each employees as employee (employee.id)}
                            <Table.Row class="group">
                                <Table.Cell>
                                    <div class="flex items-center gap-3">
                                        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                                            {(employee.userName || employee.name || "?").charAt(0)}
                                        </div>
                                        <div>
                                            <p class="font-medium">{employee.userName || employee.name}</p>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {employee.userEmail || employee.email || '-'}
                                </Table.Cell>
                                <Table.Cell>
                                    <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium {getStatusColor('position', employee.position)}">
                                        {employee.position}
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {employee.phoneNumber || '-'}
                                </Table.Cell>
                                <Table.Cell class="font-medium">
                                    {formatCurrency(employee.salaryBase)}
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {formatDate(employee.joinDate)}
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-8 w-8"
                                            onclick={() => goto(`/dashboard/employee/${employee.id}`)}
                                        >
                                            <EyeIcon class="h-4 w-4" />
                                            <span class="sr-only">View</span>
                                        </Button>
                                        <EmployeeEditDialog {employee} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-8 w-8 text-destructive hover:text-destructive"
                                            onclick={() => handleDelete(employee.id)}
                                        >
                                            <TrashIcon class="h-4 w-4" />
                                            <span class="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
