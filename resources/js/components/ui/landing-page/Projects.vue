<script setup lang="ts">
import { ref } from 'vue';
import CtaLink from '@/components/site/CtaLink.vue';
import ProjectCard from '@/components/site/ProjectCard.vue';
import Reveal from '@/components/site/Reveal.vue';
import SectionHeading from '@/components/site/SectionHeading.vue';
import SkillMarquee from '@/components/site/SkillMarquee.vue';
import { gsap } from '@/motion/gsap';
import { revealMedia } from '@/motion/reveal';
import { useMotion } from '@/motion/useMotion';
import { allProjects } from '@/routes';

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

const list = ref<HTMLElement | null>(null);

/**
 * Stack layering: every card is sticky a little lower than the one before
 * (CSS, md+ only). As the next card slides up over it, the current card
 * shrinks back and dims, scrubbed to scroll.
 */
useMotion(list, ({ reduce, desktop }) => {
    if (reduce) {
        return;
    }

    const items = gsap.utils.toArray<HTMLElement>('[data-stack-item]');

    items.forEach((item, i) => {
        gsap.from(item, {
            opacity: 0,
            y: desktop ? 48 : 24,
            scrollTrigger: { trigger: item, start: 'top 90%', once: true },
        });

        const media = item.querySelector('[data-media]');

        if (media) {
            revealMedia(media, { trigger: item });
        }

        const next = items[i + 1];

        if (!desktop || !next) {
            return;
        }

        gsap.timeline({
            scrollTrigger: {
                trigger: next,
                start: 'top bottom',
                end: 'top top+=160',
                scrub: true,
            },
        })
            .to(item.querySelector('[data-stack-card]'), {
                scale: 0.92,
                ease: 'none',
            })
            .to(
                item.querySelector('[data-stack-overlay]'),
                { opacity: 0.55, ease: 'none' },
                0,
            );
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

        <ul ref="list" class="flex flex-col gap-6 md:gap-16">
            <li
                v-for="(project, i) in props.projects"
                :key="project.id"
                data-stack-item
                class="md:motion-safe:sticky"
                :style="{ top: `calc(var(--nav-h) + 1rem + ${i * 1.25}rem)` }"
            >
                <div data-stack-card class="relative origin-top md:h-[28rem]">
                    <ProjectCard :project="project" variant="stack" />
                    <div
                        data-stack-overlay
                        class="pointer-events-none absolute inset-0 rounded-3xl bg-background opacity-0"
                        aria-hidden="true"
                    />
                </div>
            </li>
            <!-- Room for the last card to settle so the full stack rests a moment
                 (sticky items can't use the list's padding) -->
            <li
                class="hidden h-[20vh] md:motion-safe:block"
                aria-hidden="true"
            />
        </ul>

        <Reveal class="mt-10 flex justify-center">
            <CtaLink :href="allProjects().url">See More Projects</CtaLink>
        </Reveal>

        <!-- Skills -->
        <div class="mt-28 md:mt-36">
            <SectionHeading
                eyebrow="Toolbox"
                title="Skills"
                description="Tools, Languages, Frameworks and Abilities"
            />

            <div
                v-if="props.hardSkills.length || props.softSkills.length"
                class="flex flex-col gap-4 md:gap-5"
            >
                <SkillMarquee
                    v-if="props.hardSkills.length"
                    :items="props.hardSkills"
                    label="Hard skills"
                    variant="tile"
                    direction="left"
                />
                <SkillMarquee
                    v-if="props.softSkills.length"
                    :items="props.softSkills"
                    label="Soft skills"
                    variant="pill"
                    direction="right"
                />
            </div>
            <p
                v-else
                class="py-10 text-center text-sm font-medium text-muted-foreground"
            >
                No skills data
            </p>
        </div>
    </section>
</template>
