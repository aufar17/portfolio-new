<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { gsap, prefersReducedMotion } from '@/motion/gsap';
import { abotVoice, unlockVoice } from '@/script/landingPage/abotVoice';
import type { BotDialogPage, BotGesture } from '@/script/landingPage/botDialog';

/**
 * Abot's chat bubble: a non-modal dialog that talks on its own. Each line is
 * typed out, stays up long enough to read, then "…" shows Abot typing the
 * next one; after the last line the bubble closes itself. Clicking Abot
 * hurries it along (finishes the line, or skips to the next). Pointer or
 * focus on the bubble holds it; × and Esc close it.
 *
 * Screen readers get each line in full at once: a persistent live region
 * announces it and the bubble is described by an untyped copy; the typing
 * and the dots are hidden from them. Reduced motion shows each line whole.
 *
 * Abot speaks in synthesised blips while typing (abotVoice.ts), with chirps
 * on opening and closing; sound starts with the visitor's own click.
 *
 * `placement`: `hero` sits above the hero robot from lg and below it on
 * smaller screens; `corner` sits above the mini Abot, right-aligned. The
 * tail points at Abot either way.
 */
const props = withDefaults(
    defineProps<{
        id: string;
        pages: BotDialogPage[];
        placement?: 'hero' | 'corner';
    }>(),
    { placement: 'hero' },
);

