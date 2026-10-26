import { fitCanvas, random } from './canvas';
import type { PaintColors } from './paintColors';
import { readPaintColors } from './paintColors';

/**
 * Paint poured over the screen, drawn on a full-viewport <canvas> from a
 * progress value (0 → 1) rather than time, so it scrubs both ways and a given
 * progress always gives the same picture:
 *
 * - 0 → FILL_END: paint runs down from the top. The front falls faster and
 *   faster (gravity), ripples with layered waves that drift as it flows, and
 *   is led by a few narrow drips that race ahead before the bulk catches up.
 * - FILL_END → DRAIN_FROM: the screen is covered.
 * - DRAIN_FROM → 1: the paint drains off the bottom. Its top edge falls, again
 *   accelerating, leaving strands that cling higher up and slide off last.
 *
 * The paint is one filled shape (no particles, no filters). A darker band
 * along the edge (`--primary-strong`) and a faint sheen line
 * (`--primary-foreground`) inside it give it some body. Colours are theme
 * tokens resolved at runtime (paintColors.ts); alpha goes through
 * `globalAlpha`, never a colour literal.
 */
const FILL_END = 0.5;
const DRAIN_FROM = 0.56;

/** Overhang past the viewport edges, in px. */
const BLEED = 24;

type Wave = { amp: number; k: number; phase: number; flow: number };

/** A narrow lobe on the edge: a drip ahead of the front, a strand behind. */
type Lobe = {
    x: number;
    width: number;
    length: number;
    /** Progress window (within its phase) over which it grows. */
    from: number;
    span: number;
};

