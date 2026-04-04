<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import {
    Activity,
    Award,
    BookOpen,
    BriefcaseBusiness,
    Flower,
    FolderGit2,
    GraduationCap,
    LayoutGrid,
    MonitorSmartphone,
    Projector,
    ProjectorIcon,
    UsersRound,
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
    personalAdmin,
    projectsAdmin,
    skillsAdmin,
    socialAdmin,
    worksAdmin,
} from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Landing Page',
        href: landingPage().url,
        icon: MonitorSmartphone,
        group: 'landing',
    },
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
        group: 'main',
    },
    {
        title: 'Projects',
        href: projectsAdmin().url,
        icon: ProjectorIcon,
        group: 'main',
    },
    {
        title: 'Skills',
        href: skillsAdmin().url,
        icon: Flower,
        group: 'main',
    },
    {
        title: 'Awards',
        href: awardsAdmin().url,
        icon: Award,
        group: 'main',
    },
    {
        title: 'Educations',
        href: educationsAdmin().url,
        icon: GraduationCap,
        group: 'main',
    },
    {
        title: 'Works',
        href: worksAdmin().url,
        icon: BriefcaseBusiness,
        group: 'main',
    },
    {
        title: 'Personal',
        href: personalAdmin().url,
        icon: UsersRound,
        group: 'personal',
    },
    {
        title: 'Social Media',
        href: socialAdmin().url,
        icon: Activity,
        group: 'personal',
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
