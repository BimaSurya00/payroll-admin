<script>
    import { onMount } from 'svelte';
    import DashboardHeader from '$lib/components/dashboard/dashboard-header.svelte';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import { Input } from '$lib/components/ui/input/index.js';
    import { Label } from '$lib/components/ui/label/index.js';
    import UserIcon from '@lucide/svelte/icons/user';
    import MailIcon from '@lucide/svelte/icons/mail';
    import PhoneIcon from '@lucide/svelte/icons/phone';
    import MapPinIcon from '@lucide/svelte/icons/map-pin';
    import BriefcaseIcon from '@lucide/svelte/icons/briefcase';
    import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
    import BuildingIcon from '@lucide/svelte/icons/building';
    import CalendarIcon from '@lucide/svelte/icons/calendar';
    import PencilIcon from '@lucide/svelte/icons/pencil';
    import SaveIcon from '@lucide/svelte/icons/save';
    import XIcon from '@lucide/svelte/icons/x';
    import LoaderIcon from '@lucide/svelte/icons/loader';
    import CameraIcon from '@lucide/svelte/icons/camera';
    import UploadIcon from '@lucide/svelte/icons/upload';
    import TrashIcon from '@lucide/svelte/icons/trash';
    import LockIcon from '@lucide/svelte/icons/lock';
    import KeyIcon from '@lucide/svelte/icons/key';

    import { employeeStore } from '$lib/stores/employee.store.js';
    import { authStore } from '$lib/stores/auth.store.js';
    import { userStore } from '$lib/stores/user.store.js';

    // Reactive state
    let storeState = $state({ selected: null, loading: false, error: null });
    let authState = $state({ user: null });

    // Edit mode
    let isEditing = $state(false);
    let formData = $state({
        phone: '',
        address: '',
    });
    let formErrors = $state({});
    let submitting = $state(false);
    let saveSuccess = $state(false);

    // Profile image
    let uploadingImage = $state(false);
    let fileInput = $state(null);

    // Change password
    let isChangingPassword = $state(false);
    let passwordForm = $state({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    let passwordFormErrors = $state({});
    let changingPassword = $state(false);
    let passwordSuccess = $state(false);

    // Subscribe to stores
    employeeStore.subscribe((state) => {
        storeState = state;
    });

    authStore.subscribe((state) => {
        authState = state;
    });

    let employee = $derived(storeState.selected);
    let loading = $derived(storeState.loading);
    let error = $derived(storeState.error);
    let user = $derived(authState.user);

    // Fetch profile on mount
    onMount(async () => {
        try {
            await employeeStore.getMyProfile();
        } catch (err) {
            console.log('Error fetching profile:', err.message);
        }
    });

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image/(jpeg|png|jpg)')) {
            alert('Please select a valid image file (JPG or PNG)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        uploadProfileImage(file);
    }

    // Upload profile image
    async function uploadProfileImage(file) {
        if (!user?.id) {
            alert('User ID not found');
            return;
        }

        uploadingImage = true;

        try {
            await userStore.uploadProfileImage(user.id, file);
            // Refresh auth store to get updated profile image
            await authStore.fetchMe();
            alert('Profile image updated successfully!');
        } catch (err) {
            alert('Failed to upload profile image: ' + err.message);
        } finally {
            uploadingImage = false;
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }

    // Delete profile image
    async function deleteProfileImage() {
        if (!confirm('Are you sure you want to delete your profile image?')) {
            return;
        }

        if (!user?.id) {
            alert('User ID not found');
            return;
        }

        try {
            await userStore.deleteProfileImage(user.id);
            // Refresh auth store
            await authStore.fetchMe();
            alert('Profile image deleted successfully!');
        } catch (err) {
            alert('Failed to delete profile image: ' + err.message);
        }
    }

    // Trigger file input
    function triggerFileInput() {
        fileInput.click();
    }

    // Enter change password mode
    function enterChangePasswordMode() {
        passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
        passwordFormErrors = {};
        isChangingPassword = true;
        passwordSuccess = false;
    }

    // Cancel change password
    function cancelChangePassword() {
        isChangingPassword = false;
        passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
        passwordFormErrors = {};
        passwordSuccess = false;
    }

    // Validate password form
    function validatePasswordForm() {
        passwordFormErrors = {};

        if (!passwordForm.oldPassword || passwordForm.oldPassword.trim() === '') {
            passwordFormErrors.oldPassword = 'Current password is required';
        }

        if (!passwordForm.newPassword || passwordForm.newPassword.trim() === '') {
            passwordFormErrors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            passwordFormErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!passwordForm.confirmPassword || passwordForm.confirmPassword.trim() === '') {
            passwordFormErrors.confirmPassword = 'Please confirm your new password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            passwordFormErrors.confirmPassword = 'Passwords do not match';
        }

        return Object.keys(passwordFormErrors).length === 0;
    }

    // Submit change password
    async function submitChangePassword() {
        if (!validatePasswordForm()) return;

        changingPassword = true;

        try {
            await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
            passwordSuccess = true;
            isChangingPassword = false;

            // Show success message briefly
            setTimeout(() => {
                passwordSuccess = false;
            }, 3000);
        } catch (err) {
            alert('Failed to change password: ' + err.message);
        } finally {
            changingPassword = false;
        }
    }

    // Enter edit mode
    function enterEditMode() {
        if (employee) {
            formData = {
                phone: employee.phone || '',
                address: employee.address || '',
            };
            isEditing = true;
            saveSuccess = false;
        }
    }

    // Cancel edit
    function cancelEdit() {
        isEditing = false;
        formData = { phone: '', address: '' };
        formErrors = {};
        saveSuccess = false;
    }

    // Validate form
    function validateForm() {
        formErrors = {};

        if (!formData.phone || formData.phone.trim() === '') {
            formErrors.phone = 'Phone number is required';
        } else if (!/^(\+\d{1,3}[- ]?)?\d{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
            formErrors.phone = 'Invalid phone number format';
        }

        if (!formData.address || formData.address.trim() === '') {
            formErrors.address = 'Address is required';
        }

        return Object.keys(formErrors).length === 0;
    }

    // Save profile
    async function saveProfile() {
        if (!validateForm()) return;

        submitting = true;
        saveSuccess = false;

        try {
            await employeeStore.updateMyProfile(formData);
            saveSuccess = true;
            isEditing = false;

            // Show success message briefly
            setTimeout(() => {
                saveSuccess = false;
            }, 3000);
        } catch (err) {
            alert('Failed to update profile: ' + err.message);
        } finally {
            submitting = false;
        }
    }

    function formatCurrency(amount) {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function formatPhoneNumber(phone) {
        if (!phone) return '-';
        // Format: +62 812 3456 7890
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('62')) {
            return '+' + cleaned.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '$1 $2 $3 $4');
        }
        return phone;
    }
</script>

<svelte:head>
    <title>My Profile | Dashboard</title>
</svelte:head>

<DashboardHeader
    title="My Profile"
    subtitle="View and manage your personal information"
/>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <!-- Success Message -->
    {#if saveSuccess}
        <div
            class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        >
            <p class="text-sm font-medium">✓ Profile updated successfully!</p>
        </div>
    {/if}

    <!-- Error Alert -->
    {#if error}
        <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
            <p class="text-sm font-medium">Error: {error}</p>
        </div>
    {/if}

    <!-- Loading State -->
    {#if loading && !employee}
        <div class="flex items-center justify-center py-12">
            <LoaderIcon class="h-12 w-12 animate-spin text-muted-foreground" />
            <span class="ml-4 text-lg text-muted-foreground">Loading profile...</span>
        </div>
    {:else if employee}
        <div class="grid gap-6 md:grid-cols-3">
            <!-- Left Column: Profile Card -->
            <div class="md:col-span-1">
                <Card.Root class="overflow-hidden">
                    <div class="h-24 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <Card.Content class="pt-0">
                        <div class="-mt-12 mb-4 relative">
                            <div
                                class="flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-white shadow-lg text-3xl font-bold overflow-hidden group cursor-pointer"
                                onclick={triggerFileInput}
                            >
                                {#if user?.profileImage}
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        class="h-full w-full object-cover"
                                    />
                                    <div
                                        class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <CameraIcon class="h-6 w-6 text-white" />
                                    </div>
                                {:else}
                                    {(employee.userName || employee.name || 'U').charAt(0)}
                                    <div
                                        class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                    >
                                        <UploadIcon class="h-6 w-6 text-white" />
                                    </div>
                                {/if}
                            </div>
                            {#if !uploadingImage && user?.profileImage}
                                <button
                                    class="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                    onclick={deleteProfileImage}
                                    title="Remove profile picture"
                                >
                                    <TrashIcon class="h-4 w-4" />
                                </button>
                            {/if}
                            {#if uploadingImage}
                                <div
                                    class="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg animate-spin"
                                >
                                    <LoaderIcon class="h-4 w-4 animate-spin" />
                                </div>
                            {/if}
                            <input
                                bind:this={fileInput}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onchange={handleFileSelect}
                                class="hidden"
                            />
                        </div>
                        <h2 class="text-2xl font-bold">
                            {employee.userName || employee.name || 'User'}
                        </h2>
                        <p class="text-muted-foreground">
                            {employee.position || employee.userEmail || employee.email}
                        </p>
                        <div class="mt-4 space-y-2">
                            <div class="flex items-center gap-2 text-sm">
                                <BuildingIcon class="h-4 w-4 text-muted-foreground" />
                                <span class="text-muted-foreground">ID:</span>
                                <span class="font-mono text-xs">{employee.id?.slice(0, 8)}...</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                                <span class="text-muted-foreground">Joined:</span>
                                <span>{formatDate(employee.joinDate)}</span>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>
            </div>

            <!-- Right Column: Profile Details -->
            <div class="md:col-span-2 space-y-4">
                <!-- Personal Information -->
                <Card.Root>
                    <Card.Header>
                        <div class="flex items-center justify-between">
                            <div>
                                <Card.Title class="text-lg font-semibold">
                                    Personal Information
                                </Card.Title>
                                <Card.Description
                                    >Your basic personal details</Card.Description
                                >
                            </div>
                            {#if !isEditing}
                                <Button variant="outline" size="sm" onclick={enterEditMode}>
                                    <PencilIcon class="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            {/if}
                        </div>
                    </Card.Header>
                    <Card.Content>
                        {#if isEditing}
                            <!-- Edit Mode -->
                            <div class="space-y-4">
                                <div class="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label for="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+62 812 3456 7890"
                                            bind:value={formData.phone}
                                            class="mt-1"
                                        />
                                        {#if formErrors.phone}
                                            <p class="text-sm text-destructive mt-1">{formErrors.phone}</p>
                                        {/if}
                                    </div>
                                    <div>
                                        <Label for="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={employee.userEmail || employee.email}
                                            disabled
                                            class="mt-1 bg-muted"
                                        />
                                        <p class="text-xs text-muted-foreground mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label for="address">Address *</Label>
                                    <textarea
                                        id="address"
                                        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                                        placeholder="Enter your full address"
                                        bind:value={formData.address}
                                    ></textarea>
                                    {#if formErrors.address}
                                        <p class="text-sm text-destructive mt-1">{formErrors.address}</p>
                                    {/if}
                                </div>

                                <div class="flex gap-2">
                                    <Button onclick={saveProfile} disabled={submitting}>
                                        {#if submitting}
                                            <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                                        {:else}
                                            <SaveIcon class="h-4 w-4 mr-2" />
                                        {/if}
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onclick={cancelEdit}
                                        disabled={submitting}
                                    >
                                        <XIcon class="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        {:else}
                            <!-- View Mode -->
                            <div class="space-y-4">
                                <div class="flex items-start gap-3">
                                    <MailIcon class="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div class="flex-1">
                                        <p class="text-sm text-muted-foreground">Email</p>
                                        <p class="font-medium">{employee.userEmail || employee.email}</p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <PhoneIcon class="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div class="flex-1">
                                        <p class="text-sm text-muted-foreground">Phone</p>
                                        <p class="font-medium">{formatPhoneNumber(employee.phone)}</p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <MapPinIcon class="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div class="flex-1">
                                        <p class="text-sm text-muted-foreground">Address</p>
                                        <p class="font-medium">{employee.address || '-'}</p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <CalendarIcon class="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div class="flex-1">
                                        <p class="text-sm text-muted-foreground">Join Date</p>
                                        <p class="font-medium">{formatDate(employee.joinDate)}</p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <BriefcaseIcon class="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div class="flex-1">
                                        <p class="text-sm text-muted-foreground">Position</p>
                                        <p class="font-medium">{employee.position || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <!-- Change Password -->
                <Card.Root>
                    <Card.Header>
                        <div class="flex items-center justify-between">
                            <div>
                                <Card.Title class="text-lg font-semibold">Security</Card.Title>
                                <Card.Description>Manage your password</Card.Description>
                            </div>
                            {#if !isChangingPassword}
                                <Button variant="outline" size="sm" onclick={enterChangePasswordMode}>
                                    <LockIcon class="h-4 w-4 mr-2" />
                                    Change Password
                                </Button>
                            {/if}
                        </div>
                    </Card.Header>
                    <Card.Content>
                        {#if isChangingPassword}
                            <!-- Change Password Form -->
                            <div class="space-y-4">
                                <div>
                                    <Label for="oldPassword">Current Password *</Label>
                                    <Input
                                        id="oldPassword"
                                        type="password"
                                        placeholder="Enter your current password"
                                        class="mt-1"
                                        bind:value={passwordForm.oldPassword}
                                    />
                                    {#if passwordFormErrors.oldPassword}
                                        <p class="text-sm text-destructive mt-1">
                                            {passwordFormErrors.oldPassword}
                                        </p>
                                    {/if}
                                </div>

                                <div>
                                    <Label for="newPassword">New Password *</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Enter your new password (min 6 characters)"
                                        class="mt-1"
                                        bind:value={passwordForm.newPassword}
                                    />
                                    {#if passwordFormErrors.newPassword}
                                        <p class="text-sm text-destructive mt-1">
                                            {passwordFormErrors.newPassword}
                                        </p>
                                    {/if}
                                </div>

                                <div>
                                    <Label for="confirmPassword">Confirm New Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter your new password"
                                        class="mt-1"
                                        bind:value={passwordForm.confirmPassword}
                                    />
                                    {#if passwordFormErrors.confirmPassword}
                                        <p class="text-sm text-destructive mt-1">
                                            {passwordFormErrors.confirmPassword}
                                        </p>
                                    {/if}
                                </div>

                                <div class="flex gap-2">
                                    <Button
                                        onclick={submitChangePassword}
                                        disabled={changingPassword}
                                        class="flex-1"
                                    >
                                        {#if changingPassword}
                                            <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                                        {:else}
                                            <KeyIcon class="h-4 w-4 mr-2" />
                                        {/if}
                                        Update Password
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onclick={cancelChangePassword}
                                        disabled={changingPassword}
                                        class="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        {:else}
                            <!-- View Mode -->
                            <div class="space-y-2">
                                <div class="flex items-center gap-2 text-sm">
                                    <KeyIcon class="h-4 w-4 text-muted-foreground" />
                                    <div class="flex-1">
                                        <p class="text-muted-foreground">Password</p>
                                        <p class="font-medium">•••••••••</p>
                                    </div>
                                </div>
                                <p class="text-xs text-muted-foreground">
                                    Last changed: Not recorded
                                </p>
                                <div class="mt-3 p-3 rounded-lg bg-muted/50">
                                    <p class="text-xs text-muted-foreground">
                                        For security, you should change your password regularly. Use a strong
                                        password with at least 6 characters.
                                    </p>
                                </div>
                            </div>
                        {/if}

                        <!-- Success Message -->
                        {#if passwordSuccess}
                            <div
                                class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                            >
                                <p class="text-sm font-medium">✓ Password changed successfully!</p>
                            </div>
                        {/if}
                    </Card.Content>
                </Card.Root>

                <!-- Employment Details (Read-only) -->
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="text-lg font-semibold">Employment Details</Card.Title>
                        <Card.Description>Work-related information</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="grid gap-4 md:grid-cols-2">
                            <div>
                                <p class="text-sm text-muted-foreground">Employee ID</p>
                                <p class="font-mono text-sm">{employee.id}</p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Schedule</p>
                                <p class="font-medium">
                                    {employee.scheduleName || 'Not Assigned'}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Base Salary</p>
                                <p class="font-bold text-lg text-blue-600">
                                    {formatCurrency(employee.salaryBase)}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Bank Account</p>
                                <p class="font-medium">
                                    {employee.bankName} - {employee.bankAccountNumber}
                                </p>
                            </div>
                        </div>

                        <div class="mt-4 p-4 rounded-lg bg-muted/50">
                            <p class="text-xs text-muted-foreground mb-1">
                                Note: Employment details are managed by HR
                            </p>
                            <p class="text-xs text-muted-foreground">
                                Contact your HR manager for any changes to salary, schedule, or
                                bank information
                            </p>
                        </div>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    {/if}
</div>
