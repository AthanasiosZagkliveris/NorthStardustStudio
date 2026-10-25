import { beforeEach, describe, expect, it } from "vitest";

import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";
import { OrganizationService, type OrganizationDocument } from "./OrganizationService";
import { organizationReview } from "./ReviewService";

/**
 * THE EXAMPLES ARE COMPLETE: each example organization, read as the app reads it, leaves nothing for the Review to list (no page, section or card is missing
 * what it needs). The examples are the reference for every check; a change to the interface is followed by a change to them (src/data/examples).
 */
beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

    it("leaves nothing in the Review", () => {
        const document = JSON.parse(JSON.stringify(example)) as OrganizationDocument;
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: document.id, name: document.name, createdAt: document.createdAt }]));
        OrganizationService.saveDocument(document);
        OrganizationService.flushPendingWrites();
        const items = organizationReview(document.id);
        // (The "second look" items are the finance pages' own findings -- a funding gap, a runway -- which the examples keep on purpose; the key dates are milestones, not things left to do.)
        expect(items.filter(item => item.group !== "second-look" && item.group !== "key-dates").map(item => JSON.stringify(item).slice(0, 200))).toEqual([]);
    });

});

describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s's key dates", (_name, example) => {

    it("has the plan's start, the opening and the ends of the stage windows, in time order", () => {
        const document = JSON.parse(JSON.stringify(example)) as OrganizationDocument;
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: document.id, name: document.name, createdAt: document.createdAt }]));
        OrganizationService.saveDocument(document);
        OrganizationService.flushPendingWrites();
        const keys = organizationReview(document.id).filter(item => item.group === "key-dates").map(item => item.text.split(":")[0]);
        expect(keys).toEqual(expect.arrayContaining(["Plan starts", "Opening Date", "Launching window ends", "Managing window ends", "Growing window ends"]));
        expect(keys.indexOf("Plan starts")).toBeLessThan(keys.indexOf("Opening Date"));
        expect(keys.indexOf("Opening Date")).toBeLessThan(keys.indexOf("Launching window ends"));
    });

});

describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s on the Calendar", (_name, example) => {

    it("marks the key dates, the opening among them, as one kind of date", async () => {
        const { getCalendarTasks } = await import("./CalendarTaskService");
        const document = JSON.parse(JSON.stringify(example)) as OrganizationDocument;
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: document.id, name: document.name, createdAt: document.createdAt }]));
        OrganizationService.saveDocument(document);
        OrganizationService.flushPendingWrites();
        const keys = getCalendarTasks(document.id).filter(task => task.kind === "key-date").map(task => task.name);
        expect(keys).toEqual(expect.arrayContaining(["Plan starts", "Opening Date", "Launching window ends", "Managing window ends", "Growing window ends"]));
        // (The opening and the registration are key dates, not dates of a kind of their own.)
        expect(getCalendarTasks(document.id).some(task => (task.kind as string) === "opening" || (task.kind as string) === "formation")).toBe(false);
    });

});
