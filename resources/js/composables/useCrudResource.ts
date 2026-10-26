import type { InertiaForm } from '@inertiajs/vue3';
import { router, useForm } from '@inertiajs/vue3';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';

type CrudOptions<F extends Record<string, any>> = {
    /** Singular display name, e.g. "Project". */
    entity: string;
    items: () => any[];
    /** Ziggy route names. */
    routes: { create: string; update: string; delete: string };
    initial: F;
    /** Maps a table row onto form values when editing. */
    fill: (data: any) => Partial<F>;
    transform?: (data: F) => Record<string, any>;
};

const EXCLUDED_FIELDS = ['id', 'created_at', 'updated_at'];

/**
 * Shared state and actions for the admin CRUD pages: create/edit dialog,
 * delete confirmation and toast feedback.
 */
export function useCrudResource<F extends Record<string, any>>(
    options: CrudOptions<F>,
) {
    const route = window.route;
    const toast = useToast();
    const confirm = useConfirm();

    const visible = ref(false);
    const mode = ref<'create' | 'edit'>('create');
    const selected = ref<any>(null);
    const form = useForm(options.initial as any) as InertiaForm<F>;

    const globalFields = computed(() => {
        const [first] = options.items();

        if (!first) {
            return [];
        }

        return Object.keys(first).filter(
            (key) =>
                typeof first[key] !== 'object' &&
                !EXCLUDED_FIELDS.includes(key),
        );
    });

    const notify = (
        severity: 'success' | 'error',
        summary: string,
        detail: string,
    ) => toast.add({ severity, summary, detail, life: 3500 });

    const openCreate = () => {
        mode.value = 'create';
        selected.value = null;
        form.reset();
        form.clearErrors();
        visible.value = true;
    };

    const openEdit = (data: any) => {
        mode.value = 'edit';
        selected.value = data;
        form.clearErrors();
        Object.assign(form, options.fill(data));
        visible.value = true;
    };

    const closeForm = () => {
        visible.value = false;
        form.reset();
        form.clearErrors();
    };

    const submit = () => {
        if (options.transform) {
            form.transform(options.transform as any);
        }

        const isCreate = mode.value === 'create';
        const requestOptions = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeForm();
                notify(
                    'success',
                    isCreate ? 'Created' : 'Updated',
                    `${options.entity} ${isCreate ? 'created' : 'updated'} successfully.`,
                );
            },
            onError: () =>
                notify(
                    'error',
                    'Please check the form',
                    'Some fields need your attention.',
                ),
        };

        if (isCreate) {
            form.post(route(options.routes.create), requestOptions);
        } else if (selected.value?.id) {
            form.put(
                route(options.routes.update, selected.value.id),
                requestOptions,
            );
        }
    };

    const confirmDelete = (data: any) => {
        confirm.require({
            header: `Delete ${options.entity}`,
            message: `Are you sure you want to delete this ${options.entity.toLowerCase()}? This action cannot be undone.`,
            icon: 'pi pi-exclamation-triangle',
            rejectProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptProps: { label: 'Delete', severity: 'danger' },
            accept: () =>
                router.delete(route(options.routes.delete, data.id), {
                    preserveScroll: true,
                    onSuccess: () =>
                        notify(
                            'success',
                            'Deleted',
                            `${options.entity} deleted.`,
                        ),
                    onError: () =>
                        notify(
                            'error',
                            'Delete failed',
                            'Something went wrong, please try again.',
                        ),
                }),
        });
    };

    /** Sends a status toggle and reports the result. */
    const updateStatus = (
        routeName: string,
        data: any,
        status: unknown,
        onDone: () => void,
    ) => {
        router.put(route(routeName, data.id), { status } as any, {
            preserveScroll: true,
            onSuccess: () => {
                onDone();
                notify(
                    'success',
                    'Status updated',
                    `${options.entity} status changed.`,
                );
            },
            onError: () =>
                notify('error', 'Update failed', 'Status was not changed.'),
        });
    };

    return {
        visible,
        mode,
        selected,
        form,
        globalFields,
        openCreate,
        openEdit,
        closeForm,
        submit,
        confirmDelete,
        updateStatus,
        notify,
    };
}
