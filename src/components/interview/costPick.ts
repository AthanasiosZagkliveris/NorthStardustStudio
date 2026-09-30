/*
    PICKING A CHANNEL'S COST ON ANOTHER PAGE, as a note picks a field.

    "Pick a cost card" on 2. Customer Engagement starts it and opens
    3. Infrastructure & Capability, where CostPicker lights the cost
    cards and takes one click. The card chosen waits here (pending)
    while the page goes back to the channel, whose editor links it.
    Escape goes back without one.

    UI state only, never stored: a pick belongs to this moment.
*/

export interface CostPick {
    segmentId: string;
    channelKey: string;
    /** What the channel is called, for the banner. */
    channelName: string;
    /** The anchors that lead back to the channel (jumpTo). */
    returnTo: string[];
}

export interface PickedCost {
    segmentId: string;
    channelKey: string;
    costId: string;
}

type Listener = () => void;

let picking: CostPick | null = null;
let pending: PickedCost | null = null;
const listeners = new Set<Listener>();

function notify(): void {
    listeners.forEach(listener => listener());
}

export const CostPickService = {

    /** The pick under way, or null. */
    current(): CostPick | null {
        return picking;
    },

    start(pick: CostPick): void {
        picking = pick;
        pending = null;
        notify();
    },

    /** A card was chosen: it waits for the channel's page. Returns where to go back to. */
    choose(costId: string): string[] {
        const pick = picking;
        picking = null;
        pending = pick ? { segmentId: pick.segmentId, channelKey: pick.channelKey, costId } : null;
        notify();
        return pick?.returnTo ?? [];
    },

    /** No card: back to the channel. Returns where to go back to. */
    cancel(): string[] {
        const pick = picking;
        picking = null;
        notify();
        return pick?.returnTo ?? [];
    },

    /** The card chosen, once: the channel's editor links it. */
    takePending(): PickedCost | null {
        const taken = pending;
        pending = null;
        return taken;
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

};
