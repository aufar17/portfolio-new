<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    ArrowUpRight,
    Blocks,
    Brain,
    MonitorCog,
    Wrench,
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import CtaLink from '@/components/site/CtaLink.vue';
import DeckMedia from '@/components/site/DeckMedia.vue';
import DeckShowcase from '@/components/site/DeckShowcase.vue';
import PageTransition from '@/components/site/PageTransition.vue';
import Reveal from '@/components/site/Reveal.vue';
import SectionHeading from '@/components/site/SectionHeading.vue';
import SegmentedControl from '@/components/site/SegmentedControl.vue';
import type { SegmentOption } from '@/components/site/types';
import { storageUrl } from '@/lib/utils';
import {
    gsap,
    prefersReducedMotion,
    releaseTransforms,
    ScrollTrigger,
} from '@/motion/gsap';
import { mediaTransitionName } from '@/motion/transition';
import { useMotion } from '@/motion/useMotion';
import { allProjects, projectDetail } from '@/routes';

const props = withDefaults(
    defineProps<{
        projects?: any[];
        hardSkills?: any[];
        softSkills?: any[];
    }>(),
    {
        projects: () => [],
        hardSkills: () => [],
        softSkills: () => [],
    },
);

type SkillTab = 'hard' | 'soft';

const activeTab = ref<SkillTab>('hard');
const skillTabs: SegmentOption<SkillTab>[] = [
    { value: 'hard', label: 'Hard Skills', icon: Wrench },
    { value: 'soft', label: 'Soft Skills', icon: Brain },
];

const filteredSkills = computed(() =>
    activeTab.value === 'hard' ? props.hardSkills : props.softSkills,
);

const skillsBox = ref<HTMLElement | null>(null);

/** Short stagger capped at 0.3s in total, whatever the number of skills. */
const staggerFor = (count: number) => Math.min(0.02, 0.3 / Math.max(count, 1));

const showSkills = (items: Element[], vars: gsap.TweenVars = {}) =>
    gsap.fromTo(
        items,
        { opacity: 0, y: 12, scale: 0.96 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            stagger: staggerFor(items.length),
            ...vars,
            onComplete: () => {
                // Hand the tiles' hover lift back to CSS.
                releaseTransforms(items);
                vars.onComplete?.();
            },
        },
    );

// Tab switch: the old panel fades up and out, the new tiles stagger in.
const onSkillsLeave = (el: Element, done: () => void) => {
    if (prefersReducedMotion()) {
        // Finishing synchronously inside an out-in leave breaks Vue's patch.
        queueMicrotask(done);

        return;
    }

    gsap.to(el, { opacity: 0, y: -8, duration: 0.15, onComplete: done });
};

const onSkillsEnter = (el: Element, done: () => void) => {
    // The panel height changes, so triggers further down must re-measure.
    const finish = () => {
        done();
        ScrollTrigger.refresh();
    };

    if (prefersReducedMotion()) {
        finish();

        return;
    }

    showSkills([...el.querySelectorAll('li')], { onComplete: finish });
};

// First appearance, once, when the skills scroll into view.
useMotion(skillsBox, ({ reduce }) => {
    if (reduce || !skillsBox.value) {
        return;
    }

    showSkills([...skillsBox.value.querySelectorAll('li')], {
        scrollTrigger: {
            trigger: skillsBox.value,
            start: 'top 85%',
            once: true,
        },
    });
});
</script>

