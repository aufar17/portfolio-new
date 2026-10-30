/**
 * Corner peel for the showcase stack (motion/useShowcase.ts): the front card
 * is lifted at its bottom-left corner and folded back, and the fold sweeps
 * diagonally to the top-right corner until the card comes off and the next
 * one shows. Played backwards, the previous card folds back down.
 *
 * Plain 2D: a copy of the card clipped to what is still lying flat, and the
 * folded part drawn as the back of the paper, mirrored across the fold. Only
 * a strip of it next to the fold is drawn (the rest has lifted off), which
 * reads as the paper curling. A crease along the fold and a shadow the flap
 * casts on the card add depth.
 *
 * Built once per stack; `load()` copies a card into it before each peel.
 * Per frame only `clip-path` changes. Colours are flat theme-token mixes:
 * gradients here cost a long GPU raster on the first peel.
 */
export type PageFlip = {
    /** Copies `card` into the page and lays it over the card, flat. */
    load: (card: HTMLElement) => void;
    /** 0: flat on the stack; 1: peeled off completely. */
    turn: (progress: number) => void;
    hide: () => void;
    destroy: () => void;
};

type Point = [number, number];

const div = (className: string, parent: HTMLElement) => {
    const el = document.createElement('div');
    el.className = className;
    parent.append(el);

    return el;
};

/** Keeps the part of a convex polygon where the linear `side(p)` ≥ 0. */
function cut(points: Point[], side: (p: Point) => number): Point[] {
    const out: Point[] = [];

    points.forEach((a, i) => {
        const b = points[(i + 1) % points.length];
        const sa = side(a);
        const sb = side(b);

        if (sa >= 0) {
            out.push(a);
        }

        if (sa >= 0 !== sb >= 0) {
            const t = sa / (sa - sb);
            out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
    });

    return out;
}

const polygon = (points: Point[], offset = 0) =>
    points.length < 3
        ? 'polygon(0px 0px, 0px 0px, 0px 0px)'
        : `polygon(${points
              .map(
                  ([x, y]) =>
                      `${(x + offset).toFixed(1)}px ${(y + offset).toFixed(1)}px`,
              )
              .join(', ')})`;

/** Strip of the folded part that is drawn, as a share of the diagonal. */
const CURL = 0.22;

export function createPageFlip(
    stack: HTMLElement,
    { shading }: { shading: boolean },
): PageFlip {
    // Above every card; inert copies never take focus or clicks.
    const root = div('pointer-events-none absolute invisible', stack);
    root.setAttribute('aria-hidden', 'true');
    root.inert = true;
    // Out of the layout when idle: the padded flap layers would otherwise
    // widen the page (phones then zoom out).
    root.hidden = true;
    root.style.zIndex = '50';

    // What still lies flat, and the shadow the flap casts on it.
    const page = div('absolute inset-0', root);
    // Its own layer: the copy is drawn once, only the clip changes per frame.
    const content = div('absolute inset-0 will-change-transform', page);
    const shadow = div(
        'absolute inset-0 bg-[color-mix(in_oklab,var(--foreground)_22%,transparent)]',
        page,
    );
    // The folded part (the back of the paper) and its crease. Mirrored, the
    // curl reaches past the card by at most its own width, hence the padding
    // (kept that small: these layers repaint as their clip changes).
    const flap = div(
        'absolute bg-[color-mix(in_oklab,var(--card)_90%,var(--foreground))]',
        root,
    );
    const crease = div(
        'absolute bg-[color-mix(in_oklab,var(--foreground)_16%,transparent)]',
        root,
    );

    shadow.hidden = !shading;
    crease.hidden = !shading;

    let width = 0;
    let height = 0;
    let pad = 0;

    const load = (card: HTMLElement) => {
        width = card.offsetWidth;
        height = card.offsetHeight;
        pad = Math.hypot(width, height) * (CURL + 0.03);

        Object.assign(root.style, {
            left: `${card.offsetLeft}px`,
            top: `${card.offsetTop}px`,
            width: `${width}px`,
            height: `${height}px`,
        });

        [flap, crease].forEach((el) =>
            Object.assign(el.style, {
                left: `${-pad}px`,
                top: `${-pad}px`,
                width: `${width + pad * 2}px`,
                height: `${height + pad * 2}px`,
            }),
        );

        const source = card.firstElementChild as HTMLElement | null;
        const copy = source?.cloneNode(true) as HTMLElement | undefined;

        content.replaceChildren(...(copy ? [copy] : []));
        copy?.querySelectorAll('img').forEach((img) => {
            img.loading = 'eager';
            img.decoding = 'sync';
        });
        // The front card is never dimmed.
        copy?.querySelectorAll<HTMLElement>(
            '[data-dim], [data-fold-shadow]',
        ).forEach((el) => {
            el.style.opacity = '0';
        });

        turn(0);
        root.hidden = false;
        root.style.visibility = 'visible';
    };

    const turn = (progress: number) => {
        const diagonal = Math.hypot(width, height);
        // Unit vector from the bottom-left corner towards the top-right one.
        const dx = width / diagonal;
        const dy = -height / diagonal;
        // How far along it a point lies, measured from the bottom-left.
        const along = ([x, y]: Point) => x * dx + (y - height) * dy;
        const fold = progress * diagonal;
        // The curl grows as the corner lifts and shrinks to nothing as the
        // fold reaches the far corner.
        const curl = Math.min(fold, diagonal - fold, CURL * diagonal);
        // Reflects a point across the fold; `reach` > 1 pushes it a little
        // further out (the flap's shadow, peeking past its edges).
        const mirror =
            (reach = 1) =>
            ([x, y]: Point): Point => {
                const k = 2 * reach * (fold - along([x, y]));

                return [x + k * dx, y + k * dy];
            };
        const rect: Point[] = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height],
        ];

        const flat = cut(rect, (p) => along(p) - fold);
        const lifted = cut(rect, (p) => fold - along(p));
        const curled = cut(lifted, (p) => along(p) - (fold - curl));
        const nearFold = cut(curled, (p) => along(p) - (fold - curl * 0.3));

        page.style.clipPath = polygon(flat);
        // Inside the page, so only the part on the flat card shows.
        shadow.style.clipPath = polygon(curled.map(mirror(1.12)));
        flap.style.clipPath = polygon(curled.map(mirror()), pad);
        crease.style.clipPath = polygon(nearFold.map(mirror()), pad);
    };

    const hide = () => {
        root.style.visibility = 'hidden';
        root.hidden = true;
        content.replaceChildren();
    };

    return { load, turn, hide, destroy: () => root.remove() };
}
