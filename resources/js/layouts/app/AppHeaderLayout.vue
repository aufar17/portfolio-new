<script setup lang="ts">
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import Footer from '@/components/Footer.vue';
import Navbar from '@/components/ui/landing-page/Navbar.vue';
import SplashScreen from '@/components/ui/landing-page/SplashScreen.vue';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});
</script>

<template>
    <AppShell variant="header">
        <SplashScreen />
        <Navbar />
        <AppContent variant="header">
            <slot />
        </AppContent>
        <Footer />
    </AppShell>
</template>
