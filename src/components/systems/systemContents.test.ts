import { describe, expect, it } from "vitest";
import { systems } from "../../data/systems";
import { lineWords, systemContents } from "./systemContents";

describe("what a System's tile lists (owner, 2026-11-23 17:28 UTC+2)", () => {

    const of = (title: string) => systemContents(systems.find(system => system.title === title)!);

    it("lists the pages of a System of several pages, the chapters of one page, the master tiles of one chapter", () => {
        expect(of("Business System")).toEqual({ kind: "Pages", lines: [{ label: "Foundation & Engagement" }, { label: "Infrastructure & Capability" }, { label: "Financials" }] });
        expect(of("Identity System").kind).toBe("Chapters");
        expect(of("Strategy System").kind).toBe("Sections");
    });

    it("leaves the System's own word off a line, and shows an abbreviation with its full words as the tooltip", () => {
        const quality = systems.find(system => system.title === "Quality System")!;
        expect(lineWords("Quality Standards", quality)).toEqual({ label: "Standards", full: "Quality Standards" });
        expect(lineWords("Key Performance Indicators (KPI)", quality)).toEqual({ label: "KPI", full: "Key Performance Indicators" });
        expect(lineWords("Corrective Actions", quality)).toEqual({ label: "Corrective Actions" });
    });

});
