import { afterEach, describe, expect, it, vi } from "vitest";

import type { PageStatus } from "../framework/engine/PageStatus";
import type { FrameworkSystem } from "../types/system";
import { continuePlace } from "./ProgressService";
import { OrganizationService } from "./OrganizationService";

/** Each Foundation System's pages, by System number, as a test sets them. */
function pagesFrom(statuses: Record<number, PageStatus[]>) {
    return (_organizationId: string, system: FrameworkSystem) =>
        (statuses[system.number] ?? []).map((status, index) => ({
            number: index + 1,
            title: "Page " + (index + 1),
            status
        }));
}

const DONE: PageStatus[] = ["defined", "defined", "defined", "defined", "defined"];

function lastWorked(systemNumber: number, sectionIndex: number, anchor?: string) {
    vi.spyOn(OrganizationService, "getLastPlace").mockReturnValue(anchor ? { systemNumber, sectionIndex, anchor } : { systemNumber, sectionIndex });
}

afterEach(() => vi.restoreAllMocks());

describe("Continue where you left off", () => {

    it("goes back to the last page while it is not yet defined", () => {

        lastWorked(3, 1, "segments");

        const place = continuePlace("org", pagesFrom({ 3: ["defined", "in-progress", "not-started"] }));

        expect(place).toMatchObject({ prefix: "Continue", sectionNumber: 2, anchor: "segments", label: "3. Business System — 2. Page 2" });

    });

    it("moves on to the System's first page not defined once the last page is", () => {

        lastWorked(3, 0, "segments");

        const place = continuePlace("org", pagesFrom({ 3: ["defined", "defined", "in-progress", "not-started"] }));

        expect(place).toMatchObject({ prefix: "Continue", sectionNumber: 3, label: "3. Business System — 3. Page 3" });
        expect(place?.anchor).toBeUndefined();

    });

    it("offers the next Foundation System, in order, once this one is defined", () => {

        lastWorked(3, 4);

        const place = continuePlace("org", pagesFrom({
            1: ["defined", "in-progress"],
            2: ["not-started"],
            3: DONE,
            4: ["not-started"]
        }));

        expect(place).toMatchObject({ prefix: "Next", sectionNumber: 2, label: "1. Identity System — 2. Page 2" });
        expect(place?.system.number).toBe(1);

    });

    it("shows nothing once every Foundation page is defined", () => {

        lastWorked(2, 0);

        expect(continuePlace("org", pagesFrom({ 1: DONE, 2: DONE, 3: DONE, 4: DONE }))).toBeNull();

    });

    it("shows nothing when nothing has been worked on, or the place is gone", () => {

        vi.spyOn(OrganizationService, "getLastPlace").mockReturnValue(null);
        expect(continuePlace("org", pagesFrom({ 1: ["not-started"] }))).toBeNull();

        lastWorked(3, 40);
        expect(continuePlace("org", pagesFrom({ 3: ["in-progress"] }))).toBeNull();

    });

});
