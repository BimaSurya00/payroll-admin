<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import CalculatorIcon from "@lucide/svelte/icons/calculator";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import { format } from "date-fns";

    import { overtimeStore } from "$lib/stores/overtime.store.js";
    import { employeeStore } from "$lib/stores/employee.store.js";

    let open = $state(false);
    let loading = $state(false);
    let calculating = $state(false);
    let error = $state(null);
    let calculationResult = $state(null);

    // Form data
    let selectedEmployeeId = $state("");
    let startDate = $state(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    let endDate = $state(format(new Date(), "yyyy-MM-dd"));

    // Employees list
    let employees = $state([]);
    let employeesLoading = $state(false);

    // Subscribe to stores
    employeeStore.subscribe((state) => {
        employees = state.data || [];
        employeesLoading = state.loading;
    });

    // Fetch employees when dialog opens
    async function fetchEmployees() {
        if (employees.length === 0) {
            employeesLoading = true;
            try {
                await employeeStore.fetchAll({ perPage: 100 });
            } catch (err) {
                console.error("Failed to fetch employees:", err);
            } finally {
                employeesLoading = false;
            }
        }
    }

    function resetForm() {
        selectedEmployeeId = "";
        startDate = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
        endDate = format(new Date(), "yyyy-MM-dd");
        error = null;
        calculationResult = null;
    }

    async function handleCalculate() {
        if (!selectedEmployeeId) {
            error = "Please select an employee";
            return;
        }

        calculating = true;
        error = null;
        calculationResult = null;

        try {
            const result = await overtimeStore.calculatePay(
                selectedEmployeeId,
                startDate,
                endDate
            );
            calculationResult = result;
        } catch (err) {
            error = err.message || "Failed to calculate overtime pay";
        } finally {
            calculating = false;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    function formatNumber(num) {
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    }
</script>

<Dialog.Root
    bind:open
    onOpenChange={(isOpen) => {
        if (isOpen) fetchEmployees();
        if (!isOpen) resetForm();
    }}
>
    <Dialog.Trigger>
        <Button variant="outline">
            <CalculatorIcon class="h-4 w-4 mr-2" />
            Calculate Pay
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[500px]">
        <Dialog.Header>
            <Dialog.Title>Calculate Overtime Pay</Dialog.Title>
            <Dialog.Description>
                Calculate overtime pay for an employee based on approved overtime requests.
            </Dialog.Description>
        </Dialog.Header>

        <div class="space-y-4 py-4">
            {#if error}
                <div
                    class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                >
                    <p class="text-sm">{error}</p>
                </div>
            {/if}

            <!-- Employee Selection -->
            <div class="space-y-2">
                <Label for="employee">Employee</Label>
                <Select.Root
                    type="single"
                    bind:value={selectedEmployeeId}
                    disabled={employeesLoading}
                >
                    <Select.Trigger class="w-full">
                        {#if employeesLoading}
                            Loading employees...
                        {:else}
                            {employees.find((e) => e.id === selectedEmployeeId)
                                ?.fullName || "Select employee"}
                        {/if}
                    </Select.Trigger>
                    <Select.Content>
                        {#each employees as employee}
                            <Select.Item value={employee.id}>
                                {employee.fullName} - {employee.position}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        bind:value={startDate}
                    />
                </div>
                <div class="space-y-2">
                    <Label for="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="date"
                        bind:value={endDate}
                    />
                </div>
            </div>

            <!-- Calculate Button -->
            <Button
                class="w-full"
                onclick={handleCalculate}
                disabled={calculating || !selectedEmployeeId}
            >
                {#if calculating}
                    <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                    Calculating...
                {:else}
                    <CalculatorIcon class="h-4 w-4 mr-2" />
                    Calculate
                {/if}
            </Button>

            <!-- Calculation Result -->
            {#if calculationResult}
                <div
                    class="rounded-lg border bg-muted/50 p-4 space-y-3 mt-4"
                >
                    <h4 class="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Calculation Result
                    </h4>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-muted-foreground">Employee</span>
                            <span class="font-medium">{calculationResult.employeeName}</span>
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-sm text-muted-foreground">Total Hours</span>
                            <span class="font-medium">{formatNumber(calculationResult.totalHours)} hours</span>
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-sm text-muted-foreground">Hourly Rate</span>
                            <span class="font-medium">{formatCurrency(calculationResult.hourlyRate)}</span>
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-sm text-muted-foreground">Rate Multiplier</span>
                            <span class="font-medium">{calculationResult.rateMultiplier}x</span>
                        </div>

                        <div class="border-t pt-2 mt-2">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-semibold">Total Overtime Pay</span>
                                <span class="text-lg font-bold text-primary">
                                    {formatCurrency(calculationResult.overtimePay)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <Dialog.Footer>
            <Button
                type="button"
                variant="outline"
                onclick={() => (open = false)}
            >
                Close
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
