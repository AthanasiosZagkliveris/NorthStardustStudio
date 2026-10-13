import { describe, expect, test } from "vitest";

import { asBusinessEngagementValue, type BusinessSegmentEngagementValue } from "./AnswerUtils.ts";
import { actionPlaces, rowActions, withChosenAction, withRowLines } from "./ChannelActions.ts";
import { removalPatches, undoRemoval } from "./RemovalPatch.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";

/** A Segment with two channels, read as the page reads it. */
function segment(stored: Record<string, unknown>): BusinessSegmentEngagementValue {
    return asBusinessEngagementValue({ segments: [{ segmentId: "seg-1", ...stored }] }).segments[0];
}

/** Stored, then read again: what the page would load next time. */
const reread = (value: BusinessSegmentEngagementValue) => segment(JSON.parse(JSON.stringify(value)));

const twoChannels = {
    channels: [
        { id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"], actions: { discovery: ["Post reels", "Collaborate"] } },
        { id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"], actions: { discovery: ["Post reels"] } }
    ]
};

describe("a Segment's shared channel actions", () => {

    test("an answer saved before becomes one action per line, identical words kept apart", () => {
        const value = segment(twoChannels);
        expect(value.actions.map(action => action.text)).toEqual(["Post reels", "Collaborate", "Post reels"]);
        expect(rowActions(value, "insta", "discovery").texts).toEqual(["Post reels", "Collaborate"]);
        // The same ids every time it is read.
        expect(segment(twoChannels).actions.map(action => action.id)).toEqual(value.actions.map(action => action.id));
        expect(reread(value).actions).toEqual(value.actions);
    });

    test("a new line makes an action; typing edits it", () => {
        let value = segment(twoChannels);
        value = withRowLines(value, "pin", "discovery", ["Post reels", "Pin room sets"], [0, -1]);
        expect(rowActions(value, "pin", "discovery").texts).toEqual(["Post reels", "Pin room sets"]);
        expect(value.actions).toHaveLength(4);
    });

    test("an action chosen in another row is the same action, and editing it edits it everywhere", () => {
        let value = segment(twoChannels);
        const collaborate = rowActions(value, "insta", "discovery").ids[1];
        value = withChosenAction(value, "pin", "discovery", 1, collaborate);
        expect(rowActions(value, "pin", "discovery").ids[1]).toBe(collaborate);
        expect(actionPlaces(value, collaborate)).toEqual(["Instagram › Discover", "Pinterest › Discover"]);
        // Edited in one row, it reads so in both, once stored.
        value = reread(withRowLines(value, "pin", "discovery", ["Post reels", "Collaborate with interiors accounts"], [0, 1]));
        expect(rowActions(value, "insta", "discovery").texts[1]).toBe("Collaborate with interiors accounts");
        expect(value.actions.filter(action => action.id === collaborate)).toHaveLength(1);
    });

    test("taking it out of a row keeps it in the others; out of the last, it is gone -- and undo brings it all back", () => {
        let value = segment(twoChannels);
        const collaborate = rowActions(value, "insta", "discovery").ids[1];
        value = reread(withChosenAction(value, "pin", "discovery", 1, collaborate));
        const shared = value;

        value = reread(withRowLines(value, "pin", "discovery", ["Post reels"], [0]));
        expect(rowActions(value, "insta", "discovery").ids).toContain(collaborate);
        expect(value.actions.some(action => action.id === collaborate)).toBe(true);

        const before = value;
        value = reread(withRowLines(value, "insta", "discovery", ["Post reels"], [0]));
        expect(value.actions.some(action => action.id === collaborate)).toBe(false);

        // The page's undo: the patch of what was taken away, put back.
        const restored = reread(undoRemoval(value, removalPatches(before, value)) as BusinessSegmentEngagementValue);
        expect(rowActions(restored, "insta", "discovery").texts).toEqual(["Post reels", "Collaborate"]);
        expect(shared.actions.length).toBeGreaterThan(0);
    });

    test("the Lumen example shares its one repeated action between the studio and the markets", () => {
        const example = JSON.parse(lumenText) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> };
        const engagement = asBusinessEngagementValue(example.systems["3"].responses.find(response => response.sectionNumber === 2)?.value);
        const retail = engagement.segments.find(entry => entry.segmentId === "segment-8lu427u5")!;
        const touch = retail.actions.find(action => action.text === "Let visitors touch the cloth and try the loom")!;
        expect(actionPlaces(retail, touch.id)).toEqual(["Studio / Shop › Evaluation", "Market / Pop-up › Evaluation"]);
        // Read as texts, row by row, as before: once in each row.
        expect(retail.channels.filter(channel => channel.actions.evaluation?.includes(touch.text))).toHaveLength(2);
    });

});
