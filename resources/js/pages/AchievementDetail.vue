<script setup lang="ts">
import { Award, Eye, FileBadge } from 'lucide-vue-next';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';

const props = defineProps<{
    achievement: any;
}>();

const getImage = (path: string) =>
    path ? `/storage/${path}` : '/images/default-skill.png';

const isOpen = ref(false);
const selectedImage = ref<string | null>(null);

const openModal = (img: string) => {
    selectedImage.value = img;
    isOpen.value = true;
};

const closeModal = () => {
    isOpen.value = false;
    selectedImage.value = null;
};
</script>

<template>
    <LandingPageLayout>
        <div
            class="mt-10 min-h-screen text-gray-900 transition-colors duration-300 dark:text-gray-100"
        >
            <div class="mx-auto max-w-7xl px-4 py-16">
                <div
                    class="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
                >
                    <div class="space-y-3">
                        <p
                            class="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                        >
                            Achievement Detail
                        </p>

                        <h1
                            class="text-3xl font-extrabold tracking-tight md:text-5xl"
                        >
                            {{ achievement.title }}
                        </h1>
                    </div>
                </div>

                <div class="grid gap-10 lg:grid-cols-3">
                    <div
                        class="group relative overflow-hidden rounded-3xl border border-black/5 shadow-2xl lg:col-span-2 dark:border-white/10"
                    >
                        <div
                            class="h-[260px] w-full overflow-hidden md:h-[520px]"
                        >
                            <img
                                v-if="achievement.photo"
                                :src="getImage(achievement.photo)"
                                class="h-full w-full cursor-pointer object-cover transition duration-700 group-hover:scale-105"
                                @click="openModal(getImage(achievement.photo))"
                            />

                            <div
                                v-else
                                class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800"
                            >
                                <Award
                                    v-if="achievement.type == 0"
                                    class="h-30 w-30 text-gray-500"
                                />
                                <FileBadge
                                    v-else
                                    class="h-30 w-30 text-gray-500"
                                />
                            </div>
                        </div>

                        <div
                            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                        ></div>

                        <div
                            class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100"
                        >
                            <div
                                class="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md"
                            >
                                <Eye class="h-5 w-5" />
                                View Image
                            </div>
                        </div>

                        <div
                            class="absolute -bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
                        ></div>
                    </div>
                    <div class="space-y-6">
                        <div
                            class="rounded-xl border border-gray-300 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                        >
                            <p
                                class="text-xs font-bold text-gray-500 uppercase"
                            >
                                Type
                            </p>
                            <p class="text-md mt-1 font-semibold">
                                {{
                                    achievement.type === 0
                                        ? 'Award'
                                        : 'Certification'
                                }}
                            </p>
                        </div>
                        <div
                            class="rounded-xl border border-gray-300 bg-white/70 p-6 font-bold shadow-sm backdrop-blur-xl transition hover:shadow-lg dark:border-white/10 dark:bg-white/5"
                        >
                            <p class="text-xs text-gray-500 uppercase">Year</p>
                            <p class="text-md mt-1 font-semibold">
                                {{ achievement.date_format }}
                            </p>

                            <p class="mt-5 text-xs text-gray-500 uppercase">
                                Issuer
                            </p>
                            <p class="text-md mt-1 font-semibold">
                                {{ achievement.issuer }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-14 grid gap-12 md:grid-cols-3">
                    <div class="space-y-5 md:col-span-2">
                        <h2 class="text-xl font-bold">Overview</h2>

                        <p
                            class="text-justify leading-relaxed text-gray-600 dark:text-gray-300"
                        >
                            {{ achievement.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <Dialog
            v-model:visible="isOpen"
            modal
            :closable="true"
            :header="achievement.title"
            contentClass="p-0 bg-transparent shadow-none"
            :pt="{
                mask: { class: 'bg-black/80 backdrop-blur-sm' },
            }"
        >
            <img
                v-if="selectedImage"
                :src="selectedImage || ''"
                alt="image"
                class="block max-h-[70vh] max-w-[70vw] rounded-lg object-contain shadow-2xl"
            />

            <span v-else class="text-white">No image</span>
        </Dialog>
    </LandingPageLayout>
</template>
