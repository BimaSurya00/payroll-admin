<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import LeaveApprovalDialog from "$lib/components/dashboard/leave-approval-dialog.svelte";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import UserIcon from "@lucide/svelte/icons/user";
    import FileTextIcon from "@lucide/svelte/icons/file-text";
    import PhoneIcon from "@lucide/svelte/icons/phone";

    let { request, isAdmin = false, onAction } = $props();

    let open = $state(false);

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function formatDateTime(dateString) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getStatusBadge(status) {
        const config = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
            CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
        };
        return config[status] || config.PENDING;
    }

    function getStatusLabel(status) {
        const labels = {
            PENDING: "Menunggu Persetujuan",
            APPROVED: "Disetujui",
            REJECTED: "Ditolak",
            CANCELLED: "Dibatalkan",
        };
        return labels[status] || status;
    }
</script>

{#if !isAdmin}
    <Button variant="ghost" size="sm" class="h-8 text-xs" onclick={() => (open = true)}>
        <FileTextIcon class="h-3.5 w-3.5 mr-1" />
        Detail
    </Button>
{:else}
    <Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => (open = true)}>
        <FileTextIcon class="h-4 w-4" />
        <span class="sr-only">Detail</span>
    </Button>
{/if}

<Dialog.Root bind:open={open}>
    <Dialog.Content class="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Detail Pengajuan Cuti</Dialog.Title>
            <Dialog.Description>
                Informasi lengkap pengajuan cuti dari <strong class="text-foreground">{request.employeeName}</strong>
            </Dialog.Description>
        </Dialog.Header>

        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold {getStatusBadge(request.status)}">
                    {getStatusLabel(request.status)}
                </span>
                <span class="text-xs text-muted-foreground">ID: {request.id?.substring(0, 8)}...</span>
            </div>

            <div class="rounded-lg border divide-y">
                <div class="flex items-start gap-3 p-4">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <UserIcon class="h-4 w-4 text-blue-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-xs text-muted-foreground">Karyawan</p>
                        <p class="text-sm font-medium">{request.employeeName}</p>
                        {#if request.employeePosition}
                            <p class="text-xs text-muted-foreground">{request.employeePosition}</p>
                        {/if}
                    </div>
                </div>

                <div class="flex items-start gap-3 p-4">
                    <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon class="h-4 w-4 text-purple-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-xs text-muted-foreground">Tipe Cuti</p>
                        <p class="text-sm font-medium">{request.leaveTypeName || request.leaveType?.name}</p>
                        <p class="text-xs text-muted-foreground">{request.leaveType?.code}</p>
                    </div>
                </div>

                <div class="flex items-start gap-3 p-4">
                    <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <ClockIcon class="h-4 w-4 text-green-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-xs text-muted-foreground">Periode</p>
                        <p class="text-sm font-medium">{formatDate(request.startDate)}</p>
                        <p class="text-sm text-muted-foreground">s/d</p>
                        <p class="text-sm font-medium">{formatDate(request.endDate)}</p>
                        <div class="mt-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            {request.totalDays} hari
                        </div>
                    </div>
                </div>

                <div class="flex items-start gap-3 p-4">
                    <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <FileTextIcon class="h-4 w-4 text-orange-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-xs text-muted-foreground">Alasan</p>
                        <p class="text-sm mt-1 whitespace-pre-wrap">{request.reason}</p>
                    </div>
                </div>

                {#if request.emergencyContact}
                    <div class="flex items-start gap-3 p-4">
                        <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                            <PhoneIcon class="h-4 w-4 text-red-600" />
                        </div>
                        <div class="flex-1">
                            <p class="text-xs text-muted-foreground">Kontak Darurat</p>
                            <p class="text-sm font-medium">{request.emergencyContact}</p>
                        </div>
                    </div>
                {/if}
            </div>

            {#if request.approvedByName}
                <div class="rounded-lg border bg-muted/50 p-4">
                    <p class="text-xs text-muted-foreground mb-2">Status Persetujuan</p>
                    <div class="space-y-1">
                        <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground">Diproses oleh</span>
                            <span class="font-medium">{request.approvedByName}</span>
                        </div>
                        {#if request.approvedAt}
                            <div class="flex justify-between text-sm">
                                <span class="text-muted-foreground">Tanggal</span>
                                <span class="font-medium">{formatDateTime(request.approvedAt)}</span>
                            </div>
                        {/if}
                        {#if request.approvalNote}
                            <div class="border-t pt-2 mt-2">
                                <span class="text-xs text-muted-foreground">Catatan:</span>
                                <p class="text-sm mt-1">{request.approvalNote}</p>
                            </div>
                        {/if}
                        {#if request.rejectionReason}
                            <div class="border-t pt-2 mt-2">
                                <span class="text-xs text-muted-foreground">Alasan Penolakan:</span>
                                <p class="text-sm mt-1 text-red-600">{request.rejectionReason}</p>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <div class="text-xs text-muted-foreground">
                <p>Diajukan: {formatDateTime(request.createdAt)}</p>
                {#if request.updatedAt && request.updatedAt !== request.createdAt}
                    <p>Diperbarui: {formatDateTime(request.updatedAt)}</p>
                {/if}
            </div>
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => (open = false)}>
                Tutup
            </Button>
            {#if request.status === "PENDING" && isAdmin}
                <LeaveApprovalDialog {request} onApproved={() => { open = false; onAction?.(); }} onRejected={() => { open = false; onAction?.(); }} />
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
