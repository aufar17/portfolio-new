import { ref } from 'vue';

/**
 * Abot's voice: short synthesised robot blips (Web Audio, no audio files).
 *
 * Browsers only allow sound after a user gesture, so the audio context is
 * created by `unlockVoice()`, called when the visitor opens a dialog (a click
 * or key on Abot). Nothing plays before that, nothing plays in a background
 * tab, and the periodic chat bubble never speaks. One mute switch, kept in
 * localStorage, covers both dialogs; sound is on by default.
 */
const STORAGE_KEY = 'portfolio:abot-sound:v1';

/** Shared by every dialog's mute button. */
export const abotMuted = ref(false);

let loaded = false;
let context: AudioContext | null = null;
let master: GainNode | null = null;

/** Reads the stored mute choice (client only, once). */
export function loadVoicePreference() {
    if (loaded) {
        return;
    }

    loaded = true;

    try {
        abotMuted.value = localStorage.getItem(STORAGE_KEY) === 'muted';
    } catch {
        // Storage unavailable: sound stays on for this page.
    }
}

export function setAbotMuted(muted: boolean) {
    abotMuted.value = muted;

    try {
        localStorage.setItem(STORAGE_KEY, muted ? 'muted' : 'on');
    } catch {
        // Kept for the life of the page only.
    }
}

/** Call from a user gesture: creates (or wakes) the audio context. */
export function unlockVoice() {
    loadVoicePreference();

    try {
        if (!context) {
            const Context =
                window.AudioContext ??
                (
                    window as unknown as {
                        webkitAudioContext?: typeof AudioContext;
                    }
                ).webkitAudioContext;

            if (!Context) {
                return;
            }

            context = new Context();
            master = context.createGain();
            master.gain.value = 0.12;
            master.connect(context.destination);
        }

        if (context.state === 'suspended') {
            void context.resume();
        }
    } catch {
        // No audio: Abot stays silent.
    }
}

type Tone = {
    /** Start frequency, Hz. */
    from: number;
    /** End frequency (glide), Hz. */
    to?: number;
    type?: OscillatorType;
    /** Delay from now, s. */
    at?: number;
    /** Length, s. */
    length: number;
    /** Peak level before the master volume (0–1). */
    level?: number;
    /** Vibrato: rate (Hz) and depth (Hz). */
    wobble?: [rate: number, depth: number];
};

/**
 * One enveloped, low-passed oscillator note. Nodes are dropped after they
 * stop, so nothing builds up. Scheduled notes wait if the context is still
 * waking up.
 */
function tone({
    from,
    to,
    type = 'square',
    at = 0,
    length,
    level = 1,
    wobble,
}: Tone) {
    if (!context || !master || abotMuted.value || document.hidden) {
        return;
    }

    const start = context.currentTime + at;
    const end = start + length;
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, start);

    if (to) {
        osc.frequency.exponentialRampToValueAtTime(to, end);
    }

    // Takes the edge off the square wave.
    filter.type = 'lowpass';
    filter.frequency.value = 2200;

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(level, start + 0.005);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    if (wobble) {
        const lfo = context.createOscillator();
        const depth = context.createGain();
        lfo.frequency.value = wobble[0];
        depth.gain.value = wobble[1];
        lfo.connect(depth).connect(osc.frequency);
        lfo.start(start);
        lfo.stop(end + 0.05);
    }

    osc.connect(filter).connect(envelope).connect(master);
    osc.start(start);
    osc.stop(end + 0.05);
}

/** C major pentatonic, C5–A5: random notes from it never clash. */
const SCALE = [523.25, 587.33, 659.25, 783.99, 880];

const pick = () => SCALE[Math.floor(Math.random() * SCALE.length)];

export const abotVoice = {
    /** Dialog opens: "bip-bup", rising. */
    open: () => {
        tone({ from: 659.25, length: 0.07 });
        tone({ from: 987.77, at: 0.08, length: 0.09 });
    },
    /** Dialog closes: falling. */
    close: () => {
        tone({ from: 880, length: 0.07, level: 0.8 });
        tone({ from: 587.33, at: 0.08, length: 0.1, level: 0.8 });
    },
    /** Next page: a soft click. */
    next: () => tone({ from: 1318.5, type: 'triangle', length: 0.035 }),
    /** One syllable of typed speech; higher at the end of a question. */
    blip: (question = false) =>
        tone({
            from: question ? 1046.5 : pick(),
            to: question ? 1318.5 : undefined,
            length: question ? 0.09 : 0.045,
            level: 0.7,
        }),
    /** Clicked too fast: a wobbly fall. */
    dizzy: () =>
        tone({
            from: 900,
            to: 260,
            type: 'triangle',
            length: 0.6,
            wobble: [11, 70],
        }),
    /** The mini Abot touching down in the corner. */
    pop: () =>
        tone({ from: 320, to: 720, type: 'sine', length: 0.13, level: 0.9 }),
};
