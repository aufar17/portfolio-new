import { useCrudResource } from '@/composables/useCrudResource';

export function useSocialScript(socials: any[]) {
    return useCrudResource({
        entity: 'Social Media',
        items: () => socials,
        routes: {
            create: 'create-social',
            update: 'update-social',
            delete: 'delete-social',
        },
        initial: {
            name: '',
            link: '',
            issuer: '',
            icon: '',
            color: '',
        },
        fill: (data) => ({
            name: data.name,
            icon: data.icon,
            issuer: data.issuer,
            color: data.color,
            link: data.link,
        }),
    });
}
