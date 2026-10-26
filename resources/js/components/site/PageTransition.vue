<script setup lang="ts">
import { ref } from 'vue';
import { ScrollTrigger } from '@/motion/gsap';
import { isAutoScrolling } from '@/motion/lenis';
import { buildPageTransition } from '@/motion/pageTransitions';
import { sectionTransition } from '@/motion/sectionTransitions';
import { useMotion } from '@/motion/useMotion';

/**
 * "New page" transition at a section boundary (motion/pageTransitions.ts).
 * Place it where one section ends; `boundary` is its index in page order
 * and picks this session's transition (motion/sectionTransitions.ts).
 *
 * A full-screen sheet closes and opens again while the boundary scrolls
 * through the middle of the viewport, about half a screen of scrolling
 * (shorter than the Hero → About pour). Scrubbed, no pin. The range never
 * runs past the end of the page, so the last boundary still finishes. The
 * sheet stays hidden outside the range and during programmatic glides
 * (navbar anchors). Reduced motion: nothing.
 *
 * Every kind's parts are rendered and hidden; the chosen kind shows its own.
 */
defineOptions({ inheritAttrs: false });

const props = defineProps<{
    boundary: number;
}>();

const SLATS = 7;

const marker = ref<HTMLElement | null>(null);
const overlay = ref<HTMLElement | null>(null);
const sheet = ref<HTMLElement | null>(null);
const shadow = ref<HTMLElement | null>(null);
const flap = ref<HTMLElement | null>(null);
const blinds = ref<HTMLElement | null>(null);
const slats = ref<HTMLElement[]>([]);
const page = ref<HTMLElement | null>(null);
const shade = ref<HTMLElement | null>(null);

useMotion(marker, ({ desktop, reduce }) => {
    if (reduce) {
        return;
    }

    const kind = sectionTransition(props.boundary);
    const el = overlay.value!;
    el.dataset.kind = kind;

    const timeline = buildPageTransition(
        kind,
        {
            sheet: sheet.value!,
            shadow: shadow.value!,
            flap: flap.value!,
            slats: slats.value,
            blinds: blinds.value!,
            page: page.value!,
            shade: shade.value!,
        },
        { mobile: !desktop, index: props.boundary },
    );

    const length = () => window.innerHeight * (desktop ? 0.45 : 0.35);
    // Fully open once the boundary is 30% from the top, or at the very end.
    const endAt = () =>
        Math.min(
            marker.value!.getBoundingClientRect().top +
                window.scrollY -
                window.innerHeight * 0.3,
            ScrollTrigger.maxScroll(window),
        );

    const show = (self: ScrollTrigger) => {
        el.style.visibility =
            self.isActive && !isAutoScrolling() ? 'visible' : 'hidden';
    };

    const trigger = ScrollTrigger.create({
        trigger: marker.value,
        start: () => endAt() - length(),
        end: endAt,
        animation: timeline,
        scrub: true,
        invalidateOnRefresh: true,
        onToggle: show,
        onUpdate: show,
    });

    return () => {
        trigger.kill();
        timeline.kill();
        el.style.visibility = 'hidden';
    };
});
</script>

<template>
    <div
        ref="marker"
        v-bind="$attrs"
        :data-page-transition="boundary"
        aria-hidden="true"
    />

    <Teleport to="body">
        <div
            ref="overlay"
            class="pointer-events-none invisible fixed inset-0 z-30 overflow-hidden"
            aria-hidden="true"
        >
            <!-- peel / iris -->
            <div ref="sheet" class="absolute inset-0 bg-primary">
                <div
                    ref="shadow"
                    class="absolute inset-0 bg-[color-mix(in_oklab,var(--foreground)_25%,transparent)]"
                />
            </div>
            <!-- The back of the sheet, a lighter mix so the fold reads -->
            <div
                ref="flap"
                class="absolute inset-0 bg-[color-mix(in_oklab,var(--primary-strong)_75%,var(--primary-foreground))]"
            />

            <!-- blinds -->
            <div
                ref="blinds"
                class="absolute inset-y-0 left-1/2 flex w-[180vw] -translate-x-1/2 -skew-x-[20deg]"
            >
                <div
                    v-for="i in SLATS"
                    :key="i"
                    ref="slats"
                    class="-mr-px h-full flex-1"
                    :class="i % 2 ? 'bg-primary' : 'bg-primary-strong'"
                />
            </div>

            <!-- turn -->
            <div ref="page" class="absolute inset-0 transform-3d">
                <div class="absolute inset-0 bg-primary backface-hidden">
                    <div
                        ref="shade"
                        class="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_40%,transparent),transparent_70%)] opacity-0"
                    />
                </div>
                <div
                    class="absolute inset-0 rotate-y-180 bg-primary-strong backface-hidden"
                />
            </div>
        </div>
    </Teleport>
</template>
