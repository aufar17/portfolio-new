import { useForm } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

export function useSkillScript(projects: any) {
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
        name: '',
        type: '',
        icon: null as File | null,
    });

    const handleFile = (event: any) => {
        form.icon = event.files[0];
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

        form.name = data.name;
        form.icon = data.icon;
        form.type = data.type;

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
            form.post(route('create-skill'), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        } else {
            if (!selectedData.value?.id) return;

            form.put(route('update-skill', selectedData.value.id), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        }
    };

    const deleteProject = () => {
        if (!selectedData.value?.id) return;

        form.delete(route('delete-skill', selectedData.value.id), {
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
