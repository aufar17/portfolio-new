<script setup lang="ts">
import InputError from '@/components/InputError.vue';

/**
 * Label + control + error message. The control receives `id` and
 * `invalid` through the default slot so the label stays associated.
 */
const props = withDefaults(
    defineProps<{
        id: string;
        label: string;
        error?: string;
        hint?: string;
        full?: boolean;
        required?: boolean;
    }>(),
    {
        full: true,
    },
);
</script>

<template>
    <div class="flex flex-col gap-2" :class="{ 'md:col-span-2': props.full }">
        <label :for="id" class="text-sm font-semibold text-foreground">
            {{ label }}
            <span v-if="required" class="text-destructive" aria-hidden="true"
                >*</span
            >
        </label>
        <slot :id="id" :invalid="!!error" />
        <p v-if="hint && !error" class="text-xs text-muted-foreground">
            {{ hint }}
        </p>
        <InputError :message="error" />
    </div>
</template>
