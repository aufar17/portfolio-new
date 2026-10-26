/**
 * Theme colours for canvas drawing. Canvas can't use CSS variables, so the
 * tokens are resolved at runtime: a hidden probe gets `color: var(--token)`
 * and the computed colour (always a plain `rgb()`/`oklab()` string, even when
 * the token is a `color-mix()`) is handed to the canvas. Nothing here is a
 * colour literal; the palette stays in app.css.
 */
export type PaintToken =
    'primary' | 'primary-strong' | 'brand-red' | 'card' | 'border';

export type PaintColors = Record<PaintToken, string>;

const TOKENS: PaintToken[] = [
    'primary',
    'primary-strong',
    'brand-red',
    'card',
    'border',
];

export function readPaintColors(): PaintColors {
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);

    const colors = {} as PaintColors;

    for (const token of TOKENS) {
        probe.style.color = `var(--${token})`;
        colors[token] = getComputedStyle(probe).color;
    }

    probe.remove();

    return colors;
}

/**
 * Calls `onChange` when the theme flips: the `.dark` class on <html> (set by
 * useAppearance) or the system scheme. Other class changes on <html>, such
 * as Lenis toggling its scroll state, are ignored.
 */
export function onThemeChange(onChange: () => void) {
    const root = document.documentElement;
    let dark = root.classList.contains('dark');

    const check = () => {
        const now = root.classList.contains('dark');

        if (now !== dark) {
            dark = now;
            onChange();
        }
    };

    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', onChange);

    return () => {
        observer.disconnect();
        scheme.removeEventListener('change', onChange);
    };
}
