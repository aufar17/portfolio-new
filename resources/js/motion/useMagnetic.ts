import type { Ref } from 'vue';
import { gsap } from './gsap';
import { useMotion } from './useMotion';

/**
 * Pulls the element toward the cursor while hovered (`strength` of the
 * offset from its centre) and lets it spring back on leave. Desktop mouse
 * only. Like `useTilt`, it owns the element's transform, so the element
 * must not use Tailwind `hover:translate-*`.
 */
export function useMagnetic(
    target: Readonly<Ref<HTMLElement | null>>,
    strength = 0.3,
) {
    useMotion(target, ({ desktop }) => {
        const el = target.value;

        if (!el || !desktop || !window.matchMedia('(pointer: fine)').matches) {
            return;
        }

        const toX = gsap.quickTo(el, 'x', { duration: 0.25 });
        const toY = gsap.quickTo(el, 'y', { duration: 0.25 });

        const onMove = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect();

            toX((event.clientX - (rect.left + rect.width / 2)) * strength);
            toY((event.clientY - (rect.top + rect.height / 2)) * strength);
        };

        const onLeave = () => {
            toX(0);
            toY(0);
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);

        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
        };
    });
}
