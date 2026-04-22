<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import CheckIcon from "@lucide/svelte/icons/check";
    import XIcon from "@lucide/svelte/icons/x";
    import { toast } from "svelte-sonner";

    import { leaveStore } from "$lib/stores/leave.store.js";

    let { request, onApproved, onRejected } = $props();

    let openApprove = $state(false);
    let openReject = $state(false);
    let loading = $state(false);
    let error = $state(null);
    let approvalNote = $state("");
    let rejectionReason = $state("");

    async function handleApprove() {
        loading = true;
        error = null;

        try {
            await leaveStore.approve(request.id, approvalNote);
            openApprove = false;
            approvalNote = "";
            toast.success("Pengajuan cuti berhasil disetujui");
            onApproved?.();
        } catch (err) {
            error = err.message || "Gagal menyetujui pengajuan";
            toast.error(error);
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
            await leaveStore.reject(request.id, rejectionReason);
            openReject = false;
            rejectionReason = "";
            toast.success("Pengajuan cuti berhasil ditolak");
            onRejected?.();
        } catch (err) {
            error = err.message || "Gagal menolak pengajuan";
            toast.error(error);
        } finally {
            loading = false;
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }
</script>

<div class="flex gap-1">
    <Dialog.Root bind:open={openApprove}>
        <Dialog.Trigger asChild>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                <CheckIcon class="h-4 w-4" />
                <span class="sr-only">Setujui</span>
            </Button>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[450px]">
            <Dialog.Header>
                <Dialog.Title class="flex items-center gap-2 text-green-700">
                    <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckIcon class="h-4 w-4 text-green-600" />
                    </div>
                    Setujui Pengajuan Cuti
                </Dialog.Title>
                <Dialog.Description>
                    Anda akan menyetujui pengajuan cuti dari <strong class="text-foreground">{request.employeeName}</strong>.
                </Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4">
                {#if error}
                    <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <p class="text-sm">{error}</p>
                    </div>
                {/if}

                <div class="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Tipe Cuti</span>
                        <span class="font-medium">{request.leaveTypeName || request.leaveType?.name}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Tanggal Mulai</span>
                        <span class="font-medium">{formatDate(request.startDate)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Tanggal Selesai</span>
                        <span class="font-medium">{formatDate(request.endDate)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Durasi</span>
                        <span class="font-medium">{request.totalDays} hari</span>
                    </div>
                    <div class="border-t pt-2 mt-2">
                        <span class="text-xs text-muted-foreground">Alasan Karyawan:</span>
                        <p class="text-sm mt-1">{request.reason}</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="approvalNote" class="text-sm font-medium">
                        Catatan Persetujuan <span class="text-muted-foreground font-normal">(opsional)</span>
                    </label>
                    <textarea
                        id="approvalNote"
                        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Tambahkan catatan jika diperlukan..."
                        bind:value={approvalNote}
                    ></textarea>
                </div>
            </div>

            <Dialog.Footer>
                <Button type="button" variant="outline" onclick={() => (openApprove = false)} disabled={loading}>
                    Batal
                </Button>
                <Button onclick={handleApprove} disabled={loading} class="bg-green-600 hover:bg-green-700 text-white">
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        Menyetujui...
                    {:else}
                        <CheckIcon class="h-4 w-4 mr-2" />
                        Setujui
                    {/if}
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>

    <Dialog.Root bind:open={openReject}>
        <Dialog.Trigger asChild>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                <XIcon class="h-4 w-4" />
                <span class="sr-only">Tolak</span>
            </Button>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[450px]">
            <Dialog.Header>
                <Dialog.Title class="flex items-center gap-2 text-red-700">
                    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XIcon class="h-4 w-4 text-red-600" />
                    </div>
                    Tolak Pengajuan Cuti
                </Dialog.Title>
                <Dialog.Description>
                    Anda akan menolak pengajuan cuti dari <strong class="text-foreground">{request.employeeName}</strong>.
                </Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4">
                {#if error}
                    <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <p class="text-sm">{error}</p>
                    </div>
                {/if}

                <div class="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Tipe Cuti</span>
                        <span class="font-medium">{request.leaveTypeName || request.leaveType?.name}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Tanggal</span>
                        <span class="font-medium">{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Durasi</span>
                        <span class="font-medium">{request.totalDays} hari</span>
                    </div>
                    <div class="border-t pt-2 mt-2">
                        <span class="text-xs text-muted-foreground">Alasan Karyawan:</span>
                        <p class="text-sm mt-1">{request.reason}</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="rejectionReason" class="text-sm font-medium">
                        Alasan Penolakan <span class="text-red-500">*</span>
                    </label>
                    <textarea
                        id="rejectionReason"
                        class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                <Button type="button" variant="outline" onclick={() => (openReject = false)} disabled={loading}>
                    Batal
                </Button>
                <Button onclick={handleReject} disabled={loading || rejectionReason.length < 10} variant="destructive">
                    {#if loading}
                        <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        Menolak...
                    {:else}
                        <XIcon class="h-4 w-4 mr-2" />
                        Tolak
                    {/if}
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>
