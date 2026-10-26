<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { ArrowUpRight } from 'lucide-vue-next';
import { computed } from 'vue';
import AdminPage from '@/components/admin/AdminPage.vue';
import { adminNavGroups } from '@/lib/admin-nav';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

const page = usePage();
const userName = computed(
    () => (page.props.auth as any)?.user?.name ?? 'there',
);

const shortcuts = adminNavGroups
    .flatMap((group) => group.items)
    .filter((item) => item.href !== dashboard().url);
</script>

<template>
    <AdminPage
        title="Dashboard"
        :description="`Welcome back, ${userName}. Pick a section to manage.`"
        :breadcrumbs="breadcrumbs"
    >
        <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <li v-for="item in shortcuts" :key="item.title">
                <Link
                    :href="item.href"
                    class="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft focus-ring transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
                >
                    <div class="flex items-start justify-between">
                        <span
                            class="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                            <component
                                :is="item.icon"
                                class="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <ArrowUpRight
                            class="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-strong"
                            aria-hidden="true"
                        />
                    </div>
                    <div>
                        <p class="font-semibold text-foreground">
                            {{ item.title }}
                        </p>
                        <p
                            v-if="item.description"
                            class="mt-1 text-sm text-muted-foreground"
                        >
                            {{ item.description }}
                        </p>
                    </div>
                </Link>
            </li>
        </ul>
    </AdminPage>
</template>
