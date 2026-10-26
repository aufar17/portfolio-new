<script
    setup
    lang="ts"
    generic="T extends { id: number | string; title: string }"
>
import { ref } from 'vue';
import type { DeckVariant } from '@/motion/useDeck';
import { useDeck } from '@/motion/useDeck';

/**
 * Stack of cards (see motion/useDeck.ts). All cards share one grid cell, so
 * the deck is as tall as its tallest card without measuring. Only the front
 * card is interactive; the others are `inert`. Arrow keys (and Home/End)
 * work while the deck or its front card has focus. Pair it with
 * `DeckPanel` through the same `v-model:active`.
 */
const props = withDefaults(
    defineProps<{
        items: T[];
        label: string;
        variant?: DeckVariant;
        side?: 1 | -1;
    }>(),
    {
        variant: 'toss',
        side: 1,
    },
);

const active = defineModel<number>('active', { required: true });

const root = ref<HTMLElement | null>(null);

const { onKeydown, onClickCapture } = useDeck(root, {
    active,
    variant: props.variant,
    side: props.side,
});
</script>

<template>
    <!-- First card on top before JS stacks the deck -->
    <div
        ref="root"
        role="region"
        aria-roledescription="carousel"
        :aria-label="label"
        tabindex="0"
        class="relative grid rounded-3xl pt-10 focus-ring [&>[data-deck-card]:first-child]:z-10"
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
            :class="variant === 'flip' && 'transform-3d'"
        >
            <template v-if="variant === 'flip'">
                <div class="h-full backface-hidden">
                    <slot name="card" :item="item" :active="i === active" />
                </div>
                <!-- Back of the card, seen while it is turned over -->
                <div
                    class="absolute inset-0 rotate-y-180 backface-hidden"
                    aria-hidden="true"
                >
                    <slot name="back" :item="item">
                        <div
                            class="grid size-full place-items-center overflow-hidden rounded-3xl border border-primary/40 bg-primary shadow-elevated"
                        >
                            <svg
                                viewBox="0 -12 220 240"
                                class="h-3/5 max-h-48 w-auto fill-none stroke-primary-foreground"
                                stroke-width="3"
                                stroke-linejoin="round"
                                stroke-opacity="0.35"
                            >
                                <path d="M98 40 L110 62 L39 204 L16 204 Z" />
                                <path
                                    d="M98 40 L100 36 Q110 16 120 36 L204 204 L181 204 L110 62 Z"
                                />
                                <path d="M110 78 L80 140 L140 140 Z" />
                                <rect
                                    x="22"
                                    y="148"
                                    width="176"
                                    height="26"
                                    rx="13"
                                />
                            </svg>
                        </div>
                    </slot>
                </div>
            </template>
            <slot v-else name="card" :item="item" :active="i === active" />
        </div>
    </div>
</template>
