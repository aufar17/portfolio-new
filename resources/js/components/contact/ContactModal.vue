<script setup lang="ts">
import { Github, Linkedin, Instagram, X, ExternalLink } from 'lucide-vue-next';
import { watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    open: boolean;
    contacts: any[];
}>();

const emit = defineEmits(['close']);

const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
emit('close');
}
};

onMounted(() => window.addEventListener('keydown', handleKey));
onUnmounted(() => window.removeEventListener('keydown', handleKey));

watch(
    () => props.open,
    (val) => {
        document.body.style.overflow = val ? 'hidden' : '';
    },
);
</script>

<style scoped>
.modal-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}
.modal-enter-active {
    transition: all 0.3s ease;
}
.modal-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}
.modal-leave-active {
    transition: all 0.2s ease;
}
</style>

<template>
    <transition name="modal">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-white/40 px-4 backdrop-blur-md dark:bg-black/40"
            @click.self="emit('close')"
        >
            <div
                class="w-full max-w-lg rounded-xl border border-white/10 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:bg-neutral-900/70"
            >
                <div class="mb-6 flex items-start justify-between">
                    <div>
                        <h2 class="text-xl font-semibold tracking-tight">
                            Get in Touch
                        </h2>
                        <p class="text-sm text-black/60 dark:text-white/60">
                            Feel free to reach out through any platform
                        </p>
                    </div>

                    <button
                        @click="emit('close')"
                        class="rounded-lg p-2 transition hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <X class="h-5 w-5" />
                    </button>
                </div>

                <div class="space-y-3">
                    <a
                        v-for="contact in contacts"
                        :key="contact.id"
                        :href="contact.link"
                        target="_blank"
                        class="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-black/10 bg-white/60 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <div
                            class="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                            :style="{
                                background: `linear-gradient(120deg, transparent, ${contact.color}20, transparent)`,
                            }"
                        ></div>

                        <div
                            class="relative flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white/70 shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg dark:border-white/10 dark:bg-white/10"
                        >
                            <img
                                :src="contact.icon"
                                class="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>

                        <div class="relative flex-1">
                            <p class="font-medium">
                                {{ contact.name }}
                            </p>
                        </div>

                        <ExternalLink
                            class="relative h-4 w-4 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100"
                        />
                    </a>
                </div>

                <div
                    class="mt-6 border-t border-black/10 pt-4 text-center text-xs text-black/60 dark:border-white/10 dark:text-white/50"
                >
                    Let’s collaborate and build something great together
                </div>
            </div>
        </div>
    </transition>
</template>
