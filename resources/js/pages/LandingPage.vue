<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { provide, reactive, ref, watch } from 'vue';
import ContactBubble from '@/components/contact/ContactBubble.vue';
import ContactModal from '@/components/contact/ContactModal.vue';
import MiniBot from '@/components/site/MiniBot.vue';
import About from '@/components/ui/landing-page/About.vue';
import Achievements from '@/components/ui/landing-page/Achievements.vue';
import Hero from '@/components/ui/landing-page/Hero.vue';
import Projects from '@/components/ui/landing-page/Projects.vue';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import { dashboard } from '@/routes';
import { ABOT_STATE } from '@/script/landingPage/abotState';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Landing Page',
        href: dashboard(),
    },
];

const props = withDefaults(
    defineProps<{
        personal: any;
        lastRole: string;
        skills: {
            hardSkills: any[];
            softSkills: any[];
        };
        projects?: any[];
        achievements?: any[];
        works?: any[];
        educations?: any[];
        contacts?: any[];
    }>(),
    {
        personal: () => ({}),
        lastRole: () => '',
        skills: () => ({
            hardSkills: [],
            softSkills: [],
        }),
        projects: () => [],
        achievements: () => [],
        works: () => [],
        educations: () => [],
        contacts: () => [],
    },
);

const isContactOpen = ref(false);

// Shared with the hero robot and the mini Abot (script/landingPage/abotState.ts).
const abotState = reactive({
    contactOpen: false,
    heroDialogOpen: false,
    heroAway: false,
});
watch(isContactOpen, (open) => (abotState.contactOpen = open));
provide(ABOT_STATE, abotState);
</script>

<template>
    <Head>
        <meta
            v-if="props.personal?.desc"
            head-key="description"
            name="description"
            :content="props.personal.desc"
        />
    </Head>

    <LandingPageLayout :breadcrumbs="breadcrumbs" :last-role="props.lastRole">
        <Hero :personal="props.personal" :last-role="props.lastRole" />
        <About
            :works="props.works"
            :educations="props.educations"
            :personal="props.personal"
            :lastRole="props.lastRole"
        />
        <Projects
            :projects="props.projects"
            :hard-skills="props.skills.hardSkills"
            :soft-skills="props.skills.softSkills"
        />
        <Achievements :achievements="props.achievements" />

        <MiniBot :personal="props.personal" :last-role="props.lastRole" />
        <ContactBubble @open="isContactOpen = true" />
        <ContactModal
            :open="isContactOpen"
            @close="isContactOpen = false"
            :contacts="props.contacts"
        />
    </LandingPageLayout>
</template>
