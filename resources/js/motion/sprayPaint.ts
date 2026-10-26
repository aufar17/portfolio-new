import type { PaintColors, PaintToken } from './paintColors';
import { readPaintColors } from './paintColors';

/**
 * Spray-paint wipe drawn on a full-viewport <canvas>, driven by a progress
 * value (0 → 1) instead of time so it can be scrubbed both ways:
 *
 * - 0 → COVER_END: a nozzle sweeps the screen in rows, leaving soft dots,
 *   overspray speckles and (optionally) drips.
 * - COVER_END → SOLID_AT: the coats build up to a solid layer.
 * - SOLID_AT → CLEAR_AT: an "eraser" spray (destination-out) eats the paint
 *   from the centre outwards, while the canvas fades from FADE_FROM, so it
 *   is empty and invisible at CLEAR_AT.
 *
 * Particles come from a seeded PRNG, so a given progress always gives the
 * same picture. Moving forward only draws the particles crossed since the
 * last frame; moving back clears and redraws (from the solid layer when past
 * it). Soft dots are stamped from a small pre-rendered sprite per colour.
 * Colours are theme tokens resolved at runtime (paintColors.ts); alpha goes
 * through `globalAlpha`, never a colour literal.
 */
const COVER_END = 0.5;
const SOLID_AT = 0.55;
const FADE_FROM = 0.88;
const CLEAR_AT = 0.97;

type Kind = 'dot' | 'speck' | 'erase' | 'fill' | 'clear';

/** The paint colours (the other tokens are for surfaces). */
type SprayToken = Extract<
    PaintToken,
    'primary' | 'primary-strong' | 'brand-red'
>;

type Particle = {
    t: number;
    kind: Kind;
    x: number;
    y: number;
    r: number;
    alpha: number;
    color: SprayToken;
};

export type SprayOptions = {
    /** Particle count multiplier (1 desktop, lower on phones). */
    density: number;
    drips: boolean;
    dpr: number;
    seed?: number;
};

/** Small fast seeded PRNG (mulberry32). */
export function random(seed: number) {
    let a = seed >>> 0;

    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Standard normal sample (Box-Muller). */
export const gaussian = (rand: () => number) =>
    Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());

const SPRITE_SIZE = 64;

/** A soft round dot: stacked translucent circles, dense centre, faint rim. */
export function sprite(color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;

    const ctx = canvas.getContext('2d')!;
    const rings = 16;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.09;

    for (let i = 0; i < rings; i++) {
        ctx.beginPath();
        ctx.arc(
            SPRITE_SIZE / 2,
            SPRITE_SIZE / 2,
            (SPRITE_SIZE / 2) * (1 - i / rings),
            0,
            Math.PI * 2,
        );
        ctx.fill();
    }

    return canvas;
}

