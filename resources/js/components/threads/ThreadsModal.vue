<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue';
import { MessageCircleMore, Send, SendHorizonal, X } from 'lucide-vue-next';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits(['close']);

const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emit('close');
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

<template>
    <transition name="modal">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex flex-col bg-white/90 backdrop-blur-xl dark:bg-black/90"
        >
            <div
                class="flex items-center justify-between border-b px-6 py-4 dark:border-white/10"
            >
                <div class="flex items-center gap-3">
                    <MessageCircleMore
                        class="relative h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
                    />
                    <h2 class="text-lg font-semibold">Discussion Room</h2>
                </div>

                <button
                    @click="$emit('close')"
                    class="rounded-lg p-2 transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                    <X class="h-5 w-5" />
                </button>
            </div>

            <div class="flex flex-1 overflow-hidden">
                <div
                    class="hidden w-1/4 border-r p-4 md:flex md:flex-col dark:border-white/10"
                >
                    <button
                        class="mb-4 rounded-lg bg-black py-2 text-sm text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                    >
                        + New Thread
                    </button>

                    <div class="space-y-3 overflow-y-auto">
                        <div
                            v-for="i in 5"
                            :key="i"
                            class="cursor-pointer rounded-xl border p-4 transition hover:shadow-md dark:border-white/10"
                        >
                            <h3 class="line-clamp-1 text-sm font-medium">
                                Sample Thread Title {{ i }}
                            </h3>
                            <p class="mt-1 line-clamp-2 text-xs text-gray-500">
                                This is preview of thread content...
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-1 flex-col">
                    <div class="flex-1 space-y-6 overflow-y-auto p-6">
                        <div class="rounded-xl border p-5 dark:border-white/10">
                            <h1 class="text-xl font-semibold">
                                Select a thread or start one 👀
                            </h1>
                            <p class="mt-2 text-sm text-gray-500">
                                Your discussion will appear here.
                            </p>
                        </div>

                        <div
                            v-for="i in 3"
                            :key="i"
                            class="rounded-xl border p-4 dark:border-white/10"
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium"
                                    >Anonymous_123</span
                                >
                                <span class="text-xs text-gray-400"
                                    >just now</span
                                >
                            </div>
                            <p
                                class="mt-2 text-sm text-gray-600 dark:text-gray-300"
                            >
                                This is a sample reply message.
                            </p>
                        </div>
                    </div>

                    <div class="border-t px-4 py-6 dark:border-white/10">
                        <div class="flex items-center justify-center gap-3">
                            <textarea
                                rows="1"
                                placeholder="Write something..."
                                class="w-full resize-none rounded-lg border p-3 text-sm focus:ring-2 focus:ring-black focus:outline-none dark:border-white/10 dark:bg-black dark:focus:ring-white"
                            />
                            <SendHorizonal class="h-6 w-6 shrink-0" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-enter-from {
    opacity: 0;
    transform: scale(0.98);
}
.modal-enter-active {
    transition: all 0.25s ease;
}
.modal-leave-to {
    opacity: 0;
    transform: scale(0.98);
}
.modal-leave-active {
    transition: all 0.2s ease;
}
</style>
