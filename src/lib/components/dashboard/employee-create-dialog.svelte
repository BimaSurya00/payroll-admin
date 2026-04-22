<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import { formatTime } from "$lib/utils.js";

    import { employeeStore } from "$lib/stores/employee.store.js";
    import { scheduleStore } from "$lib/stores/schedule.store.js";
    import { departmentStore } from "$lib/stores/department.store.js";
    import { onMount } from "svelte";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let schedules = $state([]);
    let departments = $state([]);

    let formData = $state({
        // User Account Fields
        name: "",
        email: "",
        password: "",
        // Employee Details
        position: "",
        phoneNumber: "",
        address: "",
        salaryBase: "",
        joinDate: "",
        scheduleId: "",
        departmentId: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountHolder: "",
        employmentStatus: "PERMANENT",
        jobLevel: "STAFF",
        gender: "",
    });

    scheduleStore.subscribe((state) => {
        schedules = state.data || [];
    });

    departmentStore.subscribe((state) => {
        departments = state.data || [];
    });

    onMount(async () => {
        await scheduleStore.fetchAll();
        await departmentStore.fetchAll();
    });

    function resetForm() {
        formData = {
            // User Account Fields
            name: "",
            email: "",
            password: "",
            // Employee Details
            position: "",
            phoneNumber: "",
            address: "",
            salaryBase: "",
            joinDate: "",
            scheduleId: "",
            departmentId: "",
            bankName: "",
            bankAccountNumber: "",
            bankAccountHolder: "",
            employmentStatus: "PERMANENT",
            jobLevel: "STAFF",
            gender: "",
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
                Add a new employee. This will automatically create a user account.
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

            <!-- User Account Section -->
            <div class="border-b pb-4">
                <h4 class="text-sm font-medium mb-3 text-muted-foreground">User Account</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="name">Full Name *</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            bind:value={formData.name}
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@company.com"
                            bind:value={formData.email}
                            required
                        />
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    <Label for="password">Password *</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Min 6 characters"
                        bind:value={formData.password}
                        required
                        minlength="6"
                    />
                </div>
            </div>

            <!-- Employment Details Section -->
            <div class="border-b pb-4">
                <h4 class="text-sm font-medium mb-3 text-muted-foreground">Employment Details</h4>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="position">Position *</Label>
                        <Input
                            id="position"
                            type="text"
                            placeholder="e.g. Software Engineer"
                            bind:value={formData.position}
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="employmentStatus">Employment Status *</Label>
                        <Select.Root type="single" bind:value={formData.employmentStatus}>
                            <Select.Trigger class="w-full">
                                {formData.employmentStatus || "Select status"}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="PERMANENT">Permanent</Select.Item>
                                <Select.Item value="CONTRACT">Contract</Select.Item>
                                <Select.Item value="PROBATION">Probation</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="space-y-2">
                        <Label for="jobLevel">Job Level *</Label>
                        <Select.Root type="single" bind:value={formData.jobLevel}>
                            <Select.Trigger class="w-full">
                                {formData.jobLevel || "Select level"}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="CEO">CEO</Select.Item>
                                <Select.Item value="MANAGER">Manager</Select.Item>
                                <Select.Item value="SUPERVISOR">Supervisor</Select.Item>
                                <Select.Item value="STAFF">Staff</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <div class="space-y-2">
                        <Label for="departmentId">Department</Label>
                        <Select.Root type="single" bind:value={formData.departmentId}>
                            <Select.Trigger class="w-full">
                                {departments.find((d) => d.id === formData.departmentId)
                                    ?.name || "Select department"}
                            </Select.Trigger>
                            <Select.Content>
                                {#each departments as dept}
                                    <Select.Item value={dept.id}>{dept.name}</Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="space-y-2">
                        <Label for="scheduleId">Work Schedule</Label>
                        <Select.Root type="single" bind:value={formData.scheduleId}>
                            <Select.Trigger class="w-full">
                                {#if formData.scheduleId}
                                    {@const selected = schedules.find(
                                        (s) => s.id === formData.scheduleId,
                                    )}
                                    {selected
                                        ? `${selected.name} (${formatTime(selected.timeIn)} - ${formatTime(selected.timeOut)})`
                                        : "Select schedule"}
                                {:else}
                                    Select schedule
                                {/if}
                            </Select.Trigger>
                            <Select.Content>
                                {#each schedules as schedule}
                                    <Select.Item value={schedule.id}>
                                        {schedule.name} ({formatTime(schedule.timeIn)} - {formatTime(schedule.timeOut)})
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <div class="space-y-2">
                        <Label for="joinDate">Join Date *</Label>
                        <Input
                            id="joinDate"
                            type="date"
                            bind:value={formData.joinDate}
                            required
                        />
                    </div>
                </div>
            </div>

            <!-- Personal Information Section -->
            <div class="border-b pb-4">
                <h4 class="text-sm font-medium mb-3 text-muted-foreground">Personal Information</h4>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="gender">Gender *</Label>
                        <Select.Root type="single" bind:value={formData.gender}>
                            <Select.Trigger class="w-full">
                                {formData.gender || "Select gender"}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="MALE">Male</Select.Item>
                                <Select.Item value="FEMALE">Female</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <div class="space-y-2">
                        <Label for="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="628123456789"
                            bind:value={formData.phoneNumber}
                        />
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    <Label for="address">Address</Label>
                    <Input
                        id="address"
                        type="text"
                        placeholder="Jl. Sudirman No. 1"
                        bind:value={formData.address}
                    />
                </div>
            </div>

            <!-- Compensation & Bank Information -->
            <div>
                <h4 class="text-sm font-medium mb-3 text-muted-foreground">Compensation & Bank Information</h4>
                
                <div class="space-y-2 mb-4">
                    <Label for="salaryBase">Base Salary *</Label>
                    <Input
                        id="salaryBase"
                        type="number"
                        placeholder="15000000"
                        bind:value={formData.salaryBase}
                        required
                        min="1"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="bankName">Bank Name</Label>
                        <Input
                            id="bankName"
                            type="text"
                            placeholder="BCA"
                            bind:value={formData.bankName}
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="bankAccountNumber">Account Number</Label>
                        <Input
                            id="bankAccountNumber"
                            type="text"
                            placeholder="1234567890"
                            bind:value={formData.bankAccountNumber}
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
