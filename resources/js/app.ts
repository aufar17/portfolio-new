import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import { ZiggyVue } from 'ziggy-js';
import '../css/app.css';
import '../css/splashscreen.css';
import { initializeTheme } from '@/composables/useAppearance';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';

const appName =
    import.meta.env.VITE_APP_NAME || 'Muammar Aufar Prasetya | Portfolio';

createInertiaApp({
    title: (title) => 'Muammar Aufar Prasetya | Portfolio',
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
                preset: Aura,
                options: {
                    darkModeSelector: '.dark',
                },
            },
        });

        app.mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
