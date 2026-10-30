<script setup lang="ts">
import { X } from 'lucide-vue-next';
import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue';
import AbotFigure from '@/components/site/AbotFigure.vue';
import BotDialog from '@/components/site/BotDialog.vue';
import type { AbotParts } from '@/motion/abotMotion';
import {
    dizzy,
    gesturePlayer,
    hop,
    idle,
    nod,
    speaker,
    wave,
} from '@/motion/abotMotion';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/motion/gsap';
import { useMotion } from '@/motion/useMotion';
import type { BubbleState } from '@/script/landingPage/abotBubble';
import {
    BUBBLE,
    bubbleDelay,
    bubbleLines,
    bubblesLeft,
    loadBubbleState,
    saveBubbleState,
} from '@/script/landingPage/abotBubble';
import { ABOT_STATE } from '@/script/landingPage/abotState';
import { abotVoice } from '@/script/landingPage/abotVoice';
import { botClickHandler } from '@/script/landingPage/botClicks';
import type { BotGesture } from '@/script/landingPage/botDialog';
import { BOT_REACTION, buildDialogPages } from '@/script/landingPage/botDialog';
import { HERO_NAME } from '@/script/landingPage/hero';
import { useLocalHour } from '@/script/landingPage/localHour';

/**
 * Mini Abot: as the hero robot scrolls out of sight, Abot flies (once, on an
 * arc, shrinking) down to the bottom-right corner, right above the contact
 * bubble, and lands there; scrolling back into the hero flies it back. The
 * hero robot is hidden while Abot is away, so there is only ever one.
 *
 * Now and then it shows a small chat bubble with one of its dialog
 * lines (schedule in abotBubble.ts). The bubble stays away while the contact
 * modal or a dialog is open, while the reader is busy with a showcase, tabs
 * or a form, and in a background tab. It is not a live region and never takes
 * focus; its X ends the bubbles for the session. Clicking Abot or the bubble
 * opens the full dialog above it. On phones it steps aside while the footer
 * is in view. Reduced motion: no flight or idle, the hero robot stays and
 * the corner one simply appears; the bubble just appears.
 */
const props = defineProps<{
    personal: any;
    lastRole?: string | null;
}>();

const shared = inject(ABOT_STATE, null);

// Opens with a greeting for the visitor's local hour (the first bubble
// too), read again right before each dialog or bubble.
const { hour, read: readHour } = useLocalHour();
const pages = computed(() =>
    buildDialogPages(HERO_NAME, props.personal, props.lastRole, hour.value),
);
const lines = computed(() => bubbleLines(pages.value));

const root = ref<HTMLElement | null>(null);
const button = ref<HTMLButtonElement | null>(null);
const figure = ref<InstanceType<typeof AbotFigure> | null>(null);
const dialog = ref<InstanceType<typeof BotDialog> | null>(null);
const typed = ref<HTMLElement | null>(null);
const flyer = ref<HTMLElement | null>(null);

const dialogOpen = ref(false);
const visible = ref(false);
/** The bubble's line while it is up. */
const bubble = ref<string | null>(null);

const parts = () => (figure.value ?? {}) as AbotParts;
const player = gesturePlayer();
const voice = speaker(parts);

const onPage = (name: BotGesture) =>
    player.play(() =>
        name === 'hop'
            ? hop(parts())
            : name === 'nod'
              ? nod(parts())
              : wave(parts()),
    );

/* ---------- Bubble ---------- */

const CHARS_PER_SECOND = 40;
/** Pointer or focus on something the reader is working with. */
const BUSY = '[data-abot-quiet], input, textarea, select, [contenteditable]';
const BUSY_FOR_MS = 4000;
const TICK = 0.5;

let schedule: BubbleState = { shown: 0, dismissed: false };
let waited = 0;
let due: number = BUBBLE.firstAfter;
let upFor = 0;
let held = false;
let lastBusy = -Infinity;
let typeTween: gsap.core.Tween | undefined;

const busy = () =>
    performance.now() - lastBusy < BUSY_FOR_MS ||
    !!document.activeElement?.closest(BUSY);

const quiet = () =>
    !!shared?.contactOpen ||
    !!shared?.heroDialogOpen ||
    dialogOpen.value ||
    document.hidden ||
    busy();

