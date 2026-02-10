<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    import { employeeStore } from "$lib/stores/employee.store.js";
    import { userStore } from "$lib/stores/user.store.js";
    import { scheduleStore } from "$lib/stores/schedule.store.js";
    import { onMount } from "svelte";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let users = $state([]);
    let schedules = $state([]);

    let formData = $state({
        userId: "",
        phoneNumber: "",
        address: "",
        salaryBase: "",
        joinDate: "",
        scheduleId: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountHolder: "",
    });

    userStore.subscribe((state) => {
        users = state.data || [];
    });

    scheduleStore.subscribe((state) => {
        schedules = state.data || [];
    });

    onMount(async () => {
        await userStore.fetchAll();
        await scheduleStore.fetchAll();
    });

    function resetForm() {
        formData = {
            userId: "",
            phoneNumber: "",
            address: "",
            salaryBase: "",
            joinDate: "",
            scheduleId: "",
            bankName: "",
            bankAccountNumber: "",
            bankAccountHolder: "",
        };
        error = null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = null;

        try {
            const payload = {
                ...formData,
                salaryBase: parseInt(formData.salaryBase, 10),
            };
            await employeeStore.create(payload);
            open = false;
            resetForm();
        } catch (err) {
            error = err.message || "Failed to create employee";
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
            Add Employee
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Create New Employee</Dialog.Title>
            <Dialog.Description>
                Add a new employee. User must exist first.
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

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="userId">User</Label>
                    <Select.Root type="single" bind:value={formData.userId}>
                        <Select.Trigger class="w-full">
                            {users.find((u) => u.id === formData.userId)
                                ?.name || "Select user"}
                        </Select.Trigger>
                        <Select.Content>
                            {#each users as user}
                                <Select.Item value={user.id}
                                    >{user.name} ({user.email})</Select.Item
                                >
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <div class="space-y-2">
                    <Label for="scheduleId">Jadwal Kerja</Label>
                    <Select.Root type="single" bind:value={formData.scheduleId}>
                        <Select.Trigger class="w-full">
                            {#if formData.scheduleId}
                                {@const selected = schedules.find(
                                    (s) => s.id === formData.scheduleId,
                                )}
                                {selected
                                    ? `${selected.name} (${selected.timeIn} - ${selected.timeOut})`
                                    : "Select schedule"}
                            {:else}
                                Select schedule
                            {/if}
                        </Select.Trigger>
                        <Select.Content>
                            {#each schedules as schedule}
                                <Select.Item value={schedule.id}>
                                    {schedule.name} ({schedule.timeIn} - {schedule.timeOut})
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="phoneNumber">Phone</Label>
                    <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="628123456789"
                        bind:value={formData.phoneNumber}
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Label for="salaryBase">Base Salary</Label>
                    <Input
                        id="salaryBase"
                        type="number"
                        placeholder="15000000"
                        bind:value={formData.salaryBase}
                        required
                        min="1"
                    />
                </div>
            </div>

            <div class="space-y-2">
                <Label for="address">Address</Label>
                <Input
                    id="address"
                    type="text"
                    placeholder="Jl. Sudirman No. 1"
                    bind:value={formData.address}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="joinDate">Join Date</Label>
                <Input
                    id="joinDate"
                    type="date"
                    bind:value={formData.joinDate}
                    required
                />
            </div>

            <div class="border-t pt-4">
                <h4 class="text-sm font-medium mb-3">Bank Information</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="bankName">Bank Name</Label>
                        <Input
                            id="bankName"
                            type="text"
                            placeholder="BCA"
                            bind:value={formData.bankName}
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="bankAccountNumber">Account Number</Label>
                        <Input
                            id="bankAccountNumber"
                            type="text"
                            placeholder="1234567890"
                            bind:value={formData.bankAccountNumber}
                            required
                        />
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    <Label for="bankAccountHolder">Account Holder</Label>
                    <Input
                        id="bankAccountHolder"
                        type="text"
                        placeholder="John Doe"
                        bind:value={formData.bankAccountHolder}
                        required
                    />
                </div>
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
                        Create Employee
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
