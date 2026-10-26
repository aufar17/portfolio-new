import type { PaintColors } from './paintColors';
import { readPaintColors } from './paintColors';
import { gaussian, random, sprite } from './sprayPaint';

/**
 * Spray through a stencil of the logo's "A". Paint is laid down on an
 * offscreen layer by progress (0 → 1, scrubbable both ways like
 * sprayPaint.ts) and composited twice every frame:
 *
 * - `wall`: only the paint inside the A (what stays once the stencil goes),
 * - `plate`: the stencil card with the A cut out, carrying the overspray
 *   that landed on it. Lift the plate's element away to reveal the letter.
 *
 * The A is the robot's frame (HeroBot.vue): both legs plus a crossbar
 * between them, counter left open, in a 220 × 240 box.
 */
const A_SHAPES = [
    'M98 40 L110 62 L39 204 L16 204 Z',
    'M98 40 L100 36 Q110 16 120 36 L204 204 L181 204 L110 62 Z',
    'M60 148 H160 V172 H60 Z',
];
const A_BOX = { x: 0, y: 12, w: 220, h: 216 };

type Dot = { t: number; x: number; y: number; r: number; alpha: number };

function generate(size: number, density: number, seed = 5): Dot[] {
    const rand = random(seed);
    const dots: Dot[] = [];
    const rows = 4;

    for (let row = 0; row < rows; row++) {
        const direction = row % 2 === 0 ? 1 : -1;
        const y = size * ((row + 0.5) / rows);
        const start = (row / rows) * 0.85;
        const duration = 0.32;
        const count = Math.round(((size * size) / 180) * density);

        for (let i = 0; i < count; i++) {
            const u = rand();
            const x = direction > 0 ? u * size : size - u * size;
            dots.push({
                t: Math.min(1, start + u * duration),
                x: x + gaussian(rand) * 8,
                y: y + gaussian(rand) * (size / rows) * 0.45,
                r: size * (0.025 + rand() * 0.04),
                alpha: 0.5 + rand() * 0.4,
            });
        }
    }

    return dots.sort((a, b) => a.t - b.t);
}

export function createStencil(
    wall: HTMLCanvasElement,
    plate: HTMLCanvasElement,
    { density = 1 }: { density?: number } = {},
) {
    const paint = document.createElement('canvas');
    const contexts = [wall, plate, paint].map((c) => c.getContext('2d')!);
    const [wallCtx, plateCtx, paintCtx] = contexts;
    const shapes = A_SHAPES.map((d) => new Path2D(d));

    let colors = readPaintColors();
    let soft = sprite(colors.primary);
    let size = 0;
    let dots: Dot[] = [];
    let cursor = 0;
    let drawn = 0;

    /** Draws the A, scaled to 80% of the square, centred. */
    const fillA = (ctx: CanvasRenderingContext2D) => {
        const scale = (size * 0.8) / Math.max(A_BOX.w, A_BOX.h);
        ctx.save();
        ctx.translate(
            (size - A_BOX.w * scale) / 2 - A_BOX.x * scale,
            (size - A_BOX.h * scale) / 2 - A_BOX.y * scale,
        );
        ctx.scale(scale, scale);
        shapes.forEach((shape) => ctx.fill(shape));
        ctx.restore();
    };

    const composite = () => {
        // Wall: the paint, kept only inside the letter.
        wallCtx.clearRect(0, 0, size, size);
        wallCtx.globalCompositeOperation = 'source-over';
        wallCtx.fillStyle = colors.primary;
        fillA(wallCtx);
        wallCtx.globalCompositeOperation = 'source-in';
        wallCtx.drawImage(paint, 0, 0, size, size);
        wallCtx.globalCompositeOperation = 'source-over';

        // Plate: card with the letter cut out, overspray on top of it.
        const inset = 1;
        plateCtx.clearRect(0, 0, size, size);
        plateCtx.globalCompositeOperation = 'source-over';
        plateCtx.fillStyle = colors.card;
        plateCtx.strokeStyle = colors.border;
        plateCtx.lineWidth = 2;
        plateCtx.beginPath();
        plateCtx.roundRect(
            inset,
            inset,
            size - inset * 2,
            size - inset * 2,
            20,
        );
        plateCtx.fill();
        plateCtx.stroke();
        plateCtx.globalCompositeOperation = 'destination-out';
        fillA(plateCtx);
        plateCtx.globalCompositeOperation = 'source-atop';
        plateCtx.drawImage(paint, 0, 0, size, size);
        plateCtx.globalCompositeOperation = 'source-over';
    };

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        size = wall.clientWidth;

        for (const [i, canvas] of [wall, plate, paint].entries()) {
            canvas.width = Math.round(size * dpr);
            canvas.height = Math.round(size * dpr);
            contexts[i].setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        dots = generate(size, density);
        cursor = 0;
        drawn = 0;
    };

    /** Paint up to `progress`; `redraw` repaints from scratch. */
    const render = (progress: number, redraw = false) => {
        if (redraw || progress < drawn) {
            paintCtx.clearRect(0, 0, size, size);
            cursor = 0;
        }

        while (cursor < dots.length && dots[cursor].t <= progress) {
            const dot = dots[cursor++];
            paintCtx.globalAlpha = dot.alpha;
            paintCtx.drawImage(
                soft,
                dot.x - dot.r,
                dot.y - dot.r,
                dot.r * 2,
                dot.r * 2,
            );
        }

        paintCtx.globalAlpha = 1;
        drawn = progress;
        composite();
    };

    const setColors = (next: PaintColors) => {
        colors = next;
        soft = sprite(colors.primary);
    };

    resize();

    return { render, resize, setColors };
}
