import type { Ref } from 'vue';
import { onBeforeUnmount, onMounted } from 'vue';
import type { MotionConditions } from './gsap';
import { gsap, MOTION_QUERIES } from './gsap';

type Setup = (
    conditions: MotionConditions,
    context: gsap.Context,
) => void | (() => void);

/**
 * Runs `setup` inside a `gsap.matchMedia()` scoped to `scope` once the
 * component is mounted, and reverts everything it created on unmount.
 * Inertia swaps pages without a reload, so every component animation must
 * go through here to be cleaned up.
 *
 * `setup` re-runs whenever a media condition flips (resize across the
 * breakpoint, reduced-motion toggled); GSAP reverts the previous run first.
 */
export function useMotion(
    scope: Readonly<Ref<HTMLElement | null>>,
    setup: Setup,
) {
    let mm: gsap.MatchMedia | undefined;

    onMounted(() => {
        if (!scope.value) {
            return;
        }

        mm = gsap.matchMedia(scope.value);
        mm.add(MOTION_QUERIES, (context) =>
            setup(context.conditions as MotionConditions, context),
        );
    });

    onBeforeUnmount(() => {
        mm?.revert();
        mm = undefined;
    });
}
