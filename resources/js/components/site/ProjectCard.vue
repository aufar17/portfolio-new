<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ArrowUpRight, MonitorCog } from 'lucide-vue-next';
import type { ComponentPublicInstance } from 'vue';
import { computed, ref } from 'vue';
import { storageUrl } from '@/lib/utils';
import { mediaTransitionName, shareElement } from '@/motion/transition';
import { useTilt } from '@/motion/useTilt';
import { projectDetail } from '@/routes';

const props = withDefaults(
    defineProps<{
        project: any;
        variant?: 'deck' | 'card';
    }>(),
    {
        variant: 'card',
    },
);

const image = storageUrl(props.project.image);

const mediaBox = ref<HTMLElement | null>(null);

/** The image flies into the detail page's hero (see motion/transition.ts). */
const shareMedia = () =>
    shareElement(
        mediaBox.value,
        mediaTransitionName('project', props.project.id),
    );

// Tilt the rendered <a> of the Inertia Link.
const link = ref<ComponentPublicInstance | null>(null);
useTilt(computed(() => (link.value?.$el as HTMLElement | undefined) ?? null));
</script>

<template>
    <!-- Deck card: upright below lg, image beside the text from lg; opaque so
         stacked cards don't show through. Native link/image dragging is off
         so the deck can drag the card. -->
    <Link
        ref="link"
        v-if="variant === 'deck'"
        :href="projectDetail(project.slug).url"
        view-transition
        draggable="false"
        @before="shareMedia"
        class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-surface-border bg-card shadow-elevated focus-ring lg:grid lg:min-h-[24rem] lg:grid-cols-[1fr_1.1fr]"
    >
        <div
            ref="mediaBox"
            class="relative aspect-[16/9] shrink-0 overflow-hidden bg-muted lg:aspect-auto"
        >
            <!-- Absolute from lg so the text, not the image, sets the height -->
            <div
                v-if="image"
                data-media
                class="size-full lg:absolute lg:inset-0"
            >
                <img
                    :src="image"
                    :alt="project.title"
                    loading="lazy"
                    draggable="false"
                    class="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                />
            </div>
            <div
                v-else
                class="grid size-full place-items-center lg:absolute lg:inset-0"
            >
                <MonitorCog
                    class="size-16 text-muted-foreground/60"
                    aria-hidden="true"
                />
            </div>
        </div>

        <div class="flex flex-1 flex-col p-6 sm:p-7">
            <p
                v-if="project.date_range"
                class="text-xs font-semibold tracking-wider text-brand-red-strong uppercase"
            >
                {{ project.date_range }}
            </p>
            <h3
                class="mt-2 text-subheading font-bold text-balance text-foreground transition-colors duration-200 group-hover:text-primary-strong"
            >
                {{ project.title }}
            </h3>
            <p
                class="mt-3 line-clamp-3 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base"
            >
                {{ project.description }}
            </p>

            <ul
                v-if="project.tech_list?.length"
                class="mt-5 flex flex-wrap gap-1.5"
                aria-label="Tech stack"
            >
                <li
                    v-for="(tech, index) in project.tech_list"
                    :key="index"
                    class="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-strong"
                >
                    {{ tech }}
                </li>
            </ul>

            <span
                class="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-foreground"
                aria-hidden="true"
            >
                View project
                <span
                    class="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ease-out-expo group-hover:rotate-45"
                >
                    <ArrowUpRight class="size-4" />
                </span>
            </span>
        </div>
        <span
            data-tilt-glare
            class="pointer-events-none absolute top-0 left-0 z-10 size-56 rounded-full bg-[radial-gradient(circle,var(--tilt-glare),transparent_70%)] opacity-0"
            aria-hidden="true"
        />
    </Link>

    <!-- Listing card -->
    <Link
        ref="link"
        v-else
        :href="projectDetail(project.slug).url"
        view-transition
        @before="shareMedia"
        class="group relative flex h-full flex-col overflow-hidden rounded-2xl surface-glass focus-ring transition-[translate,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-elevated"
    >
        <div
            ref="mediaBox"
            class="relative aspect-[16/10] overflow-hidden bg-muted"
        >
            <img
                v-if="image"
                :src="image"
                :alt="project.title"
                loading="lazy"
                class="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
            <div v-else class="grid size-full place-items-center">
                <MonitorCog
                    class="size-14 text-muted-foreground/60"
                    aria-hidden="true"
                />
            </div>
            <span
                class="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground"
                aria-hidden="true"
            >
                <ArrowUpRight class="size-4" />
            </span>
        </div>

        <div class="flex flex-1 flex-col p-5 sm:p-6">
            <h3
                class="text-lg font-semibold text-foreground transition-colors group-hover:text-primary-strong"
            >
                {{ project.title }}
            </h3>
            <p
                class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
            >
                {{ project.description }}
            </p>

            <ul
                v-if="project.tech_list?.length"
                class="mt-auto flex flex-wrap gap-1.5 pt-4"
                aria-label="Tech stack"
            >
                <li
                    v-for="(tech, index) in project.tech_list"
                    :key="index"
                    class="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                    {{ tech }}
                </li>
            </ul>
        </div>
        <span
            data-tilt-glare
            class="pointer-events-none absolute top-0 left-0 z-10 size-56 rounded-full bg-[radial-gradient(circle,var(--tilt-glare),transparent_70%)] opacity-0"
            aria-hidden="true"
        />
    </Link>
</template>
