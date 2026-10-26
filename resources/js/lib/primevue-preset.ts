import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Aura preset re-tinted to the app's primary (`--primary: hsl(217, 65%, 43%)`,
 * shade 600 below) and the blue-tinted neutrals used in app.css.
 */
export const PortfolioPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: 'hsl(217 70% 97%)',
            100: 'hsl(217 70% 93%)',
            200: 'hsl(217 68% 85%)',
            300: 'hsl(217 66% 74%)',
            400: 'hsl(217 65% 62%)',
            500: 'hsl(217 65% 51%)',
            600: 'hsl(217 65% 43%)',
            700: 'hsl(217 66% 36%)',
            800: 'hsl(217 66% 29%)',
            900: 'hsl(217 64% 23%)',
            950: 'hsl(217 64% 15%)',
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: 'hsl(220 20% 97%)',
                    100: 'hsl(220 14% 94%)',
                    200: 'hsl(220 13% 89%)',
                    300: 'hsl(218 12% 80%)',
                    400: 'hsl(218 10% 64%)',
                    500: 'hsl(220 9% 46%)',
                    600: 'hsl(220 12% 34%)',
                    700: 'hsl(222 18% 25%)',
                    800: 'hsl(222 28% 17%)',
                    900: 'hsl(222 47% 11%)',
                    950: 'hsl(222 47% 7%)',
                },
                primary: {
                    color: '{primary.600}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.700}',
                    activeColor: '{primary.800}',
                },
                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.100}',
                    color: '{primary.700}',
                    focusColor: '{primary.800}',
                },
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: 'hsl(210 20% 96%)',
                    100: 'hsl(215 16% 88%)',
                    200: 'hsl(216 13% 76%)',
                    300: 'hsl(218 11% 62%)',
                    400: 'hsl(218 11% 48%)',
                    500: 'hsl(220 13% 34%)',
                    600: 'hsl(222 16% 24%)',
                    700: 'hsl(222 16% 19%)',
                    800: 'hsl(222 18% 14%)',
                    900: 'hsl(222 22% 9%)',
                    950: 'hsl(222 25% 6%)',
                },
                primary: {
                    color: '{primary.600}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.500}',
                    activeColor: '{primary.400}',
                },
                highlight: {
                    background:
                        'color-mix(in srgb, {primary.400}, transparent 84%)',
                    focusBackground:
                        'color-mix(in srgb, {primary.400}, transparent 76%)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)',
                },
            },
        },
    },
});
