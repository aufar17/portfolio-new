export type BotGesture = 'wave' | 'hop' | 'nod' | 'point';

export type BotDialogPage = {
    text: string;
    gesture: BotGesture;
};

/** Shown when the robot is clicked several times in quick succession. */
export const BOT_REACTION = 'Whoa, easy! My circuits are spinning.';

/** "A", "A and B", "A, B and C". */
const joinList = (items: string[]) =>
    items.length > 1
        ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
        : (items[0] ?? '');

/**
 * A greeting for the visitor's local hour (0–23, from their device clock):
 * morning 05–11, afternoon 12–17, evening 18–22, and a joke late at night.
 */
export function greetingFor(hour: number): string {
    if (hour >= 5 && hour < 12) {
        return 'Good morning! Thanks for stopping by.';
    }

    if (hour >= 12 && hour < 18) {
        return 'Good afternoon! Nice of you to drop in.';
    }

    if (hour >= 18 && hour < 23) {
        return 'Good evening! Glad you made it here.';
    }

    return "Up this late? Me too, but I'm a robot. Don't forget to sleep!";
}

/**
 * The robot's introduction, built from data the landing page already has.
 * Pages whose data is missing are left out. With the visitor's local
 * `hour` it opens with a greeting (the gestures shift so two waves never
 * follow each other); without it (before mount, on the server) it doesn't.
 */
export function buildDialogPages(
    name: string,
    personal: any,
    lastRole?: string | null,
    hour?: number | null,
): BotDialogPage[] {
    const roles: string[] = personal?.role_list ?? [];
    const greeting =
        hour === null || hour === undefined ? null : greetingFor(hour);
    const greet = greeting !== null;

    const pages: (BotDialogPage | false)[] = [
        greeting !== null && { text: greeting, gesture: 'wave' },
        {
            text: "Hi! I'm Abot, the robot who looks after this portfolio.",
            gesture: greet ? 'nod' : 'wave',
        },
        {
            text: roles.length
                ? `This is ${name}. Day to day: ${joinList(roles)}.`
                : `This is ${name}.`,
            gesture: 'hop',
        },
        !!lastRole && {
            text: `Most recent role: ${lastRole}.`,
            gesture: 'nod',
        },
        {
            text: 'Want to see the work? The projects are right this way.',
            gesture: 'point',
        },
    ];

    return pages.filter((page): page is BotDialogPage => !!page);
}
