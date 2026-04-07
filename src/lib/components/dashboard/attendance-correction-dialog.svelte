<script>
    import { attendanceStore } from '$lib/stores/attendance.store.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Label } from '$lib/components/ui/label/index.js';
    import { Input } from '$lib/components/ui/input/index.js';
    import LoaderIcon from '@lucide/svelte/icons/loader';
    import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';

    let { attendance = null, open = false } = $props();

    let formData = $state({
        correctClockIn: '',
        correctClockOut: '',
        reason: '',
    });

    let formErrors = $state({});
    let submitting = $state(false);

    // Initialize form when dialog opens
    $effect(() => {
        if (open && attendance) {
            formData = {
                correctClockIn: attendance.clockInTime || '',
                correctClockOut: attendance.clockOutTime || '',
                reason: '',
            };
            formErrors = {};
        }
    });

    function validateForm() {
        formErrors = {};

        if (!formData.correctClockIn && !formData.correctClockOut) {
            formErrors.time = 'At least one time must be provided';
        }

        if (formData.correctClockIn && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.correctClockIn)) {
            formErrors.correctClockIn = 'Invalid time format (use HH:MM)';
        }

        if (formData.correctClockOut && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.correctClockOut)) {
            formErrors.correctClockOut = 'Invalid time format (use HH:MM)';
        }

        if (!formData.reason || formData.reason.trim() === '') {
            formErrors.reason = 'Reason for correction is required';
        }

        return Object.keys(formErrors).length === 0;
    }

    async function submitCorrection() {
        if (!validateForm()) return;

        submitting = true;

        try {
            await attendanceStore.createCorrection({
                attendanceId: attendance.id,
                correctClockIn: formData.correctClockIn || null,
                correctClockOut: formData.correctClockOut || null,
                reason: formData.reason,
            });

            // Refresh attendance list
            await attendanceStore.fetchAll();

            open = false;
        } catch (err) {
            alert('Failed to create correction: ' + err.message);
        } finally {
            submitting = false;
        }
    }

    function closeDialog() {
        open = false;
        formData = { correctClockIn: '', correctClockOut: '', reason: '' };
        formErrors = {};
    }
</script>

{#if open}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <div class="flex items-center gap-2 mb-4">
                <AlertTriangleIcon class="h-5 w-5 text-orange-600" />
                <h2 class="text-xl font-semibold">Request Attendance Correction</h2>
            </div>

            {#if attendance}
                <div class="space-y-4 mb-4">
                    <div class="p-3 rounded-lg bg-muted/50">
                        <p class="text-sm font-medium">{attendance.employeeName}</p>
                        <p class="text-xs text-muted-foreground">{attendance.date}</p>
                        <div class="flex gap-4 mt-2 text-xs">
                            <span>
                                In: <span class="font-medium">{attendance.clockInTime || '-'}</span>
                            </span>
                            <span>
                                Out: <span class="font-medium">{attendance.clockOutTime || '-'}</span>
                            </span>
                            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                {attendance.status}
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label for="correctClockIn">Correct Clock In Time</Label>
                        <Input
                            id="correctClockIn"
                            type="time"
                            class="mt-1"
                            bind:value={formData.correctClockIn}
                        />
                        {#if formErrors.correctClockIn}
                            <p class="text-sm text-destructive mt-1">{formErrors.correctClockIn}</p>
                        {/if}
                    </div>

                    <div>
                        <Label for="correctClockOut">Correct Clock Out Time</Label>
                        <Input
                            id="correctClockOut"
                            type="time"
                            class="mt-1"
                            bind:value={formData.correctClockOut}
                        />
                        {#if formErrors.correctClockOut}
                            <p class="text-sm text-destructive mt-1">{formErrors.correctClockOut}</p>
                        {/if}
                    </div>

                    {#if formErrors.time}
                        <p class="text-sm text-destructive">{formErrors.time}</p>
                    {/if}

                    <div>
                        <Label for="reason">Reason for Correction *</Label>
                        <textarea
                            id="reason"
                            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                            placeholder="Explain why this correction is needed"
                            bind:value={formData.reason}
                        ></textarea>
                        {#if formErrors.reason}
                            <p class="text-sm text-destructive mt-1">{formErrors.reason}</p>
                        {/if}
                    </div>

                    <div class="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                        <p class="text-xs text-orange-800 dark:text-orange-300">
                            <strong>Note:</strong> This correction request will be reviewed by an admin.
                            Corrections are logged for audit purposes.
                        </p>
                    </div>
                </div>

                <div class="flex gap-2">
                    <Button variant="outline" class="flex-1" onclick={closeDialog} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button class="flex-1" onclick={submitCorrection} disabled={submitting}>
                        {#if submitting}
                            <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                        {/if}
                        Submit Request
                    </Button>
                </div>
            {/if}
        </div>
    </div>
{/if}
