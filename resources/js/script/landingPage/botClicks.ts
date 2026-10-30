// Four clicks within this window make the robot dizzy instead of advancing.
const RAPID_CLICKS = 4;
const RAPID_WINDOW_MS = 1200;
const RAPID_LOCK_MS = 1000;

/**
 * Click handler for a robot that drives a BotDialog: each click advances the
 * dialog, but a burst of clicks while it is open triggers `react` and then
 * ignores clicks for a moment.
 */
export function botClickHandler({
    isOpen,
    advance,
    react,
}: {
    isOpen: () => boolean;
    advance: () => void;
    react: () => void;
}) {
    let clickTimes: number[] = [];
    let lockedUntil = 0;

    return () => {
        const now = performance.now();

        if (now < lockedUntil) {
            return;
        }

        clickTimes = [...clickTimes, now].filter(
            (time) => now - time <= RAPID_WINDOW_MS,
        );

        if (isOpen() && clickTimes.length >= RAPID_CLICKS) {
            clickTimes = [];
            lockedUntil = now + RAPID_LOCK_MS;
            react();

            return;
        }

        advance();
    };
}