<template>
    <section id="project" class="container-page section-y">
        <SectionHeading
            eyebrow="Selected work"
            title="Projects"
            description="A collection of projects I have worked on and developed"
        />

        <!-- Active project's info left, image stack right from lg -->
        <DeckShowcase
            v-if="props.projects.length"
            :items="props.projects"
            label="Projects"
            item-label="project"
        >
            <template #info="{ item, shareMedia }">
                <p
                    v-if="item.date_range"
                    data-meta
                    class="text-xs font-semibold tracking-wider text-brand-red-strong uppercase"
                >
                    {{ item.date_range }}
                </p>
                <h3
                    data-lines
                    class="mt-3 text-subheading font-bold text-balance text-foreground lg:text-3xl"
                >
                    {{ item.title }}
                </h3>
                <p
                    data-lines
                    class="mt-4 leading-relaxed text-pretty text-muted-foreground"
                >
                    {{ item.description }}
                </p>
                <ul
                    v-if="item.tech_list?.length"
                    data-meta
                    class="mt-5 flex flex-wrap gap-1.5"
                    aria-label="Tech stack"
                >
                    <li
                        v-for="(tech, index) in item.tech_list"
                        :key="index"
                        class="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-strong"
                    >
                        {{ tech }}
                    </li>
                </ul>
                <div data-meta class="mt-6">
                    <Link
                        :href="projectDetail(item.slug).url"
                        view-transition
                        class="group inline-flex items-center gap-2 rounded-full text-sm font-semibold text-foreground focus-ring"
                        @before="
                            shareMedia(mediaTransitionName('project', item.id))
                        "
                    >
                        View project
                        <span class="sr-only">{{ item.title }}</span>
                        <span
                            class="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ease-out-expo group-hover:rotate-45"
                            aria-hidden="true"
                        >
                            <ArrowUpRight class="size-4" />
                        </span>
                    </Link>
                </div>
            </template>

            <template #media="{ item }">
                <DeckMedia
                    :href="projectDetail(item.slug).url"
                    :image="storageUrl(item.image)"
                    :alt="item.title"
                    :transition-name="mediaTransitionName('project', item.id)"
                >
                    <template #fallback>
                        <MonitorCog
                            class="size-16 text-muted-foreground/60"
                            aria-hidden="true"
                        />
                    </template>
                </DeckMedia>
            </template>

            <template #cta>
                <CtaLink :href="allProjects().url">See More Projects</CtaLink>
            </template>
        </DeckShowcase>
        <Reveal v-else class="flex justify-center">
            <CtaLink :href="allProjects().url">See More Projects</CtaLink>
        </Reveal>

        <PageTransition :boundary="1" class="mt-20 md:mt-24" />

        <!-- Skills -->
        <div class="mt-16 md:mt-20">
            <SectionHeading
                eyebrow="Toolbox"
                title="Skills"
                description="Tools, Languages, Frameworks and Abilities"
            />

            <Reveal class="mx-auto max-w-md">
                <SegmentedControl
                    id="skills-tabs"
                    v-model="activeTab"
                    :options="skillTabs"
                    label="Skill type"
                />
            </Reveal>

            <div ref="skillsBox" class="mt-10 min-h-40">
                <Transition
                    mode="out-in"
                    :css="false"
                    @enter="onSkillsEnter"
                    @leave="onSkillsLeave"
                >
                    <div
                        :id="`skills-tabs-panel-${activeTab}`"
                        :key="activeTab"
                        role="tabpanel"
                        :aria-labelledby="`skills-tabs-tab-${activeTab}`"
                    >
                        <ul
                            v-if="activeTab === 'hard' && filteredSkills.length"
                            class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4 lg:grid-cols-7"
                        >
                            <li
                                v-for="skill in filteredSkills"
                                :key="skill.id"
                                class="group flex flex-col items-center gap-3 rounded-2xl surface-tile px-2 py-5 text-center transition-[translate,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
                            >
                                <span
                                    class="grid size-14 place-items-center rounded-xl bg-primary/5 p-2.5 ring-1 ring-primary/10 transition-transform duration-300 ease-out-expo group-hover:scale-110 sm:size-16"
                                >
                                    <img
                                        v-if="storageUrl(skill.icon)"
                                        :src="storageUrl(skill.icon)!"
                                        alt=""
                                        loading="lazy"
                                        class="size-full object-contain"
                                    />
                                    <Blocks
                                        v-else
                                        class="size-6 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span
                                    class="text-xs leading-tight font-semibold text-foreground sm:text-sm"
                                >
                                    {{ skill.name }}
                                </span>
                            </li>
                        </ul>

                        <ul
                            v-else-if="filteredSkills.length"
                            class="flex flex-wrap justify-center gap-2.5 sm:gap-3"
                        >
                            <li
                                v-for="skill in filteredSkills"
                                :key="skill.id"
                                class="rounded-2xl surface-tile px-4 py-2 text-sm font-semibold text-foreground transition-[translate,border-color,color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary-strong sm:px-5 sm:py-2.5"
                            >
                                {{ skill.name }}
                            </li>
                        </ul>

                        <p
                            v-else
                            class="py-10 text-center text-sm font-medium text-muted-foreground"
                        >
                            No skills data
                        </p>
                    </div>
                </Transition>
            </div>
        </div>
    </section>
</template>
