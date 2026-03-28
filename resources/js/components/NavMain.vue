<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
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

const landingItem = props.items[0];
const featureItems = props.items.slice(1);
</script>

<template>
    <SidebarGroup class="px-2 py-0">
        <SidebarGroupLabel>Landing Page</SidebarGroupLabel>

        <SidebarMenu v-if="landingItem">
            <SidebarMenuItem>
                <SidebarMenuButton
                    as-child
                    :is-active="isCurrentUrl(landingItem.href)"
                    :tooltip="landingItem.title"
                >
                    <Link :href="landingItem.href">
                        <component :is="landingItem.icon" />
                        <span>{{ landingItem.title }}</span>
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
</template>
