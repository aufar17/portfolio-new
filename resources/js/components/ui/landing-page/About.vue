<script setup lang="ts">
import profile from '@/assets/img/logo.png';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Education from './Education.vue';
import Work from './Work.vue';
import { BriefcaseBusiness, GraduationCap } from 'lucide-vue-next';

const stats = [
    { value: 1, suffix: '+', title: 'Experience' },
    { value: 10, suffix: '+', title: 'Projects' },
    { value: 5, suffix: '+', title: 'Awards & Certs' },
];

type Tab = 'education' | 'work';

const activeTab = ref<Tab>('work');
const tabs: { id: Tab; label: string; icon?: any }[] = [
    { id: 'work', label: 'Work', icon: BriefcaseBusiness },
    { id: 'education', label: 'Education', icon: GraduationCap },
];

const animatedStats = ref(stats.map(() => 0));
const aboutSection = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
const hasAnimated = ref(false);
const animateStats = () => {
    const duration = 1200;

    stats.forEach((item, index) => {
        const start = performance.now();

        const animate = (time: number) => {
            const progress = Math.min((time - start) / duration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(easeOut * item.value);

            animatedStats.value[index] = value;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                animatedStats.value[index] = item.value;
            }
        };

        requestAnimationFrame(animate);
    });
};

onMounted(() => {
    observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];

            if (entry.isIntersecting && !hasAnimated.value) {
                hasAnimated.value = true;

                setTimeout(() => {
                    animateStats();
                }, 400);

                observer?.disconnect();
            }
        },
        { threshold: 0.2, rootMargin: '0px 0px -100px 0px' },
    );

    if (aboutSection.value) {
        observer.observe(aboutSection.value);
    }
});

onBeforeUnmount(() => {
    observer?.disconnect();
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
                <div class="relative flex justify-center md:justify-start">
                    <div
                        class="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl"
                    ></div>

                    <div
                        class="group relative rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-3 hover:shadow-2xl"
                    >
                        <img
                            :src="profile"
                            alt="profile"
                            class="h-[300px] w-[240px] rounded-2xl object-contain"
                        />
                    </div>
                </div>

                <div class="flex flex-col justify-start gap-10">
                    <p
                        class="max-w-7xl text-justify text-black md:text-lg dark:text-muted-foreground"
                    >
                        An 8th-semester student in Automotive Industry
                        Information Systems at STMI Polytechnic Jakarta with a
                        strong interest in software development. Passionate
                        about building effective digital solutions, continuously
                        learning new technologies, and improving programming
                        skills. Known for strong responsibility, discipline, and
                        problem-solving abilities, both independently and in
                        team environments. <br />
                        <br />
                        I am currently doing an internship at
                        <span class="font-bold text-primary"
                            >PT Enseval Putera Megatrading Tbk</span
                        >
                        as a
                        <span class="font-bold text-chart-2"
                            >Flutter Developer</span
                        >. During this internship, I am gaining hands-on
                        experience in building websites using Flutter, enhancing
                        my skills in cross-platform development, and
                        collaborating with the development team to deliver
                        efficient and scalable solutions.
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
                class="flex w-full overflow-hidden rounded-lg border border-black/10 shadow-md dark:border-white/10"
            >
                <div
                    class="flex w-full gap-x-2 rounded-lg bg-white/10 p-2 dark:bg-white/5"
                >
                    <div
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        :class="[
                            'flex flex-1 cursor-pointer flex-col items-center justify-center px-3 py-2 text-center font-semibold transition-all duration-300',
                            activeTab === tab.id
                                ? 'rounded-lg bg-indigo-100 text-gray-900 shadow-inner backdrop-blur-xl dark:bg-white/10 dark:text-white'
                                : 'text-black hover:rounded-lg hover:bg-indigo-50 dark:text-gray-300 hover:dark:bg-white/10',
                        ]"
                    >
                        <component :is="tab.icon" class="mb-1 h-6 w-6" />
                        {{ tab.label }}
                    </div>
                </div>
            </div>

            <div class="mt-4 overflow-visible">
                <Work v-show="activeTab === 'work'" />
                <Education v-show="activeTab === 'education'" />
            </div>
        </div>
    </section>
</template>
