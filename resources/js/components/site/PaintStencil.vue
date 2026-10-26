<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { onThemeChange, readPaintColors } from '@/motion/paintColors';
import { createStencil } from '@/motion/stencil';
import { useMotion } from '@/motion/useMotion';

/**
 * Stencil divider (motion/stencil.ts): while it scrolls through the
 * viewport, paint is sprayed over a stencil card of the logo's "A", then
 * the card lifts away and leaves the painted letter. Scrubbed. Phones get
 * fewer dots. Reduced motion shows the finished letter, no card.
 */
const root = ref<HTMLElement | null>(null);
const wall = ref<HTMLCanvasElement | null>(null);
const plate = ref<HTMLCanvasElement | null>(null);
const plateBox = ref<HTMLElement | null>(null);

useMotion(root, ({ desktop, reduce }) => {
    const stencil = createStencil(wall.value!, plate.value!, {
        density: desktop ? 1 : 0.6,
    });
    const state = { progress: reduce ? 1 : 0 };
    const draw = (redraw = false) => stencil.render(state.progress, redraw);

    draw(true);

    const offTheme = onThemeChange(() => {
        stencil.setColors(readPaintColors());
        draw(true);
    });
    const onRefresh = () => {
        stencil.resize();
        draw(true);
    };
    ScrollTrigger.addEventListener('refresh', onRefresh);

    if (!reduce) {
        gsap.timeline({
            scrollTrigger: {
                trigger: root.value,
                start: 'top 80%',
                end: 'bottom 30%',
                scrub: true,
            },
        })
            // Paint is drawn by progress, not eased (like sprayPaint.ts).
            .to(state, {
                progress: 1,
                duration: 0.65,
                ease: 'none',
                onUpdate: () => draw(),
            })
            .to(plateBox.value, {
                y: -48,
                rotation: -10,
                autoAlpha: 0,
                duration: 0.35,
            });
    }

    return () => {
        offTheme();
        ScrollTrigger.removeEventListener('refresh', onRefresh);
    };
});
</script>

<template>
    <div
        ref="root"
        class="relative mx-auto -my-12 size-44 sm:size-56 md:-my-20"
        aria-hidden="true"
    >
        <canvas ref="wall" class="absolute inset-0 size-full" />
        <div ref="plateBox" class="absolute inset-0 motion-reduce:hidden">
            <canvas ref="plate" class="size-full" />
        </div>
    </div>
</template>
