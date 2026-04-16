<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    import { scheduleStore } from "$lib/stores/schedule.store.js";

    let { schedule } = $props();

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let formData = $state({
        name: "",
        timeIn: "",
        timeOut: "",
        allowedLateMinutes: "",
    });

    function initForm() {
        if (schedule) {
            formData = {
                name: schedule.name || "",
                timeIn: schedule.timeIn || "",
                timeOut: schedule.timeOut || "",
                allowedLateMinutes:
                    schedule.allowedLateMinutes?.toString() || "15",
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
                name: formData.name,
                timeIn: formData.timeIn,
                timeOut: formData.timeOut,
                allowedLateMinutes: parseInt(formData.allowedLateMinutes, 10),
            };
            await scheduleStore.update(schedule.id, payload);
            open = false;
        } catch (err) {
            error = err.message || "Failed to update schedule";
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
    <Dialog.Content class="sm:max-w-[500px]">
        <Dialog.Header>
            <Dialog.Title>Edit Schedule</Dialog.Title>
            <Dialog.Description>
                Update schedule settings for "{schedule?.name ||
                    "this schedule"}".
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
                <Label for="edit-sched-name">Schedule Name</Label>
                <Input
                    id="edit-sched-name"
                    type="text"
                    placeholder="Morning Shift"
                    bind:value={formData.name}
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="edit-timeIn">Time In</Label>
                    <Input
                        id="edit-timeIn"
                        type="time"
                        bind:value={formData.timeIn}
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Label for="edit-timeOut">Time Out</Label>
                    <Input
                        id="edit-timeOut"
                        type="time"
                        bind:value={formData.timeOut}
                        required
                    />
                </div>
            </div>

            <div class="space-y-2">
                <Label for="edit-allowedLateMinutes">Allowed Late Minutes</Label>
                <Input
                    id="edit-allowedLateMinutes"
                    type="number"
                    placeholder="15"
                    bind:value={formData.allowedLateMinutes}
                    required
                    min="0"
                />
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
