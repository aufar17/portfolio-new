import { useCrudResource } from '@/composables/useCrudResource';

export function useSkillScript(skills: any[]) {
    const crud = useCrudResource({
        entity: 'Skill',
        items: () => skills,
        routes: {
            create: 'create-skill',
            update: 'update-skill',
            delete: 'delete-skill',
        },
        initial: {
            name: '',
            type: '' as string | number,
            icon: null as File | string | null,
        },
        fill: (data) => ({
            name: data.name,
            icon: data.icon,
            type: data.type,
        }),
    });

    const handleFile = (file: File | null) => {
        crud.form.icon = file ?? crud.selected.value?.icon ?? null;
    };

    return {
        ...crud,
        handleFile,
    };
}