export type PourOptions = {
    /** Fewer drips, coarser edge and no sheen on phones. */
    mobile: boolean;
    dpr: number;
    seed?: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Falling under gravity: slow to start, ever faster. */
const fall = (t: number) => Math.pow(t, 1.7);

function makeWaves(rand: () => number, width: number, amps: number[]) {
    const lengths = [0.9, 0.42, 0.18];

    return amps.map<Wave>((amp, i) => ({
        amp,
        k: (Math.PI * 2) / (width * lengths[i] * (0.85 + rand() * 0.3)),
        phase: rand() * Math.PI * 2,
        flow: (rand() < 0.5 ? -1 : 1) * (3 + i * 2.5),
    }));
}

function makeLobes(
    rand: () => number,
    count: number,
    width: number,
    size: { width: [number, number]; length: [number, number] },
    timing: { from: number; span: [number, number] },
) {
    return Array.from({ length: count }, (_, j) => ({
        // Spread across the width with jitter, so they never bunch up.
        x: ((j + 0.5 + (rand() - 0.5) * 0.7) / count) * width,
        width: lerp(size.width[0], size.width[1], rand()),
        length: lerp(size.length[0], size.length[1], rand()),
        from: rand() * timing.from,
        span: lerp(timing.span[0], timing.span[1], rand()),
    }));
}

const waveAt = (waves: Wave[], x: number, t: number) =>
    waves.reduce(
        (sum, w) => sum + w.amp * Math.sin(w.k * x + w.phase + w.flow * t),
        0,
    );

/**
 * Height of all lobes at `x`. A super-Gaussian profile: steep sides and a
 * broad round tip, so long drips read as runs of paint rather than spikes.
 */
const lobesAt = (lobes: Lobe[], x: number, grown: (lobe: Lobe) => number) =>
    lobes.reduce((sum, lobe) => {
        const d = Math.abs(x - lobe.x) / lobe.width;

        return d > 2.5 ? sum : sum + grown(lobe) * Math.exp(-Math.pow(d, 4));
    }, 0);

/** Curve through the points (midpoint quadratics), appended to `path`. */
function trace(path: Path2D, points: [number, number][]) {
    for (let i = 1; i < points.length - 1; i++) {
        const [x, y] = points[i];
        const [nx, ny] = points[i + 1];
        path.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
    }

    const [lx, ly] = points[points.length - 1];
    path.lineTo(lx, ly);
}

type Look = { band: number; sheen: boolean };

/**
 * Fills the paint on one side of an edge (`cap` is the far side's y) and
 * shades it: a darker band and a sheen line just inside the edge.
 */
function drawPaint(
    ctx: CanvasRenderingContext2D,
    colors: PaintColors,
    points: [number, number][],
    cap: number,
    look: Look,
) {
    const first = points[0];
    const last = points[points.length - 1];

    const fill = new Path2D();
    fill.moveTo(first[0], cap);
    fill.lineTo(first[0], first[1]);
    trace(fill, points);
    fill.lineTo(last[0], cap);
    fill.closePath();

    const edge = new Path2D();
    edge.moveTo(first[0], first[1]);
    trace(edge, points);

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.primary;
    ctx.fill(fill);

    ctx.save();
    ctx.clip(fill);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = colors['primary-strong'];
    ctx.lineWidth = look.band;
    ctx.stroke(edge);

    if (look.sheen) {
        // Into the paint: up from a front below it, down from a top edge.
        ctx.translate(0, cap < first[1] ? -look.band * 0.7 : look.band * 0.7);
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = colors['primary-foreground'];
        ctx.lineWidth = 2;
        ctx.stroke(edge);
    }

    ctx.restore();
}

export function createPour(
    canvas: HTMLCanvasElement,
    { mobile, dpr, seed = 3 }: PourOptions,
) {
    const ctx = canvas.getContext('2d')!;
    const step = mobile ? 14 : 8;
    const look: Look = { band: mobile ? 10 : 16, sheen: !mobile };
    let colors = readPaintColors();
    let width = 0;
    let height = 0;
    let waves: Wave[] = [];
    let drips: Lobe[] = [];
    let strands: Lobe[] = [];
    /** How far the waves reach either side of the front. */
    let reach = 0;
    let longestStrand = 0;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const rand = random(seed);
        waves = makeWaves(rand, width, mobile ? [14, 7, 3] : [22, 11, 5]);
        reach = waves.reduce((sum, w) => sum + w.amp, 0);
        drips = makeLobes(
            rand,
            mobile ? 4 : 7,
            width,
            {
                width: mobile ? [12, 22] : [16, 32],
                length: [height * 0.06, height * 0.2],
            },
            { from: 0.3, span: [0.35, 0.6] },
        );
        strands = makeLobes(
            rand,
            mobile ? 3 : 5,
            width,
            {
                width: mobile ? [10, 18] : [14, 26],
                length: [height * 0.1, height * 0.28],
            },
            { from: 0.15, span: [0.3, 0.5] },
        );
        longestStrand = Math.max(0, ...strands.map((s) => s.length));
    };

    const edge = (y: (x: number) => number) => {
        const points: [number, number][] = [];

        for (let x = -BLEED; x < width + BLEED + step; x += step) {
            points.push([x, y(x)]);
        }

        return points;
    };

    /** Draws the state at `progress`. */
    const render = (progress: number) => {
        ctx.clearRect(0, 0, width, height);

        if (progress <= 0 || progress >= 1) {
            return;
        }

        if (progress < FILL_END) {
            const q = progress / FILL_END;
            // Fully off the top at 0, waves clear of the bottom at 1.
            const front = lerp(-reach, height + reach + BLEED, fall(q));
            const points = edge(
                (x) =>
                    front +
                    waveAt(waves, x, progress) +
                    lobesAt(
                        drips,
                        x,
                        (d) =>
                            d.length *
                            Math.pow(clamp01((q - d.from) / d.span), 1.6),
                    ),
            );

            drawPaint(ctx, colors, points, -BLEED, look);

            return;
        }

        if (progress < DRAIN_FROM) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = colors.primary;
            ctx.fillRect(0, 0, width, height);

            return;
        }

        const r = (progress - DRAIN_FROM) / (1 - DRAIN_FROM);
        // The strands hang above the top edge, so it falls that much further.
        const top = lerp(
            -reach,
            height + reach + longestStrand + BLEED,
            fall(r),
        );
        const points = edge(
            (x) =>
                top +
                waveAt(waves, x, progress) -
                lobesAt(
                    strands,
                    x,
                    (s) => s.length * clamp01((r - s.from) / s.span),
                ),
        );

        drawPaint(ctx, colors, points, height + BLEED, look);
    };

    const setColors = (next: PaintColors) => {
        colors = next;
    };

    resize();

    return { render, resize, setColors };
}

/**
 * A static pour edge filling `canvas` (the reduced-motion divider): paint
 * along the top with a wavy front and a few short drips. Drawn once; call
 * again after a resize or theme change.
 */
export function drawPourBand(canvas: HTMLCanvasElement, seed = 9) {
    const { ctx, w, h } = fitCanvas(canvas);
    const rand = random(seed);
    const waves = makeWaves(rand, w, [5, 3, 1.5]);
    const drips = makeLobes(
        rand,
        Math.max(3, Math.round(w / 260)),
        w,
        { width: [8, 16], length: [h * 0.25, h * 0.5] },
        { from: 0, span: [1, 1] },
    );
    const points: [number, number][] = [];

    for (let x = -BLEED; x < w + BLEED + 6; x += 6) {
        points.push([
            x,
            h * 0.3 + waveAt(waves, x, 0) + lobesAt(drips, x, (d) => d.length),
        ]);
    }

    drawPaint(ctx, readPaintColors(), points, -BLEED, {
        band: 10,
        sheen: true,
    });
}
