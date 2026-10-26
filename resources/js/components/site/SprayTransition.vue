<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { onThemeChange, readPaintColors } from '@/motion/paintColors';
import { createSpray, drawSprayBand } from '@/motion/sprayPaint';
import { useMotion } from '@/motion/useMotion';

/**
 * Spray-paint transition at a section boundary (motion/sprayPaint.ts). Place
 * it between two sections: as the boundary scrolls from 80% of the viewport
 * to the top, paint covers the screen and is then sprayed away to show the
 * next section. Scrubbed, no pin.
 *
 * The overlay canvas only works while the boundary is in range; outside it,
 * it is empty, hidden and off the ticker. Phones get fewer particles, no
 * drips and 1x resolution. Reduced motion shows a static spray stroke as a
 * divider instead. Colours follow the theme.
 */
const marker = ref<HTMLElement | null>(null);
const overlay = ref<HTMLCanvasElement | null>(null);
const band = ref<HTMLCanvasElement | null>(null);

useMotion(marker, ({ desktop, reduce }) => {
    if (reduce) {
        const paint = () => band.value && drawSprayBand(band.value);
        paint();

        const offTheme = onThemeChange(paint);
        window.addEventListener('resize', paint);

        return () => {
            offTheme();
            window.removeEventListener('resize', paint);
        };
    }

    const canvas = overlay.value!;
    const spray = createSpray(canvas, {
        density: desktop ? 1 : 0.35,
        drips: desktop,
        dpr: desktop ? Math.min(window.devicePixelRatio || 1, 1.5) : 1,
    });

    let progress = 0;
    let dirty = false;

    const tick = () => {
        if (dirty) {
            dirty = false;
            spray.render(progress);
        }
    };

    const setActive = (active: boolean) => {
        canvas.style.visibility = active ? 'visible' : 'hidden';

        if (active) {
            gsap.ticker.add(tick);
        } else {
            gsap.ticker.remove(tick);
        }
    };

    const trigger = ScrollTrigger.create({
        trigger: marker.value,
        start: 'top 80%',
        end: 'top top',
        onUpdate: (self) => {
            progress = self.progress;
            dirty = true;
        },
        onToggle: (self) => {
            // Leaving at either end: draw that end (empty) before hiding.
            spray.render(self.progress);
            setActive(self.isActive);
        },
        onRefresh: (self) => {
            spray.resize();
            spray.render(self.progress, true);
        },
    });

    const offTheme = onThemeChange(() => {
        spray.setColors(readPaintColors());
        spray.render(progress, true);
    });

    return () => {
        trigger.kill();
        setActive(false);
        offTheme();
    };
});
</script>

<template>
    <div ref="marker" aria-hidden="true">
        <!-- Reduced motion: static divider -->
        <canvas ref="band" class="hidden h-16 w-full motion-reduce:block" />
    </div>

    <Teleport to="body">
        <canvas
            ref="overlay"
            class="pointer-events-none invisible fixed inset-0 z-30 size-full"
            aria-hidden="true"
        />
    </Teleport>
</template>
