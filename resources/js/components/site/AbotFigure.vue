<script setup lang="ts">
import { ref, useId } from 'vue';
import {
    A_CROSSBAR,
    A_FEET,
    A_KNEE,
    A_SHEEN,
    A_SILHOUETTE,
    A_SPLIT_LEFT,
    A_SPLIT_RIGHT,
    A_VIEWBOX,
    A_VISOR,
} from '@/components/site/abotShape';

/**
 * Abot's drawing, without behaviour: a chubby toy robot whose outline is the
 * capital "A" of the logo (geometry in `abotShape.ts`), coloured only through
 * theme tokens. The dome is the apex of the A, the arch between the legs its
 * counter and the belt its crossbar; the left side is a circuit panel and the
 * right side a solid slab, as in the logo.
 *
 * The parts that move are exposed for whoever animates it (HeroBot.vue).
 * `detail="mini"` drops the small details (circuits, knee, sheen, cheeks)
 * that would only be noise at icon size.
 */
withDefaults(
    defineProps<{
        detail?: 'full' | 'mini';
    }>(),
    { detail: 'full' },
);

// Clip ids for the two sides, unique per instance.
const uid = useId();

const body = ref<SVGGElement | null>(null);
const visor = ref<SVGGElement | null>(null);
const eyes = ref<SVGGElement | null>(null);
const eyeLeft = ref<SVGRectElement | null>(null);
const eyeRight = ref<SVGRectElement | null>(null);
const armLeft = ref<SVGGElement | null>(null);
const armRight = ref<SVGGElement | null>(null);
const antenna = ref<SVGGElement | null>(null);
const halo = ref<SVGCircleElement | null>(null);
const shadow = ref<SVGEllipseElement | null>(null);

defineExpose({
    body,
    visor,
    eyes,
    eyeLeft,
    eyeRight,
    armLeft,
    armRight,
    antenna,
    halo,
    shadow,
});
</script>

<template>
    <svg aria-hidden="true" :viewBox="A_VIEWBOX" class="overflow-visible">
        <ellipse
            ref="shadow"
            cx="120"
            cy="207"
            rx="106"
            ry="5"
            class="fill-foreground"
            fill-opacity="0.1"
        />

        <g ref="body">
            <!-- Antenna on top of the dome -->
            <g ref="antenna">
                <rect
                    x="118"
                    y="10"
                    width="4"
                    height="26"
                    rx="2"
                    class="fill-primary"
                />
                <circle ref="halo" cx="120" cy="8" r="6" class="fill-brand-red" />
                <circle cx="120" cy="8" r="6" class="fill-brand-red" />
            </g>

            <defs>
                <clipPath :id="`${uid}-left`">
                    <path :d="A_SPLIT_LEFT" />
                </clipPath>
                <clipPath :id="`${uid}-right`">
                    <path :d="A_SPLIT_RIGHT" />
                </clipPath>
            </defs>

            <!-- Oval feet peeking out under the skirt -->
            <ellipse
                v-for="(foot, i) in A_FEET"
                :key="i"
                v-bind="foot"
                class="fill-primary"
            />

            <!-- Left side of the A: circuit panel (the logo's PCB side) -->
            <path
                :d="A_SILHOUETTE"
                :clip-path="`url(#${uid}-left)`"
                stroke-width="2"
                stroke-linejoin="round"
                class="fill-card stroke-border"
            />
            <template v-if="detail === 'full'">
                <g
                    stroke-width="2.5"
                    stroke-linecap="round"
                    class="fill-none stroke-primary max-sm:hidden"
                >
                    <path d="M92 152 L82 176" />
                    <path d="M78 150 L64 172" />
                </g>
                <g class="fill-primary max-sm:hidden">
                    <circle cx="82" cy="176" r="3" />
                    <circle cx="64" cy="172" r="3" />
                </g>
                <!-- Hexagon knee joint, from the logo -->
                <path :d="A_KNEE" class="fill-primary" />
            </template>

            <!-- Right side, over the top of the dome: solid slab -->
            <path
                :d="A_SILHOUETTE"
                :clip-path="`url(#${uid}-right)`"
                class="fill-primary"
            />
            <path
                v-if="detail === 'full'"
                :d="A_SHEEN"
                stroke-width="3"
                stroke-linecap="round"
                stroke-opacity="0.25"
                class="fill-none stroke-primary-foreground"
            />

            <!-- Capsule visor across the dome, rimmed so it reads on the
                 solid side too -->
            <g ref="visor">
                <rect
                    v-bind="A_VISOR"
                    :rx="A_VISOR.height / 2"
                    stroke-width="5"
                    class="fill-primary stroke-card"
                />
                <path
                    v-if="detail === 'full'"
                    d="M80 90 Q82 82 90 80"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-opacity="0.5"
                    class="fill-none stroke-primary-foreground"
                />

                <g ref="eyes">
                    <rect
                        ref="eyeLeft"
                        x="101"
                        y="83"
                        width="10"
                        height="18"
                        rx="5"
                        class="fill-primary-foreground"
                    />
                    <rect
                        ref="eyeRight"
                        x="129"
                        y="83"
                        width="10"
                        height="18"
                        rx="5"
                        class="fill-primary-foreground"
                    />
                </g>

                <template v-if="detail === 'full'">
                    <circle
                        cx="84"
                        cy="102"
                        r="3.5"
                        class="fill-brand-red"
                        fill-opacity="0.65"
                    />
                    <circle
                        cx="156"
                        cy="102"
                        r="3.5"
                        class="fill-brand-red"
                        fill-opacity="0.65"
                    />
                </template>
            </g>

            <!-- Arms hang from the ends of the belt -->
            <g ref="armLeft">
                <g transform="rotate(50 40 129)">
                    <rect
                        x="34"
                        y="128"
                        width="12"
                        height="26"
                        rx="6"
                        class="fill-primary"
                    />
                    <circle
                        cx="40"
                        cy="157"
                        r="6.5"
                        stroke-width="2"
                        class="fill-card stroke-border"
                    />
                </g>
            </g>
            <g ref="armRight">
                <g transform="rotate(-50 200 129)">
                    <rect
                        x="194"
                        y="128"
                        width="12"
                        height="26"
                        rx="6"
                        class="fill-primary"
                    />
                    <circle
                        cx="200"
                        cy="157"
                        r="6.5"
                        stroke-width="2"
                        class="fill-card stroke-border"
                    />
                </g>
            </g>

            <!-- Belt: the crossbar of the A -->
            <rect
                v-bind="A_CROSSBAR"
                :rx="A_CROSSBAR.height / 2"
                stroke-width="2"
                class="fill-card stroke-border"
            />
            <circle cx="40" cy="129" r="4" class="fill-primary" />
            <circle cx="200" cy="129" r="4" class="fill-primary" />
            <circle cx="108" cy="129" r="3.5" class="fill-primary" />
            <circle cx="120" cy="129" r="3.5" class="fill-brand-red" />
            <circle
                cx="132"
                cy="129"
                r="3.5"
                class="fill-primary"
                fill-opacity="0.45"
            />
        </g>
    </svg>
</template>
