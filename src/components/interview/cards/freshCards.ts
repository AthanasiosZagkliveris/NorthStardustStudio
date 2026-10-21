/**
 * The cards made a moment ago and still open: a card that has just been added is not yet something the user left incomplete, so it carries no error
 * indicator (no red tile, no flashing line, no red count) while it is open. SectionTiles keeps the set; the editors that flag incomplete cards read it.
 */
const open = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

const changed = () => {
    version += 1;
    listeners.forEach(listener => listener());
};

export const freshCards = {
    has: (id: string): boolean => open.has(id),
    add(id: string) {
        if (!open.has(id)) {
            open.add(id);
            changed();
        }
    },
    remove(id: string) {
        if (open.delete(id)) {
            changed();
        }
    },
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
    snapshot: (): number => version
};
