<script setup lang="ts">
import { Eye, MonitorCog } from 'lucide-vue-next';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';

const props = defineProps<{
    project: any;
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
            <div class="mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-16">
                <div
                    class="mb-10 flex flex-col gap-4 sm:mb-12 md:mb-14 md:flex-row md:items-end md:justify-between"
                >
                    <div class="space-y-2 sm:space-y-3">
                        <p
                            class="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase sm:text-sm dark:text-gray-400"
                        >
                            Project Detail
                        </p>

                        <h1
                            class="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-5xl"
                        >
                            {{ project.title }}
                        </h1>

                        <p
                            class="max-w-2xl text-sm text-gray-500 sm:text-base dark:text-gray-400"
                        >
                            {{ project.subtitle }}
                        </p>
                    </div>
                </div>

                <div class="grid gap-6 lg:grid-cols-3">
                    <div
                        class="group relative overflow-hidden rounded-2xl border border-black/5 shadow-2xl lg:col-span-2 dark:border-white/10"
                    >
                        <div
                            class="h-[220px] w-full overflow-hidden sm:h-[280px] md:h-[350px] lg:h-full"
                        >
                            <img
                                v-if="project.image"
                                :src="getImage(project.image)"
                                :alt="project.title"
                                class="h-full w-full object-cover transition duration-700 ease-in-out group-hover:scale-110"
                                @click="openModal(getImage(project.image))"
                            />

                            <div
                                v-else
                                class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800"
                            >
                                <MonitorCog
                                    class="h-16 w-16 text-gray-500 sm:h-20 sm:w-20 md:h-24 md:w-24"
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
                                class="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md sm:px-5 sm:text-sm"
                            >
                                <Eye class="h-4 w-4 sm:h-5 sm:w-5" />
                                View Image
                            </div>
                        </div>

                        <div
                            class="absolute -bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
                        ></div>
                    </div>

                    <div class="space-y-4 sm:space-y-6">
                        <div
                            class="rounded-xl border border-gray-300 bg-white/70 p-4 backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-white/5"
                        >
                            <p
                                class="mb-3 text-xs font-bold text-gray-500 uppercase sm:mb-4"
                            >
                                Responsibility
                            </p>
                            <p class="mt-1 text-sm font-semibold sm:text-base">
                                {{ project.responsibility }}
                            </p>
                        </div>

                        <div
                            class="rounded-xl border border-gray-300 bg-white/70 p-4 font-bold shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg sm:p-6 dark:border-white/10 dark:bg-white/5"
                        >
                            <p class="text-xs text-gray-500 uppercase">Year</p>
                            <p class="mt-1 text-sm font-semibold sm:text-base">
                                {{ project.date_range }}
                            </p>

                            <p
                                class="mt-4 text-xs text-gray-500 uppercase sm:mt-5"
                            >
                                Associate
                            </p>
                            <p class="mt-1 text-sm font-semibold sm:text-base">
                                {{ project.associate }}
                            </p>
                        </div>

                        <div
                            class="rounded-xl border border-gray-300 bg-white/70 p-4 backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-white/5"
                        >
                            <p
                                class="mb-3 text-xs font-bold text-gray-500 uppercase sm:mb-4"
                            >
                                Tech Stack
                            </p>

                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="(tech, i) in project.tech_list"
                                    :key="i"
                                    class="rounded-full bg-black px-2 py-1 text-[10px] font-medium text-white transition hover:-translate-y-0.5 sm:px-3 sm:text-xs dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black"
                                >
                                    {{ tech }}
                                </span>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <a
                                :href="project.link"
                                target="_blank"
                                class="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 sm:text-sm dark:border-white/10 dark:bg-white/10"
                            >
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                                    class="h-5 w-5 sm:h-6 sm:w-6"
                                    alt="Github"
                                />
                                Github
                            </a>
                        </div>
                    </div>
                </div>

                <div class="mt-10 grid gap-10 sm:mt-12 md:mt-14 md:grid-cols-3">
                    <div class="space-y-4 sm:space-y-5 md:col-span-2">
                        <h2 class="text-lg font-bold sm:text-xl">Overview</h2>

                        <p
                            class="text-justify text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
                        >
                            {{ project.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <Dialog
            v-model:visible="isOpen"
            modal
            :closable="true"
            :header="project.title"
            contentClass="p-0 bg-transparent shadow-none"
            :pt="{
                mask: { class: 'bg-black/80 backdrop-blur-sm' },
            }"
        >
            <img
                v-if="selectedImage"
                :src="selectedImage || ''"
                alt="image"
                class="block max-h-[60vh] max-w-[90vw] rounded-lg object-contain shadow-2xl sm:max-h-[70vh] sm:max-w-[70vw]"
            />

            <span v-else class="text-white">No image</span>
        </Dialog>
    </LandingPageLayout>
</template>
