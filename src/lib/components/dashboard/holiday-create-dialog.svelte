<script>
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import LoaderIcon from "@lucide/svelte/icons/loader";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import RepeatIcon from "@lucide/svelte/icons/repeat";

    import { holidayStore } from "$lib/stores/holiday.store.js";

    let open = $state(false);
    let loading = $state(false);
    let error = $state(null);

    let formData = $state({
        name: "",
        date: "",
        isRecurring: false,
        description: "",
    });

    function resetForm() {
        formData = {
            name: "",
            date: "",
            isRecurring: false,
            description: "",
        };
        error = null;
    }

    function getYearFromDate(dateString) {
        if (!dateString) return new Date().getFullYear();
        return new Date(dateString).getFullYear();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = null;

        try {
            const payload = {
                name: formData.name,
                date: formData.date,
                year: getYearFromDate(formData.date),
                isRecurring: formData.isRecurring,
                description: formData.description || undefined,
            };
            await holidayStore.create(payload);
            open = false;
            resetForm();
        } catch (err) {
            error = err.message || "Failed to create holiday";
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
            Add Holiday
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Add New Holiday</Dialog.Title>
            <Dialog.Description>
                Create a new company holiday. Fill in all required fields.
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
                <Label for="name">
                    Holiday Name
                    <span class="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Independence Day"
                    bind:value={formData.name}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="date">
                    <div class="flex items-center gap-2">
                        <CalendarIcon class="h-4 w-4" />
                        Date
                        <span class="text-red-500">*</span>
                    </div>
                </Label>
                <Input
                    id="date"
                    type="date"
                    bind:value={formData.date}
                    required
                />
            </div>

            <div class="space-y-2">
                <Label for="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Add details about this holiday..."
                    bind:value={formData.description}
                    rows="3"
                />
            </div>

            <div class="flex items-start space-x-3 rounded-lg border p-3">
                <div class="flex h-5 items-center">
                    <input
                        id="isRecurring"
                        type="checkbox"
                        bind:checked={formData.isRecurring}
                        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                </div>
                <div class="flex-1">
                    <Label for="isRecurring" class="flex items-center gap-2 font-medium">
                        <RepeatIcon class="h-4 w-4" />
                        Recurring Holiday
                    </Label>
                    <p class="text-sm text-muted-foreground mt-1">
                        Check this if this holiday repeats every year (e.g., New Year, Christmas)
                    </p>
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
                        Creating...
                    {:else}
                        Create Holiday
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
