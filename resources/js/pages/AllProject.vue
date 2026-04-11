<script setup lang="ts">
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { Search } from 'lucide-vue-next';
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

const filteredProjects = computed(() => {
    return props.projects.filter((p) => {
        const keyword = search.value.toLowerCase();

        const matchTitle = p.title?.toLowerCase().includes(keyword);

        const matchTech = Array.isArray(p.tech)
            ? p.tech.some((t: string) => t.toLowerCase().includes(keyword))
            : p.tech?.toLowerCase().includes(keyword);

        return matchTitle || matchTech;
    });
});
const getImage = (path: string) =>
    path ? `/storage/${path}` : '/images/default-skill.png';
</script>

<template>
    <LandingPageLayout>
        <section class="mt-5 min-h-screen px-6 py-20">
            <div class="mx-auto max-w-7xl text-center">
                <h1
                    class="text-4xl font-extrabold text-gray-900 md:text-5xl dark:text-white"
                >
                    All Projects
                </h1>
                <p class="mt-3 text-gray-500 dark:text-gray-400">
                    Explore all projects I've built with passion and precision
                </p>
            </div>

            <div class="mx-auto mt-10 max-w-4xl">
                <div
                    class="flex items-center gap-4 rounded-xl border border-black/10 bg-white px-4 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/40 dark:border-white/10 dark:bg-white/10"
                >
                    <Search class="size-5 opacity-80 group-hover:opacity-100" />
                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search project or tech stack "
                        class="w-full bg-transparent text-sm text-gray-800 outline-none dark:text-white"
                    />
                </div>
            </div>

            <div
                class="mx-auto mt-12 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-2"
            >
                <Link
                    v-for="(project, i) in filteredProjects"
                    :key="project.id"
                    :href="projectDetail(project.slug).url"
                    class="group relative overflow-hidden rounded-xl border border-black/10 bg-background shadow transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                >
                    <div class="relative overflow-hidden">
                        <img
                            :src="getImage(project.image)"
                            :alt="project.title"
                            class="h-56 w-full object-cover transition duration-700 group-hover:scale-105"
                        />

                        <div
                            class="absolute inset-0 bg-black/10 opacity-0 transition duration-500 group-hover:opacity-100"
                        ></div>
                        <div
                            class="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-all group-hover:opacity-100"
                        >
                            <Link
                                :href="`/projects/${project.id}`"
                                class="flex items-center gap-2 rounded-full border border-black/20 bg-white/10 px-5 py-2 text-sm font-medium text-black backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-lg dark:border-white/20 dark:text-white"
                            >
                                View Project
                                <span
                                    class="transition-transform duration-300 group-hover:translate-x-1"
                                >
                                    →
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div
                        class="relative z-10 p-5 transition-all duration-300 group-hover:-translate-y-1"
                    >
                        <h3
                            class="mt-1 text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            {{ project.title }}
                        </h3>

                        <p
                            class="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400"
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
                                class="cursor-pointer rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] font-medium text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-primary hover:text-white hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-primary dark:hover:text-white"
                            >
                                {{ tech }}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <div
                v-if="filteredProjects.length === 0"
                class="mt-20 text-center text-gray-500 dark:text-gray-400"
            >
                No projects found.
            </div>
        </section>
    </LandingPageLayout>
</template>
