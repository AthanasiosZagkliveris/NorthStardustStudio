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
            { id: "mission", label: "1. Mission" },
            { id: "vision", label: "2. Vision" }
        ]);
    });

    it("is empty for a stacked Multi-Part page", () => {
        const answer = {
            type: AnswerType.MultiPart,
            columns: false,
            parts: [{ id: "a", label: "A" }, { id: "b", label: "B" }]
        } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([]);
    });

    it("is empty for a tabbed Multi-Part page", () => {
        const answer = {
            type: AnswerType.MultiPart,
            tabbed: true,
            columns: true,
            parts: [{ id: "a", label: "A" }, { id: "b", label: "B" }]
        } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([]);
    });

    it("omits unlabeled parts of a columns page", () => {
        const answer = {
            type: AnswerType.MultiPart,
            columns: true,
            parts: [{ id: "primary", label: "" }, { id: "blank", label: "  " }, { id: "vision", label: "Vision" }]
        } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([{ id: "vision", label: "3. Vision" }]);
    });

    it("uses the fixed sub-sections of a bespoke page", () => {
        const answer = { type: AnswerType.BusinessCapability } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer)).toEqual([
            { id: "infrastructure", label: "1. Infrastructure" },
            { id: "offering-s-capability", label: "2. Offering's Capability" }
        ]);
    });

    it("lists Themes on the Goals and Roadmap pages", () => {
        const answer = { type: AnswerType.StrategicRoadmap } as unknown as AnswerDefinition;
        expect(sectionRailItems(answer, [
            { id: "t1", name: "Financial Stability", description: "" },
            { id: "t2", name: "", description: "" }
        ])).toEqual([
            { id: "t1", label: "1. Financial Stability" },
            { id: "t2", label: "2. Theme 2" }
        ]);
    });

    it("numbers the Legal Entity page's sections on their own", () => {
        const answer = { type: AnswerType.LegalEntity, nestedNumbering: true } as unknown as AnswerDefinition;
        const labels = sectionRailItems(answer).map(item => item.label);
        expect(labels[0]).toBe("1. Organization");
        expect(labels[1]).toBe("2. Founders & Ownership");
        expect(labels[5]).toBe("6. Legal Entity Expenses");
    });

    it("carries on a running count where the page does", () => {
        const columns = {
            type: AnswerType.MultiPart,
            columns: true,
            parts: [{ id: "mission", label: "Mission" }, { id: "vision", label: "Vision" }]
        } as unknown as AnswerDefinition;
        expect(sectionRailItems(columns, [], 5).map(item => item.label)).toEqual(["5. Mission", "6. Vision"]);

        const style = { type: AnswerType.BrandStyle } as unknown as AnswerDefinition;
        expect(sectionRailItems(style, [], 5)[0].label).toBe("5. Colours");

        // A page that never continues the count starts from 1 regardless.
        const capability = { type: AnswerType.BusinessCapability } as unknown as AnswerDefinition;
        expect(sectionRailItems(capability, [], 5)[0].label).toBe("1. Infrastructure");
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
