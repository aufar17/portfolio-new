<script setup lang="ts">
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { Eye } from 'lucide-vue-next';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';

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
    <div
        class="min-h-screen text-gray-900 transition-colors duration-300 dark:text-gray-100"
    >
        <div class="mx-auto max-w-7xl px-4 py-16">
            <div
                class="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
                <div class="space-y-3">
                    <p
                        class="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                    >
                        Project Detail
                    </p>

                    <h1
                        class="text-3xl font-extrabold tracking-tight md:text-5xl"
                    >
                        {{ project.title }}
                    </h1>

                    <p class="max-w-2xl text-gray-500 dark:text-gray-400">
                        {{ project.subtitle }}
                    </p>
                </div>
            </div>

            <div class="grid gap-10 lg:grid-cols-3">
                <div
                    class="group relative overflow-hidden rounded-3xl border border-black/5 shadow-2xl lg:col-span-2 dark:border-white/10"
                >
                    <img
                        :src="getImage(project.image)"
                        class="h-[260px] w-full cursor-pointer object-cover transition duration-700 group-hover:scale-105 md:h-[520px]"
                        @click="openModal(getImage(project.image))"
                    />

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
                            class="mb-4 text-xs font-bold text-gray-500 uppercase"
                        >
                            Responsibility
                        </p>
                        <p class="text-md mt-1 font-semibold">
                            {{ project.responsibility }}
                        </p>
                    </div>
                    <div
                        class="rounded-xl border border-gray-300 bg-white/70 p-6 font-bold shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
                    >
                        <p class="text-xs text-gray-500 uppercase">Year</p>
                        <p class="text-md mt-1 font-semibold">
                            {{ project.date_range }}
                        </p>

                        <p class="mt-5 text-xs text-gray-500 uppercase">
                            Associate
                        </p>
                        <p class="text-md mt-1 font-semibold">
                            {{ project.associate }}
                        </p>
                    </div>

                    <div
                        class="rounded-xl border border-gray-300 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                        <p
                            class="mb-4 text-xs font-bold text-gray-500 uppercase"
                        >
                            Tech Stack
                        </p>

                        <div class="flex flex-wrap gap-2">
                            <span
                                v-for="(tech, i) in project.tech_list"
                                :key="i"
                                class="rounded-full bg-black px-3 py-1 text-xs font-medium text-white transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black"
                            >
                                {{ tech }}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <a
                            :href="project.link"
                            target="_blank"
                            class="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/10"
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                                class="h-7 w-7"
                                alt="Github"
                            />
                            Github
                        </a>
                    </div>
                </div>
            </div>

            <div class="mt-14 grid gap-12 md:grid-cols-3">
                <div class="space-y-5 md:col-span-2">
                    <h2 class="text-xl font-bold">Overview</h2>

                    <p class="leading-relaxed text-gray-600 dark:text-gray-300">
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
            class="block max-h-[70vh] max-w-[70vw] rounded-lg object-contain shadow-2xl"
        />

        <span v-else class="text-white">No image</span>
    </Dialog>
</template>
