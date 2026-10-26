/**
 * Geometry of Abot's "A" (HeroBot.vue), shared by everything that draws the
 * letter. Coordinates are in the robot's viewBox (`0 -12 220 240`).
 *
 * Every corner is rounded with a real circular arc. Like the logo, the A has
 * no crossbar of its own: the silhouette is one outline (apex, both feet and
 * the gap between the legs), and the left "circuit" leg and the right solid
 * leg are the same outline clipped either side of the seam that runs from the
 * apex down into the gap.
 */
type Corner = readonly [x: number, y: number, radius?: number];

/** Outer corners (apex, feet). */
export const A_RADIUS = 8;
/** Inner corners (top of the gap between the legs). */
export const A_RADIUS_INNER = 6;

const round = (value: number) => +value.toFixed(2);

/**
 * Closed polygon path with every corner rounded by an arc of `radius` (or the
 * corner's own radius). Works for convex and reflex corners alike; a radius
 * too large for the neighbouring edges shrinks so each arc keeps to at most
 * half of an edge.
 */
export function roundedPath(corners: readonly Corner[], radius = 0): string {
    const n = corners.length;
    let d = '';

    corners.forEach(([x, y, own], i) => {
        const [ax, ay] = corners[(i - 1 + n) % n];
        const [bx, by] = corners[(i + 1) % n];
        const lenA = Math.hypot(ax - x, ay - y);
        const lenB = Math.hypot(bx - x, by - y);
        const ux = (ax - x) / lenA;
        const uy = (ay - y) / lenA;
        const vx = (bx - x) / lenB;
        const vy = (by - y) / lenB;
        const half = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy))) / 2;
        const command = i === 0 ? 'M' : 'L';
        let r = own ?? radius;

        if (r <= 0 || half <= 0) {
            d += `${command}${round(x)} ${round(y)} `;

            return;
        }

        let t = r / Math.tan(half);
        const maxT = Math.min(lenA, lenB) / 2;

        if (t > maxT) {
            t = maxT;
            r = t * Math.tan(half);
        }

        // Turning clockwise on screen (y down) → positive sweep.
        const sweep = (x - ax) * (by - y) - (y - ay) * (bx - x) > 0 ? 1 : 0;

        d +=
            `${command}${round(x + ux * t)} ${round(y + uy * t)} ` +
            `A${round(r)} ${round(r)} 0 0 ${sweep} ${round(x + vx * t)} ${round(y + vy * t)} `;
    });

    return `${d}Z`;
}

/** The whole letter: apex, right foot, gap between the legs, left foot. */
export const A_SILHOUETTE = roundedPath([
    [110, 16, A_RADIUS],
    [204, 204, A_RADIUS],
    [181, 204, A_RADIUS],
    [110, 62, A_RADIUS_INNER],
    [39, 204, A_RADIUS],
    [16, 204, A_RADIUS],
]);

// Where the rounded top of the gap meets the right leg's inner edge
// (tip 110,62 towards the inner foot 181,204; the gap is 2·atan(½) wide).
const GAP_TANGENT = (() => {
    const length = Math.hypot(181 - 110, 204 - 62);
    const t = A_RADIUS_INNER / 0.5;

    return [
        round(110 + ((181 - 110) / length) * t),
        round(62 + ((204 - 62) / length) * t),
    ] as const;
})();

/**
 * Halves of the viewBox either side of the seam between the legs: along the
 * leg joint (98,40 → 110,62), on along the right leg's inner edge past the
 * rounded top of the gap (which belongs to the left leg), then straight down
 * through the gap. The right (solid) leg keeps the apex, as in the logo.
 */
const SEAM = `L98 40 L110 62 L${GAP_TANGENT[0]} ${GAP_TANGENT[1]} L${GAP_TANGENT[0]} 250`;
export const A_SPLIT_LEFT = `M-40 -70 L38 -70 ${SEAM} L-40 250 Z`;
export const A_SPLIT_RIGHT = `M260 -70 L38 -70 ${SEAM} L260 250 Z`;

/** The visor filling the gap under the apex. */
export const A_VISOR = roundedPath(
    [
        [110, 67],
        [72, 145],
        [148, 145],
    ],
    A_RADIUS,
);

/** Hexagon knee joint on the left leg, from the logo. */
export const A_KNEE = roundedPath(
    [
        [37, 182],
        [43.1, 185.5],
        [43.1, 192.5],
        [37, 196],
        [30.9, 192.5],
        [30.9, 185.5],
    ],
    2,
);

/** Shoulder panel (the robot's crossbar) as a capsule. */
export const A_CROSSBAR = { x: 22, y: 148, width: 176, height: 26 } as const;
