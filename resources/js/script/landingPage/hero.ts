import { CodeXml, MonitorCheck, Smartphone } from 'lucide-vue-next';
import { computed } from 'vue';

export function UserHeroScript(personal: any) {
    const roleIcons = [CodeXml, Smartphone, MonitorCheck];

    const roles = computed(() =>
        (personal?.role_list || []).map((role: string, i: number) => ({
            name: role,
            icon: roleIcons[i],
        })),
    );

    return { roles };
}
