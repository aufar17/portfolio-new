<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed, onBeforeMount, onBeforeUnmount } from 'vue';
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import Footer from '@/components/Footer.vue';
import FloatingSparks from '@/components/site/FloatingSparks.vue';
import Navbar from '@/components/ui/landing-page/Navbar.vue';
import SplashScreen from '@/components/ui/landing-page/SplashScreen.vue';
import { acquireLenis, releaseLenis } from '@/motion/lenis';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    lastRole?: string;
};

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
    lastRole: '',
});

const page = usePage();

// Landing page passes `lastRole` as a page prop; use it when the layout isn't given one.
const role = computed(
    () => props.lastRole || (page.props.lastRole as string | undefined) || '',
);

// Smooth scroll lives only on public pages. Created before children mount
// so the splash can pause it.
onBeforeMount(acquireLenis);
onBeforeUnmount(releaseLenis);
</script>

<template>
    <AppShell variant="header">
        <a
            href="#main-content"
            class="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-ring focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
            Skip to content
        </a>
        <FloatingSparks />
        <SplashScreen />
        <Navbar />
        <AppContent id="main-content" variant="header">
            <slot />
        </AppContent>
        <Footer :last-role="role" />
    </AppShell>
</template>
