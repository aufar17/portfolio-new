import { gsap } from './gsap';
import type { TransitionKind } from './sectionTransitions';

/**
 * "New page" transitions between sections: a full-screen sheet closes over
 * the page and opens again on the next section. Each kind is a paused
 * timeline of length 1 meant to be scrubbed by scroll: it closes over
 * 0 → CLOSED_FROM, stays shut until OPEN_FROM, then opens.
 *
 * - peel: the sheet is laid from the bottom-right corner, then peeled off
 *   from the top-right one; the part past the fold lies folded back over the
 *   sheet (its back side), casting a shadow on it.
 * - blinds: diagonal slats close one after another and open the other way.
 * - iris: a circle grows from one corner; then a hole opens from the
 *   opposite corner until nothing is left.
 * - turn: the sheet slides up, then turns away on its left edge like a book
 *   page (slides away on phones).
 *
 * Only transforms and clip-paths; colours come from the elements' classes.
 */
export const CLOSED_FROM = 0.45;
export const OPEN_FROM = 0.55;
const PHASE = CLOSED_FROM;

export type TransitionParts = {
    /** Peel and iris: the clipped sheet. */
    sheet: HTMLElement;
    /** Peel: shadow of the folded part, inside the sheet (clipped by it). */
    shadow: HTMLElement;
    /** Peel: the folded-back part, showing the sheet's back. */
    flap: HTMLElement;
    /** Blinds: the slats. */
    slats: HTMLElement[];
    blinds: HTMLElement;
    /** Turn: the page (front and back faces) and its shading. */
    page: HTMLElement;
    shade: HTMLElement;
};

type Options = {
    mobile: boolean;
    /** Varies the corners per boundary. */
    index: number;
};

type Point = [number, number];

const size = () => [window.innerWidth, window.innerHeight] as const;

const polygon = (points: Point[]) =>
    points.length < 3
        ? 'polygon(0px 0px, 0px 0px, 0px 0px)'
        : `polygon(${points.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;

/** Signed distance of a point past the line at `s` along `dir` from `corner`. */
const depthFrom =
    (corner: Point, dir: Point, s: number) =>
    ([x, y]: Point) =>
        (x - corner[0]) * dir[0] + (y - corner[1]) * dir[1] - s;

/** Splits a convex polygon by the line `depth = 0` (near side: depth ≤ 0). */
function split(points: Point[], depth: (p: Point) => number) {
    const near: Point[] = [];
    const far: Point[] = [];

    points.forEach((a, i) => {
        const b = points[(i + 1) % points.length];
        const da = depth(a);
        const db = depth(b);

        (da <= 0 ? near : far).push(a);

        if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
            const t = da / (da - db);
            const cut: Point = [
                a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t,
            ];
            near.push(cut);
            far.push(cut);
        }
    });

    return { near, far };
}

/**
 * The sheet folded at `s` along `dir` (a unit vector into the screen) from
 * `corner`: the part still lying flat, and the strip of paper within
 * `curl` of the fold, turned back over it. Paper further out is lifted
 * off and not drawn, like a page curling away.
 */
function fold(
    w: number,
    h: number,
    corner: Point,
    dir: Point,
    s: number,
    curl: number,
) {
    const rect: Point[] = [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
    ];
    const depth = depthFrom(corner, dir, s);
    const { near, far } = split(rect, depth);
    const strip = split(far, depthFrom(corner, dir, s + curl)).near;
    const folded = strip.map<Point>((p) => {
        const d = depth(p);

        return [p[0] - 2 * d * dir[0], p[1] - 2 * d * dir[1]];
    });

    return { near, folded };
}

const unit = (x: number, y: number): Point => {
    const length = Math.hypot(x, y);

    return [x / length, y / length];
};

function peel(tl: gsap.core.Timeline, parts: TransitionParts, { mobile }: Options) {
    const at = { closing: 0, opening: 1 };
    const lift = mobile ? 0 : 18;

    const draw = () => {
        const [w, h] = size();
        const diagonal = Math.hypot(w, h);
        // Laid from the bottom-right corner, peeled off from the top-right.
        const closing = at.opening >= 1;
        const corner: Point = closing ? [w, h] : [0, h];
        const dir = closing ? unit(-w, -h) : unit(w, -h);
        const s = (closing ? at.closing : at.opening) * diagonal;
        // The folded strip widens as the fold travels, up to a fifth or so.
        const curl = Math.min(s * 0.6, diagonal * 0.18);
        const { near, folded } = fold(w, h, corner, dir, s, curl);
        // The shadow is the flap pushed a little further onto the sheet.
        const shadow = folded.map<Point>(([x, y]) => [
            x - dir[0] * lift,
            y - dir[1] * lift,
        ]);

        parts.sheet.style.clipPath = polygon(near);
        parts.flap.style.clipPath = polygon(folded);
        parts.shadow.style.clipPath = polygon(lift ? shadow : []);
    };

    tl.to(at, { closing: 1, duration: PHASE, onUpdate: draw }, 0).fromTo(
        at,
        { opening: 1 },
        { opening: 0, duration: PHASE, onUpdate: draw, immediateRender: false },
        OPEN_FROM,
    );
    draw();
}

function blinds(tl: gsap.core.Timeline, parts: TransitionParts) {
    const each = { duration: PHASE * 0.55, stagger: (PHASE * 0.45) / parts.slats.length };

    tl.fromTo(
        parts.slats,
        { scaleX: 0, transformOrigin: '0% 50%' },
        { scaleX: 1, ...each },
        0,
    )
        .set(parts.slats, { transformOrigin: '100% 50%' }, OPEN_FROM)
        .to(parts.slats, { scaleX: 0, ...each }, OPEN_FROM);
}

function iris(tl: gsap.core.Timeline, parts: TransitionParts, { index }: Options) {
    const radius = { grow: 0, hole: 0 };
    // Each boundary starts from another corner and opens from the opposite.
    const corners: Point[] = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
    ];
    const from = corners[index % 4];
    const to = corners[(index + 2) % 4];

    const draw = () => {
        const [w, h] = size();
        const diagonal = Math.hypot(w, h);

        if (radius.hole <= 0) {
            const r = radius.grow * diagonal;
            parts.sheet.style.clipPath = `circle(${r.toFixed(1)}px at ${from[0] * w}px ${from[1] * h}px)`;

            return;
        }

        const r = radius.hole * diagonal;
        const [x, y] = [to[0] * w, to[1] * h];
        parts.sheet.style.clipPath =
            `path(evenodd, 'M0 0H${w}V${h}H0Z` +
            `M${(x - r).toFixed(1)} ${y}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0` +
            `a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0Z')`;
    };

    tl.to(radius, { grow: 1, duration: PHASE, onUpdate: draw }, 0).fromTo(
        radius,
        { hole: 0 },
        { hole: 1, duration: PHASE, onUpdate: draw, immediateRender: false },
        OPEN_FROM,
    );
    draw();
}

