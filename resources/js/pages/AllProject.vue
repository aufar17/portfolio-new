<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { MonitorCog, Search } from 'lucide-vue-next';
import { ref, computed, watch } from 'vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { projectDetail } from '@/routes';

const props = withDefaults(
    defineProps<{
        projects?: any[];
    }>(),
    {
        projects: () => [],
    },
);

const search = ref('');
const currentPage = ref(1);
const perPage = 6;

const filteredProjects = computed(() => {
    return props.projects.filter((p) => {
        const keyword = search.value.toLowerCase();

        const matchTitle = p.title?.toLowerCase().includes(keyword);
        const matchAssociate = p.associate?.toLowerCase().includes(keyword);

        const matchTech = Array.isArray(p.tech)
            ? p.tech.some((t: string) => t.toLowerCase().includes(keyword))
            : p.tech?.toLowerCase().includes(keyword);

        return matchTitle || matchTech || matchAssociate;
    });
});

const totalPages = computed(() =>
    Math.ceil(filteredProjects.value.length / perPage),
);

const pages = computed(() =>
    Array.from({ length: totalPages.value }, (_, i) => i + 1),
);

const paginatedProjects = computed(() => {
    const start = (currentPage.value - 1) * perPage;
    const end = start + perPage;
    return filteredProjects.value.slice(start, end);
});

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

watch(filteredProjects, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
    }
});

const getImage = (path: string) =>
    path ? `/storage/${path}` : '/images/default-skill.png';
</script>

<template>
    <LandingPageLayout>
        <section
            class="mt-10 min-h-screen px-4 py-12 sm:mt-5 sm:px-6 sm:py-16 md:py-20"
        >
            <div class="mx-auto max-w-7xl text-center">
                <h1
                    class="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-5xl dark:text-white"
                >
                    All Projects
                </h1>

                <p
                    class="mt-2 text-sm text-gray-500 sm:mt-3 sm:text-base dark:text-gray-400"
                >
                    Explore all projects I've built with passion and precision
                </p>
            </div>

            <div class="mx-auto mt-8 max-w-4xl sm:mt-10">
                <div
                    class="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/40 sm:gap-4 sm:px-4 dark:border-white/10 dark:bg-white/10"
                >
                    <Search class="h-4 w-4 opacity-80 sm:h-5 sm:w-5" />

                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search project, tech stack, or associate"
                        class="w-full bg-transparent text-xs text-gray-800 outline-none sm:text-sm dark:text-white"
                    />
                </div>
            </div>

            <div
                class="mx-auto mt-10 grid max-w-7xl gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2"
            >
                <Link
                    v-for="(project, i) in paginatedProjects"
                    :key="project.id"
                    :href="projectDetail(project.slug).url"
                    class="group relative overflow-hidden rounded-xl border border-black/10 bg-background shadow transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                >
                    <div class="relative overflow-hidden">
                        <div
                            class="h-[180px] w-full overflow-hidden sm:h-[220px] md:h-[260px]"
                        >
                            <img
                                v-if="project.image"
                                :src="getImage(project.image)"
                                :alt="project.title"
                                class="h-full w-full object-cover transition duration-700 ease-in-out group-hover:scale-110"
                            />

                            <div
                                v-else
                                class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800"
                            >
                                <MonitorCog
                                    class="h-12 w-12 text-gray-500 sm:h-16 sm:w-16 md:h-20 md:w-20"
                                />
                            </div>
                        </div>

                        <div
                            class="absolute inset-0 bg-black/10 opacity-0 transition duration-500 group-hover:opacity-100"
                        ></div>

                        <div
                            class="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-all group-hover:opacity-100"
                        >
                            <div
                                class="flex items-center gap-2 rounded-full border border-black/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-black backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-lg sm:px-5 sm:py-2 sm:text-sm dark:border-white/20 dark:text-white"
                            >
                                View Project
                                <span
                                    class="transition-transform duration-300 group-hover:translate-x-1"
                                >
                                    →
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        class="relative z-10 p-4 transition-all duration-300 group-hover:-translate-y-1 sm:p-5"
                    >
                        <h3
                            class="mt-1 text-base font-semibold text-gray-900 sm:text-lg dark:text-white"
                        >
                            {{ project.title }}
                        </h3>

                        <p
                            class="mt-2 line-clamp-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400"
                        >
                            {{ project.description }}
                        </p>

                        <div
                            v-if="project.tech_list.length"
                            class="mt-3 flex flex-wrap gap-2"
                        >
                            <span
                                v-for="(tech, index) in project.tech_list"
                                :key="index"
                                class="cursor-pointer rounded-full border border-black/10 bg-black/5 px-2 py-1 text-[10px] font-medium text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-primary hover:text-white hover:shadow-md sm:px-3 sm:text-[11px] dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-primary dark:hover:text-white"
                            >
                                {{ tech }}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <div
                v-if="filteredProjects.length === 0"
                class="mt-16 text-center text-sm text-gray-500 sm:mt-20 sm:text-base dark:text-gray-400"
            >
                No projects found.
            </div>

            <div
                v-if="filteredProjects.length > perPage"
                class="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12"
            >
                <button
                    class="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                >
                    ← Previous
                </button>

                <button
                    v-for="page in pages"
                    :key="page"
                    @click="goToPage(page)"
                    class="min-w-[32px] rounded-xl border px-2 py-1.5 text-xs transition-all hover:-translate-y-0.5 sm:min-w-[38px] sm:px-3 sm:py-2 sm:text-sm"
                    :class="
                        currentPage === page
                            ? 'border-black bg-black text-white dark:bg-white dark:text-black'
                            : 'border-black/10 bg-white text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-white'
                    "
                >
                    {{ page }}
                </button>

                <button
                    class="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm dark:border-white/10 dark:bg-white/10 dark:text-white"
                    :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)"
                >
                    Next →
                </button>
            </div>
        </section>
    </LandingPageLayout>
</template>
