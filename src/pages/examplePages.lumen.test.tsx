import { describe, expect, it, vi } from "vitest";

import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { describeExamplePages, EXAMPLES, openPage, useExamplesSaved } from "./examplePagesShared";

/* Every page of Lumen & Loom Studio, as it reads today (examplePagesShared.tsx says why), and the Financials page. */

vi.mock("../components/calendar/OrganizationCalendarPanel", () => ({ default: () => null }));

useExamplesSaved();
describeExamplePages(EXAMPLES.lumen);

/* THE FINANCIALS IN ONE CHAPTER (owner, 2026-11-20 02:11 UTC+2: "The financials should be in a single page. Maybe they should all be under only one chapter."):
   one frame, its six Master Tiles in the order each reads only what stands before it (Questions 20, section 11). */
describe("the Financials page", () => {
    it("draws one chapter of three Master Tiles that ask, each after what it reads (Questions 20, section 14: Cash Flow and Break-Even & Sustainability are records, in the Workbook)", () => {
        const section = frameworkRegistry.getFramework("business").sections.find(candidate => candidate.title.startsWith("Revenue & Pricing"))!;
        const { container } = openPage(EXAMPLES.lumen.id, "business", section.number);
        expect([...container.querySelectorAll(".tiles-frame-head")].map(head => head.textContent?.trim())).toEqual(["Financial Foundation"]);
        const titles = [...container.querySelectorAll<HTMLElement>("[data-anchor^=\"column-tiles\"] .section-tile-title")].map(title => title.textContent?.replace(/\s+/g, " ").trim().toLowerCase());
        expect(titles).toEqual(["revenue streams", "cost of each offering", "funding"]);
    });
});
