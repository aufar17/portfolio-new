import { useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

export function useProjectScript(projects: any) {
    const route = window.route;

    const visible = ref(false);
    const mode = ref<'create' | 'edit'>('create');
    const selectedData = ref<any>(null);
    const isDelete = ref(false);

    const excluded = ['id', 'created_at', 'updated_at'];

    const globalFields = computed(() => {
        if (!projects.data.length) return [];

        return Object.keys(projects.data[0]).filter(
            (key) =>
                typeof projects.data[0][key] !== 'object' &&
                !excluded.includes(key),
        );
    });

    const form = useForm({
        title: '',
        description: '',
        responsibility: '',
        start: null as Date | null,
        end: null as Date | null,
        status: null as string | null,
        tech: '',
        link: '',
        associate: '',
        image: null as File | null,
    });

    const handleFile = (event: any) => {
        form.image = event.files[0];
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
        form.description = data.description;
        form.responsibility = data.responsibility;

        form.start = data.start ? new Date(data.start) : null;
        form.end = data.end ? new Date(data.end) : null;

        form.tech = data.tech;
        form.link = data.link;
        form.associate = data.associate;
        form.image = null;

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
            start: data.start
                ? new Date(data.start).toISOString().split('T')[0]
                : null,
            end: data.end
                ? new Date(data.end).toISOString().split('T')[0]
                : null,
        }));

        if (mode.value === 'create') {
            form.post(route('create-project'), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        } else {
            if (!selectedData.value?.id) return;

            form.put(route('update-project', selectedData.value.id), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        }
    };

    const deleteProject = () => {
        if (!selectedData.value?.id) return;

        form.delete(route('delete-project', selectedData.value.id), {
            onSuccess: closeDialogDelete,
        });
    };

    return {
        visible,
        mode,
        selectedData,
        isDelete,
        globalFields,
        form,
        handleFile,
        openCreate,
        openEdit,
        openDelete,
        closeDialogForm,
        closeDialogDelete,
        submit,
        deleteProject,
    };
}
