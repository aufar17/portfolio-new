import { useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

export function useAwardScript(awards: any) {
    const route = window.route;

    const visible = ref(false);
    const photoModalVisible = ref(false);
    const mode = ref<'create' | 'edit'>('create');
    const selectedData = ref<any>(null);
    const selectedPhoto = ref<string[]>([]);
    const isDelete = ref(false);

    const excluded = ['id', 'created_at', 'updated_at'];

    const globalFields = computed(() => {
        if (!awards.length) {
            return [];
        }

        return Object.keys(awards[0]).filter(
            (key) =>
                typeof awards[0][key] !== 'object' && !excluded.includes(key),
        );
    });

    const openPhotoModal = (photo: string[]) => {
        selectedPhoto.value = photo || [];
        photoModalVisible.value = true;
    };

    const form = useForm({
        title: '',
        description: '',
        type: '',
        status: null as boolean | null,
        issuer: '',
        photo: null as File | null,
        date: null as Date | null,
    });

    const handleFile = (event: any) => {
        form.photo = event.files[0];
    };
    const openCreate = () => {
        mode.value = 'create';
        selectedData.value = null;
        form.reset();
        visible.value = true;
    };

    const openEdit = (data: any) => {
        mode.value = 'edit';
        selectedData.value = data;

        form.title = data.title;
        form.photo = null;
        form.type = data.type;
        form.status = data.status;
        form.issuer = data.issuer;
        form.date = data.date ? new Date(data.date) : null;
        form.description = data.description;

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
        form.transform((data) => ({
            ...data,
            date: data.date
                ? new Date(data.date).toISOString().split('T')[0]
                : null,
        }));

        if (mode.value === 'create') {
            form.post(route('create-award'), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        } else {
            if (!selectedData.value?.id) {
                return;
            }

            form.put(route('update-award', selectedData.value.id), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        }
    };

    const deleteAward = () => {
        if (!selectedData.value?.id) {
            return;
        }

        form.delete(route('delete-award', selectedData.value.id), {
            onSuccess: closeDialogDelete,
        });
    };

    const toggleStatus = (data: any, val: boolean) => {
        const newStatus = val ? 1 : 0;

        useForm({ status: newStatus }).put(
            route('update-status-award', data.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    data.status = newStatus;
                },
            },
        );
    };

    return {
        visible,
        photoModalVisible,
        mode,
        selectedData,
        selectedPhoto,
        isDelete,
        globalFields,
        form,
        handleFile,
        openCreate,
        openEdit,
        openDelete,
        openPhotoModal,
        closeDialogForm,
        closeDialogDelete,
        submit,
        deleteAward,
        toggleStatus,
    };
}
