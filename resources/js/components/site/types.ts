import type { Component } from 'vue';

export type SegmentOption<V extends string> = {
    value: V;
    label: string;
    icon?: Component;
};

export type TimelineEntry = {
    id: number | string;
    title: string;
    date?: string;
    meta: { icon: Component; label: string }[];
    body?: string;
};
