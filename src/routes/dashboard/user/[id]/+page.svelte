<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import DashboardHeader from "$lib/components/dashboard/dashboard-header.svelte";
    import ErrorForbidden from "$lib/components/error-forbidden.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import UserIcon from "@lucide/svelte/icons/user";
    import MailIcon from "@lucide/svelte/icons/mail";
    import ShieldIcon from "@lucide/svelte/icons/shield";
    import CalendarIcon from "@lucide/svelte/icons/calendar";

    import { userStore } from "$lib/stores/user.store.js";

    let id = $derived($page.params.id);
    let storeState = $state({ selected: null, loading: false, error: null });

    userStore.subscribe((state) => {
        storeState = state;
    });

    let user = $derived(storeState.selected);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);

    let isForbidden = $derived(
        error?.includes("403") ||
            error?.toLowerCase().includes("forbidden") ||
            error?.toLowerCase().includes("access denied"),
    );

    onMount(async () => {
        if (id) {
            await userStore.fetchById(id);
        }
    });

    function goBack() {
        goto("/dashboard/user");
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await userStore.delete(id);
                goto("/dashboard/user");
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
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        }
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
</script>

<svelte:head>
    <title>{user?.name || "User Detail"} | Dashboard</title>
</svelte:head>

<DashboardHeader title="User Detail" subtitle="View user information" />

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    {#if isForbidden}
        <ErrorForbidden
            title="Access Denied"
            message="You don't have permission to view this user."
        />
    {:else if loading}
        <div class="flex items-center justify-center py-16">
            <LoaderIcon class="h-8 w-8 animate-spin text-muted-foreground" />
            <span class="ml-2 text-muted-foreground">Loading user...</span>
        </div>
    {:else if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {:else if user}
        <!-- Back Button -->
        <div class="flex items-center justify-between">
            <Button variant="outline" onclick={goBack}>
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Users
            </Button>
            <div class="flex gap-2">
                <Button variant="outline">
                    <PencilIcon class="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button variant="destructive" onclick={handleDelete}>
                    <TrashIcon class="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>

        <!-- User Card -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-4">
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                    >
                        {#if user.profileImage}
                            <img
                                src={user.profileImage}
                                alt={user.name}
                                class="h-16 w-16 rounded-full object-cover"
                            />
                        {:else}
                            <UserIcon class="h-8 w-8" />
                        {/if}
                    </div>
                    <div>
                        <Card.Title class="text-2xl">{user.name}</Card.Title>
                        <span
                            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getRoleColor(
                                user.role,
                            )}"
                        >
                            {user.role}
                        </span>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <MailIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p class="font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <ShieldIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Role
                                </p>
                                <p class="font-medium">{user.role}</p>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <CalendarIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Created At
                                </p>
                                <p class="font-medium">
                                    {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                            >
                                <UserIcon
                                    class="h-5 w-5 text-muted-foreground"
                                />
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    User ID
                                </p>
                                <p class="font-mono text-sm">{user.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="text-center py-16">
            <p class="text-muted-foreground">User not found</p>
            <Button variant="outline" onclick={goBack} class="mt-4">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Users
            </Button>
        </div>
    {/if}
</div>
