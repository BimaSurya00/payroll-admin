<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    import { userStore } from "$lib/stores/user.store.js";
    import { companyStore } from "$lib/stores/company.store.js";
    import { authStore } from "$lib/stores/auth.store.js";

    let { user } = $props();

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);
    let companiesLoading = $state(false);

    let formData = $state({
        name: "",
        email: "",
        role: "",
        companyId: "",
    });

    // Get auth state to check if super user
    let authState = $state({ user: null });
    authStore.subscribe((state) => {
        authState = state;
    });

    let isSuperUser = $derived(authState.user?.role === 'SUPER_USER');

    // Get companies for dropdown
    let companies = $state([]);
    companyStore.subscribe((state) => {
        companies = state.data || [];
    });

    const roles = [
        { value: "USER", label: "User" },
        { value: "ADMIN", label: "Admin" },
        { value: "SUPER_USER", label: "Super User" },
    ];

    async function initForm() {
        if (user) {
            formData = {
                name: user.name || "",
                email: user.email || "",
                role: user.role || "USER",
                companyId: user.companyId || "",
            };
        }
        error = null;

        // Fetch companies if super user
        if (isSuperUser && companies.length === 0) {
            companiesLoading = true;
            try {
                await companyStore.fetchAll({ perPage: 100 });
            } catch (err) {
                console.error('Failed to fetch companies:', err);
            } finally {
                companiesLoading = false;
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = null;

        try {
            await userStore.update(user.id, formData);
            open = false;
        } catch (err) {
            error = err.message || "Failed to update user";
        } finally {
            loading = false;
        }
    }
</script>

<Dialog.Root
    bind:open
    onOpenChange={(isOpen) => {
        if (isOpen) initForm();
    }}
>
    <Dialog.Trigger>
        <Button variant="ghost" size="icon" class="h-8 w-8">
            <PencilIcon class="h-4 w-4" />
            <span class="sr-only">Edit</span>
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Edit User</Dialog.Title>
            <Dialog.Description>
                Update user information. Password cannot be changed here.
            </Dialog.Description>
        </Dialog.Header>

        <form onsubmit={handleSubmit} class="space-y-4">
            {#if error}
                <div
                    class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                >
                    <p class="text-sm">{error}</p>
                </div>
            {/if}

            <div class="space-y-2">
                <Label for="edit-name">Name</Label>
                <Input
                    id="edit-name"
                    type="text"
                    placeholder="Enter user name"
                    bind:value={formData.name}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="edit-email">Email</Label>
                <Input
                    id="edit-email"
                    type="email"
                    placeholder="user@example.com"
                    bind:value={formData.email}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="edit-role">Role</Label>
                <Select.Root type="single" bind:value={formData.role}>
                    <Select.Trigger class="w-full">
                        {roles.find((r) => r.value === formData.role)?.label ||
                            "Select role"}
                    </Select.Trigger>
                    <Select.Content>
                        {#each roles as role}
                            <Select.Item value={role.value}
                                >{role.label}</Select.Item
                            >
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            {#if isSuperUser}
                <div class="space-y-2">
                    <Label for="edit-company">Company</Label>
                    <Select.Root type="single" bind:value={formData.companyId}>
                        <Select.Trigger class="w-full" disabled={companiesLoading}>
                            {#if companiesLoading}
                                Loading companies...
                            {:else}
                                {companies.find((c) => c.id === formData.companyId)?.name ||
                                    "Select company"}
                            {/if}
                        </Select.Trigger>
                        <Select.Content>
                            {#each companies as company}
                                <Select.Item value={company.id}>
                                    {company.name}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                    <p class="text-xs text-muted-foreground">
                        Only Super User can change company
                    </p>
                </div>
            {/if}

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (open = false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                    {:else}
                        Save Changes
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
