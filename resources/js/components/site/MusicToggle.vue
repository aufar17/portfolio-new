<script setup lang="ts">
import { HeadphoneOff, Headphones } from 'lucide-vue-next';
import { useBacksound } from '@/composables/useBacksound';

/**
 * Turns the background music (composables/useBacksound.ts) on or off, next
 * to the theme toggle. It also keeps the music going while public pages are
 * showing.
 */
const { musicOn, setMusicOn } = useBacksound();
</script>

<template>
    <button
        type="button"
        class="relative grid size-10 place-items-center overflow-hidden rounded-full text-foreground focus-ring transition-colors hover:bg-muted"
        aria-label="Background music"
        :aria-pressed="musicOn"
        @click="setMusicOn(!musicOn)"
    >
        <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out-expo"
            enter-from-class="-rotate-90 scale-50 opacity-0"
            leave-active-class="transition duration-150 ease-out-expo"
            leave-to-class="rotate-90 scale-50 opacity-0"
        >
            <span :key="String(musicOn)" class="grid place-items-center">
                <Headphones v-if="musicOn" class="size-5" />
                <HeadphoneOff v-else class="size-5" />
            </span>
        </Transition>
    </button>
</template>
