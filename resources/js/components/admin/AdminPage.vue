<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';

/** Page frame for admin screens: title block + content card area. */
defineProps<{
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
}>();
</script>

<template>
    <Head :title="title" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
            <header
                class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
                <div class="min-w-0">
                    <h1
                        class="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
                    >
                        {{ title }}
                    </h1>
                    <p
                        v-if="description"
                        class="mt-1 text-sm text-muted-foreground"
                    >
                        {{ description }}
                    </p>
                </div>
                <div v-if="$slots.actions" class="flex shrink-0 gap-2">
                    <slot name="actions" />
                </div>
            </header>

            <slot />
        </div>
    </AppLayout>
</template>
