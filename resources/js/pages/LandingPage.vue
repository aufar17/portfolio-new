<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import LandingPageLayout from '@/layouts/LandingPageLayout.vue';
import Hero from '@/components/ui/landing-page/Hero.vue';
import About from '@/components/ui/landing-page/About.vue';

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
        <Hero></Hero>
        <About></About>
    </LandingPageLayout>
</template>
