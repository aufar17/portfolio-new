import { ref, watch } from 'vue';
import { useCrudResource } from '@/composables/useCrudResource';

const toDateString = (value: Date | string | null) =>
    value ? new Date(value).toISOString().split('T')[0] : null;

export function useEducationScript(educations: any[]) {
    const isPresent = ref(false);

    const crud = useCrudResource({
        entity: 'Education',
        items: () => educations,
        routes: {
            create: 'create-education',
            update: 'update-education',
            delete: 'delete-education',
        },
        initial: {
            institution: '',
            major: '',
            title: '',
            start: null as Date | null,
            end: null as Date | null,
        },
        fill: (data) => {
            isPresent.value = data.end === null;

            return {
                institution: data.institution,
                major: data.major,
                title: data.title,
                start: data.start ? new Date(data.start) : null,
                end: data.end ? new Date(data.end) : null,
            };
        },
        transform: (data) => ({
            ...data,
            start: toDateString(data.start),
            end: isPresent.value ? null : toDateString(data.end),
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