const type = async (line: string) => {
    typeTween?.kill();
    await nextTick();

    const el = typed.value;

    if (!el) {
        return;
    }

    if (prefersReducedMotion()) {
        el.textContent = line;

        return;
    }

    el.textContent = '';
    voice.speak(true);

    const state = { chars: 0 };
    typeTween = gsap.to(state, {
        chars: line.length,
        duration: line.length / CHARS_PER_SECOND,
        ease: 'none',
        onUpdate: () => {
            el.textContent = line.slice(0, Math.round(state.chars));
        },
        onComplete: () => voice.speak(false),
    });
};

const showBubble = () => {
    readHour();

    const line = lines.value[schedule.shown % lines.value.length];

    if (!line) {
        return;
    }

    schedule = { ...schedule, shown: schedule.shown + 1 };
    saveBubbleState(schedule);
    bubble.value = line;
    upFor = 0;
    held = false;
    type(line);
};

const hideBubble = () => {
    if (!bubble.value) {
        return;
    }

    typeTween?.kill();
    voice.speak(false);
    bubble.value = null;
    held = false;
    waited = 0;
    due = bubbleDelay(schedule.shown);
};

/** The X: no more bubbles this session. */
const dismiss = () => {
    schedule = { ...schedule, dismissed: true };
    saveBubbleState(schedule);
    hideBubble();
    button.value?.focus({ preventScroll: true });
};

const tick = () => {
    if (!visible.value) {
        return;
    }

    if (bubble.value) {
        if (quiet()) {
            hideBubble();
        } else if (!held && (upFor += TICK) >= BUBBLE.showFor) {
            hideBubble();
        }

        return;
    }

    if (bubblesLeft(schedule) && !quiet() && (waited += TICK) >= due) {
        showBubble();
    }
};

const onPointerDown = (event: PointerEvent) => {
    if ((event.target as Element | null)?.closest?.(BUSY)) {
        lastBusy = performance.now();
    }
};

/** Pointer or focus on the bubble keeps it up. */
const hold = (on: boolean) => {
    held = on;
};

const onBubbleFocusOut = (event: FocusEvent) => {
    if (
        !(event.currentTarget as Element).contains(event.relatedTarget as Node)
    ) {
        hold(false);
    }
};

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    schedule = loadBubbleState();
    due = bubbleDelay(schedule.shown);
    timer = setInterval(tick, TICK * 1000);
    document.addEventListener('pointerdown', onPointerDown, true);
});

onBeforeUnmount(() => {
    clearInterval(timer);
    document.removeEventListener('pointerdown', onPointerDown, true);
    typeTween?.kill();
    player.kill();
    voice.kill();
});

/* ---------- Dialog ---------- */

const onClick = botClickHandler({
    isOpen: () => dialogOpen.value,
    advance: () => {
        hideBubble();

        if (dialogOpen.value) {
            dialog.value?.advance();
        } else {
            openDialog();
        }
    },
    react: () => {
        player.play(() => dizzy(parts()));
        dialog.value?.interrupt(BOT_REACTION);
    },
});

/** The bubble's text opens the full dialog too. */
const openDialog = () => {
    hideBubble();

    if (!dialogOpen.value) {
        // A fresh hour, and its pages passed down, before the first page.
        readHour();
        nextTick(() => dialog.value?.advance());
    }
};

const onDialogClosed = (hadFocus: boolean) => {
    if (hadFocus) {
        button.value?.focus({ preventScroll: true });
    }
};

const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && bubble.value) {
        hideBubble();
    }
};

/* ---------- Flying between the hero and the corner ---------- */

/** Where Abot is: 0 in the hero, 1 in the corner, in between in flight. */
const place = { t: 0 };
/** Where it is heading: 1 the corner, 0 the hero. */
let heading = 0;
let flight: gsap.core.Tween | undefined;
let footerHidden = false;
let reduceMotion = false;

const FLIGHT_SECONDS = 0.9;
/** How high the flight arcs above the straight line, in px. */
const ARC = 70;

type Box = { left: number; top: number; width: number; height: number };

const heroFigure = () =>
    document.querySelector<SVGSVGElement>('[data-intro-target] svg');

const boxOf = (el: Element | null | undefined): Box | null => {
    if (!el) {
        return null;
    }

    const { left, top, width, height } = el.getBoundingClientRect();

    return { left, top, width, height };
};

/**
 * The hero robot, kept inside the screen (below the navbar): when the page
 * has already scrolled it partly or wholly away, Abot still takes off (or
 * lands) where it can be seen.
 */
const heroBox = (): Box | null => {
    const box = boxOf(heroFigure());

    if (!box) {
        return null;
    }

    const navBottom =
        parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
                '--nav-h',
            ),
        ) || 0;

    return {
        ...box,
        top: gsap.utils.clamp(
            navBottom,
            Math.max(navBottom, window.innerHeight - box.height),
            box.top,
        ),
    };
};

