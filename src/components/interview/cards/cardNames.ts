/**
 * THE NAMES OF THE CARDS, as their tiles show them (global): every card tile says its card's name as it draws itself, and the carousel rail of an open card
 * reads the names from here, so a card's bullet says its name whatever kind of card it is (a Resource, a channel, a Legal expense ...) without each tile
 * having to hand the rail its names one by one.
 */
const names = new Map<string, string>();

/** A card tile says its card's name (or what an unnamed one is called). */
export function rememberCardName(id: string, name: string): void {
    if (name.trim().length > 0) {
        names.set(id, name.trim());
    }
}

/** The name a card's tile shows, or "" where no tile of it has been drawn. */
export function cardNameOf(id: string): string {
    return names.get(id) ?? "";
}
