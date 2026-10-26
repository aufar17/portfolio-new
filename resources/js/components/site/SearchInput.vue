<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import { useId } from 'vue';

defineProps<{
    label: string;
    placeholder?: string;
}>();

const model = defineModel<string>({ required: true });
const id = useId();
</script>

<template>
    <div
        class="flex items-center gap-3 rounded-xl surface-glass px-4 transition-shadow focus-within:shadow-glow focus-within:ring-2 focus-within:ring-ring/60"
    >
        <label :for="id" class="sr-only">{{ label }}</label>
        <Search
            class="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
        />
        <input
            :id="id"
            v-model="model"
            type="search"
            :placeholder="placeholder"
            autocomplete="off"
            class="h-12 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none sm:text-base [&::-webkit-search-cancel-button]:hidden"
        />
        <button
            v-if="model"
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
            @click="model = ''"
        >
            <X class="size-4" />
        </button>
    </div>
</template>
