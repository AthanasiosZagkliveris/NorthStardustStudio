import { describe, expect, test } from "vitest";

import { InterviewSession } from "../../interview";
import { AnswerType } from "../../enums/AnswerType.ts";
import { frameworkRegistry } from "../FrameworkRegistry.ts";
import { asBusinessCapabilityValue } from "../AnswerUtils.ts";
import { reviewItems } from "../ReviewItems.ts";
import { neededSkillLine, neededSkills, skillCover, skillGroups, skillsOf, teamNames } from "./skills.ts";
import lumenText from "../../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../../data/examples/quillfield-automation-llc.json?raw";

type Saved = { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> & Record<string, { responses: Record<string, { value: unknown }> }> };
const lumen = JSON.parse(lumenText) as Saved;
const quill = JSON.parse(quillText) as Saved;
const capabilityOf = (example: Saved) => asBusinessCapabilityValue(example.systems["3"].responses["2"].value);
const LUMEN_FOUNDERS = { "founder-3aux8uyh": "Maya Chen", "founder-z2jgpf8v": "Oliver Grant", "founder-3fhkh0cm": "Priya Shah" };

describe("LC1, the skills the business still needs (Capacity & Delivery; owner, 2026-11-16 20:25)", () => {

    test("the Legal Entity's Gaps and Cover are read once: Gaps as Other rows, one a sentence; Cover as the Notes", () => {
        const unsaved = { skillsNeeded: undefined };
        expect(skillsOf(unsaved, { teamGaps: "No one sells. No bookkeeping!\nNo cover for holidays.", teamCover: " A CPA covers the books. " })).toEqual({
            ticked: ["other"],
            other: ["No one sells.", "No bookkeeping!", "No cover for holidays."],
            notes: "A CPA covers the books."
        });
        expect(skillsOf(unsaved, { teamGaps: "", teamCover: "" })).toEqual({ ticked: [], other: [], notes: "" });
        // Once saved, the answer is the one owner: the old text is never read again.
        expect(skillsOf({ skillsNeeded: ["selling"], skillsOther: [], skillsNotes: "Mentor" }, { teamGaps: "Old gaps.", teamCover: "Old cover." }))
            .toEqual({ ticked: ["selling"], other: [], notes: "Mentor" });
    });

    test("the parser keeps the skills only once they are saved", () => {
        expect(asBusinessCapabilityValue({}).skillsNeeded).toBeUndefined();
        const saved = asBusinessCapabilityValue({ skillsNeeded: ["selling", "selling", "design"], skillsOther: ["Translation"], skillsNotes: "Notes" });
        expect([saved.skillsNeeded, saved.skillsOther, saved.skillsNotes]).toEqual([["selling", "design"], ["Translation"], "Notes"]);
    });

    test("a skill's cover is the Team of its group's activities: Marketing; Selling and Customer service, Sales; Making and Delivery, Production; the rest Infrastructure", () => {
        expect(skillGroups("marketing")).toEqual(["marketing"]);
        expect(skillGroups("service")).toEqual(["sales"]);
        expect(skillGroups("delivery")).toEqual(["production"]);
        expect(skillGroups("bookkeeping")).toEqual(["pre-operational", "operational"]);
        expect(skillGroups("other")).toEqual(["pre-operational", "operational"]);

        const capability = capabilityOf(lumen);
        const names = teamNames(capability, LUMEN_FOUNDERS);
        expect(skillCover(capability, "marketing", names).map(entry => entry.name)).toEqual(["Oliver Grant", "Maya Chen"]);
        expect(skillCover(capability, "making", names).map(entry => entry.name)).toEqual(["Maya Chen", "Priya Shah", "FlameGuard Finishing"]);
        expect(skillCover(capability, "bookkeeping", names).map(entry => entry.name)).toContain("Accountant");
        expect(skillCover(capability, "bookkeeping", names).map(entry => entry.name)).not.toContain("Lawyer");
        expect(skillCover(capability, "legal", names).map(entry => entry.name)).toContain("Lawyer");
        expect(skillCover(capability, "legal", names).map(entry => entry.name)).not.toContain("Accountant");
    });

    test("each example's needed skills read with their cover; a group with no one on its Team is not covered yet", () => {
        expect(neededSkills(capabilityOf(lumen), undefined, LUMEN_FOUNDERS).map(neededSkillLine)).toEqual([
            "Marketing and social media: covered by Oliver Grant, Maya Chen",
            // (By the activities whose name says it -- "Launch website and journal" --, not every Infrastructure performer: owner, 2026-11-18 02:31.)
            "Website and technology: covered by Oliver Grant",
            "Making or producing: covered by Maya Chen, Priya Shah, FlameGuard Finishing"
        ]);
        expect(neededSkills(capabilityOf(quill), undefined, { "founder-q7m2x4ke": "Jordan Ellis" }).map(skill => skill.label)).toEqual([
            "Bookkeeping and tax", "Legal and contracts", "Marketing and social media", "Selling", "Cover for holidays or illness"
        ]);

        const capability = capabilityOf(lumen);
        const noMarketing = { ...capability, offering: { ...capability.offering, activities: capability.offering.activities.filter(activity => activity.category !== "marketing") } };
        expect(neededSkills(noMarketing, undefined, LUMEN_FOUNDERS).map(neededSkillLine)[0]).toBe("Marketing and social media: not covered yet");
    });

    test("the Review lists each skill not covered yet, linking to Capacity & Delivery", () => {
        const ids: Record<number, string> = { 1: "identity", 2: "brand", 3: "business", 4: "strategy" };
        const titles = { 1: "1. Identity System", 2: "2. Brand System", 3: "3. Business System", 4: "4. Strategy System" };
        const sessions = Object.fromEntries([1, 2, 3, 4].map(number => [number,
            InterviewSession.fromJSON(lumen.systems[String(number)], frameworkRegistry.getFramework(ids[number]))])) as Record<number, InterviewSession | null>;
        const business = sessions[3]!;
        const page = business.getSections().find(section => section.answer?.type === AnswerType.BusinessCapability)!;
        const capability = asBusinessCapabilityValue(business.getResponse(page.number));
        business.saveResponse(page.number, { ...capability, skillsNeeded: ["marketing", "making"], offering: { ...capability.offering, activities: capability.offering.activities.filter(activity => activity.category !== "marketing") } });

        const items = reviewItems({ sessions, titles, organisationName: "Lumen" }).filter(item => item.text.includes("not covered yet"));
        expect(items).toHaveLength(1);
        expect(items[0].group).toBe("missing");
        expect(items[0].text).toBe("Marketing and social media is not covered yet: 3. Business System → " + page.number + ". Infrastructure & Capability → Capacity & Delivery.");
        expect(items[0].place).toMatchObject({ systemNumber: 3, sectionNumber: page.number, anchors: ["section-offering-delivery"] });
    });

});
