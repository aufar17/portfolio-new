import { useForm } from '@inertiajs/vue3';
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';
import { route } from 'ziggy-js';
import { storageUrl } from '@/lib/utils';

export function usePersonalScript(personal: any) {
    const toast = useToast();
    const fileInput = ref<HTMLInputElement | null>(null);
    const preview = ref<string | null>(null);

    const form = useForm({
        desc: personal?.desc ?? '',
        role: personal?.role ?? '',
        about: personal?.about ?? '',
        photo: null as File | null,
    });

    watch(
        () => personal,
        (val) => {
            if (val) {
                form.desc = val.desc ?? '';
                form.role = val.role ?? '';
                form.about = val.about ?? '';
            }
        },
        { immediate: true },
    );

    const avatarUrl = computed(
        () =>
            preview.value ??
            storageUrl(personal?.photo) ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent('Muammar Aufar')}`,
    );

    const handleFile = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) {
            return;
        }

        form.photo = file;
        preview.value = URL.createObjectURL(file);
    };

    const submit = () => {
        if (!personal?.id) {
            return;
        }

        form.put(route('update-personal', personal.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () =>
                toast.add({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Personal information updated.',
                    life: 3500,
                }),
            onError: () =>
                toast.add({
                    severity: 'error',
                    summary: 'Please check the form',
                    detail: 'Some fields need your attention.',
                    life: 3500,
                }),
        });
    };

    return {
        fileInput,
        preview,
        form,
        avatarUrl,
        handleFile,
        submit,
    };
}