const emit = defineEmits<{
    page: [gesture: BotGesture];
    speaking: [on: boolean];
    closed: [hadFocus: boolean];
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const CHARS_PER_SECOND = 40;
/** "…" before the next line, s. */
const DOTS_SECONDS = 0.8;
/** The last line stays this long before the bubble closes, s. */
const LAST_LINE_SECONDS = 5;

/** Long enough to read a line: about 2–5.5 s. */
const readingTime = (line: string) =>
    gsap.utils.clamp(2, 5.5, 1.4 + line.length * 0.045);

const index = ref(0);
const interruption = ref<string | null>(null);
/** typing → reading → dots → (next line) typing … */
const phase = ref<'typing' | 'reading' | 'dots'>('typing');

const panel = ref<HTMLElement | null>(null);
const typed = ref<HTMLElement | null>(null);

const titleId = `${props.id}-title`;
const textId = `${props.id}-text`;

const text = computed(
    () => interruption.value ?? props.pages[index.value]?.text ?? '',
);
const isLast = computed(
    () => !interruption.value && index.value === props.pages.length - 1,
);

let typeTween: gsap.core.Tween | undefined;
let stepCall: gsap.core.Tween | undefined;
let pointerInside = false;
let focusInside = false;

const held = () => pointerInside || focusInside;

const setSpeaking = (on: boolean) => {
    emit('speaking', on);
};

/** What comes after a line has been read. */
const scheduleNext = () => {
    stepCall?.kill();

    if (phase.value !== 'reading' || held()) {
        return;
    }

    if (interruption.value) {
        // Back to the line it was on.
        stepCall = gsap.delayedCall(readingTime(text.value), () => {
            interruption.value = null;
            type();
        });
    } else if (isLast.value) {
        stepCall = gsap.delayedCall(
            Math.max(LAST_LINE_SECONDS, readingTime(text.value)),
            close,
        );
    } else {
        stepCall = gsap.delayedCall(readingTime(text.value), nextLine);
    }
};

const finishTyping = () => {
    typeTween?.kill();
    typeTween = undefined;

    if (typed.value) {
        typed.value.textContent = text.value;
    }

    setSpeaking(false);
    phase.value = 'reading';
    scheduleNext();
};

const type = async () => {
    typeTween?.kill();
    stepCall?.kill();
    phase.value = 'typing';
    // The bubble (or the text, after the dots) mounts on the next tick.
    await nextTick();

    const el = typed.value;
    const full = text.value;

    if (!el || !isOpen.value) {
        return;
    }

    if (prefersReducedMotion()) {
        finishTyping();

        return;
    }

    el.textContent = '';
    setSpeaking(true);

    const state = { chars: 0 };
    // A blip every two or three letters, not every one: speech, not noise.
    let nextBlip = 1;
    typeTween = gsap.to(state, {
        chars: full.length,
        duration: full.length / CHARS_PER_SECOND,
        ease: 'none',
        onUpdate: () => {
            const chars = Math.round(state.chars);
            el.textContent = full.slice(0, chars);

            if (chars >= nextBlip) {
                if (full[chars - 1]?.trim()) {
                    abotVoice.blip();
                }

                nextBlip = chars + 2 + Math.round(Math.random());
            }
        },
        onComplete: () => {
            if (full.trim().endsWith('?')) {
                abotVoice.blip(true);
            }

            finishTyping();
        },
    });
};

const startLine = () => {
    const page = props.pages[index.value];

    if (page) {
        emit('page', page.gesture);
    }

    type();
};

/** "…" for a moment, then the next line (straight away under reduced motion). */
const nextLine = () => {
    stepCall?.kill();

    if (prefersReducedMotion()) {
        index.value++;
        startLine();

        return;
    }

    phase.value = 'dots';
    stepCall = gsap.delayedCall(DOTS_SECONDS, () => {
        index.value++;
        startLine();
    });
};

const close = () => {
    if (!isOpen.value) {
        return;
    }

    typeTween?.kill();
    stepCall?.kill();
    setSpeaking(false);
    abotVoice.close();

    const hadFocus = !!panel.value?.contains(document.activeElement);
    pointerInside = false;
    focusInside = false;
    isOpen.value = false;
    emit('closed', hadFocus);
};

/**
 * Opens on the first line; afterwards hurries along: finishes the line being
 * typed, skips the wait (or the dots) to the next line, or closes after the
 * last.
 */
const advance = () => {
    if (!isOpen.value) {
        // Opened by the visitor's click or key: sound may start now.
        unlockVoice();
        abotVoice.open();
        isOpen.value = true;
        index.value = 0;
        interruption.value = null;
        startLine();
    } else if (phase.value === 'typing') {
        finishTyping();
    } else if (interruption.value) {
        interruption.value = null;
        type();
    } else if (phase.value === 'dots') {
        stepCall?.kill();
        index.value++;
        startLine();
    } else if (index.value < props.pages.length - 1) {
        index.value++;
        startLine();
    } else {
        close();
    }
};

/** Says a one-off line, then goes back to the line it was on. */
const interrupt = (message: string) => {
    abotVoice.dizzy();
    isOpen.value = true;
    interruption.value = message;
    type();
};

defineExpose({ advance, interrupt, close });

const onPointerEnter = () => {
    pointerInside = true;
    stepCall?.kill();
};
const onPointerLeave = () => {
    pointerInside = false;
    scheduleNext();
};
const onFocusIn = () => {
    focusInside = true;
    stepCall?.kill();
};
const onFocusOut = (event: FocusEvent) => {
    if (!panel.value?.contains(event.relatedTarget as Node | null)) {
        focusInside = false;
        scheduleNext();
    }
};

const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        close();
    }
};

watch(isOpen, (open) => {
    if (open) {
        document.addEventListener('keydown', onKeydown);
    } else {
        document.removeEventListener('keydown', onKeydown);
    }
});

// The bubble eases to its new size when a line or the dots replace another.
watch(
    [phase, text],
    async () => {
        const el = panel.value;

        if (!el || prefersReducedMotion()) {
            return;
        }

        const from = el.offsetHeight;
        await nextTick();
        const to = el.offsetHeight;

        if (from && from !== to) {
            gsap.fromTo(
                el,
                { height: from },
                { height: to, duration: 0.25, clearProps: 'height' },
            );
        }
    },
    { flush: 'pre' },
);

