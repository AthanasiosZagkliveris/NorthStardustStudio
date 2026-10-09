import type { BusinessEngagementValue, BusinessSegmentEngagementValue } from "./AnswerUtils.ts";

/*
    WHERE A SEGMENT'S ACTIONS STAND IN THE CUSTOMER CHANNEL TABLE.

    The table is read down as it is drawn: Channel Category, channel,
    journey stage, action line. Every DISTINCT action takes the next
    number of that walk the first time it appears -- its TOTAL ACTION
    ORDER NUMBER, "#12" -- and every other placement of a shared action
    shows that same number, so the numbers run 1..N with no gaps. The
    numbers are a property of the data, not of what is drawn: folding a
    category or isolating some rows renumbers nothing.

    Also here, because they read the same walk: which actions are shared
    (placed in more than one row), the colour each shared action and
    each linked resource is given, and the channels that hold an action.
*/

/** How many hues each palette has (global.css, --shared-hue-1..6 and --resource-hue-1..6). */
export const MARK_PALETTE = 6;

/**
 * What a mark is drawn in once the hues are used up: the first six are
 * solid, the next six the same hues in diagonal STRIPES with a contrasting
 * second colour, the next six in a CROSS-HATCH of it, then round again.
 */
export const MARK_PATTERNS = ["solid", "stripes", "hatch"] as const;
export type MarkPattern = typeof MARK_PATTERNS[number];

export interface ActionPlacement {
    actionId: string;
    channelId: string;
    stage: string;
    line: number;
    /** 1..N over the Segment's distinct actions, in table order: every placement of a shared action has the same. */
    order: number;
}

/** Every placement of the Segment's actions, in the table's order. */
export function actionPlacements(segment: BusinessSegmentEngagementValue): ActionPlacement[] {
    const categories: string[] = [];
    for (const channel of segment.channels) {
        if (!categories.includes(channel.category)) {
            categories.push(channel.category);
        }
    }
    const placements: ActionPlacement[] = [];
    const numbers = new Map<string, number>();
    for (const category of categories) {
        // A channel with no category yet is not drawn (the table shows the category row alone).
        if (category.trim().length === 0) {
            continue;
        }
        for (const channel of segment.channels.filter(candidate => candidate.category === category)) {
            for (const stage of channel.stages) {
                (channel.actionIds[stage] ?? []).forEach((actionId, line) => {
                    if (!numbers.has(actionId)) {
                        numbers.set(actionId, numbers.size + 1);
                    }
                    placements.push({ actionId, channelId: channel.id, stage, line, order: numbers.get(actionId) ?? 0 });
                });
            }
        }
    }
    return placements;
}

/** Every distinct action of the table, each once, in the table's order (its total order numbers 1..N). */
export function tableActionIds(placements: readonly ActionPlacement[]): string[] {
    return [...new Set(placements.map(entry => entry.actionId))];
}

/** The number of one line of the table. */
export function orderAt(placements: readonly ActionPlacement[], channelId: string, stage: string, line: number): number | undefined {
    return placements.find(entry => entry.channelId === channelId && entry.stage === stage && entry.line === line)?.order;
}

/** The action that has a total order number ("#12" is 12), if any. */
export function actionAtOrder(placements: readonly ActionPlacement[], order: number): string | undefined {
    return placements.find(entry => entry.order === order)?.actionId;
}

/**
 * Reads "#12" (a hash and digits, nothing else, spaces around allowed)
 * as 12; anything else is not a number.
 */
export function parseOrderReference(text: string): number | undefined {
    const match = /^\s*#\s*(\d+)\s*$/.exec(text);
    const order = match ? Number(match[1]) : NaN;
    return Number.isSafeInteger(order) && order > 0 ? order : undefined;
}

/**
 * An action's number (the same wherever it stands; asked by channel for
 * the resource cards, which read their channel's rows).
 */
export function orderIn(placements: readonly ActionPlacement[], actionId: string, channelId: string): number | undefined {
    return (placements.find(entry => entry.actionId === actionId && entry.channelId === channelId)
        ?? placements.find(entry => entry.actionId === actionId))?.order;
}

