<script setup lang="ts">
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { allProjects, projectDetail } from '@/routes';
import { MonitorCog } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        projects?: any[];
        hardSkills?: any[];
        softSkills?: any[];
    }>(),
    {
        projects: () => [],
        hardSkills: () => [],
        softSkills: () => [],
    },
);

const activeTab = ref<'hard' | 'soft'>('hard');

const filteredSkills = computed(() =>
    activeTab.value === 'hard' ? props.hardSkills : props.softSkills,
);
const filteredProjects = computed(() => props.projects);

const getImage = (path: string) =>
    path ? `/storage/${path}` : '/images/default-skill.png';
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>

<template>
    <section id="project" class="px-6 py-28">
        <div class="mb-20 text-center">
            <h2
                class="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-gray-100"
            >
                Projects
            </h2>
            <p
                class="md:text-md mt-3 text-sm text-gray-500 lg:text-lg dark:text-gray-400"
            >
                A collection of projects I have worked on and developed
            </p>
        </div>

        <div
            class="mx-auto grid max-w-7xl auto-rows-[200px] gap-6 sm:grid-cols-2 md:grid-cols-4"
        >
            <Link
                :href="projectDetail(project.slug).url"
                v-for="(project, i) in filteredProjects"
                :key="project.id"
                :class="[
                    i === 0
                        ? 'md:col-span-2 md:row-span-2'
                        : i === 2
                          ? 'md:row-span-2'
                          : '',
                    'group relative overflow-hidden rounded-2xl border border-black/10 bg-white/40 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/5',
                ]"
            >
                <div class="h-full w-full overflow-hidden">
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
                        <MonitorCog class="h-30 w-30 text-gray-500" />
                    </div>
                </div>

                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 transition duration-300 group-hover:opacity-100"
                ></div>

                <div class="absolute inset-0 flex items-end p-6">
                    <div
                        class="translate-y-0 opacity-100 transition-all duration-500 ease-out md:translate-y-8 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                    >
                        <h3 class="text-lg font-bold text-white drop-shadow-md">
                            {{ project.title }}
                        </h3>

                        <div
                            class="mt-3 h-[2px] w-8 bg-white/60 transition-all duration-300 group-hover:w-16"
                        ></div>
                    </div>
                </div>
            </Link>
        </div>

        <div class="mt-10 text-center">
            <Link
                :href="allProjects().url"
                class="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-primary/10 px-6 py-2 text-sm font-medium text-black backdrop-blur transition-all duration-300 hover:bg-primary hover:text-white dark:border-white/10 dark:text-white"
            >
                See More Projects
                <span
                    class="transition-transform duration-300 group-hover:translate-x-2"
                >
                    →
                </span>
            </Link>
        </div>
        <div class="mx-auto mt-20 max-w-7xl px-4 sm:mt-24 sm:px-6 md:mt-28">
            <div class="mb-12 sm:mb-16 md:mb-20">
                <h3
                    class="text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-5xl dark:text-white"
                >
                    Skills
                </h3>
                <p
                    class="mt-2 text-center text-xs tracking-wide text-gray-500 sm:mt-3 sm:text-sm md:text-base lg:text-lg dark:text-gray-400"
                >
                    Tools, Languages, Frameworks and Abilities
                </p>
            </div>

            <div
                class="relative flex w-full overflow-hidden rounded-xl border border-black/10 bg-white/50 p-1 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
                <div
                    class="absolute top-1 bottom-1 w-1/2 rounded-lg bg-gradient-to-r from-primary/90 to-primary shadow-md transition-all duration-500 ease-in-out"
                    :class="
                        activeTab === 'soft'
                            ? 'translate-x-full'
                            : 'translate-x-0'
                    "
                ></div>

                <button
                    @click="activeTab = 'hard'"
                    class="relative z-10 flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 sm:px-4 sm:text-sm"
                    :class="
                        activeTab === 'hard'
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    "
                >
                    Hard Skills
                </button>

                <button
                    @click="activeTab = 'soft'"
                    class="relative z-10 flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 sm:px-4 sm:text-sm"
                    :class="
                        activeTab === 'soft'
                            ? 'text-white'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    "
                >
                    Soft Skills
                </button>
            </div>

            <transition name="fade" mode="out-in">
                <div :key="activeTab" class="mt-8 sm:mt-10">
                    <div
                        v-if="activeTab === 'hard'"
                        class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-7 md:gap-4"
                    >
                        <div
                            v-for="skill in filteredSkills"
                            :key="skill.id"
                            class="group flex items-center gap-3 rounded-xl border border-black/20 bg-white/40 p-3 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:aspect-square md:flex-col md:justify-center md:gap-2 md:p-4 dark:border-white/20 dark:bg-white/10"
                        >
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/5 p-2 transition-all duration-300 md:mb-3 md:h-25 md:w-25 md:p-5 md:group-hover:scale-110 md:group-hover:rotate-3 dark:bg-white/10"
                            >
                                <img
                                    :src="getImage(skill.icon)"
                                    :alt="skill.name"
                                    class="h-20 w-20 object-contain md:h-18 md:w-18"
                                />
                            </div>

                            <p
                                class="md:text-md text-left text-sm font-medium text-gray-700 md:text-center md:font-semibold md:group-hover:text-black dark:text-white/80 dark:md:group-hover:text-white"
                            >
                                {{ skill.name }}
                            </p>
                        </div>
                    </div>

                    <div
                        v-else
                        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
                    >
                        <div
                            v-for="skill in filteredSkills"
                            :key="skill.id"
                            class="group relative cursor-pointer overflow-hidden rounded-lg border border-black/10 bg-white/50 px-3 py-2 text-center font-medium text-gray-700 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                        >
                            <div
                                class="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            ></div>

                            <span
                                class="relative z-10 text-[11px] transition-all duration-300 group-hover:text-gray-900 sm:text-xs md:text-sm dark:group-hover:text-white"
                            >
                                {{ skill.name }}
                            </span>

                            <div
                                class="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover:w-1/2"
                            ></div>
                        </div>
                    </div>

                    <div
                        v-if="filteredSkills.length === 0"
                        class="mt-6 text-center text-sm font-medium tracking-wide text-gray-900 sm:text-base dark:text-white"
                    >
                        No skills data
                    </div>
                </div>
            </transition>
        </div>
    </section>
</template>
