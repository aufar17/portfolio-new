import { useForm } from '@inertiajs/vue3';
import { computed, ref, watch } from 'vue';
import { deleteEducation } from '@/routes';

export function useEducationScript(educations: any) {
    const route = window.route;

    const visible = ref(false);
    const mode = ref<'create' | 'edit'>('create');
    const selectedData = ref<any>(null);
    const isDelete = ref(false);
    const isPresent = ref(false);

    const excluded = ['id', 'created_at', 'updated_at'];

    const globalFields = computed(() => {
        if (!educations.data.length) {
return [];
}

        return Object.keys(educations.data[0]).filter(
            (key) =>
                typeof educations.data[0][key] !== 'object' &&
                !excluded.includes(key),
        );
    });

    const form = useForm({
        institution: '',
        major: '',
        title: '',
        start: null as Date | null,
        end: null as Date | null,
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

        form.institution = data.institution;
        form.major = data.major;
        form.title = data.title;
        form.start = data.start ? new Date(data.start) : null;
        form.end = data.end ? new Date(data.end) : null;
        isPresent.value = data.end === null;
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
            end: isPresent.value
                ? null
                : form.end
                  ? new Date(form.end).toISOString().split('T')[0]
                  : null,
        }));

        if (mode.value === 'create') {
            form.post(route('create-education'), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        } else {
            if (!selectedData.value?.id) {
return;
}

            form.put(route('update-education', selectedData.value.id), {
                forceFormData: true,
                onSuccess: closeDialogForm,
            });
        }
    };

    const deleteEducation = () => {
        if (!selectedData.value?.id) {
return;
}

        form.delete(route('delete-education', selectedData.value.id), {
            onSuccess: closeDialogDelete,
        });
    };

    watch(isPresent, (val) => {
        if (val) {
            form.end = null;
        }
    });

    return {
        visible,
        mode,
        selectedData,
        isDelete,
        isPresent,
        globalFields,
        form,
        openCreate,
        openEdit,
        openDelete,
        closeDialogForm,
        closeDialogDelete,
        submit,
        deleteEducation,
    };
}
