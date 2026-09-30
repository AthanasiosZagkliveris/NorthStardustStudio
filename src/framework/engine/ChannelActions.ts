import {
    BUSINESS_JOURNEY_STAGES,
    type BusinessChannelActionValue,
    type BusinessSegmentEngagementValue
} from "./AnswerUtils.ts";
import { randomId } from "./Readers.ts";

/*
    A SEGMENT'S CHANNEL ACTIONS, SHARED (see BusinessChannelActionValue).

    Each channel x stage row of the Customer Channel table holds its
    actions as references to the Segment's one list. What a row shows
    is their texts; what the row's lines do comes back here:

      - a line typed into edits its action -- in every row that holds it;
      - a new line makes a new action;
      - a line taken away takes away only that row's reference, and an
        action no row holds any more is gone (the answer's reader drops
        it, see withSharedActions);
      - choosing one of the Segment's other actions puts a reference to
        it on that line -- the same action, not a copy.
*/

/** A row's action ids, texts and the ids by line (an empty row has one empty line). */
export function rowActions(
    segment: BusinessSegmentEngagementValue,
    channelId: string,
    stage: string
): { ids: string[]; texts: string[] } {
    const channel = segment.channels.find(candidate => candidate.id === channelId);
    const ids = channel?.actionIds[stage] ?? [];
    const texts = ids.map(id => segment.actions.find(action => action.id === id)?.text ?? "");
    return { ids, texts };
}

function withRow(
    segment: BusinessSegmentEngagementValue,
    channelId: string,
    stage: string,
    ids: string[],
    actions: BusinessChannelActionValue[]
): BusinessSegmentEngagementValue {
    const held = new Set<string>();
    const channels = segment.channels.map(channel => {
        const actionIds = channel.id === channelId ? { ...channel.actionIds, [stage]: ids } : channel.actionIds;
        Object.values(actionIds).flat().forEach(id => held.add(id));
        const texts = Object.fromEntries(Object.entries(actionIds)
            .map(([row, rowIds]) => [row, rowIds.map(id => actions.find(action => action.id === id)?.text ?? "")]));
        return { ...channel, actionIds, actions: texts };
    });
    return { ...segment, channels, actions: actions.filter(action => held.has(action.id)) };
}

/**
 * A row's lines after an edit (NumberedListInput's items and origins):
 * a line from before keeps its action, and writes its text into it; a
 * new line is a new action.
 */
export function withRowLines(
    segment: BusinessSegmentEngagementValue,
    channelId: string,
    stage: string,
    items: readonly string[],
    origins: readonly number[]
): BusinessSegmentEngagementValue {
    const before = rowActions(segment, channelId, stage).ids;
    let actions = [...segment.actions];
    const ids = items.map((text, index) => {
        const origin = origins[index] ?? -1;
        const id = origin >= 0 ? before[origin] : undefined;
        if (id) {
            actions = actions.map(action => action.id === id && action.text !== text ? { ...action, text } : action);
            return id;
        }
        const created = { id: randomId("action"), text };
        actions.push(created);
        return created.id;
    });
    return withRow(segment, channelId, stage, ids, actions);
}

/**
 * One of the Segment's actions chosen on a line: that line holds it
 * now (the same action, not a copy), and what the line held before is
 * let go.
 */
export function withChosenAction(
    segment: BusinessSegmentEngagementValue,
    channelId: string,
    stage: string,
    line: number,
    actionId: string
): BusinessSegmentEngagementValue {
    const ids = [...rowActions(segment, channelId, stage).ids];
    if (line < ids.length) {
        ids[line] = actionId;
    } else {
        ids.push(actionId);
    }
    return withRow(segment, channelId, stage, ids, segment.actions);
}

/** The rows that hold an action, in the table's words: "Instagram › Discovery". */
export function actionPlaces(segment: BusinessSegmentEngagementValue, actionId: string): string[] {
    return segment.channels.flatMap(channel => Object.entries(channel.actionIds)
        .filter(([, ids]) => ids.includes(actionId))
        .map(([stage]) => (channel.name.trim() || "Unnamed channel") + " › " +
            (BUSINESS_JOURNEY_STAGES.find(candidate => candidate.id === stage)?.label ?? stage)));
}
