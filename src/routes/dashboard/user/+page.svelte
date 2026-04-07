<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import BuildingIcon from "@lucide/svelte/icons/building";

    // Import store
    import { userStore } from "$lib/stores/user.store.js";
    import { companyStore } from "$lib/stores/company.store.js";
    import UserCreateDialog from "$lib/components/dashboard/user-create-dialog.svelte";
    import UserEditDialog from "$lib/components/dashboard/user-edit-dialog.svelte";

    // Reactive state from store
    let storeState = $state({ data: [], loading: false, error: null });
    let companyState = $state({ data: [], selected: null });

    // Subscribe to store
    userStore.subscribe((state) => {
        storeState = state;
    });

    companyStore.subscribe((state) => {
        companyState = state;
    });

    // Create company ID to name mapping
    let companyMap = $derived(
        Object.fromEntries(companyState.data.map(c => [c.id, c.name]))
    );

    // Check if error is forbidden
    let isForbidden = $derived(
        storeState.error?.includes("403") ||
            storeState.error?.toLowerCase().includes("forbidden") ||
            storeState.error?.toLowerCase().includes("access denied"),
    );

    // Use API data only
    let users = $derived(storeState.data);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await Promise.all([
                userStore.fetchAll(),
                companyStore.fetchAll({ perPage: 100 })
            ]);
        } catch (err) {
            console.error("Failed to fetch data:", err.message);
        }
    });

    // Refresh function
    async function handleRefresh() {
        await userStore.fetchAll();
    }

    // Delete function
    async function handleDelete(id) {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await userStore.delete(id);
            } catch (err) {
                alert("Failed to delete user: " + err.message);
            }
        }
    }

    function getRoleColor(role) {
        switch (role) {
            case "SUPER_USER":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            case "ADMIN":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "USER":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    // Calculate stats
    let adminCount = $derived(
        users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_USER")
            .length,
    );
    let userCount = $derived(users.filter((u) => u.role === "USER").length);
</script>

<svelte:head>
    <title>User Management | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="User Management"
    subtitle="Manage all users in the system"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Forbidden Error -->
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view user data. This feature requires Admin or Super User access."
        />
    {:else}
        <!-- Regular Error Alert -->
        {#if error && !isForbidden}
            <div
                class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
                <p class="text-sm font-medium">Error: {error}</p>
                <p class="text-xs mt-1">
                    Click refresh to retry.
                </p>
            </div>
        {/if}

        <!-- Stats Cards -->
        <div class="grid auto-rows-min gap-4 md:grid-cols-4">
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Total Users
                </p>
                <p class="text-2xl font-bold mt-1">{users.length}</p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Admin/Super User
                </p>
                <p class="text-2xl font-bold mt-1 text-purple-600">
                    {adminCount}
                </p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    Regular Users
                </p>
                <p class="text-2xl font-bold mt-1 text-blue-600">
                    {userCount}
                </p>
            </div>
            <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p class="text-sm font-medium text-muted-foreground">
                    New This Month
                </p>
                <p class="text-2xl font-bold mt-1 text-green-600">
                    {users.filter((u) => {
                        const date = new Date(u.createdAt);
                        const now = new Date();
                        return (
                            date.getMonth() === now.getMonth() &&
                            date.getFullYear() === now.getFullYear()
                        );
                    }).length}
                </p>
            </div>
        </div>

        <!-- User Table Card -->
        <Card.Root class="flex-1">
            <Card.Header
                class="flex flex-row items-center justify-between space-y-0 pb-4"
            >
                <div>
                    <Card.Title class="text-xl font-semibold"
                        >User List</Card.Title
                    >
                    <Card.Description>
                        A list of all users in your system
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
                    <UserCreateDialog />
                </div>
            </Card.Header>
            <Card.Content>
                {#if loading && storeState.data.length === 0}
                    <div class="flex items-center justify-center py-8">
                        <LoaderIcon
                            class="h-8 w-8 animate-spin text-muted-foreground"
                        />
                        <span class="ml-2 text-muted-foreground"
                            >Loading users...</span
                        >
                    </div>
                {:else}
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.Head>Name</Table.Head>
                                    <Table.Head>Email</Table.Head>
                                    <Table.Head>Role</Table.Head>
                                    <Table.Head>Company</Table.Head>
                                    <Table.Head>Created At</Table.Head>
                                    <Table.Head class="text-right">Actions</Table.Head>
                                </Table.Row>
                            </Table.Header>
                        <Table.Body>
                            {#each users as user (user.id)}
                                <Table.Row>
                                    <Table.Cell>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium"
                                            >
                                                {user.name.charAt(0)}
                                            </div>
                                            <span class="font-medium"
                                                >{user.name}</span
                                            >
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground"
                                        >{user.email}</Table.Cell
                                    >
                                    <Table.Cell>
                                        <span
                                            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getRoleColor(
                                                user.role,
                                            )}"
                                        >
                                            {user.role}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground">
                                        <div class="flex items-center gap-1.5">
                                            <BuildingIcon class="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{companyMap[user.companyId] || 'N/A'}</span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell class="text-muted-foreground"
                                        >{formatDate(
                                            user.createdAt,
                                        )}</Table.Cell
                                    >
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
                                                        `/dashboard/user/${user.id}`,
                                                    )}
                                            >
                                                <EyeIcon class="h-4 w-4" />
                                                <span class="sr-only">View</span
                                                >
                                            </Button>
                                            <UserEditDialog {user} />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8 text-destructive"
                                                onclick={() =>
                                                    handleDelete(user.id)}
                                            >
                                                <TrashIcon class="h-4 w-4" />
                                                <span class="sr-only"
                                                    >Delete</span
                                                >
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
    {/if}
</div>
