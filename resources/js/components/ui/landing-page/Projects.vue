<script setup lang="ts">
import { ref, computed } from 'vue';
import { CodeXml, Smartphone, Users, Brain } from 'lucide-vue-next';
import { Link } from '@inertiajs/vue3';

const projects = [
    {
        title: 'Hydrant System',
        image: '/images/project1.jpg',
        span: 'md:col-span-2 md:row-span-2',
    },
    {
        title: 'Inventory App',
        image: '/images/project2.jpg',
        span: '',
    },
    {
        title: 'VR Showcase',
        image: '/images/project3.jpg',
        span: 'md:row-span-2',
    },
    {
        title: 'Flutter App',
        image: '/images/project4.jpg',
        span: '',
    },
    {
        title: 'Web Dashboard',
        image: '/images/project5.jpg',
        span: 'md:col-span-2',
    },
];

type Skill = {
    name: string;
    type: 'hard' | 'soft';
    icon?: any;
};

const skills: Skill[] = [
    { name: 'Laravel', type: 'hard', icon: CodeXml },
    { name: 'Vue.js', type: 'hard', icon: CodeXml },
    { name: 'Flutter', type: 'hard', icon: Smartphone },

    { name: 'Teamwork', type: 'soft', icon: Users },
    { name: 'Problem Solving', type: 'soft', icon: Brain },
    { name: 'Communication', type: 'soft', icon: Users },
];

const activeTab = ref<'hard' | 'soft'>('hard');

const filteredSkills = computed(() =>
    skills.filter((s) => s.type === activeTab.value),
);
</script>

<template>
    <section id="project" class="px-6 py-28">
        <div class="mb-20 text-center">
            <h2
                class="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
            >
                Projects
            </h2>
            <p class="mt-3 text-gray-500 dark:text-gray-400">
                A collection of projects I have worked on and developed
            </p>
        </div>

        <div
            class="mx-auto grid max-w-7xl auto-rows-[180px] gap-6 sm:grid-cols-2 md:grid-cols-4"
        >
            <div
                v-for="(project, i) in projects"
                :key="i"
                :class="[
                    i === projects.length - 1 ? 'md:col-span-4' : project.span,
                    'group relative overflow-hidden rounded-xl border border-black/10 bg-white/40 backdrop-blur-xl transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/5',
                ]"
            >
                <img
                    :src="project.image"
                    :alt="project.title"
                    class="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 transition group-hover:opacity-90"
                ></div>

                <div class="absolute inset-0 flex items-end p-6">
                    <div
                        class="translate-y-6 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                        <h3 class="text-lg font-semibold text-white">
                            {{ project.title }}
                        </h3>
                        <div
                            class="mt-2 h-[2px] w-8 bg-white/60 transition-all group-hover:w-16"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-10 text-center">
            <Link
                href="/projects"
                class="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-6 py-3 font-semibold text-white transition-all duration-300"
            >
                <span
                    class="absolute inset-0 bg-primary opacity-80 transition duration-300 group-hover:opacity-100 dark:bg-chart-1"
                ></span>

                <span class="relative z-10 flex items-center gap-2">
                    More Projects
                    <span
                        class="transition-transform duration-300 group-hover:translate-x-1"
                    >
                        →
                    </span>
                </span>
            </Link>
        </div>
        <div class="mx-auto mt-30 max-w-7xl">
            <div class="mb-20">
                <h3
                    class="text-center text-5xl font-bold text-gray-900 dark:text-white"
                >
                    My Skills
                </h3>
                <p
                    class="mt-3 text-center tracking-wide text-gray-500 dark:text-gray-400"
                >
                    Tools, Languages, Frameworks and Abilities
                </p>
            </div>

            <div
                class="relative flex w-full overflow-hidden rounded-xl border border-black/10 bg-white/40 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
                <div
                    class="absolute top-1 bottom-1 w-1/2 rounded-lg bg-white/80 shadow-md transition-all duration-300 dark:bg-white/10"
                    :class="activeTab === 'soft' ? 'translate-x-full' : ''"
                ></div>

                <button
                    @click="activeTab = 'hard'"
                    class="relative z-10 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition"
                    :class="
                        activeTab === 'hard'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                >
                    Hard Skills
                </button>

                <button
                    @click="activeTab = 'soft'"
                    class="relative z-10 flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition"
                    :class="
                        activeTab === 'soft'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                >
                    Soft Skills
                </button>
            </div>

            <transition name="fade" mode="out-in">
                <div :key="activeTab" class="mt-10">
                    <div
                        v-if="activeTab === 'hard'"
                        class="grid grid-cols-4 gap-4 sm:grid-cols-3 md:grid-cols-6"
                    >
                        <div
                            v-for="skill in filteredSkills"
                            :key="skill.name"
                            class="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-black/10 bg-white/40 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-white/10"
                        >
                            <div
                                class="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-black/5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 dark:bg-white/10"
                            >
                                <component
                                    :is="skill.icon"
                                    class="h-8 w-8 text-gray-800 transition-colors duration-300 group-hover:text-black dark:text-white dark:group-hover:text-white"
                                />
                            </div>

                            <p
                                class="text-center text-sm font-semibold text-gray-700 transition-colors duration-300 group-hover:text-black dark:text-white/80 dark:group-hover:text-white"
                            >
                                {{ skill.name }}
                            </p>
                        </div>
                    </div>

                    <div
                        v-else
                        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                    >
                        <div
                            v-for="skill in filteredSkills"
                            :key="skill.name"
                            class="cursor-pointer rounded-xl border border-black/10 bg-white/40 px-4 py-3 text-center font-medium text-gray-700 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                        >
                            {{ skill.name }}
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </section>
</template>

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