/** The rows (channel at a stage) that hold an action. */
export function actionRows(placements: readonly ActionPlacement[], actionId: string): ActionPlacement[] {
    const seen = new Set<string>();
    return placements.filter(entry => {
        const key = entry.channelId + "|" + entry.stage;
        if (entry.actionId !== actionId || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/** The actions placed in more than one row, each once, in table order. */
export function sharedActionIds(placements: readonly ActionPlacement[]): string[] {
    const ids = [...new Set(placements.map(entry => entry.actionId))];
    return ids.filter(id => actionRows(placements, id).length > 1);
}

/**
 * Which place (0, 1, 2 ...) each shared action takes in the shared
 * palette: its position among them. The hue is `markHue(place)`, the
 * pattern `markPattern(place)`: past six they go round with a pattern.
 */
export function sharedColours(placements: readonly ActionPlacement[]): Map<string, number> {
    return new Map(sharedActionIds(placements).map((id, index) => [id, index]));
}

/** The hue (0..5) of a place in a palette. */
export function markHue(place: number): number {
    return place % MARK_PALETTE;
}

/** The pattern of a place in a palette: solid for 0..5, stripes 6..11, cross-hatch 12..17, then round again. */
export function markPattern(place: number): MarkPattern {
    return MARK_PATTERNS[Math.floor(place / MARK_PALETTE) % MARK_PATTERNS.length];
}

/** The classes a mark of this place carries: its hue (global.css, .tint-shared-N / .tint-resource-N) and, past six, its pattern (.tint-pattern-stripes / -hatch). */
export function markTint(kind: "shared" | "resource", place: number): string {
    const pattern = markPattern(place);
    return "tint-" + kind + "-" + (markHue(place) + 1) + (pattern === "solid" ? "" : " tint-pattern-" + pattern);
}

/**
 * The paint of a 4px connection line made of one or more places (a
 * resource's places split top to bottom in equal parts): CSS values for
 * background-image, -size and -position. A solid place is its mark ink; a
 * striped one 4px diagonal bands of it and the contrasting `--pattern-alt`
 * (colors.css); a cross-hatch the same two crossed. Every place is its own
 * layer in its own part of the line, so patterns can sit side by side.
 */
export function connectionPaint(kind: "shared" | "resource", places: readonly number[]): { image: string; size: string; position: string } {
    const part = 100 / Math.max(1, places.length);
    const layers = places.map((place, at) => {
        const ink = "hsl(var(--" + kind + "-hue-" + (markHue(place) + 1) + ") var(--theme-mark-ink))";
        const pattern = markPattern(place);
        const image = pattern === "solid"
            ? ["linear-gradient(" + ink + ", " + ink + ")"]
            : pattern === "stripes"
                ? ["repeating-linear-gradient(45deg, " + ink + " 0 4px, var(--pattern-alt) 4px 8px)"]
                : [
                    "repeating-linear-gradient(90deg, var(--pattern-alt) 0 1px, transparent 1px 6px)",
                    "repeating-linear-gradient(0deg, var(--pattern-alt) 0 1px, " + ink + " 1px 6px)"
                ];
        return {
            image,
            size: image.map(() => "100% " + part + "%").join(", "),
            position: image.map(() => places.length > 1 ? "0 " + (at * 100 / (places.length - 1)) + "%" : "0 0").join(", ")
        };
    });
    return {
        image: layers.flatMap(layer => layer.image).join(", "),
        size: layers.map(layer => layer.size).join(", "),
        position: layers.map(layer => layer.position).join(", ")
    };
}

/** Which place in the resource palette each resource of the Segment takes: its position among those linked. */
export function resourceColours(engagement: BusinessEngagementValue, segmentId: string): Map<string, number> {
    const ids = [...new Set(engagement.channelResources
        .filter(link => link.segmentId === segmentId)
        .map(link => link.resourceId))];
    return new Map(ids.map((id, index) => [id, index]));
}

/** The names of the channels that hold an action, each once, in table order. */
export function channelNamesOf(
    segment: BusinessSegmentEngagementValue,
    placements: readonly ActionPlacement[],
    actionId: string
): string[] {
    const names: string[] = [];
    for (const placement of placements) {
        if (placement.actionId !== actionId) {
            continue;
        }
        const channel = segment.channels.find(candidate => candidate.id === placement.channelId);
        const name = channel?.name.trim() || "Unnamed channel";
        if (!names.includes(name)) {
            names.push(name);
        }
    }
    return names;
}
