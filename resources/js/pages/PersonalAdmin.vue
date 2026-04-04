<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { computed, ref, watch } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { personalAdmin } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from '@/components/ui/button/Button.vue';
import { Pencil } from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Personal', href: personalAdmin().url },
];

const props = defineProps<{
    personal: any;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(null);

const form = useForm({
    desc: '',
    role: '',
    about: '',
    photo: null as File | null,
});

watch(
    () => props.personal,
    (val) => {
        if (val) {
            form.desc = val.desc ?? '';
            form.role = val.role ?? '';
            form.about = val.about ?? '';
        }
    },
    { immediate: true },
);

const avatarUrl = computed(() => {
    if (preview.value) return preview.value;

    if (props.personal?.photo) {
        return `/storage/${props.personal.photo}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        props.personal?.role ?? 'User',
    )}&background=random&color=fff`;
});

const handleFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    form.photo = file;
    preview.value = URL.createObjectURL(file);
};

const submit = () => {
    if (!props.personal?.id) return;

    form.put(route('update-personal', props.personal.id), {
        forceFormData: true,
    });
};
</script>
<template>
    <Head title="Personal" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="p-4">
            <div class="rounded-xl border bg-background p-4 shadow-sm">
                <h2 class="m-2 text-xl font-semibold">Personal Information</h2>
                <hr class="mt-4 mb-10" />

                <form @submit.prevent="submit" class="grid grid-cols-2 gap-6">
                    <div class="col-span-2 flex flex-col items-center gap-4">
                        <label class="font-semibold">Profile Image</label>

                        <div
                            class="relative cursor-pointer"
                            @click="fileInput?.click()"
                        >
                            <img
                                :src="avatarUrl"
                                class="h-32 w-32 rounded-full border object-cover shadow"
                            />

                            <div
                                class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition hover:opacity-800"
                            >
                                <Pencil class="h-6 w-6 text-white" />
                            </div>
                        </div>

                        <input
                            ref="fileInput"
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="handleFile"
                        />
                    </div>
                    <div class="col-span-2 flex flex-col gap-2">
                        <label class="font-semibold">Role</label>
                        <InputText v-model="form.role" required />
                        <small v-if="form.errors.role" class="text-red-500">
                            {{ form.errors.role }}
                        </small>
                    </div>

                    <div class="col-span-2 flex flex-col gap-2">
                        <label class="font-semibold">Description</label>
                        <Textarea v-model="form.desc" autoResize required />
                    </div>

                    <div class="col-span-2 flex flex-col gap-2">
                        <label class="font-semibold">About</label>
                        <Textarea v-model="form.about" autoResize required />
                    </div>

                    <div class="col-span-2 flex justify-end gap-3">
                        <Button type="reset" variant="outline"> Cancel </Button>

                        <Button
                            type="submit"
                            :disabled="form.processing"
                            class="font-bold text-white"
                        >
                            {{ form.processing ? 'Saving...' : 'Save' }}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