const cornerBox = () => boxOf(figure.value?.$el as Element | undefined);

/** Where the flying copy is right now (to turn around mid-flight). */
const flyerBox = (): Box | null => {
    const el = flyer.value;

    return el
        ? {
              left: Number(gsap.getProperty(el, 'x')),
              top: Number(gsap.getProperty(el, 'y')),
              width: el.offsetWidth,
              height: el.offsetHeight,
          }
        : null;
};

/** Shows the corner Abot when it has landed (and the footer allows it). */
const syncCorner = (bounce = false) => {
    const on = heading === 1 && place.t >= 1 && !footerHidden;

    if (on === visible.value || !root.value) {
        return;
    }

    visible.value = on;

    if (!on) {
        dialog.value?.close();
        hideBubble();
    }

    gsap.killTweensOf(root.value);
    gsap.set(root.value, { autoAlpha: on ? 1 : 0, scale: 1 });

    if (on && bounce && !reduceMotion) {
        // Touchdown: a little squash, then a wave. The "bloop" only sounds if
        // the visitor has already opened a dialog (audio needs a gesture).
        abotVoice.pop();
        gsap.timeline()
            .fromTo(
                root.value,
                { scaleX: 1.12, scaleY: 0.86 },
                { scaleX: 1, scaleY: 1, duration: 0.35 },
            )
            .add(() => player.play(() => wave(parts())));
    }
};

/**
 * Draws the flying copy at `k` (0 → 1) of the way from `from` (fixed on the
 * screen at take-off, so a fast scroll can't carry it out of sight) to the
 * destination, measured live.
 */
const drawFlight = (from: Box, toCorner: boolean, k: number) => {
    const to = toCorner ? cornerBox() : heroBox();
    const el = flyer.value;

    if (!to || !el) {
        return;
    }

    const lift = Math.sin(Math.PI * k);

    gsap.set(el, {
        x: gsap.utils.interpolate(from.left, to.left, k),
        y: gsap.utils.interpolate(from.top, to.top, k) - ARC * lift,
        width: gsap.utils.interpolate(from.width, to.width, k),
        height: gsap.utils.interpolate(from.height, to.height, k),
        rotation: (toCorner ? -10 : 10) * lift,
        autoAlpha: k < 1 ? 1 : 0,
    });
};

/** Flies to the corner (`true`) or back to the hero; instant when `now`. */
const fly = (toCorner: boolean, now = false) => {
    const target = toCorner ? 1 : 0;
    const startT = place.t;
    const midFlight = !!flight?.isActive();

    flight?.kill();
    flight = undefined;
    heading = target;

    if (shared && !reduceMotion) {
        shared.heroAway = toCorner || startT > 0;
    }

    if (!toCorner) {
        // Leaving the corner: the corner Abot becomes the flying one.
        syncCorner();
    }

    // Turning around mid-air starts from where the copy is; otherwise from
    // the robot it leaves.
    const from = midFlight ? flyerBox() : toCorner ? heroBox() : cornerBox();

    if (now || reduceMotion || !from || startT === target) {
        place.t = target;
        gsap.set(flyer.value, { autoAlpha: 0 });
        syncCorner();

        if (shared && !reduceMotion) {
            shared.heroAway = toCorner;
        }

        return;
    }

    const progress = { k: 0 };
    flight = gsap.to(progress, {
        k: 1,
        duration: FLIGHT_SECONDS * Math.max(Math.abs(target - startT), 0.4),
        ease: 'power2.inOut',
        onUpdate: () => {
            place.t = gsap.utils.interpolate(startT, target, progress.k);
            drawFlight(from, toCorner, progress.k);
        },
        onComplete: () => {
            place.t = target;
            drawFlight(from, toCorner, 1);

            if (toCorner) {
                syncCorner(true);
            } else if (shared) {
                shared.heroAway = false;
            }
        },
    });
};

