<script setup lang="ts">
import { Volume2, VolumeX } from 'lucide-vue-next';
import { onMounted } from 'vue';
import {
    abotMuted,
    abotVoice,
    loadVoicePreference,
    setAbotMuted,
} from '@/script/landingPage/abotVoice';

/**
 * Mutes Abot's voice (script/landingPage/abotVoice.ts), next to the theme
 * toggle. The choice is remembered; turning sound back on gives a click.
 */
onMounted(loadVoicePreference);

const toggleSound = () => {
    setAbotMuted(!abotMuted.value);

    if (!abotMuted.value) {
        abotVoice.next();
    }
};
</script>

<template>
    <button
        type="button"
        class="relative grid size-10 place-items-center overflow-hidden rounded-full text-foreground focus-ring transition-colors hover:bg-muted"
        aria-label="Mute Abot"
        :aria-pressed="abotMuted"
        @click="toggleSound"
    >
        <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out-expo"
            enter-from-class="-rotate-90 scale-50 opacity-0"
            leave-active-class="transition duration-150 ease-out-expo"
            leave-to-class="rotate-90 scale-50 opacity-0"
        >
            <span :key="String(abotMuted)" class="grid place-items-center">
                <VolumeX v-if="abotMuted" class="size-5" />
                <Volume2 v-else class="size-5" />
            </span>
        </Transition>
    </button>
</template>