function generate(
    w: number,
    h: number,
    { density, drips, seed = 7 }: SprayOptions,
): Particle[] {
    const rand = random(seed);
    const particles: Particle[] = [];
    const rows = Math.max(3, Math.ceil(h / 160));
    const spacing = h / rows;
    const rowWindow = COVER_END / rows;

    for (let row = 0; row < rows; row++) {
        const direction = row % 2 === 0 ? 1 : -1;
        const yCentre = spacing * (row + 0.5);
        const start = row * rowWindow * 0.85;
        const duration = rowWindow * 1.3;
        const phase = rand() * Math.PI * 2;
        // Where the nozzle is at sweep position u.
        const nozzleX = (u: number) =>
            direction > 0 ? -0.05 * w + u * 1.1 * w : 1.05 * w - u * 1.1 * w;
        const nozzleY = (u: number) =>
            yCentre + Math.sin(u * Math.PI * 2 + phase) * spacing * 0.15;

        const dots = Math.round(((w * spacing) / 500) * density);

        for (let i = 0; i < dots; i++) {
            const u = rand();
            particles.push({
                t: start + u * duration + rand() * 0.01,
                kind: 'dot',
                x: nozzleX(u) + gaussian(rand) * 16,
                y: nozzleY(u) + gaussian(rand) * spacing * 0.42,
                r: 12 + rand() * 18,
                alpha: 0.45 + rand() * 0.45,
                color: rand() < 0.25 ? 'primary-strong' : 'primary',
            });
        }

        // Overspray: fine speckles further out, a few in brand red.
        for (let i = 0; i < dots * 1.2; i++) {
            const u = rand();
            particles.push({
                t: start + u * duration + rand() * 0.01,
                kind: 'speck',
                x: nozzleX(u) + gaussian(rand) * 30,
                y: nozzleY(u) + gaussian(rand) * spacing * 0.9,
                r: 0.8 + rand() * 2.2,
                alpha: 0.5 + rand() * 0.4,
                color: rand() < 0.12 ? 'brand-red' : 'primary',
            });
        }

        if (!drips) {
            continue;
        }

        // Drips: a dense run of specks growing down once the nozzle passed.
        for (let d = 0; d < 3; d++) {
            const u = 0.1 + rand() * 0.8;
            const x = nozzleX(u);
            const y = nozzleY(u) + spacing * 0.3;
            const length = 30 + rand() * 80;
            const width = 2 + rand() * 2.5;
            const t0 = start + u * duration;
            const steps = Math.ceil(length / 2);

            for (let j = 0; j <= steps; j++) {
                particles.push({
                    t: t0 + (j / steps) * 0.12,
                    kind: 'speck',
                    x,
                    y: y + (j / steps) * length,
                    r: j === steps ? width * 1.6 : width,
                    alpha: 1,
                    color: 'primary',
                });
            }
        }
    }

    // The coats build up into one solid layer.
    const solid = { x: 0, y: 0, r: 0, color: 'primary' as const };
    particles.push({ ...solid, t: 0.51, kind: 'fill', alpha: 0.25 });
    particles.push({ ...solid, t: 0.525, kind: 'fill', alpha: 0.4 });
    particles.push({ ...solid, t: 0.54, kind: 'fill', alpha: 0.6 });
    particles.push({ ...solid, t: SOLID_AT, kind: 'fill', alpha: 1 });

    // Eraser spray, from the centre outwards. Spread evenly over the area
    // (sqrt for the radius) and timed by distance, so the cleared disc grows
    // at a steady pace. Erasing is the reveal, not texture, so phones keep
    // the same count (its dots are big and few).
    const reach = Math.hypot(w, h) / 2 + 40;
    const erasers = Math.round((w * h) / 700);
    const span = FADE_FROM - SOLID_AT;

    for (let i = 0; i < erasers; i++) {
        const k = Math.sqrt(rand());
        const radius = k * reach;
        const angle = rand() * Math.PI * 2;
        particles.push({
            t: Math.max(
                SOLID_AT + 0.001,
                SOLID_AT + 0.001 + gaussian(rand) * 0.015 + k * span,
            ),
            kind: 'erase',
            x: w / 2 + Math.cos(angle) * radius,
            y: h / 2 + Math.sin(angle) * radius,
            r: 40 + rand() * 40,
            alpha: 0.8 + rand() * 0.2,
            color: 'primary',
        });
    }

    particles.push({ ...solid, t: CLEAR_AT, kind: 'clear', alpha: 1 });

    return particles.sort((a, b) => a.t - b.t);
}

export function createSpray(canvas: HTMLCanvasElement, options: SprayOptions) {
    const ctx = canvas.getContext('2d')!;
    let colors = readPaintColors();
    let sprites = {} as Record<SprayToken, HTMLCanvasElement>;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let solidIndex = 0;
    // Index of the next particle to draw, and the progress drawn so far.
    let cursor = 0;
    let drawn = 0;

    const setColors = (next: PaintColors) => {
        colors = next;
        sprites = {
            primary: sprite(colors.primary),
            'primary-strong': sprite(colors['primary-strong']),
            'brand-red': sprite(colors['brand-red']),
        };
    };

    const draw = (p: Particle) => {
        if (p.kind === 'clear') {
            ctx.clearRect(0, 0, width, height);

            return;
        }

        ctx.globalCompositeOperation =
            p.kind === 'erase' ? 'destination-out' : 'source-over';
        ctx.globalAlpha = p.alpha;

        if (p.kind === 'dot' || p.kind === 'erase') {
            ctx.drawImage(
                sprites[p.color],
                p.x - p.r,
                p.y - p.r,
                p.r * 2,
                p.r * 2,
            );

            return;
        }

        ctx.fillStyle = colors[p.color];

        if (p.kind === 'fill') {
            ctx.fillRect(0, 0, width, height);

            return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    };

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * options.dpr);
        canvas.height = Math.round(height * options.dpr);
        ctx.setTransform(options.dpr, 0, 0, options.dpr, 0, 0);
        particles = generate(width, height, options);
        solidIndex = particles.findIndex(
            (p) => p.kind === 'fill' && p.t === SOLID_AT,
        );
        cursor = 0;
        drawn = 0;
    };

    /** Draws the state at `progress`; `redraw` forces a full repaint. */
    const render = (progress: number, redraw = false) => {
        if (redraw || progress < drawn) {
            ctx.clearRect(0, 0, width, height);
            // Past the solid layer, nothing before it is visible any more.
            cursor = progress >= SOLID_AT ? solidIndex : 0;
        }

        while (cursor < particles.length && particles[cursor].t <= progress) {
            draw(particles[cursor]);
            cursor++;
        }

        drawn = progress;
        canvas.style.opacity = String(
            Math.min(
                1,
                Math.max(0, (CLEAR_AT - progress) / (CLEAR_AT - FADE_FROM)),
            ),
        );
    };

    setColors(colors);
    resize();

    return { render, resize, setColors };
}

