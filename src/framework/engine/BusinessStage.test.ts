import { describe, expect, it } from "vitest";

import { stageEnds, stageMessages, stageOf } from "./BusinessStage.ts";

const day = (iso: string) => new Date(iso + "T12:00:00");

describe("the business stage from the Opening Date", () => {

    it("is planning before the Opening Date and with none, launching from it, managing from 12 months after it, growing from 24", () => {

        const today = day("2026-10-24");
        expect(stageOf("", today)).toBe("plan");
        expect(stageOf("2026-10-25", today)).toBe("plan");
        expect(stageOf("2026-10-24", today)).toBe("launch");
        expect(stageOf("2025-10-25", today)).toBe("launch");
        expect(stageOf("2025-10-24", today)).toBe("manage");
        expect(stageOf("2024-10-25", today)).toBe("manage");
        expect(stageOf("2024-10-24", today)).toBe("grow");

    });

    it("follows a changed Opening Date at once", () => {

        const today = day("2026-10-24");
        expect(stageOf("2026-03-01", today)).toBe("launch");
        expect(stageOf("2027-03-01", today)).toBe("plan");

    });

});

describe("what the Review says of the stage's time", () => {

    const today = day("2026-10-24");

    it("says the time left to the opening while planning, and warns of a planning that ran long", () => {

        expect(stageMessages("2027-01-24", "2026-10-01", today)[0]).toBe("Planning: 3 months to the Opening Date (24 Jan 2027). Planning is meant to take 3 months.");
        expect(stageMessages("2027-01-24", "2026-05-01", today)[0]).toContain("The planning has run 5 months, longer than the 3 it is meant to take");
        expect(stageMessages("", "", today)[0]).toContain("no Opening Date is set");

    });

    it("says how far into the window the launching, the managing and the growing are, and what is left", () => {

        expect(stageMessages("2026-04-24", "", today)[0]).toBe("Launching: month 7 of 12 since the Opening Date (24 Apr 2026). 6 months left to prove the Early Positioning Statement or change it, until 24 Apr 2027.");
        expect(stageMessages("2025-12-24", "", today)[0]).toContain("Only 2 months left");
        expect(stageMessages("2025-04-24", "", today)[0]).toBe("Managing: 6 months left of the Core Market Positioning's horizon, until 24 Apr 2027 (the Opening Date was 24 Apr 2025).");
        expect(stageMessages("2023-04-24", "", today)[0]).toContain("Growing: year 2 of 3 of the stage");
        expect(stageMessages("2020-04-24", "", today)[0]).toContain("past its 3-year window");

    });

});

describe("the stages' durations", () => {

    const today = day("2026-10-24");

    it("move the stages: the opening, then Launching, Managing and Growing for as long as each is set", () => {

        const longer = { planning: 6, launching: 18, managing: 6, growing: 2 };
        // Opened 15 months ago: launching by the defaults' 12... no longer; with 18 months it still is.
        expect(stageOf("2025-07-24", today)).toBe("manage");
        expect(stageOf("2025-07-24", today, longer)).toBe("launch");
        // Opened 22 months ago: managing with the longer launching (18, then 6 more), growing with the defaults.
        expect(stageOf("2024-12-24", today)).toBe("manage");
        expect(stageOf("2024-12-24", today, longer)).toBe("manage");
        expect(stageOf("2024-04-24", today, longer)).toBe("grow");

    });

    it("sum into the ends of the windows, the Growing years counted as twelve months each", () => {

        expect(stageEnds()).toEqual({ launching: 12, managing: 24, growing: 60 });
        expect(stageEnds({ planning: 3, launching: 6, managing: 6, growing: 1 })).toEqual({ launching: 6, managing: 12, growing: 24 });

    });

    it("change what the Review says: the planning's length and the launching's months", () => {

        const durations = { planning: 2, launching: 9, managing: 12, growing: 3 };
        expect(stageMessages("2027-01-24", "2026-05-01", today, durations)[0]).toContain("longer than the 2 it is meant to take");
        expect(stageMessages("2026-04-24", "", today, durations)[0]).toContain("month 7 of 9");

    });

});
