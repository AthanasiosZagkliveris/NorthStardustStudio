import { describe, expect, test } from "vitest";

import { createBusinessChannel, createBusinessSegmentEngagement, type BusinessSegmentEngagementValue } from "./AnswerUtils.ts";
import {
    actionAtOrder,
    actionPlacements,
    connectionPaint,
    markHue,
    markPattern,
    markTint,
    orderAt,
    orderIn,
    parseOrderReference,
    resourceColours,
    sharedColours
} from "./ActionOrder.ts";

function segment(rows: Record<string, Record<string, string[]>>): BusinessSegmentEngagementValue {
    const ids = [...new Set(Object.values(rows).flatMap(stages => Object.values(stages).flat()))];
    return {
        ...createBusinessSegmentEngagement("seg"),
        actions: ids.map(id => ({ id, text: "Action " + id })),
        channels: Object.entries(rows).map(([id, actionIds]) => ({
            ...createBusinessChannel(),
            id,
            category: "Social Media",
            name: id,
            stages: Object.keys(actionIds),
            actionIds
        }))
    };
}

describe("the total action order number", () => {

    const shared = segment({
        insta: { discovery: ["reels", "plain"], support: ["answer"] },
        pin: { discovery: ["reels", "pins"] },
        mail: { evaluation: ["reels", "news"] }
    });
    const placements = actionPlacements(shared);

    test("numbers DISTINCT actions in the table's walk (channel, stage, line), 1..N with no gaps", () => {
        expect(placements.map(entry => entry.order)).toEqual([1, 2, 3, 1, 4, 1, 5]);
        expect([...new Set(placements.map(entry => entry.order))]).toEqual([1, 2, 3, 4, 5]);
    });

    test("every placement of a shared action shows the same number", () => {
        const reels = placements.filter(entry => entry.actionId === "reels").map(entry => entry.order);
        expect(reels).toEqual([1, 1, 1]);
        expect(orderAt(placements, "pin", "discovery", 0)).toBe(1);
        expect(orderIn(placements, "reels", "mail")).toBe(1);
    });

    test("finds the action that has a number, and nothing for a number it has not", () => {
        expect(actionAtOrder(placements, 4)).toBe("pins");
        expect(actionAtOrder(placements, 6)).toBeUndefined();
        expect(actionAtOrder(placements, 0)).toBeUndefined();
    });

    test("reads #12 (a hash and digits only) as 12", () => {
        expect(parseOrderReference("#12")).toBe(12);
        expect(parseOrderReference("  # 7 ")).toBe(7);
        for (const text of ["12", "#", "#0", "#1a", "# 1 2", "#-3", "#1.5", "x#1", ""]) {
            expect(parseOrderReference(text), text).toBeUndefined();
        }
    });

});

describe("the colour a mark takes", () => {

    test("six solid hues, then the same hues in stripes, then in a cross-hatch, then round again", () => {
        const at = (place: number) => markHue(place) + 1 + ":" + markPattern(place);
        expect([0, 1, 5].map(at)).toEqual(["1:solid", "2:solid", "6:solid"]);
        expect([6, 7, 11].map(at)).toEqual(["1:stripes", "2:stripes", "6:stripes"]);
        expect([12, 13, 17].map(at)).toEqual(["1:hatch", "2:hatch", "6:hatch"]);
        expect([18, 24].map(at)).toEqual(["1:solid", "1:stripes"]);
    });

    test("the classes: the hue, and the pattern past six", () => {
        expect(markTint("shared", 0)).toBe("tint-shared-1");
        expect(markTint("shared", 5)).toBe("tint-shared-6");
        expect(markTint("shared", 6)).toBe("tint-shared-1 tint-pattern-stripes");
        expect(markTint("resource", 13)).toBe("tint-resource-2 tint-pattern-hatch");
        expect(markTint("resource", 18)).toBe("tint-resource-1");
    });

    test("shared actions and resources take places in order, with no limit", () => {
        const eight = segment(Object.fromEntries(Array.from({ length: 8 }, (_, at) => ["c" + at, { discovery: ["a" + at], support: ["a" + ((at + 1) % 8)] }])));
        const places = sharedColours(actionPlacements(eight));
        expect([...places.values()]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        const engagement = {
            segments: [], demand: {},
            channelResources: Array.from({ length: 8 }, (_, at) => ({ id: "l" + at, segmentId: "seg", channelId: "c0", resourceId: "r" + at, actionIds: [] }))
        };
        expect([...resourceColours(engagement as never, "seg").values()]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    test("a connection line is solid ink, 4px diagonal stripes against the second colour, or a cross-hatch, one part per place", () => {
        const solid = connectionPaint("shared", [2]);
        expect(solid.image).toBe("linear-gradient(hsl(var(--shared-hue-3) var(--theme-mark-ink)), hsl(var(--shared-hue-3) var(--theme-mark-ink)))");
        expect(solid.size).toBe("100% 100%");
        const stripes = connectionPaint("shared", [6]);
        expect(stripes.image).toBe("repeating-linear-gradient(45deg, hsl(var(--shared-hue-1) var(--theme-mark-ink)) 0 4px, var(--pattern-alt) 4px 8px)");
        const hatch = connectionPaint("resource", [12]);
        expect(hatch.image.match(/repeating-linear-gradient/g)).toHaveLength(2);
        expect(hatch.image).toContain("var(--pattern-alt)");
        // Two places split the line into equal parts, top and bottom, patterns side by side.
        const two = connectionPaint("resource", [0, 7]);
        expect(two.size).toBe("100% 50%, 100% 50%");
        expect(two.position).toBe("0 0%, 0 100%");
        expect(two.image).toContain("repeating-linear-gradient(45deg, hsl(var(--resource-hue-2) var(--theme-mark-ink))");
    });

});
