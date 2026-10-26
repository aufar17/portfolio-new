import { ref, watch } from 'vue';
import { useCrudResource } from '@/composables/useCrudResource';

const toDateString = (value: Date | string | null) =>
    value ? new Date(value).toISOString().split('T')[0] : null;

export function useWorkScript(works: any[]) {
    const isPresent = ref(false);

    const crud = useCrudResource({
        entity: 'Work',
        items: () => works,
        routes: {
            create: 'create-work',
            update: 'update-work',
            delete: 'delete-work',
        },
        initial: {
            company: '',
            role: '',
            status: '',
            desc: '',
            start: null as Date | null,
            end: null as Date | null,
        },
        fill: (data) => ({
            company: data.company,
            role: data.role,
            status: data.status,
            desc: data.desc,
            start: data.start ? new Date(data.start) : null,
            end: data.end ? new Date(data.end) : null,
        }),
        transform: (data) => ({
            ...data,
            start: toDateString(data.start),
            end: toDateString(data.end),
        }),
    });

    const openCreate = () => {
        isPresent.value = false;
        crud.openCreate();
    };

    watch(isPresent, (val) => {
        if (val) {
            crud.form.end = null;
        }
    });

    return {
        ...crud,
        openCreate,
        isPresent,
    };
}
