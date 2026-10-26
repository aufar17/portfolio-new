<script setup lang="ts">
import type { BreadcrumbItem } from '@/types';
import AppHeaderLayout from './app/AppHeaderLayout.vue';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    lastRole?: string;
};

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
    lastRole: '',
});
</script>

<template>
    <AppHeaderLayout :breadcrumbs="breadcrumbs" :last-role="lastRole">
        <slot />
    </AppHeaderLayout>
</template>
