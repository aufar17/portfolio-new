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
 * The robot's introduction, built from data the landing page already has.
 * Pages whose data is missing are left out.
 */
export function buildDialogPages(
    name: string,
    personal: any,
    lastRole?: string | null,
): BotDialogPage[] {
    const roles: string[] = personal?.role_list ?? [];

    const pages: (BotDialogPage | false)[] = [
        {
            text: "Hi! I'm Abot, the robot who looks after this portfolio.",
            gesture: 'wave',
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
