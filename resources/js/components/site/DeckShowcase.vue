<script
    setup
    lang="ts"
    generic="T extends { id: number | string; title: string }"
>
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { shareElement } from '@/motion/transition';
import { useShowcase } from '@/motion/useShowcase';

/**
 * Landing showcase for projects and achievements: an info panel for the
 * active item on the left (title, description, details, previous/next) and a
 * stack of image-only cards on the right from lg; below lg the stack comes
 * first. Motion lives in motion/useShowcase.ts.
 *
 * Slots:
 * - `media`: the card for an item. Mark the image layer `[data-parallax]`
 *   inside a `[data-media]` box (the shared element), and include a
 *   `[data-dim]` overlay.
 * - `info`: the panel block for an item. Mark text that reveals by line
 *   `[data-lines]` and the rest `[data-meta]`. `shareMedia(name)` names the
 *   front card's image for the detail page transition (call it from a
 *   link's `@before`).
 * - `cta`: below the controls.
 */
const props = defineProps<{
    items: T[];
    /** Accessible name of the stack, e.g. "Projects". */
    label: string;
    /** Singular noun for button labels, e.g. "project". */
    itemLabel: string;
}>();

const active = ref(0);

const root = ref<HTMLElement | null>(null);
const stack = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);

const { next, prev, settle, onKeydown, onClickCapture } = useShowcase(
    { root, stack, panel },
    active,
);

const count = computed(() => props.items.length);
const progress = computed(() =>
    count.value ? (active.value + 1) / count.value : 0,
);

/** Names the front card's image so it flies into the detail hero. */
const shareMedia = (name: string) => {
    settle();
    shareElement(
        stack.value?.children[active.value]?.querySelector<HTMLElement>(
            '[data-media]',
        ) ?? null,
        name,
    );
};

// Empty until the first change, so nothing is read out on page load.
const announcement = ref('');

watch(active, (index) => {
    announcement.value = `Showing ${props.items[index]?.title ?? ''}`;
});
</script>

<template>
    <div
        ref="root"
        class="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
    >
        <div ref="panel" class="order-last flex flex-col gap-8 lg:order-none">
            <!-- Every block shares one cell, so the panel is as tall as the
                 longest one and never jumps when the item changes -->
            <div class="grid">
                <div
                    v-for="(item, i) in items"
                    :key="item.id"
                    data-info
                    class="col-start-1 row-start-1"
                    :class="i !== active && 'invisible'"
                    :inert="i !== active"
                >
                    <slot
                        name="info"
                        :item="item"
                        :active="i === active"
                        :share-media="shareMedia"
                    />
                </div>
            </div>

            <!-- Below lg the controls sit right under the stack, so a short
                 item's spare panel height falls after its text instead -->
            <div
                v-if="count > 1"
                data-panel-controls
                class="flex items-center gap-3 max-lg:order-first"
            >
                <button
                    type="button"
                    class="grid size-11 shrink-0 place-items-center rounded-full surface-glass text-foreground focus-ring transition-colors duration-200 hover:text-primary-strong"
                    :aria-label="`Previous ${itemLabel}`"
                    @click="prev"
                >
                    <ArrowLeft class="size-4" aria-hidden="true" />
                </button>
                <div
                    class="relative h-1 flex-1 overflow-hidden rounded-full bg-muted"
                    aria-hidden="true"
                >
                    <span
                        class="absolute inset-0 origin-left rounded-full bg-primary transition-transform duration-500 ease-out-expo motion-reduce:transition-none"
                        :style="{ transform: `scaleX(${progress})` }"
                    />
                </div>
                <button
                    type="button"
                    class="grid size-11 shrink-0 place-items-center rounded-full surface-glass text-foreground focus-ring transition-colors duration-200 hover:text-primary-strong"
                    :aria-label="`Next ${itemLabel}`"
                    @click="next"
                >
                    <ArrowRight class="size-4" aria-hidden="true" />
                </button>
            </div>

            <div
                data-panel-controls
                class="flex justify-center lg:justify-start"
            >
                <slot name="cta" />
            </div>

            <p class="sr-only" aria-live="polite">{{ announcement }}</p>
        </div>

        <!-- Front card on top before JS stacks the cards -->
        <div
            ref="stack"
            role="region"
            aria-roledescription="carousel"
            :aria-label="label"
            tabindex="0"
            class="relative grid rounded-3xl pt-6 focus-ring md:pt-10 [&>[data-deck-card]:first-child]:z-10"
            @keydown="onKeydown"
            @click.capture="onClickCapture"
        >
            <div
                v-for="(item, i) in items"
                :key="item.id"
                data-deck-card
                role="group"
                aria-roledescription="slide"
                :aria-label="item.title"
                :inert="i !== active"
                class="relative col-start-1 row-start-1 select-none"
            >
                <slot name="media" :item="item" :active="i === active" />
            </div>
        </div>
    </div>
</template>
