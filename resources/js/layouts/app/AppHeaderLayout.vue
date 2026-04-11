<script setup lang="ts">
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import Footer from '@/components/Footer.vue';
import ThreadBubble from '@/components/threads/ThreadBubble.vue';
import ThreadsModal from '@/components/threads/ThreadsModal.vue';
import Navbar from '@/components/ui/landing-page/Navbar.vue';
import SplashScreen from '@/components/ui/landing-page/SplashScreen.vue';
import type { BreadcrumbItem } from '@/types';
import { ref } from 'vue';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    lastRole?: string;
};

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
    lastRole: '',
});

const isDiscussionOpen = ref(false);
</script>

<template>
    <AppShell variant="header">
        <SplashScreen />
        <Navbar />
        <AppContent variant="header">
            <slot />
        </AppContent>
        <Footer :lastRole="props.lastRole" />
        <ThreadBubble @open="isDiscussionOpen = true" />
        <ThreadsModal :open="isDiscussionOpen" @close="isDiscussionOpen = false" />
    </AppShell>
</template>
