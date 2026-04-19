<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/composables/useCurrentUrl';
import type { NavItem } from '@/types';

const props = defineProps<{
    items: NavItem[];
}>();

const { isCurrentUrl } = useCurrentUrl();

const landingItems = computed(() =>
    props.items.filter((item) => item.group === 'landing'),
);

const featureItems = computed(() =>
    props.items.filter((item) => item.group === 'main'),
);

const personalItems = computed(() =>
    props.items.filter((item) => item.group === 'personal'),
);
</script>

<template>
    <SidebarGroup v-if="landingItems.length" class="px-2 py-0">
        <SidebarGroupLabel>Landing Page</SidebarGroupLabel>

        <SidebarMenu>
            <SidebarMenuItem v-for="item in landingItems" :key="item.title">
                <SidebarMenuButton
                    as-child
                    :is-active="isCurrentUrl(item.href)"
                    :tooltip="item.title"
                >
                    <Link :href="item.href">
                        <component :is="item.icon" />
                        <span>{{ item.title }}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>

    <SidebarGroup v-if="featureItems.length" class="mt-4 px-2 py-0">
        <SidebarGroupLabel>Main Features</SidebarGroupLabel>

        <SidebarMenu>
            <SidebarMenuItem v-for="item in featureItems" :key="item.title">
                <SidebarMenuButton
                    as-child
                    :is-active="isCurrentUrl(item.href)"
                    :tooltip="item.title"
                >
                    <Link :href="item.href">
                        <component :is="item.icon" />
                        <span>{{ item.title }}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>

    <SidebarGroup v-if="personalItems.length" class="mt-4 px-2 py-0">
        <SidebarGroupLabel>Personal Features</SidebarGroupLabel>

        <SidebarMenu>
            <SidebarMenuItem v-for="item in personalItems" :key="item.title">
                <SidebarMenuButton
                    as-child
                    :is-active="isCurrentUrl(item.href)"
                    :tooltip="item.title"
                >
                    <Link :href="item.href">
                        <component :is="item.icon" />
                        <span>{{ item.title }}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
