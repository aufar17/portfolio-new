<script setup lang="ts">
import { ref } from 'vue';
import AchievementCard from '@/components/site/AchievementCard.vue';
import CtaLink from '@/components/site/CtaLink.vue';
import Reveal from '@/components/site/Reveal.vue';
import SectionHeading from '@/components/site/SectionHeading.vue';
import { gsap } from '@/motion/gsap';
import { revealMedia } from '@/motion/reveal';
import { useMotion } from '@/motion/useMotion';
import { allAchievements } from '@/routes';

defineProps<{
    achievements?: any[];
}>();

const list = ref<HTMLElement | null>(null);

/** Base tilt of each card in the deck, alternating sides. */
const tiltFor = (index: number) => (index % 2 === 0 ? 1.5 : -1.5);

/**
 * Deck variant of the stack: smaller cards, tighter steps and an alternating
 * tilt, like cards dealt onto a table. As the next card lands, the one below
 * straightens, sinks back slightly and dims, scrubbed to scroll.
 */
useMotion(list, ({ reduce, desktop }) => {
    if (reduce) {
        return;
    }

    const items = gsap.utils.toArray<HTMLElement>('[data-deck-item]');

    items.forEach((item, i) => {
        const card = item.querySelector('[data-deck-card]');

        gsap.from(item, {
            opacity: 0,
            y: desktop ? 48 : 24,
            scrollTrigger: { trigger: item, start: 'top 90%', once: true },
        });

        const media = item.querySelector('[data-media]');

        if (media) {
            revealMedia(media, { trigger: item });
        }

        if (!desktop) {
            return;
        }

        gsap.set(card, { rotation: tiltFor(i) });

        const next = items[i + 1];

        if (!next) {
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
            .to(card, { scale: 0.9, rotation: 0, y: -12, ease: 'none' })
            .to(
                item.querySelector('[data-deck-overlay]'),
                { opacity: 0.55, ease: 'none' },
                0,
            );
    });
});
</script>

<template>
    <section id="achievement" class="container-page section-y">
        <SectionHeading
            eyebrow="Recognition"
            title="Achievements"
            description="Awards and Certificates"
        />

        <ul ref="list" class="mx-auto flex max-w-3xl flex-col gap-6 md:gap-12">
            <li
                v-for="(item, i) in achievements"
                :key="item.id"
                data-deck-item
                class="md:motion-safe:sticky"
                :style="{ top: `calc(var(--nav-h) + 1.5rem + ${i * 0.75}rem)` }"
            >
                <div data-deck-card class="relative md:h-[20rem]">
                    <AchievementCard :item="item" variant="deck" />
                    <div
                        data-deck-overlay
                        class="pointer-events-none absolute inset-0 rounded-3xl bg-background opacity-0"
                        aria-hidden="true"
                    />
                </div>
            </li>
            <!-- Room for the last card to settle (sticky items can't use the list's padding) -->
            <li
                class="hidden h-[16vh] md:motion-safe:block"
                aria-hidden="true"
            />
        </ul>

        <Reveal class="mt-10 flex justify-center">
            <CtaLink :href="allAchievements().url">
                See More Achievements
            </CtaLink>
        </Reveal>
    </section>
</template>
