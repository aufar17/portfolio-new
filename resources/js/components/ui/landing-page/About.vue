<script setup lang="ts">
import IdCard from '@/components/site/IdCard.vue';
import Reveal from '@/components/site/Reveal.vue';
import SectionHeading from '@/components/site/SectionHeading.vue';
import SegmentedControl from '@/components/site/SegmentedControl.vue';
import Timeline from '@/components/site/Timeline.vue';
import { ScrollTrigger } from '@/motion/gsap';
import { UserAboutScript } from '@/script/landingPage/about';

const props = defineProps<{
    personal: any;
    lastRole: string;
    works?: any[];
    educations?: any[];
}>();

const {
    statsRef,
    avatarUrl,
    activeTab,
    tabs,
    workItems,
    educationItems,
    animatedStats,
    stats,
} = UserAboutScript({
    personal: props.personal,
    works: props.works ?? [],
    educations: props.educations ?? [],
});

// The panels differ in height, so later triggers need re-measuring.
const refreshScroll = () => ScrollTrigger.refresh();
</script>

<template>
    <section id="about" class="container-page section-y">
        <SectionHeading eyebrow="Get to know me" title="About" highlight="Me" />

        <div
            class="grid items-start gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16"
        >
            <!-- ID card -->
            <Reveal class="mx-auto w-full max-w-[320px]">
                <IdCard
                    name="Muammar Aufar Prasetya"
                    :role="props.lastRole"
                    location="Bekasi, Indonesia"
                    :avatar="avatarUrl"
                    :tags="personal?.role_list"
                />
            </Reveal>

            <!-- Bio + stats -->
            <div class="flex flex-col gap-10">
                <Reveal :delay="0.1">
                    <p
                        class="text-base leading-relaxed text-pretty text-muted-foreground md:text-lg md:leading-relaxed"
                    >
                        {{ personal.about }}
                    </p>
                </Reveal>

                <Reveal :delay="0.2">
                    <dl ref="statsRef" class="grid grid-cols-3 gap-3 sm:gap-4">
                        <div
                            v-for="(item, index) in stats"
                            :key="item.title"
                            class="flex flex-col items-center gap-1 rounded-2xl surface-glass px-2 py-5 text-center sm:py-6"
                        >
                            <dt
                                class="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase sm:text-xs"
                            >
                                {{ item.title }}
                            </dt>
                            <dd
                                class="order-first text-3xl font-extrabold tracking-tight text-primary-strong tabular-nums sm:text-4xl"
                            >
                                {{ animatedStats[index] }}{{ item.suffix }}
                            </dd>
                        </div>
                    </dl>
                </Reveal>
            </div>
        </div>

        <!-- Work / Education -->
        <div class="mt-20 md:mt-28">
            <Reveal class="mx-auto max-w-md">
                <SegmentedControl
                    id="about-tabs"
                    v-model="activeTab"
                    :options="tabs"
                    label="Experience"
                />
            </Reveal>

            <div class="mx-auto mt-12 max-w-5xl">
                <Transition
                    mode="out-in"
                    enter-active-class="transition-opacity duration-200 ease-out-expo"
                    enter-from-class="opacity-0"
                    leave-active-class="transition-opacity duration-150 ease-out-expo"
                    leave-to-class="opacity-0"
                    @after-enter="refreshScroll"
                >
                    <div
                        :id="`about-tabs-panel-${activeTab}`"
                        :key="activeTab"
                        role="tabpanel"
                        :aria-labelledby="`about-tabs-tab-${activeTab}`"
                    >
                        <Timeline
                            :items="
                                activeTab === 'work'
                                    ? workItems
                                    : educationItems
                            "
                        />
                    </div>
                </Transition>
            </div>
        </div>
    </section>
</template>
