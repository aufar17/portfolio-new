<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { gsap, prefersReducedMotion } from '@/motion/gsap';
import type {
    BotDialogPage,
    BotGesture,
} from '@/script/landingPage/botDialog';

/**
 * HUD-style panel for the hero robot's introduction: a non-modal dialog whose
 * pages are typed out with a blinking cursor. The robot (or Next) advances,
 * a click while typing completes the page, and the last page closes itself
 * unless the pointer or focus is inside the panel.
 *
 * Screen readers get each page in full at once: a persistent live region
 * announces it and the panel is described by an untyped copy. The typed text
 * is hidden from them. Reduced motion shows the text without typing.
 */
const props = defineProps<{
    id: string;
    pages: BotDialogPage[];
}>();

const emit = defineEmits<{
    page: [gesture: BotGesture];
    speaking: [on: boolean];
    closed: [hadFocus: boolean];
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const CHARS_PER_SECOND = 40;
const AUTO_CLOSE_SECONDS = 5;

const index = ref(0);
const interruption = ref<string | null>(null);
const typing = ref(false);

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
let closeCall: gsap.core.Tween | undefined;
let pointerInside = false;
let focusInside = false;

const setSpeaking = (on: boolean) => {
    if (typing.value !== on) {
        typing.value = on;
        emit('speaking', on);
    }
};

const scheduleClose = () => {
    closeCall?.kill();

    if (isLast.value && !typing.value && !pointerInside && !focusInside) {
        closeCall = gsap.delayedCall(AUTO_CLOSE_SECONDS, close);
    }
};

const finishTyping = () => {
    typeTween?.kill();
    typeTween = undefined;

    if (typed.value) {
        typed.value.textContent = text.value;
    }

    setSpeaking(false);
    scheduleClose();
};

const type = async () => {
    typeTween?.kill();
    closeCall?.kill();
    // The panel mounts on the tick after opening.
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
    typeTween = gsap.to(state, {
        chars: full.length,
        duration: full.length / CHARS_PER_SECOND,
        ease: 'none',
        onUpdate: () => {
            el.textContent = full.slice(0, Math.round(state.chars));
        },
        onComplete: finishTyping,
    });
};

const startPage = () => {
    const page = props.pages[index.value];

    if (page) {
        emit('page', page.gesture);
    }

    type();
};

const close = () => {
    if (!isOpen.value) {
        return;
    }

    typeTween?.kill();
    closeCall?.kill();
    setSpeaking(false);

    const hadFocus = !!panel.value?.contains(document.activeElement);
    pointerInside = false;
    focusInside = false;
    isOpen.value = false;
    emit('closed', hadFocus);
};

/** Opens on the first page, then completes / moves on / closes. */
const advance = () => {
    if (!isOpen.value) {
        isOpen.value = true;
        index.value = 0;
        interruption.value = null;
        startPage();
    } else if (typing.value) {
        finishTyping();
    } else if (interruption.value) {
        interruption.value = null;
        type();
    } else if (index.value < props.pages.length - 1) {
        index.value++;
        startPage();
    } else {
        close();
    }
};

/** Shows a one-off message; the next advance returns to the current page. */
const interrupt = (message: string) => {
    isOpen.value = true;
    interruption.value = message;
    type();
};

defineExpose({ advance, interrupt, close });

const onPointerEnter = () => {
    pointerInside = true;
    closeCall?.kill();
};
const onPointerLeave = () => {
    pointerInside = false;
    scheduleClose();
};
const onFocusIn = () => {
    focusInside = true;
    closeCall?.kill();
};
const onFocusOut = (event: FocusEvent) => {
    if (!panel.value?.contains(event.relatedTarget as Node | null)) {
        focusInside = false;
        scheduleClose();
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

onBeforeUnmount(() => {
    typeTween?.kill();
    closeCall?.kill();
    document.removeEventListener('keydown', onKeydown);
});

const onEnter = (el: Element, done: () => void) => {
    if (prefersReducedMotion()) {
        done();

        return;
    }

    gsap.fromTo(
        el,
        {
            opacity: 0,
            y: 8,
            scale: 0.98,
            clipPath: 'inset(0% 0% 100% 0% round 1rem)',
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            clipPath: 'inset(0% 0% 0% 0% round 1rem)',
            duration: 0.25,
            clearProps: 'all',
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
        y: 8,
        scale: 0.98,
        duration: 0.2,
        onComplete: done,
    });
};
</script>

<template>
    <div>
        <!-- Always mounted so the first page is announced as well -->
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
                class="absolute inset-x-0 top-full z-10 mx-auto mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-primary/30 bg-card/95 p-4 text-left shadow-elevated backdrop-blur-md lg:top-auto lg:bottom-[94%] lg:mt-0"
                @pointerenter="onPointerEnter"
                @pointerleave="onPointerLeave"
                @focusin="onFocusIn"
                @focusout="onFocusOut"
            >
                <!-- HUD corner brackets -->
                <span
                    class="pointer-events-none absolute -top-px -left-px size-4 rounded-tl-2xl border-t-2 border-l-2 border-primary"
                    aria-hidden="true"
                />
                <span
                    class="pointer-events-none absolute -top-px -right-px size-4 rounded-tr-2xl border-t-2 border-r-2 border-primary"
                    aria-hidden="true"
                />
                <span
                    class="pointer-events-none absolute -bottom-px -left-px size-4 rounded-bl-2xl border-b-2 border-l-2 border-primary"
                    aria-hidden="true"
                />
                <span
                    class="pointer-events-none absolute -right-px -bottom-px size-4 rounded-br-2xl border-r-2 border-b-2 border-primary"
                    aria-hidden="true"
                />

                <div class="flex items-center justify-between gap-3">
                    <p
                        :id="titleId"
                        class="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.2em] text-primary-strong uppercase"
                    >
                        <span
                            class="size-1.5 rounded-full bg-brand-red"
                            aria-hidden="true"
                        />
                        Abot · Online
                    </p>
                    <button
                        type="button"
                        class="-m-1.5 grid size-7 place-items-center rounded-full text-muted-foreground focus-ring transition-colors hover:text-foreground"
                        aria-label="Close"
                        @click="close"
                    >
                        <X class="size-4" aria-hidden="true" />
                    </button>
                </div>

                <p :id="textId" class="sr-only">{{ text }}</p>

                <!-- The invisible copy reserves the page's full height, so the
                     panel doesn't grow while typing. -->
                <p
                    class="mt-2.5 grid text-sm leading-relaxed text-foreground"
                    aria-hidden="true"
                >
                    <span class="invisible col-start-1 row-start-1">
                        {{ text }}&nbsp;
                    </span>
                    <span class="col-start-1 row-start-1">
                        <span ref="typed" />
                        <span
                            class="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.2em] animate-caret bg-primary motion-reduce:animate-none"
                        />
                    </span>
                </p>

                <div class="mt-3 flex items-center justify-between gap-3">
                    <span class="flex gap-1.5" aria-hidden="true">
                        <span
                            v-for="(page, i) in pages"
                            :key="i"
                            class="size-1.5 rounded-full transition-colors duration-200"
                            :class="i === index ? 'bg-primary' : 'bg-primary/25'"
                        />
                    </span>
                    <button
                        type="button"
                        class="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground focus-ring transition-[filter] duration-200 hover:brightness-110"
                        @click="advance"
                    >
                        {{ isLast ? 'Close' : 'Next' }}
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>
