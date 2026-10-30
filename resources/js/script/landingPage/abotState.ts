import type { InjectionKey } from 'vue';

/**
 * What the landing page shares with its Abots: whether the contact modal or
 * the hero robot's dialog is open (the mini Abot keeps quiet meanwhile), and
 * whether Abot has flown from the hero to the corner (the hero robot hides).
 * Provided by LandingPage.vue; nothing at module level, so it is safe for
 * server rendering.
 */
export type AbotState = {
    contactOpen: boolean;
    heroDialogOpen: boolean;
    heroAway: boolean;
};

export const ABOT_STATE: InjectionKey<AbotState> = Symbol('abot-state');
