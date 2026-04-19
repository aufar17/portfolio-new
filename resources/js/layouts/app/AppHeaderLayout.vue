<script setup lang="ts">
import { ref } from 'vue';
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import Footer from '@/components/Footer.vue';
import Navbar from '@/components/ui/landing-page/Navbar.vue';
import SplashScreen from '@/components/ui/landing-page/SplashScreen.vue';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    lastRole?: string;
};

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
    lastRole: '',
});
</script>

<template>
    <AppShell variant="header">
        <SplashScreen />
        <Navbar />
        <AppContent variant="header">
            <slot />
        </AppContent>
        <Footer :lastRole="props.lastRole" />
    </AppShell>
</template>
