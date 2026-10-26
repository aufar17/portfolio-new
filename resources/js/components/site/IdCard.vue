<script setup lang="ts">
import { Contact, MapPin } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
    name: string;
    role?: string;
    location: string;
    avatar: string;
    tags?: string[];
}>();

/* Subtle 3D tilt for mouse users only */
const cardRef = ref<HTMLElement | null>(null);
let frame = 0;

const handlePointerMove = (e: PointerEvent) => {
    const card = cardRef.value;

    if (!card || e.pointerType !== 'mouse') {
        return;
    }

    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `perspective(1000px) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
    });
};

const resetCard = () => {
    cancelAnimationFrame(frame);

    if (cardRef.value) {
        cardRef.value.style.transform = '';
    }
};
</script>

<template>
    <div
        ref="cardRef"
        class="overflow-hidden rounded-xl surface-glass transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none!"
        @pointermove="handlePointerMove"
        @pointerleave="resetCard"
    >
        <div
            class="flex items-center gap-2.5 bg-primary px-5 py-3 text-xs font-bold tracking-[0.2em] text-primary-foreground"
        >
            <Contact class="size-4 opacity-80" aria-hidden="true" />
            ID CARD
        </div>

        <div class="flex flex-col items-center px-6 pt-8 pb-6 text-center">
            <div class="relative">
                <div
                    class="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary to-primary/0 opacity-70"
                    aria-hidden="true"
                />
                <img
                    :src="avatar"
                    :alt="name"
                    class="relative size-28 rounded-full border-4 border-background object-cover"
                />
            </div>

            <p class="mt-5 text-lg font-bold text-foreground">{{ name }}</p>
            <p v-if="role" class="mt-1 text-sm font-medium text-primary-strong">
                {{ role }}
            </p>

            <div class="my-5 h-px w-full bg-border" />

            <p
                class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
            >
                <MapPin class="size-4" aria-hidden="true" />
                {{ location }}
            </p>

            <ul
                v-if="tags?.length"
                class="mt-4 flex flex-wrap justify-center gap-1.5"
            >
                <li
                    v-for="(tag, i) in tags"
                    :key="i"
                    class="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                    {{ tag }}
                </li>
            </ul>
        </div>

        <div
            class="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-brand-red"
            aria-hidden="true"
        />
    </div>
</template>
