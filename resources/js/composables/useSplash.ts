const STORAGE_KEY = 'splash-shown';

/** Whether the splash should play on this visit (client only). */
export function shouldShowSplash() {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        if (sessionStorage.getItem(STORAGE_KEY)) {
            return false;
        }
    } catch {
        return false;
    }

    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useSplash() {
    const finishSplash = () => {
        try {
            sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch {
            // Storage unavailable (private mode); the splash simply replays.
        }
    };

    return { finishSplash };
}
