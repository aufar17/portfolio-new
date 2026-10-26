<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    ArrowUpRight,
    Award,
    Building2,
    CalendarDays,
    FileBadge,
} from 'lucide-vue-next';
import type { ComponentPublicInstance } from 'vue';
import { computed, ref } from 'vue';
import { storageUrl } from '@/lib/utils';
import { mediaTransitionName, shareElement } from '@/motion/transition';
import { useTilt } from '@/motion/useTilt';
import { achievementsDetail } from '@/routes';

const props = withDefaults(
    defineProps<{
        item: any;
        variant?: 'deck' | 'card';
    }>(),
    {
        variant: 'card',
    },
);

const image = storageUrl(props.item.photo);

const mediaBox = ref<HTMLElement | null>(null);

/** The image flies into the detail page's hero (see motion/transition.ts). */
const shareMedia = () =>
    shareElement(
        mediaBox.value,
        mediaTransitionName('achievement', props.item.id),
    );

// Tilt the rendered <a> of the Inertia Link.
const link = ref<ComponentPublicInstance | null>(null);
useTilt(computed(() => (link.value?.$el as HTMLElement | undefined) ?? null));
</script>

<template>
    <!-- Deck card: compact and opaque, stacked like cards on a table -->
    <Link
        ref="link"
        v-if="variant === 'deck'"
        :href="achievementsDetail(item.slug).url"
        view-transition
        @before="shareMedia"
        class="group relative grid h-full overflow-hidden rounded-3xl border border-surface-border bg-card shadow-elevated focus-ring sm:grid-cols-[2fr_3fr]"
    >
        <div
            ref="mediaBox"
            class="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-auto"
        >
            <div v-if="image" data-media class="size-full">
                <img
                    :src="image"
                    :alt="item.title"
                    loading="lazy"
                    class="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                />
            </div>
            <div v-else class="grid size-full place-items-center">
                <FileBadge
                    v-if="item.type"
                    class="size-14 text-muted-foreground/60"
                    aria-hidden="true"
                />
                <Award
                    v-else
                    class="size-14 text-muted-foreground/60"
                    aria-hidden="true"
                />
            </div>
        </div>

        <div class="flex flex-col gap-3 p-6 sm:p-8">
            <span
                class="w-fit rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red-strong"
            >
                {{ item.type ? 'Certification' : 'Award' }}
            </span>
            <h3
                class="text-lg leading-snug font-bold text-balance text-foreground transition-colors duration-200 group-hover:text-primary-strong sm:text-xl"
            >
                {{ item.title }}
            </h3>
            <div
                class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground sm:text-sm"
            >
                <span
                    v-if="item.issuer"
                    class="inline-flex items-center gap-1.5"
                >
                    <Building2
                        class="size-3.5 text-brand-red-strong"
                        aria-hidden="true"
                    />
                    {{ item.issuer }}
                </span>
                <span
                    v-if="item.date_format"
                    class="inline-flex items-center gap-1.5"
                >
                    <CalendarDays
                        class="size-3.5 text-primary-strong"
                        aria-hidden="true"
                    />
                    {{ item.date_format }}
                </span>
            </div>
            <p
                class="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
            >
                {{ item.description }}
            </p>
            <span
                class="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-foreground"
                aria-hidden="true"
            >
                View detail
                <span
                    class="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ease-out-expo group-hover:rotate-45"
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
        :href="achievementsDetail(item.slug).url"
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
                :alt="item.title"
                loading="lazy"
                class="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
            <div v-else class="grid size-full place-items-center">
                <FileBadge
                    v-if="item.type"
                    class="size-14 text-muted-foreground/60"
                    aria-hidden="true"
                />
                <Award
                    v-else
                    class="size-14 text-muted-foreground/60"
                    aria-hidden="true"
                />
            </div>

            <span
                class="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md"
            >
                {{ item.type ? 'Certification' : 'Award' }}
            </span>
            <span
                class="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground"
                aria-hidden="true"
            >
                <ArrowUpRight class="size-4" />
            </span>
        </div>

        <div class="flex flex-1 flex-col gap-3 p-5 sm:p-6">
            <h3
                class="text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary-strong"
            >
                {{ item.title }}
            </h3>

            <div
                class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground"
            >
                <span
                    v-if="item.issuer"
                    class="inline-flex items-center gap-1.5"
                >
                    <Building2
                        class="size-3.5 text-brand-red-strong"
                        aria-hidden="true"
                    />
                    {{ item.issuer }}
                </span>
                <span
                    v-if="item.date_format"
                    class="inline-flex items-center gap-1.5"
                >
                    <CalendarDays
                        class="size-3.5 text-primary-strong"
                        aria-hidden="true"
                    />
                    {{ item.date_format }}
                </span>
            </div>

            <p
                class="line-clamp-2 text-sm leading-relaxed text-muted-foreground"
            >
                {{ item.description }}
            </p>
        </div>
        <span
            data-tilt-glare
            class="pointer-events-none absolute top-0 left-0 z-10 size-56 rounded-full bg-[radial-gradient(circle,var(--tilt-glare),transparent_70%)] opacity-0"
            aria-hidden="true"
        />
    </Link>
</template>
