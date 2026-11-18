import { describe, expect, it } from "vitest";
import { COMPETITOR_CHANNEL_OPTIONS, COMPETITOR_SUBCHANNELS } from "./CompetitorQuestions";
import { givesWorkingHours } from "./capability/partnerGroups";

/* The owner's points of 2026-11-18 02:31. */

describe("K5: every channel a competitor uses opens its list of subchannels", () => {
    it("gives each of K5's channels a list, Online / live's the live tools", () => {
        expect(COMPETITOR_CHANNEL_OPTIONS.filter(option => (COMPETITOR_SUBCHANNELS[option.id] ?? []).length === 0).map(option => option.id)).toEqual([]);
        expect(COMPETITOR_SUBCHANNELS["online-live"].map(option => option.label)).toEqual(["Zoom", "Google Meet", "Microsoft Teams", "Live Stream"]);
        expect(COMPETITOR_SUBCHANNELS.email.map(option => option.label)).toContain("Newsletter");
    });
});

describe("Delivery: only the people who give working hours", () => {
    const card = (group: string, frequency: string, hoursAvailable = "") => ({ group, hoursAvailable, cost: { frequency } });
    it("keeps a contractor, leaves out a courier and a payment service, keeps one that says its hours or holds some", () => {
        expect(givesWorkingHours(card("contractors-advisers", "per-unit"))).toBe(true);
        expect(givesWorkingHours(card("logistics-fulfilment", "per-unit"))).toBe(false);
        expect(givesWorkingHours(card("platforms-payments", "percent-revenue"))).toBe(false);
        expect(givesWorkingHours(card("logistics-fulfilment", "per-unit", "10"))).toBe(true);
        expect(givesWorkingHours(card("producers-wholesalers", "per-unit"), true)).toBe(true);
    });
});
