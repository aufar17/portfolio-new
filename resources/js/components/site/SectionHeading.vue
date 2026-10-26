<script setup lang="ts">
import { ref } from 'vue';
import { gsap, ScrollTrigger } from '@/motion/gsap';
import { splitLines, whenFontsReady } from '@/motion/split';
import { useMotion } from '@/motion/useMotion';

const props = withDefaults(
    defineProps<{
        eyebrow?: string;
        title: string;
        highlight?: string;
        description?: string;
        align?: 'center' | 'left';
        as?: 'h1' | 'h2';
    }>(),
    {
        align: 'center',
        as: 'h2',
    },
);

const root = ref<HTMLElement | null>(null);
const eyebrowEl = ref<HTMLElement | null>(null);
const titleEl = ref<HTMLElement | null>(null);
const descriptionEl = ref<HTMLElement | null>(null);

/** Eyebrow fades in, the title rises word by word, then the description. */
useMotion(root, ({ reduce, mobile }, context) => {
    if (reduce) {
        return;
    }

    const fades = [eyebrowEl.value, descriptionEl.value].filter(Boolean);

    gsap.set(fades, { opacity: 0, y: 12 });
    gsap.set(titleEl.value, { opacity: 0 });

    return whenFontsReady(context, () => {
        ScrollTrigger.create({
            trigger: root.value,
            start: 'top 85%',
            once: true,
            onEnter: () =>
                context.add(() => {
                    const split = splitLines(titleEl.value!);

                    const timeline = gsap.timeline({
                        onComplete: () => split.revert(),
                    });

                    gsap.set(titleEl.value, { opacity: 1 });

                    if (eyebrowEl.value) {
                        timeline.to(eyebrowEl.value, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                        });
                    }

                    timeline.from(
                        split.words,
                        { yPercent: 110, stagger: mobile ? 0.04 : 0.06 },
                        0.1,
                    );

                    if (descriptionEl.value) {
                        timeline.to(
                            descriptionEl.value,
                            { opacity: 1, y: 0, duration: 0.7 },
                            '-=0.55',
                        );
                    }
                }),
        });
    });
});
</script>

<template>
    <div
        ref="root"
        class="mb-12 flex flex-col gap-3 md:mb-16"
        :class="
            props.align === 'center'
                ? 'items-center text-center'
                : 'items-start text-left'
        "
    >
        <span v-if="props.eyebrow" ref="eyebrowEl" class="eyebrow">{{
            props.eyebrow
        }}</span>
        <component
            :is="props.as"
            ref="titleEl"
            class="text-heading font-bold text-balance text-foreground"
        >
            {{ props.title }}
            <span v-if="props.highlight" class="text-primary-strong">{{
                props.highlight
            }}</span>
        </component>
        <p
            v-if="props.description"
            ref="descriptionEl"
            class="max-w-2xl text-base text-pretty text-muted-foreground md:text-lg"
        >
            {{ props.description }}
        </p>
        <slot />
    </div>
</template>
