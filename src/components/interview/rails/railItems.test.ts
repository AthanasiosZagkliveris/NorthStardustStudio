import { describe, expect, it } from "vitest";

import { pageIndexFromRailId, pageRailItems, pickActiveRail, railId, sectionRailItems } from "./railItems";
import { AnswerType } from "../../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../../framework/model/AnswerDefinition";

describe("railId", () => {
    it("slugs a label", () => {
        expect(railId("Offering's Capability")).toBe("offering-s-capability");
        expect(railId("Icon & Logo")).toBe("icon-logo");
    });
});

describe("pageRailItems", () => {
    it("numbers each page and strips the Strategy period placeholder", () => {
        expect(pageRailItems([
            { number: 1, title: "Situation & Direction" },
            { number: 2, title: "Goals & Objectives MM/YY - MM/YY" }
        ])).toEqual([
            { id: "page-1", label: "1. Situation & Direction" },
            { id: "page-2", label: "2. Goals & Objectives" }
        ]);
    });
});

describe("pageIndexFromRailId", () => {
    it("turns a page rail id back into the 0-based page index", () => {
        expect(pageIndexFromRailId("page-1")).toBe(0);
        expect(pageIndexFromRailId("page-14")).toBe(13);
    });
});

describe("sectionRailItems", () => {
    it("uses the parts of a columns page", () => {
        const answer = {
            type: AnswerType.MultiPart,
            columns: true,
            parts: [{ id: "mission", label: "Mission" }, { id: "vision", label: "Vision" }]
        } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([
            { id: "mission", label: "Mission" },
            { id: "vision", label: "Vision" }
        ]);
    });

    it("uses the fixed sub-sections of a bespoke page", () => {
        const answer = { type: AnswerType.BusinessCapability } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([
            { id: "infrastructure", label: "Infrastructure" },
            { id: "offering-s-capability", label: "Offering's Capability" }
        ]);
    });

    it("lists Themes on the Goals and Roadmap pages", () => {
        const answer = { type: AnswerType.StrategicRoadmap } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer, [
            { id: "t1", name: "Financial Stability", description: "" },
            { id: "t2", name: "", description: "" }
        ])).toEqual([
            { id: "t1", label: "Financial Stability" },
            { id: "t2", label: "Theme 2" }
        ]);
    });

    it("is empty for pages without sub-sections", () => {
        expect(sectionRailItems({ type: AnswerType.FreeText } as unknown as AnswerDefinition)).toEqual([]);
        expect(sectionRailItems(undefined)).toEqual([]);
    });
});

describe("pickActiveRail", () => {
    it("picks the last section whose top has passed the threshold", () => {
        expect(pickActiveRail([100, 600, 1400], 700)).toBe(1);
    });
    it("picks the first of several sections sharing a row", () => {
        expect(pickActiveRail([300, 300, 300, 300], 700)).toBe(0);
    });
    it("falls back to the first section before any has passed", () => {
        expect(pickActiveRail([900, 1500], 700)).toBe(0);
    });
});
