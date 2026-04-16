<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";

    import { scheduleStore } from "$lib/stores/schedule.store.js";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let formData = $state({
        name: "",
        timeIn: "",
        timeOut: "",
        allowedLateMinutes: "15",
    });

    function resetForm() {
        formData = {
            name: "",
            timeIn: "",
            timeOut: "",
            allowedLateMinutes: "15",
        };
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
            await scheduleStore.create(payload);
            open = false;
            resetForm();
        } catch (err) {
            error = err.message || "Failed to create schedule";
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
            Add Schedule
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[500px]">
        <Dialog.Header>
            <Dialog.Title>Create New Schedule</Dialog.Title>
            <Dialog.Description>
                Add a new work schedule with time settings.
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
                <Label for="name">Schedule Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Morning Shift"
                    bind:value={formData.name}
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="timeIn">Time In</Label>
                    <Input
                        id="timeIn"
                        type="time"
                        bind:value={formData.timeIn}
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Label for="timeOut">Time Out</Label>
                    <Input
                        id="timeOut"
                        type="time"
                        bind:value={formData.timeOut}
                        required
                    />
                </div>
            </div>

            <div class="space-y-2">
                <Label for="allowedLateMinutes">Allowed Late Minutes</Label>
                <Input
                    id="allowedLateMinutes"
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
                        Creating...
                    {:else}
                        Create Schedule
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
