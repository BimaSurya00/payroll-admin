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

    // Import store
    import { userStore } from "$lib/stores/user.store.js";
    import UserCreateDialog from "$lib/components/dashboard/user-create-dialog.svelte";
    import UserEditDialog from "$lib/components/dashboard/user-edit-dialog.svelte";

    // Fallback dummy data (used when API fails or for development)
    const fallbackUsers = [
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "ADMIN",
            profileImage: null,
            createdAt: "2024-01-15T10:00:00Z",
        },
        {
            id: "660e8400-e29b-41d4-a716-446655440001",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "USER",
            profileImage: null,
            createdAt: "2024-02-20T10:00:00Z",
        },
        {
            id: "770e8400-e29b-41d4-a716-446655440002",
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            role: "USER",
            profileImage: null,
            createdAt: "2024-03-10T10:00:00Z",
        },
        {
            id: "880e8400-e29b-41d4-a716-446655440003",
            name: "Alice Williams",
            email: "alice.williams@example.com",
            role: "SUPER_USER",
            profileImage: null,
            createdAt: "2024-04-05T10:00:00Z",
        },
    ];

    // Reactive state from store
    let storeState = $state({ data: [], loading: false, error: null });

    // Subscribe to store
    userStore.subscribe((state) => {
        storeState = state;
    });

    // Check if error is forbidden
    let isForbidden = $derived(
        storeState.error?.includes("403") ||
            storeState.error?.toLowerCase().includes("forbidden") ||
            storeState.error?.toLowerCase().includes("access denied"),
    );

    // Use API data if available, otherwise use fallback
    let users = $derived(
        storeState.data.length > 0
            ? storeState.data
            : isForbidden
              ? []
              : fallbackUsers,
    );
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    // Fetch data on mount
    onMount(async () => {
        try {
            await userStore.fetchAll();
        } catch (err) {
            console.log("Error fetching users:", err.message);
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
                    Using fallback data. Click refresh to retry.
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
                        {#if storeState.data.length === 0 && !loading && !error}
                            <span class="text-yellow-600"
                                >(Showing demo data)</span
                            >
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
                                <Table.Head>Created At</Table.Head>
                                <Table.Head class="text-right"
                                    >Actions</Table.Head
                                >
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
