import { useForm } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { route } from 'ziggy-js';

export function usePersonalScript(personal: any) {
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

    const avatarUrl = computed(() => {
        if (preview.value) {
return preview.value;
}

        return personal?.photo
            ? `/storage/${personal.photo}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent('Muammar Aufar')}`;
    });

    const handleFile = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

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
