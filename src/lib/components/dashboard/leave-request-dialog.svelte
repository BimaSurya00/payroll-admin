<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import CalendarIcon from "@lucide/svelte/icons/calendar";

    import { leaveStore } from "$lib/stores/leave.store.js";
    import { onMount } from "svelte";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let leaveTypes = $state([]);

    let formData = $state({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
        emergencyContact: "",
    });

    // Subscribe to store for leave types
    leaveStore.subscribe((state) => {
        leaveTypes = state.leaveTypes || [];
    });

    onMount(async () => {
        await leaveStore.fetchLeaveTypes();
    });

    function resetForm() {
        formData = {
            leaveTypeId: "",
            startDate: "",
            endDate: "",
            reason: "",
            emergencyContact: "",
        };
        error = null;
    }

    // Calculate total days
    let totalDays = $derived(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return diff > 0 ? diff : 0;
        }
        return 0;
    });

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = null;

        try {
            await leaveStore.create(formData);
            open = false;
            resetForm();
        } catch (err) {
            error = err.message || "Failed to create leave request";
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
            Ajukan Cuti
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Ajukan Cuti / Izin</Dialog.Title>
            <Dialog.Description>
                Isi form berikut untuk mengajukan cuti atau izin.
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
                <Label for="leaveTypeId">Tipe Cuti</Label>
                <Select.Root type="single" bind:value={formData.leaveTypeId}>
                    <Select.Trigger class="w-full">
                        {#if formData.leaveTypeId}
                            {@const selected = leaveTypes.find(
                                (t) => t.id === formData.leaveTypeId,
                            )}
                            {selected ? selected.name : "Pilih tipe cuti"}
                        {:else}
                            Pilih tipe cuti
                        {/if}
                    </Select.Trigger>
                    <Select.Content>
                        {#each leaveTypes as type}
                            <Select.Item value={type.id}>
                                {type.name} ({type.code})
                            </Select.Item>
                        {:else}
                            <Select.Item value="" disabled>
                                Tidak ada tipe cuti tersedia
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="startDate">Tanggal Mulai</Label>
                    <Input
                        id="startDate"
                        type="date"
                        bind:value={formData.startDate}
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Label for="endDate">Tanggal Selesai</Label>
                    <Input
                        id="endDate"
                        type="date"
                        bind:value={formData.endDate}
                        min={formData.startDate}
                        required
                    />
                </div>
            </div>

            {#if totalDays() > 0}
                <div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p class="text-sm text-blue-800 dark:text-blue-300">
                        <CalendarIcon class="inline h-4 w-4 mr-1" />
                        Total: <strong>{totalDays()}</strong> hari kerja
                    </p>
                </div>
            {/if}

            <div class="space-y-2">
                <Label for="reason">Alasan</Label>
                <textarea
                    id="reason"
                    class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Jelaskan alasan pengajuan cuti..."
                    bind:value={formData.reason}
                    required
                ></textarea>
            </div>

            <div class="space-y-2">
                <Label for="emergencyContact">Kontak Darurat</Label>
                <Input
                    id="emergencyContact"
                    type="text"
                    placeholder="Nomor telepon yang bisa dihubungi"
                    bind:value={formData.emergencyContact}
                />
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
                        Ajukan Cuti
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
