import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { BriefcaseBusiness, GraduationCap } from 'lucide-vue-next';

type Tab = 'work' | 'education';

export function UserAboutScript({
    personal,
    lastRole,
    works = [],
    educations = [],
}: {
    personal: any;
    lastRole: String;
    works?: any[];
    educations?: any[];
}) {
    const preview = ref<string | null>(null);

    const stats = [
        { value: 1, suffix: '+', title: 'Experience' },
        { value: 10, suffix: '+', title: 'Projects' },
        { value: 5, suffix: '+', title: 'Achievements' },
    ];

    const avatarUrl = computed(() => {
        if (preview.value) return preview.value;

        return personal?.photo
            ? `/storage/${personal.photo}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent('Muammar Aufar')}`;
    });
    type Tab = 'work' | 'education';

    const activeTab = ref<Tab>('work');
    const tabs: { id: Tab; label: string; icon?: any }[] = [
        { id: 'work', label: 'Work', icon: BriefcaseBusiness },
        { id: 'education', label: 'Education', icon: GraduationCap },
    ];
    const activeIndex = computed(() =>
        tabs.findIndex((t) => t.id === activeTab.value),
    );

    const animatedStats = ref(stats.map(() => 0));
    const aboutSection = ref<HTMLElement | null>(null);
    let observer: IntersectionObserver | null = null;
    const hasAnimated = ref(false);

    const animateStats = () => {
        const duration = 1200;

        stats.forEach((item, index) => {
            const start = performance.now();

            const animate = (time: number) => {
                const progress = Math.min((time - start) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const value = Math.floor(easeOut * item.value);

                animatedStats.value[index] = value;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    animatedStats.value[index] = item.value;
                }
            };

            requestAnimationFrame(animate);
        });
    };

    onMounted(() => {
        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (entry.isIntersecting && !hasAnimated.value) {
                    hasAnimated.value = true;

                    setTimeout(() => animateStats(), 400);
                    observer?.disconnect();
                }
            },
            { threshold: 0.2, rootMargin: '0px 0px -100px 0px' },
        );

        if (aboutSection.value) {
            observer.observe(aboutSection.value);
        }
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
    });

    return {
        aboutSection,
        avatarUrl,
        activeTab,
        tabs,
        activeIndex,
        animatedStats,
        stats,
    };
}
