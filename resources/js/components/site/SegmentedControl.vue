<script setup lang="ts" generic="T extends string">
import { computed } from 'vue';
import type { SegmentOption } from './types';

/**
 * Accessible tab list (WAI-ARIA tabs pattern) with a sliding indicator.
 * Tabs share the width equally, so the indicator is one pill moved with a
 * CSS transform transition (instant under reduced motion).
 * Pair each panel with `:id="`${id}-panel-${value}`"` and
 * `:aria-labelledby="`${id}-tab-${value}`"`.
 */
const props = defineProps<{
    id: string;
    options: SegmentOption<T>[];
    label: string;
}>();

const model = defineModel<T>({ required: true });

const activeIndex = computed(() =>
    Math.max(
        0,
        props.options.findIndex((option) => option.value === model.value),
    ),
);

// Width of one tab and its offset, inside p-1.5 (0.75rem) with gap-1 (0.25rem).
const indicatorStyle = computed(() => {
    const count = props.options.length;
    const index = activeIndex.value;

    return {
        width: `calc((100% - 0.75rem - ${(count - 1) * 0.25}rem) / ${count})`,
        transform: `translateX(calc(${index * 100}% + ${index * 0.25}rem))`,
    };
});

const focusTab = (index: number) => {
    const option = props.options[index];
    model.value = option.value;
    document.getElementById(`${props.id}-tab-${option.value}`)?.focus();
};

const onKeydown = (event: KeyboardEvent, index: number) => {
    const last = props.options.length - 1;
    const keyMap: Record<string, number> = {
        ArrowRight: index === last ? 0 : index + 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
    };

    if (event.key in keyMap) {
        event.preventDefault();
        focusTab(keyMap[event.key]);
    }
};
</script>

<template>
    <div
        role="tablist"
        :aria-label="label"
        class="relative flex w-full gap-1 rounded-full surface-glass p-1.5"
    >
        <span
            class="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-primary shadow-glow transition-transform duration-250 ease-out-expo"
            :style="indicatorStyle"
            aria-hidden="true"
        />
        <button
            v-for="(option, index) in options"
            :id="`${id}-tab-${option.value}`"
            :key="option.value"
            type="button"
            role="tab"
            :aria-selected="model === option.value"
            :aria-controls="`${id}-panel-${option.value}`"
            :tabindex="model === option.value ? 0 : -1"
            class="relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-base"
            :class="
                model === option.value
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
            "
            @click="model = option.value"
            @keydown="onKeydown($event, index)"
        >
            <component
                :is="option.icon"
                v-if="option.icon"
                class="relative size-4 sm:size-5"
                aria-hidden="true"
            />
            <span class="relative">{{ option.label }}</span>
        </button>
    </div>
</template>
