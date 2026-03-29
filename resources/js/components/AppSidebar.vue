<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    Award,
    BookOpen,
    Flower,
    FolderGit2,
    GraduationCap,
    LayoutGrid,
    MonitorSmartphone,
    Projector,
    ProjectorIcon,
} from 'lucide-vue-next';
import AppLogo from '@/components/AppLogo.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    awardsAdmin,
    dashboard,
    educationsAdmin,
    landingPage,
    projectsAdmin,
    skillsAdmin,
} from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Landing Page',
        href: landingPage().url,
        icon: MonitorSmartphone,
    },
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Projects',
        href: projectsAdmin().url,
        icon: ProjectorIcon,
    },
    {
        title: 'Skills',
        href: skillsAdmin().url,
        icon: Flower,
    },
    {
        title: 'Awards',
        href: awardsAdmin().url,
        icon: Award,
    },
    {
        title: 'Educations',
        href: educationsAdmin().url,
        icon: GraduationCap,
    },
];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
