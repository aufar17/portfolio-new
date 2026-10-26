import { SplitText } from './gsap';

/**
 * Runs `fn` inside `context` once web fonts have loaded, so SplitText line
 * breaks match the final Poppins layout. Skipped if the context is torn
 * down first; the returned cleanup marks it as such.
 */
export function whenFontsReady(context: gsap.Context, fn: () => void) {
    let cancelled = false;

    document.fonts.ready.then(() => {
        if (!cancelled) {
            context.add(fn);
        }
    });

    return () => {
        cancelled = true;
    };
}

/**
 * Splits text into words wrapped in masked lines. Reveals play once, so the
 * caller animates `split.words` and reverts the split when done; that keeps
 * the text reflowing naturally on resize afterwards.
 */
export const splitLines = (el: HTMLElement) =>
    SplitText.create(el, { type: 'words,lines', mask: 'lines' });
