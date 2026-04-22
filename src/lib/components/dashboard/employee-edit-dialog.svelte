<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import { formatTime } from "$lib/utils.js";

    import { employeeStore } from "$lib/stores/employee.store.js";
    import { scheduleStore } from "$lib/stores/schedule.store.js";
    import { departmentStore } from "$lib/stores/department.store.js";
    import { onMount } from "svelte";

    let { employee } = $props();

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);
    let schedules = $state([]);
    let departments = $state([]);

    let formData = $state({
        position: "",
        phoneNumber: "",
        address: "",
        salaryBase: "",
        scheduleId: "",
        departmentId: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountHolder: "",
        employmentStatus: "",
        jobLevel: "",
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

    function initForm() {
        if (employee) {
            formData = {
                position: employee.position || "",
                phoneNumber: employee.phoneNumber || employee.phone || "",
                address: employee.address || "",
                salaryBase: employee.salaryBase?.toString() || "",
                scheduleId: employee.scheduleId || employee.schedule?.id || "",
                departmentId: employee.departmentId || employee.department?.id || "",
                bankName: employee.bankName || "",
                bankAccountNumber: employee.bankAccountNumber || "",
                bankAccountHolder: employee.bankAccountHolder || "",
                employmentStatus: employee.employmentStatus || "PERMANENT",
                jobLevel: employee.jobLevel || "STAFF",
                gender: employee.gender || "",
            };
        }
        error = null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = null;

        try {
            const payload = {
                position: formData.position || undefined,
                phoneNumber: formData.phoneNumber || undefined,
                address: formData.address || undefined,
                salaryBase: formData.salaryBase ? parseFloat(formData.salaryBase) : undefined,
                scheduleId: formData.scheduleId || undefined,
                departmentId: formData.departmentId || undefined,
                bankName: formData.bankName || undefined,
                bankAccountNumber: formData.bankAccountNumber || undefined,
                bankAccountHolder: formData.bankAccountHolder || undefined,
                employmentStatus: formData.employmentStatus || undefined,
                jobLevel: formData.jobLevel || undefined,
                gender: formData.gender || undefined,
            };

            // Remove undefined values
            const cleanPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, v]) => v !== undefined)
            );

            // DEBUG: Log request payload untuk tim backend
            console.log("=== EMPLOYEE UPDATE DEBUG ===");
            console.log("Employee ID:", employee.id);
            console.log("REQUEST Payload:", JSON.stringify(cleanPayload, null, 2));

            const result = await employeeStore.update(employee.id, cleanPayload);

            // DEBUG: Log response
            console.log("RESPONSE:", JSON.stringify(result, null, 2));
            console.log("=== END DEBUG ===");

            open = false;
        } catch (err) {
            console.error("UPDATE ERROR:", err);
            error = err.message || "Failed to update employee";
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
    <Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Edit Employee</Dialog.Title>
            <Dialog.Description>
                Update employee information for {employee?.userName ||
                    employee?.name ||
                    "this employee"}.
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

            <!-- Employment Details Section -->
            <div class="border-b pb-4">
                <h4 class="text-sm font-medium mb-3 text-muted-foreground">Employment Details</h4>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="edit-position">Position</Label>
                        <Input
                            id="edit-position"
                            type="text"
                            placeholder="e.g. Software Engineer"
                            bind:value={formData.position}
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-employmentStatus">Employment Status</Label>
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
                        <Label for="edit-jobLevel">Job Level</Label>
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
                        <Label for="edit-departmentId">Department</Label>
                        <Select.Root type="single" bind:value={formData.departmentId}>
                            <Select.Trigger class="w-full">
                                {departments.find((d) => d.id === formData.departmentId)
                                    ?.name || "Select department"}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="">No Department</Select.Item>
                                {#each departments as dept}
                                    <Select.Item value={dept.id}>{dept.name}</Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="space-y-2">
                        <Label for="edit-scheduleId">Work Schedule</Label>
                        <Select.Root type="single" bind:value={formData.scheduleId}>
                            <Select.Trigger class="w-full">
                                {#if formData.scheduleId}
                                    {@const selected = schedules.find(
                                        (s) => s.id === formData.scheduleId,
                                    )}
                                    {selected
                                        ? `${selected.name} (${formatTime(selected.timeIn)} - ${formatTime(selected.timeOut)}${selected.allowedLateMinutes ? `, Late: ${selected.allowedLateMinutes}min` : ''})`
                                        : "Select schedule"}
                                {:else}
                                    No Schedule
                                {/if}
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="">No Schedule</Select.Item>
                                {#each schedules as schedule}
                                    <Select.Item value={schedule.id}>
                                        {schedule.name} ({formatTime(schedule.timeIn)} - {formatTime(schedule.timeOut)}
                                        {schedule.allowedLateMinutes ? `, Late: ${schedule.allowedLateMinutes}min` : ''})
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>
            </div>

            <!-- Personal Information Section -->
            <div class="border-b pb-4">
                <h4 class="text-sm font-medium mb-3 text-muted-foreground">Personal Information</h4>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="edit-gender">Gender</Label>
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
                        <Label for="edit-phone">Phone</Label>
                        <Input
                            id="edit-phone"
                            type="tel"
                            placeholder="628123456789"
                            bind:value={formData.phoneNumber}
                        />
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    <Label for="edit-address">Address</Label>
                    <Input
                        id="edit-address"
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
                    <Label for="edit-salaryBase">Base Salary</Label>
                    <Input
                        id="edit-salaryBase"
                        type="number"
                        placeholder="15000000"
                        bind:value={formData.salaryBase}
                        min="1"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="edit-bankName">Bank Name</Label>
                        <Input
                            id="edit-bankName"
                            type="text"
                            placeholder="BCA"
                            bind:value={formData.bankName}
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="edit-bankAccountNumber"
                            >Account Number</Label
                        >
                        <Input
                            id="edit-bankAccountNumber"
                            type="text"
                            placeholder="1234567890"
                            bind:value={formData.bankAccountNumber}
                            required
                        />
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    <Label for="edit-bankAccountHolder">Account Holder</Label>
                    <Input
                        id="edit-bankAccountHolder"
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
                        Saving...
                    {:else}
                        Save Changes
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
