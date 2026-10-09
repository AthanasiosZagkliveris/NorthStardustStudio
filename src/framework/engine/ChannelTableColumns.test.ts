import { describe, expect, test } from "vitest";

import { BUSINESS_CHANNEL_CATEGORIES } from "./AnswerUtils.ts";
import { ACTION_SHARE, OFFERINGS_SHARE, channelPresetNames, fittedColumns, journeyStageLabels, shareTheRest, widest } from "./ChannelTableColumns.ts";

describe("the Customer Channel table's fitted columns", () => {

    test("the Journey Stage picker is made for the longest stage, the Channel one for the longest preset name", () => {
        expect(journeyStageLabels()).toContain("Support & Follow Up");
        const names = channelPresetNames();
        expect(names).toContain("Booking / Registration Page");
        expect(names).toContain("Third-party Fulfilment");
        expect(names).toContain("Physical Delivery");
        expect(names).toContain("Other");
        for (const category of BUSINESS_CHANNEL_CATEGORIES) {
            expect(names).toContain(category.label);
        }
        expect(new Set(names).size).toBe(names.length);
    });

    test("a column is its picker (widest option and chrome, rounded up), what stands beside it and the cell padding at both sides", () => {
        const widths = fittedColumns({
            cellPadding: 12,
            stageText: 173.8, stageChrome: 33.3, stageBeside: 44,
            nameText: 242.1, nameChrome: 44.7, nameBeside: 126
        });
        expect(widths.stage).toBe(Math.ceil(173.8 + 33.3 + 2) + 44 + 24);
        expect(widths.channel).toBe(Math.ceil(242.1 + 44.7 + 2) + 126 + 24);
    });

    test("Offerings and Action share the rest of the table whole pixel by whole pixel, Action the larger part", () => {
        const { offerings, action } = shareTheRest(1330, { stage: 278, channel: 440 });
        expect(offerings + action).toBe(1330 - 278 - 440);
        expect(action).toBeGreaterThan(offerings);
        expect(shareTheRest(500, { stage: 278, channel: 440 })).toEqual({ offerings: 0, action: 0 });
    });

    test("the widest of some widths, and Action takes the larger share of what is left", () => {
        expect(widest([3, 9, 4])).toBe(9);
        expect(widest([])).toBe(0);
        expect(OFFERINGS_SHARE + ACTION_SHARE).toBeCloseTo(1);
        expect(ACTION_SHARE).toBeGreaterThan(OFFERINGS_SHARE);
    });

});

describe("the Journey Stage column keeps its add button on one line", () => {

    test("it is never narrower than the button (with the slack) and the cell padding at both sides", () => {
        const base = { cellPadding: 12, stageText: 173.8, stageChrome: 33.3, stageBeside: 44, nameText: 242.1, nameChrome: 44.7, nameBeside: 126 };
        // The picker row alone: 209 + 44 + 24.
        expect(fittedColumns(base).stage).toBe(Math.ceil(173.8 + 33.3 + 2) + 44 + 24);
        // "+ ADD JOURNEY STAGE" measured 272.1px wide: the column holds it whole.
        expect(fittedColumns({ ...base, stageButton: 272.1 }).stage).toBe(Math.ceil(272.1 + 2) + 24);
        // A button narrower than the picker row changes nothing.
        expect(fittedColumns({ ...base, stageButton: 120 }).stage).toBe(fittedColumns(base).stage);
        // The Channel column is untouched by it.
        expect(fittedColumns({ ...base, stageButton: 272.1 }).channel).toBe(fittedColumns(base).channel);
    });

});