/**
 * A static horizontal spray stroke filling `canvas` (the reduced-motion
 * divider). Drawn once; call again after a resize or theme change.
 */
export function drawSprayBand(canvas: HTMLCanvasElement, seed = 11) {
    const { ctx, w, h } = fitCanvas(canvas);
    const colors = readPaintColors();
    const soft = sprite(colors.primary);
    const rand = random(seed);

    for (let i = 0; i < w / 2; i++) {
        const r = 5 + rand() * 9;
        ctx.globalAlpha = 0.3 + rand() * 0.4;
        ctx.drawImage(
            soft,
            rand() * w - r,
            h / 2 + gaussian(rand) * h * 0.1 - r,
            r * 2,
            r * 2,
        );
    }

    for (let i = 0; i < w / 2; i++) {
        ctx.globalAlpha = 0.4 + rand() * 0.4;
        ctx.fillStyle = colors[rand() < 0.1 ? 'brand-red' : 'primary'];
        ctx.beginPath();
        ctx.arc(
            rand() * w,
            h / 2 + gaussian(rand) * h * 0.3,
            0.8 + rand() * 1.4,
            0,
            Math.PI * 2,
        );
        ctx.fill();
    }
}

/** Sizes a canvas to its CSS box at a capped device pixel ratio. */
function fitCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    return { ctx, w, h };
}

/**
 * A paint-roller stripe filling `canvas`: a solid band with ragged top and
 * bottom edges, faint lengthwise streaks and a few dry skips. Static; it is
 * revealed by animating the canvas, and redrawn after resize / theme change.
 */
export function drawRollerStripe(canvas: HTMLCanvasElement, seed = 23) {
    const { ctx, w, h } = fitCanvas(canvas);
    const colors = readPaintColors();
    const rand = random(seed);
    const top = h * 0.18;
    const bottom = h * 0.82;

    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = 0.92;
    ctx.fillRect(0, top, w, bottom - top);

    // Ragged edges: paint squeezed out past the roller's rim.
    for (const edge of [top, bottom]) {
        for (let x = 0; x < w; x += 2) {
            ctx.globalAlpha = 0.6 + rand() * 0.35;
            ctx.beginPath();
            ctx.arc(
                x + rand() * 2,
                edge + gaussian(rand) * 2.5,
                1 + rand() * 2.5,
                0,
                Math.PI * 2,
            );
            ctx.fill();
        }
    }

    // Lengthwise streaks from the roller's nap.
    ctx.fillStyle = colors['primary-strong'];

    for (let i = 0; i < 14; i++) {
        ctx.globalAlpha = 0.12 + rand() * 0.18;
        ctx.fillRect(
            rand() * w * 0.3,
            top + rand() * (bottom - top),
            w * (0.4 + rand() * 0.6),
            1,
        );
    }

    // Dry skips where the roller ran out.
    ctx.globalCompositeOperation = 'destination-out';

    for (let i = 0; i < w / 40; i++) {
        ctx.globalAlpha = 0.25 + rand() * 0.35;
        ctx.beginPath();
        ctx.ellipse(
            rand() * w,
            top + rand() * (bottom - top),
            4 + rand() * 14,
            1 + rand() * 2,
            0,
            0,
            Math.PI * 2,
        );
        ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
}

/**
 * A paint splat landing on the bottom edge of `canvas`: a soft blob and
 * droplets thrown up and out, some in brand red. Static; redraw after
 * resize / theme change.
 */
export function drawSplash(canvas: HTMLCanvasElement, seed = 31) {
    const { ctx, w, h } = fitCanvas(canvas);
    const colors = readPaintColors();
    const rand = random(seed);
    const soft = sprite(colors.primary);
    const cx = w / 2;
    const cy = h - 4;

    for (let i = 0; i < 14; i++) {
        const r = 10 + rand() * 18;
        ctx.globalAlpha = 0.7 + rand() * 0.3;
        ctx.drawImage(
            soft,
            cx + gaussian(rand) * 22 - r,
            cy + Math.abs(gaussian(rand)) * -6 - r,
            r * 2,
            r * 2,
        );
    }

    for (let i = 0; i < 46; i++) {
        // Upper half only: the splat is thrown up off the edge.
        const angle = Math.PI + rand() * Math.PI;
        const distance = 24 + Math.pow(rand(), 0.7) * (h - 12);
        const x = cx + Math.cos(angle) * distance * (w / h) * 0.5;
        const y = cy + Math.sin(angle) * distance;
        const r = Math.max(0.8, 5 - (distance / h) * 4) * (0.6 + rand() * 0.6);

        ctx.globalAlpha = 0.55 + rand() * 0.45;
        ctx.fillStyle = colors[rand() < 0.35 ? 'brand-red' : 'primary'];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}
