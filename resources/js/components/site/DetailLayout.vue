<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ArrowLeft, Expand } from 'lucide-vue-next';
import type { Component } from 'vue';
import { ref } from 'vue';
import { gsap } from '@/motion/gsap';
import { splitLines, whenFontsReady } from '@/motion/split';
import { takeSharedArrival } from '@/motion/transition';
import { useMotion } from '@/motion/useMotion';
import ImageLightbox from './ImageLightbox.vue';
import Reveal from './Reveal.vue';

/** Shared layout for project and achievement detail pages. */
defineProps<{
    eyebrow: string;
    title: string;
    subtitle?: string;
    image: string | null;
    fallbackIcon: Component;
    backHref: string;
    backLabel: string;
    /** Matches the card image the visitor clicked, so it morphs into the hero. */
    transitionName?: string;
}>();

const lightboxOpen = ref(false);

const root = ref<HTMLElement | null>(null);
const back = ref<HTMLElement | null>(null);
const eyebrowEl = ref<HTMLElement | null>(null);
const titleEl = ref<HTMLElement | null>(null);
const subtitleEl = ref<HTMLElement | null>(null);
const media = ref<HTMLElement | null>(null);
const aside = ref<HTMLElement | null>(null);

// When the card image flew in as a shared element, it is already in place.
const arrivedShared = takeSharedArrival();

/** Back link and eyebrow, then the title word by word, subtitle, image, sidebar. */
useMotion(root, ({ reduce, mobile }, context) => {
    if (reduce) {
        return;
    }

    const fades = [back.value, eyebrowEl.value, subtitleEl.value];

    gsap.set(fades.filter(Boolean), { opacity: 0, y: 12 });
    gsap.set(titleEl.value, { opacity: 0 });
    gsap.set(aside.value, { opacity: 0, y: 24 });

    if (!arrivedShared) {
        gsap.set(media.value, {
            clipPath: 'inset(14% 10% 14% 10%)',
            scale: 1.08,
        });
    }

    return whenFontsReady(context, () => {
        const split = splitLines(titleEl.value!);
        const timeline = gsap.timeline({ onComplete: () => split.revert() });

        gsap.set(titleEl.value, { opacity: 1 });
        timeline
            .to([back.value, eyebrowEl.value], {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.06,
            })
            .from(
                split.words,
                { yPercent: 110, stagger: mobile ? 0.04 : 0.06 },
                0.1,
            );

        if (subtitleEl.value) {
            timeline.to(subtitleEl.value, { opacity: 1, y: 0 }, '-=0.55');
        }

        if (!arrivedShared) {
            // fromTo with explicit four-value insets: reading back the set value
            // gives the browser's shortened form, which would interpolate unevenly.
            timeline.fromTo(
                media.value,
                { clipPath: 'inset(14% 10% 14% 10%)', scale: 1.08 },
                { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9 },
                0.25,
            );
        }

        timeline.to(
            aside.value,
            { opacity: 1, y: 0, clearProps: 'transform' },
            0.4,
        );
    });
});
</script>

<template>
    <article ref="root" class="container-page pt-32 pb-20 md:pt-40">
        <div ref="back" class="mb-8">
            <Link
                :href="backHref"
                view-transition
                class="group inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground focus-ring transition-colors hover:text-foreground"
            >
                <ArrowLeft
                    class="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                    aria-hidden="true"
                />
                {{ backLabel }}
            </Link>
        </div>

        <header class="mb-10 max-w-3xl space-y-3 md:mb-14">
            <p
                ref="eyebrowEl"
                class="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase sm:text-sm"
            >
                {{ eyebrow }}
            </p>
            <h1
                ref="titleEl"
                class="text-2xl font-extrabold tracking-tight text-balance text-foreground sm:text-3xl md:text-5xl"
            >
                {{ title }}
            </h1>
            <p
                v-if="subtitle"
                ref="subtitleEl"
                class="text-base text-pretty text-muted-foreground md:text-lg"
            >
                {{ subtitle }}
            </p>
        </header>

        <div class="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
            <div class="lg:col-span-2">
                <button
                    v-if="image"
                    type="button"
                    class="group relative block w-full overflow-hidden rounded-xl border border-surface-border bg-muted shadow-elevated focus-ring"
                    :style="{ viewTransitionName: transitionName }"
                    aria-label="View full image"
                    @click="lightboxOpen = true"
                >
                    <div ref="media">
                        <img
                            :src="image"
                            :alt="title"
                            class="aspect-video w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                        />
                    </div>
                    <span
                        class="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30"
                        aria-hidden="true"
                    >
                        <span
                            class="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                        >
                            <Expand class="size-4" />
                            View Image
                        </span>
                    </span>
                </button>
                <div
                    v-else
                    ref="media"
                    class="grid aspect-video w-full place-items-center rounded-xl border border-surface-border bg-muted"
                    :style="{ viewTransitionName: transitionName }"
                >
                    <component
                        :is="fallbackIcon"
                        class="size-20 text-muted-foreground/60"
                        aria-hidden="true"
                    />
                </div>
            </div>

            <aside ref="aside" class="space-y-4 lg:sticky lg:top-28">
                <slot name="sidebar" />
            </aside>
        </div>

        <Reveal as="section" class="mt-14 max-w-3xl md:mt-20">
            <h2 class="text-subheading font-bold text-foreground">Overview</h2>
            <div
                class="mt-4 text-base leading-relaxed text-pretty text-muted-foreground md:text-lg md:leading-relaxed"
            >
                <slot name="overview" />
            </div>
        </Reveal>

        <ImageLightbox v-model:open="lightboxOpen" :src="image" :alt="title" />
    </article>
</template>
