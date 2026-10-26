/**
 * Which "new page" transition each section boundary plays. Picked at random
 * once per browser session (sessionStorage), so scrolling back and forth or
 * navigating between pages always shows the same one at a given boundary.
 * Neighbouring boundaries never get the same kind.
 *
 * Boundaries, in page order: About → Projects, Projects → Skills,
 * Skills → Achievements, Achievements → Footer.
 */
export const TRANSITION_KINDS = ['peel', 'blinds', 'iris', 'turn'] as const;

export type TransitionKind = (typeof TRANSITION_KINDS)[number];

export const BOUNDARY_COUNT = 4;

// Versioned: a stored draw from an older list of kinds is drawn again.
const STORAGE_KEY = 'portfolio:section-transitions:v1';

let drawn: TransitionKind[] | undefined;

const isKind = (value: unknown): value is TransitionKind =>
    TRANSITION_KINDS.includes(value as TransitionKind);

const isValid = (list: unknown): list is TransitionKind[] =>
    Array.isArray(list) &&
    list.length === BOUNDARY_COUNT &&
    list.every(isKind) &&
    list.every((kind, i) => i === 0 || kind !== list[i - 1]);

function draw() {
    const kinds: TransitionKind[] = [];

    for (let i = 0; i < BOUNDARY_COUNT; i++) {
        const options = TRANSITION_KINDS.filter((k) => k !== kinds[i - 1]);
        kinds.push(options[Math.floor(Math.random() * options.length)]);
    }

    return kinds;
}

function load() {
    let stored: unknown;

    try {
        stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
        // Storage unavailable (private mode) or corrupt: draw in memory.
    }

    const kinds = isValid(stored) ? stored : draw();

    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(kinds));
    } catch {
        // Kept for the life of the page only.
    }

    return kinds;
}

/** The transition for boundary `index` (0-based, page order). Client only. */
export function sectionTransition(index: number): TransitionKind {
    drawn ??= load();

    return drawn[index % BOUNDARY_COUNT];
}
