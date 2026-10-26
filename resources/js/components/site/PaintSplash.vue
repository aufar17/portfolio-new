<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { onThemeChange } from '@/motion/paintColors';
import { drawSplash } from '@/motion/sprayPaint';
import { useMotion } from '@/motion/useMotion';

/**
 * Paint splat sitting on the top edge of the footer (the negative bottom
 * margin cancels the footer's top margin). Drawn once on a small canvas and
 * popped in the first time it scrolls into view; redrawn after resize and
 * theme change. Reduced motion: drawn, no pop.
 */
const root = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

useMotion(root, ({ reduce }) => {
    const paint = () => canvas.value && drawSplash(canvas.value);
    paint();

    const offTheme = onThemeChange(paint);
    ScrollTrigger.addEventListener('refresh', paint);

    if (!reduce) {
        gsap.from(canvas.value, {
            scale: 0.6,
            opacity: 0,
            transformOrigin: '50% 100%',
            duration: 0.5,
            scrollTrigger: {
                trigger: root.value,
                start: 'top 90%',
                once: true,
            },
        });
    }

    return () => {
        offTheme();
        ScrollTrigger.removeEventListener('refresh', paint);
    };
});
</script>

<template>
    <div
        ref="root"
        class="relative mx-auto -mb-16 h-24 w-full max-w-md sm:-mb-20 md:-mb-24"
        aria-hidden="true"
    >
        <canvas ref="canvas" class="size-full" />
    </div>
</template>
