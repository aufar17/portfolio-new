import {
    ANTENNA_BASE,
    FEET,
    SHOULDER_RIGHT,
} from '@/components/site/abotShape';
import { gsap, prefersReducedMotion } from './gsap';

/**
 * Abot's moves, shared by the hero robot (HeroBot.vue) and the mini one
 * (MiniBot.vue). Each takes the parts exposed by AbotFigure.vue; pivots are
 * in viewBox units, so they hold at any size.
 */
export type AbotParts = {
    body: SVGGElement | null;
    visor: SVGGElement | null;
    eyes: SVGGElement | null;
    eyeLeft: SVGRectElement | null;
    eyeRight: SVGRectElement | null;
    armLeft: SVGGElement | null;
    armRight: SVGGElement | null;
    antenna: SVGGElement | null;
    halo: SVGCircleElement | null;
    shadow: SVGEllipseElement | null;
};

export const wave = ({ armRight }: AbotParts) =>
    gsap
        .timeline()
        .to(armRight, {
            rotation: -110,
            svgOrigin: SHOULDER_RIGHT,
            duration: 0.35,
        })
        .to(armRight, {
            rotation: -80,
            duration: 0.18,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut',
        })
        .to(armRight, { rotation: 0, duration: 0.45 });

export const hop = ({ body, shadow }: AbotParts) =>
    gsap
        .timeline()
        .to(body, { y: -18, duration: 0.25 })
        .to(body, { y: 0, duration: 0.5 })
        .to(shadow, { scaleX: 0.7, svgOrigin: FEET, duration: 0.25 }, 0)
        .to(shadow, { scaleX: 1, duration: 0.5 }, 0.25);

export const nod = ({ visor }: AbotParts) =>
    gsap.timeline().to(visor, {
        y: 4,
        duration: 0.16,
        repeat: 3,
        yoyo: true,
        ease: 'sine.inOut',
    });

/** Reaction to being clicked many times in a row. */
export const dizzy = ({ body, eyes }: AbotParts) =>
    gsap
        .timeline()
        .fromTo(
            body,
            { rotation: -6, svgOrigin: FEET },
            {
                rotation: 6,
                duration: 0.09,
                repeat: 5,
                yoyo: true,
                ease: 'sine.inOut',
            },
        )
        .to(body, { rotation: 0, duration: 0.2 })
        .to(
            eyes,
            {
                rotation: 360,
                transformOrigin: '50% 50%',
                duration: 0.8,
                ease: 'none',
            },
            0,
        )
        .set(eyes, { rotation: 0 });

/**
 * Plays one gesture at a time: a new one first snaps the previous one to its
 * (resting) end. Does nothing under reduced motion.
 */
export function gesturePlayer() {
    let current: gsap.core.Timeline | undefined;

    return {
        play: (make: () => gsap.core.Timeline) => {
            if (prefersReducedMotion()) {
                return;
            }

            current?.progress(1).kill();
            current = make();
        },
        kill: () => current?.kill(),
    };
}

/** The visor pulses while Abot is "talking" (text being typed). */
export function speaker(parts: () => AbotParts) {
    let talk: gsap.core.Tween | undefined;

    return {
        speak: (on: boolean) => {
            talk?.kill();
            talk = undefined;

            if (prefersReducedMotion()) {
                return;
            }

            const { visor } = parts();
            talk = on
                ? gsap.to(visor, {
                      scale: 1.05,
                      transformOrigin: '50% 60%',
                      duration: 0.12,
                      yoyo: true,
                      repeat: -1,
                      ease: 'sine.inOut',
                  })
                : gsap.to(visor, { scale: 1, duration: 0.15 });
        },
        kill: () => talk?.kill(),
    };
}

/**
 * Standing still: breathing, a swaying antenna, the halo's pulse and random
 * blinks. Call inside a motion context (useMotion); returns what stops the
 * blinking, which isn't a tween the context reverts.
 */
export function idle({ body, antenna, halo, eyeLeft, eyeRight }: AbotParts) {
    const loop = { duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 };

    gsap.to(body, { scaleY: 1.015, svgOrigin: FEET, ...loop });
    gsap.to(antenna, {
        rotation: 4,
        svgOrigin: ANTENNA_BASE,
        ...loop,
        duration: 1.8,
    });
    gsap.fromTo(
        halo,
        { scale: 1, opacity: 0.5 },
        {
            scale: 2.2,
            opacity: 0,
            transformOrigin: '50% 50%',
            duration: 1.6,
            repeat: -1,
        },
    );

    let blinkCall: gsap.core.Tween;
    const blink = () => {
        gsap.to([eyeLeft, eyeRight], {
            scaleY: 0.1,
            transformOrigin: '50% 50%',
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: 'none',
        });
        blinkCall = gsap.delayedCall(gsap.utils.random(2.5, 5.5), blink);
    };
    blinkCall = gsap.delayedCall(2, blink);

    return () => blinkCall.kill();
}
