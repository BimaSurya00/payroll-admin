<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import Swal from "sweetalert2";
    import { extractValidationErrors } from "$lib/utils.js";

    import { overtimeStore } from "$lib/stores/overtime.store.js";
    import { employeeStore } from "$lib/stores/employee.store.js";
    import { onMount } from "svelte";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let policies = $state([]);
    let employees = $state([]);

    let formData = $state({
        employeeId: "",
        overtimeDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        reason: "",
        overtimePolicyId: "",
    });

    // Subscribe to store for policies
    overtimeStore.subscribe((state) => {
        policies = state.policies || [];
    });

    // Subscribe to employee store
    employeeStore.subscribe((state) => {
        employees = state.data || [];
    });

    onMount(async () => {
        await overtimeStore.fetchPolicies();
        await employeeStore.fetchAll();
    });

    function resetForm() {
        formData = {
            employeeId: "",
            overtimeDate: new Date().toISOString().split("T")[0],
            startTime: "",
            endTime: "",
            reason: "",
            overtimePolicyId: "",
        };
        error = null;
    }

    // Calculate total hours
    let totalHours = $derived(() => {
        if (formData.startTime && formData.endTime) {
            const [startH, startM] = formData.startTime.split(":").map(Number);
            const [endH, endM] = formData.endTime.split(":").map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const diffMinutes = endMinutes - startMinutes;
            return diffMinutes > 0 ? (diffMinutes / 60).toFixed(1) : 0;
        }
        return 0;
    });

    // Get selected policy multiplier
    let selectedPolicy = $derived(() => {
        return policies.find((p) => p.id === formData.overtimePolicyId);
    });

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.employeeId) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: 'Silakan pilih karyawan',
                confirmButtonColor: '#d33'
            });
            return;
        }

        if (formData.reason.length < 10) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: 'Alasan minimal 10 karakter',
                confirmButtonColor: '#d33'
            });
            return;
        }

        loading = true;
        error = null;

        try {
            await overtimeStore.create(formData);
            open = false;
            resetForm();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Pengajuan lembur berhasil dibuat.',
                confirmButtonColor: '#3085d6',
            });
        } catch (err) {
            const { errorMessage, validationList } = extractValidationErrors(err, "Gagal mengajukan lembur");
            error = err.message || "Gagal mengajukan lembur";

            Swal.fire({
                icon: 'error',
                title: 'Gagal mengajukan lembur',
                html: `<p>${errorMessage}</p>${validationList}`,
                confirmButtonColor: '#d33',
            });
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
            Ajukan Lembur
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Ajukan Lembur</Dialog.Title>
            <Dialog.Description>
                Isi form berikut untuk mengajukan lembur.
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
                <Label for="employeeId">Karyawan *</Label>
                <Select.Root
                    type="single"
                    bind:value={formData.employeeId}
                >
                    <Select.Trigger class="w-full">
                        {#if formData.employeeId}
                            {@const selected = employees.find(
                                (e) => e.id === formData.employeeId,
                            )}
                            {selected
                                ? selected.name || selected.userName || "Karyawan terpilih"
                                : "Pilih Karyawan"}
                        {:else}
                            Pilih Karyawan
                        {/if}
                    </Select.Trigger>
                    <Select.Content class="max-h-[200px] overflow-y-auto">
                        {#each employees as employee}
                            <Select.Item value={employee.id}>
                                {employee.name || employee.userName} 
                                {#if employee.position} - {employee.position} {/if}
                            </Select.Item>
                        {:else}
                            <Select.Item value="" disabled>
                                Memuat karyawan...
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="space-y-2">
                <Label for="overtimePolicyId">Kebijakan Lembur</Label>
                <Select.Root
                    type="single"
                    bind:value={formData.overtimePolicyId}
                >
                    <Select.Trigger class="w-full">
                        {#if formData.overtimePolicyId}
                            {@const selected = policies.find(
                                (p) => p.id === formData.overtimePolicyId,
                            )}
                            {selected
                                ? `${selected.name} (${selected.rateMultiplier}x)`
                                : "Pilih kebijakan"}
                        {:else}
                            Pilih kebijakan lembur
                        {/if}
                    </Select.Trigger>
                    <Select.Content>
                        {#each policies as policy}
                            <Select.Item value={policy.id}>
                                {policy.name} ({policy.rateMultiplier}x)
                            </Select.Item>
                        {:else}
                            <Select.Item value="" disabled>
                                Tidak ada kebijakan tersedia
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="space-y-2">
                <Label for="overtimeDate">Tanggal Lembur</Label>
                <Input
                    id="overtimeDate"
                    type="date"
                    bind:value={formData.overtimeDate}
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="startTime">Jam Mulai</Label>
                    <Input
                        id="startTime"
                        type="time"
                        bind:value={formData.startTime}
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Label for="endTime">Jam Selesai</Label>
                    <Input
                        id="endTime"
                        type="time"
                        bind:value={formData.endTime}
                        required
                    />
                </div>
            </div>

            {#if totalHours() > 0}
                <div class="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                    <p class="text-sm text-orange-800 dark:text-orange-300">
                        <ClockIcon class="inline h-4 w-4 mr-1" />
                        Estimasi: <strong>{totalHours()}</strong> jam
                        {#if selectedPolicy()}
                            (Rate: {selectedPolicy().rateMultiplier}x)
                        {/if}
                    </p>
                </div>
            {/if}

            <div class="space-y-2">
                <Label for="reason">Alasan Lembur</Label>
                <textarea
                    id="reason"
                    class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Jelaskan alasan dan pekerjaan yang akan dilakukan... (minimal 10 karakter)"
                    bind:value={formData.reason}
                    required
                ></textarea>
                <p class="text-xs text-muted-foreground">
                    {formData.reason.length}/10 karakter minimum
                </p>
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (open = false)}
                    disabled={loading}
                >
                    Batal
                </Button>
                <Button type="submit" disabled={loading}>
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        Mengajukan...
                    {:else}
                        Ajukan Lembur
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