function turn(tl: gsap.core.Timeline, parts: TransitionParts, { mobile }: Options) {
    tl.fromTo(parts.page, { yPercent: 100 }, { yPercent: 0, duration: PHASE }, 0);

    if (mobile) {
        tl.to(parts.page, { xPercent: -100, duration: PHASE }, OPEN_FROM);

        return;
    }

    gsap.set(parts.page, { transformOrigin: '0% 50%', transformPerspective: 1800 });
    tl.to(parts.page, { rotationY: -100, duration: PHASE }, OPEN_FROM).fromTo(
        parts.shade,
        { opacity: 0 },
        { opacity: 0.8, duration: PHASE },
        OPEN_FROM,
    );
}

const BUILDERS: Record<
    TransitionKind,
    (tl: gsap.core.Timeline, parts: TransitionParts, options: Options) => void
> = { peel, blinds, iris, turn };

/** Which parts each kind draws with; the others are hidden. */
const USES: Record<TransitionKind, (keyof TransitionParts)[]> = {
    peel: ['sheet', 'shadow', 'flap'],
    blinds: ['blinds'],
    iris: ['sheet'],
    turn: ['page'],
};

/** A paused timeline (length 1) for `kind`, to be scrubbed by scroll. */
export function buildPageTransition(
    kind: TransitionKind,
    parts: TransitionParts,
    options: Options,
) {
    const roots: (keyof TransitionParts)[] = [
        'sheet',
        'shadow',
        'flap',
        'blinds',
        'page',
    ];

    roots.forEach((part) =>
        gsap.set(parts[part], {
            // '' hands display back to the element's own classes (flex, block).
            display: USES[kind].includes(part) ? '' : 'none',
        }),
    );

    // Symmetric easing: the front-loaded `brand` curve would have the screen
    // shut for a third of the scroll range instead of a narrow middle.
    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
    });
    BUILDERS[kind](tl, parts, options);

    // Keep the shut stretch in the timeline even if a kind ends early.
    tl.set({}, {}, 1);

    return tl;
}
