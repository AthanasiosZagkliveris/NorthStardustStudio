import { describe, expect, it } from "vitest";

import { keyDateText, keyDates, relativeDay } from "./KeyDates.ts";

const day = (iso: string) => new Date(iso + "T12:00:00");

describe("the key dates", () => {

    const today = day("2026-10-24");

    it("are the plan's start, the registration, the opening and the ends of the stage windows, in time order, each behind or ahead", () => {

        const entries = keyDates({ planStart: "2026-03-01", registrationDate: "2026-03-02", openingDate: "2026-10-01" }, today);
        expect(entries.map(entry => [entry.id, entry.date, entry.when])).toEqual([
            ["plan-start", "2026-03-01", "past"],
            ["registered", "2026-03-02", "past"],
            ["opening", "2026-10-01", "past"],
            ["launching-ends", "2027-10-01", "ahead"],
            ["managing-ends", "2028-10-01", "ahead"],
            ["growing-ends", "2031-10-01", "ahead"]
        ]);

    });

    it("leave out a date that is missing, and the windows with no Opening Date", () => {

        expect(keyDates({ planStart: "2026-03-01", registrationDate: "", openingDate: "" }, today).map(entry => entry.id)).toEqual(["plan-start"]);
        expect(keyDates({ planStart: "", registrationDate: "", openingDate: "" }, today)).toEqual([]);

    });

    it("say how far each is: today, days, months, years", () => {

        expect(relativeDay("2026-10-24", today)).toBe("today");
        expect(relativeDay("2026-10-01", today)).toBe("23 days ago");
        expect(relativeDay("2027-10-01", today)).toBe("in 11 months");
        expect(relativeDay("2031-10-01", today)).toBe("in 4.9 years");
        const opening = keyDates({ planStart: "", registrationDate: "", openingDate: "2026-10-01" }, today).find(entry => entry.id === "opening")!;
        expect(keyDateText(opening, today)).toBe("Opening Date: 1 Oct 2026 (23 days ago), the business opens: Launching begins.");

    });

});
