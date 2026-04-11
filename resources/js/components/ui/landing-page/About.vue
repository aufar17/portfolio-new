<script setup lang="ts">
import { UserAboutScript } from '@/script/landingPage/about';
import Work from './Work.vue';
import Education from './Education.vue';

const props = defineProps<{
    personal: any;
    lastRole: String;
    works?: any[];
    educations?: any[];
}>();

const { aboutSection, activeTab, tabs, activeIndex, animatedStats, stats } =
    UserAboutScript({
        personal: props.personal,
        lastRole: props.lastRole,
        works: props.works ?? [],
        educations: props.educations ?? [],
    });
</script>

<template>
    <section
        ref="aboutSection"
        id="about"
        class="relative flex flex-col items-center justify-center px-6 py-28"
    >
        <div
            class="w-full max-w-7xl rounded-xl border border-black/10 bg-white/20 p-8 shadow-xl backdrop-blur-xl md:p-12 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
        >
            <div
                class="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl"
            ></div>

            <div class="mb-16 text-center">
                <h2 class="text-3xl font-bold md:text-5xl">
                    About <span class="text-primary">Me</span>
                </h2>
            </div>

            <div class="grid gap-10 md:grid-cols-[1fr_2fr]">
                <div class="flex justify-center md:justify-start">
                    <div
                        class="group relative w-[280px] overflow-hidden rounded-xl border border-black/10 bg-black/5 text-center transition duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-white/10"
                    >
                        <div
                            class="flex items-center justify-between border-b border-black/10 bg-primary px-4 py-3 text-sm font-bold text-white dark:border-white/10"
                        >
                            <span class="tracking-wider">ID CARD</span>
                            <QrCode class="h-5 w-5 opacity-80" />
                        </div>

                        <div class="p-6">
                            <div class="flex justify-center">
                                <img
                                    :src="
                                        personal?.photo
                                            ? `/storage/${personal.photo}`
                                            : '/images/default.png'
                                    "
                                    alt="avatar"
                                    class="h-24 w-24 rounded-full border border-black/10 object-cover shadow-lg dark:border-white/10"
                                />
                            </div>

                            <h2
                                class="mt-4 text-lg font-semibold text-black dark:text-white"
                            >
                                Muammar Aufar Prasetya
                            </h2>

                            <p
                                class="mt-1 text-sm font-medium text-black/80 italic dark:text-white/80"
                            >
                                {{ props.lastRole }}
                            </p>

                            <div
                                class="my-4 border-t border-black/30 dark:border-white/10"
                            ></div>

                            <div
                                class="space-y-1 text-xs text-black/80 dark:text-white/80"
                            >
                                <p class="font-medium">📍 Bekasi, Indonesia</p>
                            </div>

                            <div
                                class="mt-4 flex flex-wrap justify-center gap-2"
                            >
                                <span
                                    v-for="(role, i) in personal?.role_list ||
                                    []"
                                    :key="i"
                                    class="rounded-full border border-black/10 px-2 py-0.5 text-[10px] dark:border-white/10"
                                >
                                    {{ role }}
                                </span>
                            </div>
                        </div>

                        <div
                            class="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
                        ></div>
                    </div>
                </div>

                <div class="flex flex-col justify-start gap-10">
                    <p
                        class="max-w-7xl text-justify text-black md:text-lg dark:text-muted-foreground"
                    >
                        {{ personal.about }}
                    </p>

                    <div
                        class="flex w-full max-w-4xl flex-col items-start justify-start gap-6 text-left md:flex-row md:items-center md:justify-between md:gap-8"
                    >
                        <template
                            v-for="(item, index) in stats"
                            :key="item.title"
                        >
                            <div
                                class="flex w-full flex-1 flex-col items-start sm:text-center md:items-center md:text-center"
                            >
                                <p
                                    class="text-3xl font-bold text-primary sm:text-4xl md:text-4xl"
                                >
                                    {{ animatedStats[index] }}{{ item.suffix }}
                                </p>
                                <p
                                    class="mt-2 text-base font-semibold tracking-wide text-black uppercase sm:text-lg dark:text-white"
                                >
                                    {{ item.title }}
                                </p>
                            </div>

                            <div
                                v-if="index < stats.length - 1"
                                class="hidden h-16 w-px self-stretch bg-white/20 md:block lg:h-20"
                            ></div>

                            <div
                                v-if="index < stats.length - 1"
                                class="h-px w-full bg-white/10 md:hidden"
                            ></div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-5 w-full">
            <div
                class="relative flex w-full overflow-hidden rounded-lg border border-black/10 shadow-md dark:border-white/10"
            >
                <div
                    class="relative flex w-full rounded-lg bg-white/10 p-2 dark:bg-white/5"
                >
                    <div
                        class="absolute top-2 bottom-2 left-2 z-0 rounded-lg bg-indigo-100 shadow-inner transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/10"
                        :style="{
                            width: `calc((100% - 0.5rem) / ${tabs.length})`,
                            transform: `translateX(${activeIndex * 100}%)`,
                        }"
                    />

                    <div
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        class="relative z-10 flex flex-1 cursor-pointer flex-col items-center justify-center px-3 py-2 text-center font-semibold transition-colors duration-300"
                        :class="
                            activeTab === tab.id
                                ? 'text-gray-900 dark:text-white'
                                : 'text-black dark:text-gray-300'
                        "
                    >
                        <component
                            :is="tab.icon"
                            class="mb-1 h-6 w-6 transition-transform duration-300"
                            :class="activeTab === tab.id ? 'scale-110' : ''"
                        />
                        {{ tab.label }}
                    </div>
                </div>
            </div>
            <div class="mt-4 overflow-hidden">
                <Transition
                    enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    enter-from-class="opacity-0 translate-y-6 scale-95"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 translate-y-0 scale-100"
                    leave-to-class="opacity-0 -translate-y-6 scale-95"
                    mode="out-in"
                >
                    <Work
                        v-if="activeTab === 'work'"
                        :works="props.works"
                        key="work"
                    />

                    <Education
                        v-else
                        :educations="props.educations"
                        key="education"
                    />
                </Transition>
            </div>
        </div>
    </section>
</template>
