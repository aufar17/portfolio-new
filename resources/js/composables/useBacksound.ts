import { onBeforeUnmount, onMounted, ref } from 'vue';
import track from '@/assets/music/Marimba Mischief.mp3';
import { gsap } from '@/motion/gsap';

/**
 * Background music for the public site: one looping track, quiet, shared by
 * every public page (it keeps playing across Inertia visits).
 *
 * On by default and started as soon as a public page loads. Browsers often
 * refuse sound before any interaction (always on a first visit), so then it
 * starts on the visitor's first click, tap or key press anywhere instead (or
 * the toggle itself). The on/off choice is remembered. It fades in and out,
 * pauses while the tab is hidden, and stops once no public page is showing
 * (e.g. after moving to the admin area). The file only downloads when it
 * first starts.
 */
const STORAGE_KEY = 'portfolio:music:v1';
const VOLUME = 0.3;

/** The visitor wants music (whether or not it is audible yet). */
export const musicOn = ref(true);
/** Sound is actually coming out. */
export const musicPlaying = ref(false);

let audio: HTMLAudioElement | null = null;
let users = 0;
let stopTimer: ReturnType<typeof setTimeout> | undefined;
let loaded = false;

const player = () => {
    if (!audio) {
        audio = new Audio(track);
        audio.loop = true;
        audio.preload = 'none';
        audio.volume = 0;
    }

    return audio;
};

const fadeTo = (volume: number, onComplete?: () => void) => {
    const el = player();
    gsap.to(el, {
        volume,
        duration: volume > 0 ? 1.5 : 0.4,
        ease: 'none',
        overwrite: true,
        onComplete,
    });
};

const start = () => {
    if (!musicOn.value || document.hidden || musicPlaying.value) {
        return;
    }

    const el = player();
    el.play()
        .then(() => {
            musicPlaying.value = true;
            fadeTo(VOLUME);
        })
        .catch(() => {
            // Blocked until a gesture: the next one tries again.
        });
};

const stop = () => {
    if (!audio || !musicPlaying.value) {
        return;
    }

    musicPlaying.value = false;
    fadeTo(0, () => audio?.pause());
};

export function setMusicOn(on: boolean) {
    musicOn.value = on;

    try {
        localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
        // Kept for the life of the page only.
    }

    if (on) {
        start();
    } else {
        stop();
    }
}

// The first gesture anywhere starts the music (if it is wanted).
const onGesture = () => start();

const onVisibility = () => {
    if (document.hidden) {
        stop();
    } else {
        start();
    }
};

/**
 * Keeps the music going while a public page is mounted (reference counted,
 * so the remount between Inertia visits doesn't interrupt it).
 */
export function useBacksound() {
    onMounted(() => {
        clearTimeout(stopTimer);
        users++;

        if (users > 1) {
            return;
        }

        if (!loaded) {
            loaded = true;

            try {
                musicOn.value = localStorage.getItem(STORAGE_KEY) !== 'off';
            } catch {
                // Storage unavailable: keep the default.
            }
        }

        document.addEventListener('pointerdown', onGesture, true);
        document.addEventListener('keydown', onGesture, true);
        document.addEventListener('visibilitychange', onVisibility);

        // Try straight away: browsers that allow autoplay (e.g. a site the
        // visitor often listens to) play at once; the rest refuse quietly
        // and the first click, tap or key press starts it.
        start();
    });

    onBeforeUnmount(() => {
        users = Math.max(0, users - 1);

        if (users > 0) {
            return;
        }

        // Deferred: the next public page mounts right after this one goes.
        stopTimer = setTimeout(() => {
            if (users > 0) {
                return;
            }

            document.removeEventListener('pointerdown', onGesture, true);
            document.removeEventListener('keydown', onGesture, true);
            document.removeEventListener('visibilitychange', onVisibility);
            stop();
        });
    });

    return { musicOn, musicPlaying, setMusicOn };
}
