<script setup lang="ts">
import { Camera } from 'lucide-vue-next';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import AdminPage from '@/components/admin/AdminPage.vue';
import FormField from '@/components/admin/FormField.vue';
import { personalAdmin } from '@/routes';
import { usePersonalScript } from '@/script/admin/personal';
import type { BreadcrumbItem } from '@/types';

const props = defineProps<{ personal: any }>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Personal', href: personalAdmin().url },
];

const { fileInput, form, avatarUrl, handleFile, submit } = usePersonalScript(
    props.personal,
);
</script>

<template>
    <AdminPage
        title="Personal"
        description="Profile information shown in the hero and about sections."
        :breadcrumbs="breadcrumbs"
    >
        <form
            class="grid gap-6 lg:grid-cols-[280px_1fr]"
            @submit.prevent="submit"
        >
            <section
                class="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center shadow-soft"
                aria-labelledby="profile-image-label"
            >
                <h2
                    id="profile-image-label"
                    class="text-sm font-semibold text-foreground"
                >
                    Profile Image
                </h2>

                <button
                    type="button"
                    class="group relative size-36 overflow-hidden rounded-full border-4 border-background shadow-elevated focus-ring"
                    aria-label="Change profile image"
                    @click="fileInput?.click()"
                >
                    <img
                        :src="avatarUrl"
                        alt="Current profile image"
                        class="size-full object-cover"
                    />
                    <span
                        class="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                    >
                        <Camera class="size-7" />
                    </span>
                </button>
                <p class="text-xs text-muted-foreground">
                    Click the photo to upload a new one.
                </p>
                <p
                    v-if="form.errors.photo"
                    class="text-sm font-medium text-destructive"
                    role="alert"
                >
                    {{ form.errors.photo }}
                </p>

                <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    tabindex="-1"
                    aria-hidden="true"
                    @change="handleFile"
                />
            </section>

            <section
                class="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-soft"
            >
                <FormField
                    v-slot="{ id, invalid }"
                    id="personal-role"
                    label="Role"
                    hint="Separate multiple roles with a comma."
                    :error="form.errors.role"
                    required
                >
                    <InputText
                        :id="id"
                        v-model="form.role"
                        :invalid="invalid"
                        required
                    />
                </FormField>

                <FormField
                    v-slot="{ id, invalid }"
                    id="personal-desc"
                    label="Description"
                    :error="form.errors.desc"
                    required
                >
                    <Textarea
                        :id="id"
                        v-model="form.desc"
                        :invalid="invalid"
                        rows="3"
                        auto-resize
                        required
                    />
                </FormField>

                <FormField
                    v-slot="{ id, invalid }"
                    id="personal-about"
                    label="About"
                    :error="form.errors.about"
                    required
                >
                    <Textarea
                        :id="id"
                        v-model="form.about"
                        :invalid="invalid"
                        rows="6"
                        auto-resize
                        required
                    />
                </FormField>

                <div class="flex justify-end">
                    <Button
                        type="submit"
                        label="Save changes"
                        icon="pi pi-check"
                        :loading="form.processing"
                    />
                </div>
            </section>
        </form>
    </AdminPage>
</template>
