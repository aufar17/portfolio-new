import {
    Activity,
    Award,
    BriefcaseBusiness,
    Flower,
    GraduationCap,
    LayoutGrid,
    MonitorSmartphone,
    ProjectorIcon,
    UsersRound,
} from 'lucide-vue-next';
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

export type NavGroup = {
    label: string;
    items: (NavItem & { description?: string })[];
};

/** Admin navigation, shared by the sidebar and the dashboard shortcuts. */
export const adminNavGroups: NavGroup[] = [
    {
        label: 'Landing Page',
        items: [
            {
                title: 'Landing Page',
                href: landingPage().url,
                icon: MonitorSmartphone,
                description: 'Open the public portfolio.',
            },
        ],
    },
    {
        label: 'Main Features',
        items: [
            { title: 'Dashboard', href: dashboard().url, icon: LayoutGrid },
            {
                title: 'Projects',
                href: projectsAdmin().url,
                icon: ProjectorIcon,
                description: 'Showcase work, tech stack and links.',
            },
            {
                title: 'Skills',
                href: skillsAdmin().url,
                icon: Flower,
                description: 'Hard and soft skills with icons.',
            },
            {
                title: 'Awards',
                href: awardsAdmin().url,
                icon: Award,
                description: 'Awards and certifications.',
            },
            {
                title: 'Educations',
                href: educationsAdmin().url,
                icon: GraduationCap,
                description: 'Education timeline.',
            },
            {
                title: 'Works',
                href: worksAdmin().url,
                icon: BriefcaseBusiness,
                description: 'Work experience timeline.',
            },
        ],
    },
    {
        label: 'Personal Features',
        items: [
            {
                title: 'Personal',
                href: personalAdmin().url,
                icon: UsersRound,
                description: 'Roles, bio and profile photo.',
            },
            {
                title: 'Social Media',
                href: socialAdmin().url,
                icon: Activity,
                description: 'Contact links.',
            },
        ],
    },
];
