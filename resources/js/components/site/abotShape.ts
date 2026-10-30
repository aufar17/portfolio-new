/**
 * Geometry of Abot (AbotFigure.vue): a chubby toy robot whose outline still
 * reads as the capital "A" of the logo. The apex is a round dome (the head),
 * the counter of the A is the short arch between the legs, and the crossbar
 * is a belt. Coordinates are in the robot's viewBox (`A_VIEWBOX`).
 *
 * Like the logo, the left side is a circuit panel and the right side a solid
 * slab: both are the same outline clipped either side of a seam that runs
 * from the dome down into the arch.
 */
type Corner = readonly [x: number, y: number, radius?: number];

export const A_VIEWBOX = '0 -6 240 222';

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

/**
 * The whole body: a half-circle dome (centre 120,100, r 66) flaring into a
 * thick skirt, with a short arch between the two stubby legs.
 */
export const A_SILHOUETTE =
    'M54 100 A66 66 0 0 1 186 100 ' +
    'C186 138 214 160 222 180 Q226 190 214 190 L140 190 Q133 190 132 183 ' +
    'C131 172 127 164 120 164 C113 164 109 172 108 183 Q107 190 100 190 ' +
    'L26 190 Q14 190 18 180 C26 160 54 138 54 100 Z';

/** Top of the arch between the legs. */
const ARCH_TOP = [120, 164] as const;

/**
 * Halves of the viewBox either side of the seam: a slanted line from left of
 * the dome's top down to the top of the arch, then straight down through it.
 * The right (solid) side keeps the top of the dome, as the logo's slab keeps
 * the apex.
 */
const SEAM = `L93 -20 L${ARCH_TOP[0]} ${ARCH_TOP[1]} L${ARCH_TOP[0]} 240`;
export const A_SPLIT_LEFT = `M-20 -20 ${SEAM} L-20 240 Z`;
export const A_SPLIT_RIGHT = `M260 -20 ${SEAM} L260 240 Z`;

/** Sheen along the solid side: round the dome, then down the skirt. */
export const A_SHEEN =
    'M149 50 A58 58 0 0 1 178 100 C179 130 196 150 206 162';

/** Capsule visor across the dome (ski goggles); `rx` is half the height. */
export const A_VISOR = { x: 68, y: 72, width: 104, height: 40 } as const;

/** Belt (the crossbar of the A) as a capsule. */
export const A_CROSSBAR = { x: 38, y: 118, width: 164, height: 22 } as const;

/** Oval feet sticking out either side under the skirt. */
export const A_FEET = [
    { cx: 50, cy: 194, rx: 42, ry: 10 },
    { cx: 190, cy: 194, rx: 42, ry: 10 },
] as const;

/** Hexagon knee joint on the left (circuit) side, from the logo. */
export const A_KNEE = roundedPath(
    [
        [44, 162],
        [50.1, 165.5],
        [50.1, 172.5],
        [44, 176],
        [37.9, 172.5],
        [37.9, 165.5],
    ],
    2,
);

// Pivots in viewBox units (`svgOrigin`), so rotations stay put whatever the
// rendered size.
export const SHOULDER_LEFT = '40 129';
export const SHOULDER_RIGHT = '200 129';
export const FEET = '120 200';
export const ANTENNA_BASE = '120 34';