onBeforeUnmount(() => {
    typeTween?.kill();
    stepCall?.kill();
    document.removeEventListener('keydown', onKeydown);
});

const onEnter = (el: Element, done: () => void) => {
    if (prefersReducedMotion()) {
        done();

        return;
    }

    gsap.fromTo(
        el,
        { opacity: 0, y: props.placement === 'corner' ? 10 : 8, scale: 0.92 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            clearProps: 'opacity,transform',
            onComplete: done,
        },
    );
};

const onLeave = (el: Element, done: () => void) => {
    if (prefersReducedMotion()) {
        done();

        return;
    }

    gsap.to(el, {
        opacity: 0,
        y: 6,
        scale: 0.95,
        duration: 0.2,
        onComplete: done,
    });
};
</script>

<template>
    <div>
        <!-- Always mounted so the first line is announced as well -->
        <p class="sr-only" aria-live="polite">{{ isOpen ? text : '' }}</p>

        <Transition :css="false" @enter="onEnter" @leave="onLeave">
            <div
                v-if="isOpen"
                :id="id"
                ref="panel"
                role="dialog"
                aria-modal="false"
                :aria-labelledby="titleId"
                :aria-describedby="textId"
                class="absolute z-10 rounded-3xl border border-border bg-card py-3 pr-9 pl-4 text-left shadow-elevated"
                :class="
                    placement === 'corner'
                        ? 'right-0 bottom-full mb-4 w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right'
                        : 'inset-x-0 top-full mx-auto mt-4 w-[min(20rem,calc(100vw-2rem))] origin-top lg:top-auto lg:bottom-[96%] lg:mt-0 lg:origin-bottom'
                "
                @pointerenter="onPointerEnter"
                @pointerleave="onPointerLeave"
                @focusin="onFocusIn"
                @focusout="onFocusOut"
            >
                <p :id="titleId" class="sr-only">Abot</p>
                <p :id="textId" class="sr-only">{{ text }}</p>

                <button
                    type="button"
                    class="absolute top-2 right-2 grid size-6 place-items-center rounded-full text-muted-foreground focus-ring transition-colors hover:text-foreground"
                    aria-label="Close"
                    @click="close"
                >
                    <X class="size-3.5" aria-hidden="true" />
                </button>

                <!-- Abot typing the next line -->
                <span
                    v-if="phase === 'dots'"
                    class="flex h-[1.625rem] items-center gap-1"
                    aria-hidden="true"
                >
                    <span
                        v-for="i in 3"
                        :key="i"
                        class="size-1.5 animate-bounce rounded-full bg-primary/60 motion-reduce:animate-none"
                        :style="{ animationDelay: `${(i - 1) * 120}ms` }"
                    />
                </span>

                <!-- The invisible copy reserves the line's full height, so
                     the bubble doesn't grow while typing. -->
                <p
                    v-else
                    class="grid text-sm leading-relaxed text-foreground"
                    aria-hidden="true"
                >
                    <span class="invisible col-start-1 row-start-1">
                        {{ text }}
                    </span>
                    <span ref="typed" class="col-start-1 row-start-1" />
                </p>

                <!-- The tail, pointing at Abot -->
                <span
                    v-if="placement === 'corner'"
                    class="absolute right-[1.3rem] -bottom-[7px] size-3.5 rotate-45 rounded-br-[4px] border-r border-b border-border bg-card"
                    aria-hidden="true"
                />
                <template v-else>
                    <span
                        class="absolute -top-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 rounded-tl-[4px] border-t border-l border-border bg-card lg:hidden"
                        aria-hidden="true"
                    />
                    <span
                        class="absolute -bottom-[7px] left-1/2 hidden size-3.5 -translate-x-1/2 rotate-45 rounded-br-[4px] border-r border-b border-border bg-card lg:block"
                        aria-hidden="true"
                    />
                </template>
            </div>
        </Transition>
    </div>
</template>
