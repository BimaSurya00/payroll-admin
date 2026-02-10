<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    // Import store
    import { employeeStore } from "$lib/stores/employee.store.js";
    import EmployeeCreateDialog from "$lib/components/dashboard/employee-create-dialog.svelte";
    import EmployeeEditDialog from "$lib/components/dashboard/employee-edit-dialog.svelte";

    // Fallback dummy data (used when API fails or for development)
    const fallbackEmployees = [
        {
            id: "aaa54c52-b033-4517-9c70-7c4106ac0c07",
            userName: "John Doe",
            userEmail: "john.doe@example.com",
            position: "Software Engineer",
            phoneNumber: "+628123456789",
            salaryBase: 15000000,
            joinDate: "2024-01-15",
        },
        {
            id: "bbb65d63-c144-4628-ad81-8d5217bd1e18",
            userName: "Jane Smith",
            userEmail: "jane.smith@example.com",
            position: "Product Manager",
            phoneNumber: "+628234567890",
            salaryBase: 18000000,
            joinDate: "2023-06-20",
        },
        {
            id: "ccc76e74-d255-5739-be92-9e6328ce2f29",
            userName: "Bob Johnson",
            userEmail: "bob.johnson@example.com",
            position: "UI/UX Designer",
            phoneNumber: "+628345678901",
            salaryBase: 12000000,
            joinDate: "2024-03-10",
        },
        {
            id: "ddd87f85-e366-6840-cf03-0f7439df3g30",
            userName: "Alice Williams",
            userEmail: "alice.williams@example.com",
            position: "HR Manager",
            phoneNumber: "+628456789012",
            salaryBase: 16000000,
            joinDate: "2022-11-05",
        },
        {
            id: "eee98g96-f477-7951-dg14-1g8540eg4h41",
            userName: "Charlie Brown",
            userEmail: "charlie.brown@example.com",
            position: "DevOps Engineer",
            phoneNumber: "+628567890123",
            salaryBase: 17000000,
            joinDate: "2024-05-12",
        },
    ];

    // Reactive state from store
    let storeState = $state({ data: [], loading: false, error: null });

    // Subscribe to store
    employeeStore.subscribe((state) => {
        storeState = state;
    });

    // Use API data if available, otherwise use fallback
    let employees = $derived(
        storeState.data.length > 0 ? storeState.data : fallbackEmployees,
    );
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await employeeStore.fetchAll();
        } catch (err) {
            // If API fails, fallback data will be used
            console.log("Using fallback data:", err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await employeeStore.fetchAll();
    }

    // Delete function
    async function handleDelete(id) {
        if (confirm("Are you sure you want to delete this employee?")) {
            try {
                await employeeStore.delete(id);
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
        }).format(amount);
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function getPositionColor(position) {
        const colors = {
            "Software Engineer":
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            "Product Manager":
                "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            "UI/UX Designer":
                "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
            "HR Manager":
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            "DevOps Engineer":
                "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };
        return (
            colors[position] ||
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        );
    }

    // Calculate stats
    let totalSalary = $derived(
        employees.reduce((sum, emp) => sum + (emp.salaryBase || 0), 0),
    );
    let avgSalary = $derived(
        employees.length > 0 ? totalSalary / employees.length : 0,
    );
</script>

<svelte:head>
    <title>Employee Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="Employee Management"
    subtitle="Manage all employees in the system"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Error Alert -->
    {#if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
            <p class="text-xs mt-1">
                Using fallback data. Click refresh to retry.
            </p>
        </div>
    {/if}

    <!-- Stats Cards -->
    <div class="grid auto-rows-min gap-4 md:grid-cols-4">
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Total Employees
            </p>
            <p class="text-2xl font-bold mt-1">{employees.length}</p>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Total Salary Budget
            </p>
            <p class="text-2xl font-bold mt-1 text-blue-600">
                {formatCurrency(totalSalary)}
            </p>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                Average Salary
            </p>
            <p class="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(avgSalary)}
            </p>
        </div>
        <div class="rounded-lg border bg-card p-4 shadow-sm">
            <p class="text-sm font-medium text-muted-foreground">
                New This Year
            </p>
            <p class="text-2xl font-bold mt-1 text-purple-600">
                {employees.filter(
                    (e) => new Date(e.joinDate).getFullYear() >= 2024,
                ).length}
            </p>
        </div>
    </div>

    <!-- Employee Table Card -->
    <Card.Root class="flex-1">
        <Card.Header
            class="flex flex-row items-center justify-between space-y-0 pb-4"
        >
            <div>
                <Card.Title class="text-xl font-semibold"
                    >Employee List</Card.Title
                >
                <Card.Description>
                    A list of all employees in your organization
                    {#if storeState.data.length === 0 && !loading}
                        <span class="text-yellow-600">(Showing demo data)</span>
                    {/if}
                </Card.Description>
            </div>
            <div class="flex gap-2">
                <Button
                    variant="outline"
                    onclick={handleRefresh}
                    disabled={loading}
                >
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                    {:else}
                        <RefreshCwIcon class="h-4 w-4 mr-2" />
                    {/if}
                    Refresh
                </Button>
                <EmployeeCreateDialog />
            </div>
        </Card.Header>
        <Card.Content>
            {#if loading && storeState.data.length === 0}
                <div class="flex items-center justify-center py-8">
                    <LoaderIcon
                        class="h-8 w-8 animate-spin text-muted-foreground"
                    />
                    <span class="ml-2 text-muted-foreground"
                        >Loading employees...</span
                    >
                </div>
            {:else}
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Name</Table.Head>
                            <Table.Head>Email</Table.Head>
                            <Table.Head>Position</Table.Head>
                            <Table.Head>Phone</Table.Head>
                            <Table.Head>Salary</Table.Head>
                            <Table.Head>Join Date</Table.Head>
                            <Table.Head class="text-right">Actions</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each employees as employee (employee.id)}
                            <Table.Row>
                                <Table.Cell>
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                                        >
                                            {(
                                                employee.userName ||
                                                employee.name ||
                                                "?"
                                            ).charAt(0)}
                                        </div>
                                        <span class="font-medium"
                                            >{employee.userName ||
                                                employee.name}</span
                                        >
                                    </div>
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {employee.userEmail || employee.email}
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getPositionColor(
                                            employee.position,
                                        )}"
                                    >
                                        {employee.position}
                                    </span>
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {employee.phoneNumber}
                                </Table.Cell>
                                <Table.Cell class="font-medium">
                                    {formatCurrency(employee.salaryBase)}
                                </Table.Cell>
                                <Table.Cell class="text-muted-foreground">
                                    {formatDate(employee.joinDate)}
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    <div
                                        class="flex items-center justify-end gap-2"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-8 w-8"
                                            onclick={() =>
                                                goto(
                                                    `/dashboard/employee/${employee.id}`,
                                                )}
                                        >
                                            <EyeIcon class="h-4 w-4" />
                                            <span class="sr-only">View</span>
                                        </Button>
                                        <EmployeeEditDialog {employee} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-8 w-8 text-destructive"
                                            onclick={() =>
                                                handleDelete(employee.id)}
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
