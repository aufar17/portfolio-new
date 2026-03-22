<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import Hero from '@/components/ui/landing-page/Hero.vue';
import About from '@/components/ui/landing-page/About.vue';
import Projects from '@/components/ui/landing-page/Projects.vue';
import Contact from '@/components/ui/landing-page/Contact.vue';
import Card from '@/components/ui/card/Card.vue';
import Footer from '@/components/Footer.vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];
</script>

<template>
    <Head title="Portfolio  " />

    <LandingPageLayout :breadcrumbs="breadcrumbs">
        <Hero />
        <About />
        <Projects />
        <Contact />
    </LandingPageLayout>
</template>
