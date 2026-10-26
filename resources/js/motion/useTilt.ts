import type { Ref } from 'vue';
import { gsap } from './gsap';
import { useMotion } from './useMotion';

const finePointer = () => window.matchMedia('(pointer: fine)').matches;

/**
 * 3D tilt toward the cursor (max `max` degrees) with a small lift, plus an
 * optional `[data-tilt-glare]` child that follows the cursor. Desktop mouse
 * only.
 *
 * GSAP writes `translate: none` on elements it transforms, so a Tailwind
 * `hover:translate-*` on the target only applies where tilt is off (touch,
 * small screens, reduced motion); the lift here takes over on desktop.
 */
export function useTilt(target: Readonly<Ref<HTMLElement | null>>, max = 4) {
    useMotion(target, ({ desktop }) => {
        const el = target.value;

        if (!el || !desktop || !finePointer()) {
            return;
        }

        const glare = el.querySelector<HTMLElement>('[data-tilt-glare]');
        const tween = { duration: 0.4 };
        const rotateX = gsap.quickTo(el, 'rotationX', tween);
        const rotateY = gsap.quickTo(el, 'rotationY', tween);
        const lift = gsap.quickTo(el, 'y', { duration: 0.25 });
        const glareX = glare && gsap.quickTo(glare, 'x', { duration: 0.3 });
        const glareY = glare && gsap.quickTo(glare, 'y', { duration: 0.3 });

        // Perspective grows with width so wide cards don't swing their near edge out.
        gsap.set(el, {
            transformPerspective: Math.max(900, el.offsetWidth * 2.5),
        });

        const onMove = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;

            rotateY((px - 0.5) * 2 * max);
            rotateX((0.5 - py) * 2 * max);

            if (glare && glareX && glareY) {
                glareX(event.clientX - rect.left - glare.offsetWidth / 2);
                glareY(event.clientY - rect.top - glare.offsetHeight / 2);
            }
        };

        const onEnter = () => {
            lift(-4);

            if (glare) {
                gsap.to(glare, { opacity: 1, duration: 0.2 });
            }
        };

        const onLeave = () => {
            rotateX(0);
            rotateY(0);
            lift(0);

            if (glare) {
                gsap.to(glare, { opacity: 0, duration: 0.25 });
            }
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerenter', onEnter);
        el.addEventListener('pointerleave', onLeave);

        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerenter', onEnter);
            el.removeEventListener('pointerleave', onLeave);
        };
    });
}
