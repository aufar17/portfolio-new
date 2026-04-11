<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import Hero from '@/components/ui/landing-page/Hero.vue';
import About from '@/components/ui/landing-page/About.vue';
import Projects from '@/components/ui/landing-page/Projects.vue';
import Contact from '@/components/ui/landing-page/Contact.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Landing Page',
        href: dashboard(),
    },
];

const props = withDefaults(
    defineProps<{
        personal: any;
        lastRole: String;
        skills: {
            hardSkills: any[];
            softSkills: any[];
        };
        projects?: any[];
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
        works: () => [],
        educations: () => [],
        contacts: () => [],
    },
);
</script>

<template>
    <Head title="Portfolio  " />

    <LandingPageLayout :breadcrumbs="breadcrumbs">
        <Hero :personal="props.personal" />
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
        <Contact :contacts="props.contacts" />
    </LandingPageLayout>
</template>
