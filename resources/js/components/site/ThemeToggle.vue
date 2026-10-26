<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
import { useAppearance } from '@/composables/useAppearance';

const { resolvedAppearance, updateAppearance } = useAppearance();

const toggleTheme = () => {
    updateAppearance(resolvedAppearance.value === 'dark' ? 'light' : 'dark');
};
</script>

<template>
    <button
        type="button"
        class="relative grid size-10 place-items-center overflow-hidden rounded-full text-foreground focus-ring transition-colors hover:bg-muted"
        :aria-label="
            resolvedAppearance === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
        "
        @click="toggleTheme"
    >
        <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out-expo"
            enter-from-class="-rotate-90 scale-50 opacity-0"
            leave-active-class="transition duration-150 ease-out-expo"
            leave-to-class="rotate-90 scale-50 opacity-0"
        >
            <span :key="resolvedAppearance" class="grid place-items-center">
                <Moon v-if="resolvedAppearance === 'dark'" class="size-5" />
                <Sun v-else class="size-5" />
            </span>
        </Transition>
    </button>
</template>
