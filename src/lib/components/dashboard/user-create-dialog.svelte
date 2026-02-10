<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    import { userStore } from "$lib/stores/user.store.js";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let formData = $state({
        name: "",
        email: "",
        password: "",
        role: "USER",
    });

    const roles = [
        { value: "USER", label: "User" },
        { value: "ADMIN", label: "Admin" },
        { value: "SUPER_USER", label: "Super User" },
    ];

    function resetForm() {
        formData = {
            name: "",
            email: "",
            password: "",
            role: "USER",
        };
        error = null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = null;

        try {
            await userStore.create(formData);
            open = false;
            resetForm();
        } catch (err) {
            error = err.message || "Failed to create user";
        } finally {
            loading = false;
        }
    }
</script>

<Dialog.Root
    bind:open
    onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
    }}
>
    <Dialog.Trigger>
        <Button>
            <PlusIcon class="h-4 w-4 mr-2" />
            Add User
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create New User</Dialog.Title>
            <Dialog.Description>
                Add a new user to the system. Fill in all required fields.
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
                <Label for="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Enter user name"
                    bind:value={formData.name}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    bind:value={formData.email}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    bind:value={formData.password}
                    required
                    minlength="6"
                />
            </div>

            <div class="space-y-2">
                <Label for="role">Role</Label>
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
                        Creating...
                    {:else}
                        Create User
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