useMotion(root, ({ reduce, desktop }) => {
    reduceMotion = reduce;
    gsap.set(root.value, { transformOrigin: '50% 100%' });

    const hero = document.querySelector('[data-intro-target]');
    const footer = document.querySelector('footer');
    const created = performance.now();

    const triggers = [
        // Abot takes off while the hero robot is still in sight near the
        // top (on phones, where it sits above the text: half out of sight)
        // and comes back as it scrolls back in. Already past on load (a
        // link to a section): no flight, it is simply in the corner.
        hero &&
            ScrollTrigger.create({
                trigger: hero,
                start: desktop ? 'center 20%' : 'center top',
                end: 'max',
                onToggle: (self) =>
                    fly(self.isActive, performance.now() - created < 500),
            }),
        footer &&
            ScrollTrigger.create({
                trigger: footer,
                start: 'top bottom',
                end: 'max',
                onToggle: (self) => {
                    // On phones it steps aside for the footer.
                    footerHidden = self.isActive && !desktop;
                    syncCorner();
                },
            }),
    ];

    const stopBlinking = reduce ? () => {} : idle(parts());

    return () => {
        triggers.forEach((trigger) => trigger?.kill());
        stopBlinking();
        flight?.kill();
        gsap.set(flyer.value, { autoAlpha: 0 });

        if (shared) {
            shared.heroAway = false;
        }
    };
});

const onBubbleEnter = (el: Element, done: () => void) => {
    if (prefersReducedMotion()) {
        done();

        return;
    }

    gsap.fromTo(
        el,
        { opacity: 0, x: 8, scale: 0.96 },
        {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.25,
            clearProps: 'all',
            onComplete: done,
        },
    );
};

const onBubbleLeave = (el: Element, done: () => void) => {
    if (prefersReducedMotion()) {
        done();

        return;
    }

    gsap.to(el, { opacity: 0, x: 8, duration: 0.2, onComplete: done });
};
</script>

<template>
    <div>
        <!-- The copy of Abot that flies between the hero and the corner -->
        <div
            ref="flyer"
            class="pointer-events-none invisible fixed top-0 left-0 z-[55]"
            aria-hidden="true"
        >
            <AbotFigure
                class="block size-full drop-shadow-[0_10px_18px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
            />
        </div>

        <!-- Stacked right above ContactBubble (same right edge and width) -->
        <div
            ref="root"
            class="invisible fixed right-5 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom)_+_0.75rem)_+_4.25rem)] z-40 flex w-14 justify-center opacity-0 sm:right-6 sm:bottom-[calc(max(1.5rem,env(safe-area-inset-bottom)_+_0.75rem)_+_4.25rem)]"
            @keydown="onKeydown"
        >
            <BotDialog
                id="abot-mini-dialog"
                ref="dialog"
                v-model:open="dialogOpen"
                placement="corner"
                :pages="pages"
                @page="onPage"
                @speaking="voice.speak"
                @closed="onDialogClosed"
            />

            <Transition
                :css="false"
                @enter="onBubbleEnter"
                @leave="onBubbleLeave"
            >
                <div
                    v-if="bubble"
                    class="absolute right-full bottom-1 mr-3.5 w-max max-w-[min(15rem,calc(100vw-6.5rem))] rounded-3xl border border-border bg-card py-2.5 pr-2 pl-4 shadow-elevated"
                    @pointerenter="hold(true)"
                    @pointerleave="hold(false)"
                    @focusin="hold(true)"
                    @focusout="onBubbleFocusOut"
                >
                    <!-- The tail, pointing at the mini Abot -->
                    <span
                        class="pointer-events-none absolute -right-[7px] bottom-5 size-3.5 rotate-45 rounded-tr-[4px] border-t border-r border-border bg-card"
                        aria-hidden="true"
                    />

                    <div class="flex items-start gap-2">
                        <button
                            type="button"
                            class="rounded-md text-left focus-ring"
                            @click="openDialog"
                        >
                            <span class="sr-only">Abot: {{ bubble }}</span>
                            <!-- The invisible copy reserves the full height -->
                            <span
                                class="grid text-sm leading-snug text-foreground"
                                aria-hidden="true"
                            >
                                <span class="invisible col-start-1 row-start-1">
                                    {{ bubble }}
                                </span>
                                <span
                                    ref="typed"
                                    class="col-start-1 row-start-1"
                                />
                            </span>
                        </button>
                        <button
                            type="button"
                            class="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground focus-ring transition-colors hover:text-foreground"
                            aria-label="Dismiss Abot's message"
                            @click="dismiss"
                        >
                            <X class="size-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </Transition>

            <button
                ref="button"
                type="button"
                class="cursor-pointer touch-manipulation rounded-2xl p-1 focus-ring select-none"
                aria-label="Talk to Abot"
                :aria-expanded="dialogOpen"
                :aria-controls="dialogOpen ? 'abot-mini-dialog' : undefined"
                @click="onClick"
            >
                <AbotFigure
                    ref="figure"
                    detail="mini"
                    class="block h-11 w-auto drop-shadow-[0_6px_12px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                />
            </button>
        </div>
    </div>
</template>
