import { useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

export function useSocialScript(socials: any) {
    const route = window.route;

    const visible = ref(false);
    const mode = ref<'create' | 'edit'>('create');
    const selectedData = ref<any>(null);
    const selectedPhoto = ref<string[]>([]);
    const isDelete = ref(false);

    const excluded = ['id', 'created_at', 'updated_at'];

    const globalFields = computed(() => {
        if (!socials.data.length) return [];

        return Object.keys(socials.data[0]).filter(
            (key) =>
                typeof socials.data[0][key] !== 'object' &&
                !excluded.includes(key),
        );
    });

    const form = useForm({
        name: '',
        link: '',
        issuer: '',
        icon: '',
        color: '',
    });

    const openCreate = () => {
        mode.value = 'create';
        selectedData.value = null;
        form.reset();
        visible.value = true;
    };

    const openEdit = (data: any) => {
        mode.value = 'edit';
        selectedData.value = data;

        form.name = data.name;
        form.icon = data.icon;
        form.issuer = data.issuer;
        form.color = data.color;
        form.link = data.link;

        visible.value = true;
    };

    const openDelete = (data: any) => {
        selectedData.value = data;
        isDelete.value = true;
    };

    const closeDialogForm = () => {
        visible.value = false;
        form.reset();
        form.clearErrors();
    };

    const closeDialogDelete = () => {
        isDelete.value = false;
        form.reset();
        form.clearErrors();
    };

    const submit = () => {
        if (mode.value === 'create') {
            form.post(route('create-social'), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        } else {
            if (!selectedData.value?.id) return;

            form.put(route('update-social', selectedData.value.id), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        }
    };

    const deleteSocial = () => {
        if (!selectedData.value?.id) return;

        form.delete(route('delete-social', selectedData.value.id), {
            onSuccess: closeDialogDelete,
        });
    };

    return {
        visible,
        mode,
        selectedData,
        selectedPhoto,
        isDelete,
        globalFields,
        form,
        openCreate,
        openEdit,
        openDelete,
        closeDialogForm,
        closeDialogDelete,
        submit,
        deleteSocial,
    };
}
