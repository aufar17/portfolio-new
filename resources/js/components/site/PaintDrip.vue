<script setup lang="ts">
import { ref } from 'vue';
import { gsap } from '@/motion/gsap';
import { random } from '@/motion/sprayPaint';
import { useMotion } from '@/motion/useMotion';

/**
 * Paint-drip divider between two sections: a wavy edge of paint across the
 * page with drips running down from it, scrubbed to scroll (the edge is laid
 * left to right, then each drip runs). Plain elements coloured with
 * `bg-primary`/`fill-primary`; growth is a `clip-path` reveal from the top,
 * so the round drop at the end of each drip keeps its shape.
 *
 * Phones show every other drip. Reduced motion (and no JS) shows the drips
 * fully grown, as a static divider.
 */
const COUNT = 14;
const rand = random(41);

// Seeded, so the layout is the same on every render.
const drips = Array.from({ length: COUNT }, (_, i) => ({
    left: ((i + 0.2 + rand() * 0.6) / COUNT) * 100,
    width: 5 + rand() * 7,
    length: 28 + rand() * 80,
    delay: rand(),
    phone: i % 2 === 0,
}));

const root = ref<HTMLElement | null>(null);

useMotion(root, ({ reduce }) => {
    if (reduce || !root.value) {
        return;
    }

    const band = root.value.querySelector('[data-band]');
    const runs = root.value.querySelectorAll<HTMLElement>('[data-drip]');
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: root.value,
            start: 'top 85%',
            end: 'top 35%',
            scrub: true,
        },
    });

    timeline.fromTo(
        band,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.35, ease: 'none' },
        0,
    );

    runs.forEach((run, i) => {
        timeline.fromTo(
            run,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5 },
            0.2 + drips[i].delay * 0.3,
        );
    });
});
</script>

<template>
    <div
        ref="root"
        class="relative -mt-8 h-32 md:-mt-12 md:h-36"
        aria-hidden="true"
    >
        <svg
            data-band
            viewBox="0 0 1200 16"
            preserveAspectRatio="none"
            class="absolute inset-x-0 top-0 h-3 w-full fill-primary md:h-4"
        >
            <path
                d="M0 0 H1200 V9 Q1150 15 1100 8 Q1050 13 1000 11 Q950 16 900 9 Q850 14 800 12 Q750 17 700 8 Q650 13 600 10 Q550 15 500 9 Q450 14 400 12 Q350 17 300 8 Q250 13 200 11 Q150 16 100 10 Q50 15 0 10 Z"
            />
        </svg>
        <span
            v-for="(drip, i) in drips"
            :key="i"
            data-drip
            class="absolute top-2 rounded-b-full bg-primary md:top-3"
            :class="!drip.phone && 'max-md:hidden'"
            :style="{
                left: `${drip.left}%`,
                width: `${drip.width}px`,
                height: `${drip.length}px`,
            }"
        />
    </div>
</template>
