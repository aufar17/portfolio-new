/**
 * Joins the splash and the hero into one continuous timeline.
 *
 * The splash (layout) and the hero (page) mount independently and the hero
 * only builds its timeline once fonts are ready, so either side can arrive
 * first. The hero timeline is nested into the splash timeline at its
 * `reveal` label (or wherever the playhead is), so there is no gap between
 * the splash closing and the hero coming in. Without a splash the hero
 * simply plays on its own.
 */
let splashExpected = false;
let splashTimeline: gsap.core.Timeline | null = null;
let pendingHero: gsap.core.Timeline | null = null;

/** Called synchronously from the splash's setup when it is going to play. */
export function expectSplash() {
    splashExpected = true;
}

function attachHero() {
    const splash = splashTimeline;
    const hero = pendingHero;

    if (!hero) {
        return;
    }

    pendingHero = null;

    if (!splash || splash.progress() === 1) {
        hero.play();

        return;
    }

    const reveal = splash.labels.reveal ?? splash.duration();
    splash.add(hero.paused(false), Math.max(reveal, splash.time()));
}

export function registerSplash(timeline: gsap.core.Timeline) {
    splashTimeline = timeline;

    if (pendingHero) {
        attachHero();
    }
}

/** The splash has fully finished (or was skipped). */
export function endSplash() {
    splashExpected = false;
    splashTimeline = null;

    if (pendingHero) {
        attachHero();
    }
}

/** Hands over a paused hero timeline; it plays right after the splash. */
export function playHeroIntro(timeline: gsap.core.Timeline) {
    pendingHero = timeline.pause();

    if (!splashExpected || splashTimeline) {
        attachHero();
    }
}

/** The hero unmounted before its timeline was attached. */
export function discardHeroIntro(timeline: gsap.core.Timeline) {
    if (pendingHero === timeline) {
        pendingHero = null;
    }
}
