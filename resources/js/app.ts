import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import { ZiggyVue } from 'ziggy-js';
import '../css/app.css';
import { initializeTheme } from '@/composables/useAppearance';
import { PortfolioPreset } from '@/lib/primevue-preset';
import 'primeicons/primeicons.css';

const appName = 'Muammar Aufar Prasetya';

createInertiaApp({
    title: (title) =>
        title ? `${title} · ${appName}` : `${appName} | Portfolio`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob<DefineComponent>('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) });

        app.use(plugin);

        app.use(ZiggyVue);

        app.use(PrimeVue, {
            theme: {
                preset: PortfolioPreset,
                options: {
                    darkModeSelector: '.dark',
                    cssLayer: {
                        name: 'primevue',
                        order: 'theme, base, primevue, components, utilities',
                    },
                },
            },
        });
        app.use(ToastService);
        app.use(ConfirmationService);
        app.directive('tooltip', Tooltip);

        app.mount(el);
    },
    progress: {
        color: 'hsl(217, 65%, 43%)',
        showSpinner: false,
    },
});

initializeTheme();
