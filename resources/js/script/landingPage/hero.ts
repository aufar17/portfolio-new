import {
    ArrowRight,
    CodeXml,
    Mail,
    MailOpen,
    MonitorCheck,
    Smartphone,
} from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useSplash } from '@/composables/useSplash';

export function UserHeroScript(personal: any) {
    const roleConfig = [
        { icon: CodeXml, color: 'text-red-500' },
        { icon: Smartphone, color: 'text-green-500' },
        { icon: MonitorCheck, color: 'text-yellow-500' },
    ];

    const roles = computed(() =>
        (personal?.role_list || []).map((role: string, i: number) => ({
            name: role,
            icon: roleConfig[i]?.icon,
            color: roleConfig[i]?.color || 'text-gray-500',
        })),
    );

    const { splashDone } = useSplash(2500);
    const startTyping = ref(false);

    watch(splashDone, (val) => {
        if (val) {
startTyping.value = true;
}
    });

    return {
        roles,
        startTyping,
        ArrowRight,
        Mail,
        MailOpen,
    };
}
