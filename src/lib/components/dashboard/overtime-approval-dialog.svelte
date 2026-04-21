<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import CheckIcon from "@lucide/svelte/icons/check";
    import XIcon from "@lucide/svelte/icons/x";

    import { overtimeStore } from "$lib/stores/overtime.store.js";

    let { request } = $props();

    let openApprove = $state(false);
    let openReject = $state(false);
    let loading = $state(false);
    let error = $state(null);
    let rejectionReason = $state("");

    async function handleApprove() {
        loading = true;
        error = null;

        try {
            await overtimeStore.approve(request.id);
            openApprove = false;
        } catch (err) {
            error = err.message || "Failed to approve request";
        } finally {
            loading = false;
        }
    }

    async function handleReject() {
        if (!rejectionReason.trim() || rejectionReason.length < 10) {
            error = "Alasan penolakan minimal 10 karakter";
            return;
        }

        loading = true;
        error = null;

        try {
            await overtimeStore.reject(request.id, rejectionReason);
            openReject = false;
            rejectionReason = "";
        } catch (err) {
            error = err.message || "Failed to reject request";
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex gap-2">
    <!-- Approve Button -->
    <Dialog.Root bind:open={openApprove}>
        <Dialog.Trigger>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-green-600">
                <CheckIcon class="h-4 w-4" />
                <span class="sr-only">Approve</span>
            </Button>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[400px]">
            <Dialog.Header>
                <Dialog.Title>Setujui Pengajuan Lembur</Dialog.Title>
                <Dialog.Description>
                    Anda akan menyetujui pengajuan lembur dari <strong
                        >{request.employeeName}</strong
                    >.
                </Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4">
                {#if error}
                    <div
                        class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                    >
                        <p class="text-sm">{error}</p>
                    </div>
                {/if}

                <div class="rounded-lg bg-muted p-3">
                    <p class="text-sm">
                        <strong>Tanggal:</strong>
                        {request.overtimeDate}
                    </p>
                    <p class="text-sm">
                        <strong>Jam:</strong>
                        {request.startTime?.substring(0, 5)} - {request.endTime?.substring(0, 5)}
                    </p>
                    <p class="text-sm">
                        <strong>Durasi:</strong>
                        {request.totalHours} jam
                    </p>
                    <p class="text-sm">
                        <strong>Alasan:</strong>
                        {request.reason}
                    </p>
                </div>
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (openApprove = false)}
                    disabled={loading}
                >
                    Batal
                </Button>
                <Button
                    onclick={handleApprove}
                    disabled={loading}
                    class="bg-green-600 hover:bg-green-700"
                >
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                    {:else}
                        <CheckIcon class="h-4 w-4 mr-2" />
                    {/if}
                    Setujui
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>

    <!-- Reject Button -->
    <Dialog.Root bind:open={openReject}>
        <Dialog.Trigger>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-red-600">
                <XIcon class="h-4 w-4" />
                <span class="sr-only">Reject</span>
            </Button>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[400px]">
            <Dialog.Header>
                <Dialog.Title>Tolak Pengajuan Lembur</Dialog.Title>
                <Dialog.Description>
                    Anda akan menolak pengajuan lembur dari <strong
                        >{request.employeeName}</strong
                    >.
                </Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4">
                {#if error}
                    <div
                        class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                    >
                        <p class="text-sm">{error}</p>
                    </div>
                {/if}

                <div class="rounded-lg bg-muted p-3">
                    <p class="text-sm">
                        <strong>Tanggal:</strong>
                        {request.overtimeDate}
                    </p>
                    <p class="text-sm">
                        <strong>Jam:</strong>
                        {request.startTime?.substring(0, 5)} - {request.endTime?.substring(0, 5)}
                    </p>
                    <p class="text-sm">
                        <strong>Alasan:</strong>
                        {request.reason}
                    </p>
                </div>

                <div class="space-y-2">
                    <label for="rejectionReason" class="text-sm font-medium">
                        Alasan Penolakan <span class="text-red-500">*</span>
                    </label>
                    <textarea
                        id="rejectionReason"
                        class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Jelaskan alasan penolakan (minimal 10 karakter)..."
                        bind:value={rejectionReason}
                        required
                    ></textarea>
                    <p class="text-xs text-muted-foreground">
                        {rejectionReason.length}/10 karakter minimum
                    </p>
                </div>
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (openReject = false)}
                    disabled={loading}
                >
                    Batal
                </Button>
                <Button
                    onclick={handleReject}
                    disabled={loading}
                    variant="destructive"
                >
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                    {:else}
                        <XIcon class="h-4 w-4 mr-2" />
                    {/if}
                    Tolak
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>
