<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { createPour, drawPourBand } from '@/motion/liquidPour';
import { onThemeChange, readPaintColors } from '@/motion/paintColors';
import { useMotion } from '@/motion/useMotion';

/**
 * Poured-paint transition at a section boundary (motion/liquidPour.ts).
 * Place it between two sections: as the boundary scrolls from 80% of the
 * viewport to the top, paint runs down over the screen and then drains off
 * the bottom to show the next section. Scrubbed, no pin.
 *
 * The overlay canvas only works while the boundary is in range; outside it,
 * it is empty, hidden and off the ticker. Phones get fewer drips, a coarser
 * edge and 1x resolution. Reduced motion shows a static pour edge as a
 * divider instead. Colours follow the theme.
 */
const marker = ref<HTMLElement | null>(null);
const overlay = ref<HTMLCanvasElement | null>(null);
const band = ref<HTMLCanvasElement | null>(null);

useMotion(marker, ({ desktop, reduce }) => {
    if (reduce) {
        const paint = () => band.value && drawPourBand(band.value);
        paint();

        const offTheme = onThemeChange(paint);
        window.addEventListener('resize', paint);

        return () => {
            offTheme();
            window.removeEventListener('resize', paint);
        };
    }

    const canvas = overlay.value!;
    const pour = createPour(canvas, {
        mobile: !desktop,
        dpr: desktop ? Math.min(window.devicePixelRatio || 1, 1.5) : 1,
    });

    let progress = 0;
    let dirty = false;

    const tick = () => {
        if (dirty) {
            dirty = false;
            pour.render(progress);
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
            pour.render(self.progress);
            setActive(self.isActive);
        },
        onRefresh: (self) => {
            pour.resize();
            pour.render(self.progress);
        },
    });

    const offTheme = onThemeChange(() => {
        pour.setColors(readPaintColors());
        pour.render(progress);
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
