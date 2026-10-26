import {
    BookOpen,
    BriefcaseBusiness,
    CircleUserRound,
    GraduationCap,
    Info,
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import type { SegmentOption, TimelineEntry } from '@/components/site/types';
import { storageUrl } from '@/lib/utils';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';

type Tab = 'work' | 'education';

export function UserAboutScript({
    personal,
    works = [],
    educations = [],
}: {
    personal: any;
    works?: any[];
    educations?: any[];
}) {
    const stats = [
        { value: 1, suffix: '+', title: 'Experience' },
        { value: 10, suffix: '+', title: 'Projects' },
        { value: 5, suffix: '+', title: 'Achievements' },
    ];

    const avatarUrl = computed(
        () =>
            storageUrl(personal?.photo) ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent('Muammar Aufar')}`,
    );

    const activeTab = ref<Tab>('work');
    const tabs: SegmentOption<Tab>[] = [
        { value: 'work', label: 'Work', icon: BriefcaseBusiness },
        { value: 'education', label: 'Education', icon: GraduationCap },
    ];

    const workItems = computed<TimelineEntry[]>(() =>
        works.map((work) => ({
            id: work.id,
            title: work.company,
            date: work.date_range,
            meta: [
                { icon: Info, label: work.status },
                { icon: CircleUserRound, label: work.role },
            ],
            body: work.desc,
        })),
    );

    const educationItems = computed<TimelineEntry[]>(() =>
        educations.map((education) => ({
            id: education.id,
            title: education.institution,
            date: education.date_range,
            meta: [
                { icon: BookOpen, label: education.major },
                { icon: GraduationCap, label: education.title },
            ],
            body: education.description,
        })),
    );

    // Final values by default so the numbers are right without motion.
    const finalStats = stats.map((item) => item.value);
    const animatedStats = ref([...finalStats]);
    const statsRef = ref<HTMLElement | null>(null);

    useMotion(statsRef, ({ reduce }, context) => {
        if (reduce) {
            return;
        }

        const counters = stats.map(() => ({ value: 0 }));
        animatedStats.value = finalStats.map(() => 0);

        ScrollTrigger.create({
            trigger: statsRef.value,
            start: 'top 85%',
            once: true,
            onEnter: () =>
                context.add(() =>
                    counters.forEach((counter, index) =>
                        gsap.to(counter, {
                            value: finalStats[index],
                            duration: 1.4,
                            onUpdate: () => {
                                animatedStats.value[index] = Math.round(
                                    counter.value,
                                );
                            },
                        }),
                    ),
                ),
        });

        return () => {
            animatedStats.value = [...finalStats];
        };
    });

    return {
        statsRef,
        avatarUrl,
        activeTab,
        tabs,
        workItems,
        educationItems,
        animatedStats,
        stats,
    };
}
