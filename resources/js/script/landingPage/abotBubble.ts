import type { BotDialogPage } from './botDialog';

/**
 * When the mini Abot (MiniBot.vue) shows a chat bubble. Times are seconds
 * spent outside the hero with nothing else going on: the first bubble after
 * 8 s, then one every 35–45 s, each up for 6 s, at most 4 per browser
 * session. Closing one with its X ends them for the session.
 */
export const BUBBLE = {
    firstAfter: 8,
    every: [35, 45] as const,
    showFor: 6,
    perSession: 4,
};

export type BubbleState = {
    /** Bubbles shown so far this session. */
    shown: number;
    /** The visitor closed one: no more this session. */
    dismissed: boolean;
};

// Versioned: a stored state from an older schedule starts over.
const STORAGE_KEY = 'portfolio:abot-bubble:v1';

let memory: BubbleState = { shown: 0, dismissed: false };

const isState = (value: unknown): value is BubbleState =>
    !!value &&
    typeof (value as BubbleState).shown === 'number' &&
    typeof (value as BubbleState).dismissed === 'boolean';

/** This session's state (kept in memory when storage is unavailable). */
export function loadBubbleState(): BubbleState {
    try {
        const stored = JSON.parse(
            sessionStorage.getItem(STORAGE_KEY) ?? 'null',
        );

        if (isState(stored)) {
            memory = stored;
        }
    } catch {
        // Private mode or corrupt: keep the in-memory state.
    }

    return { ...memory };
}

export function saveBubbleState(state: BubbleState) {
    memory = { ...state };

    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Kept for the life of the page only.
    }
}

/** Whether another bubble may still come this session. */
export const bubblesLeft = (state: BubbleState) =>
    !state.dismissed && state.shown < BUBBLE.perSession;

/** Seconds (outside the hero, undisturbed) before the next bubble. */
export const bubbleDelay = (shown: number, random = Math.random) =>
    shown === 0
        ? BUBBLE.firstAfter
        : BUBBLE.every[0] + random() * (BUBBLE.every[1] - BUBBLE.every[0]);

/**
 * Lines the bubble takes turns with: the dialog's own pages, minus the one
 * pointing at the projects (that direction only holds in the hero).
 */
export const bubbleLines = (pages: BotDialogPage[]) =>
    pages.filter((page) => page.gesture !== 'point').map((page) => page.text);
