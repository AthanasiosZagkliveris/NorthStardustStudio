import { beforeEach, describe, expect, it } from "vitest";
import { OrganizationService, type OrganizationDocument } from "./OrganizationService";
import { organizationReview } from "./ReviewService";
import { asBrandStyleValue, asBusinessCapabilityValue, asBusinessEngagementValue, asBusinessFoundationValue, asFoundersProfileValue, asLegalEntityValue, asStrategicPeriodValue, asStrategyFoundationValue } from "../framework/engine/answers/AnswerUtils";
import { asFinancialFoundationValue, asFinancialSustainabilityValue } from "../framework/engine/financial/FinancialModel";
import { refreshExampleOrganizations } from "./ExampleOrganizations";
import { SEGMENT_QUESTIONS, segmentQuestionAsked, segmentSettleSaved } from "../framework/engine/choices/SegmentQuestions";
import { stageOf } from "../framework/engine/BusinessStage";
import { fitPositioningToStage } from "../components/interview/editors/legal/shared";
import { segmentContextFor, segmentPositioningShown } from "../components/interview/editors/foundation/identityLink";
import { asProfileAnswers, profileSettle } from "../framework/engine/choices/ProfileQuestions";
import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";

/* THE TWO EXAMPLE ORGANISATIONS (Lumen & Loom Studio, Quillfield Automation LLC): complete, in step with the code, loaded and refreshed in the browser. */

describe("the examples are complete", () => {
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

    /**
     * EVERY SUBCHANNEL OF AN EXAMPLE IS NAMED AND EVERY SUGGESTION IS MET (owner, 2026-11-14 14:03: two "Unnamed subchannel" cards under Online / Live -- the
     * Relationship Types' after-sale help suggested the channel, and no subchannel answered it): no channel without a name, and no channel the answers suggest left
     * standing as a suggestion only.
     */
    describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s's channels", (_name, example) => {

        it("names every subchannel and answers every channel its answers suggest", async () => {
            const { asBusinessEngagementValue, businessFoundationSegments } = await import("../framework/engine/answers/AnswerUtils.ts");
            const { journeySuggestions, suggestionCovered } = await import("../framework/engine/JourneySuggestions.ts");
            const responses = (example as unknown as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> }).systems["3"].responses;
            const segments = businessFoundationSegments(responses.find(response => response.sectionNumber === 1)!.value);
            const engagement = asBusinessEngagementValue(responses.find(response => response.sectionNumber === 2)!.value);
            const unnamed = engagement.segments.flatMap(segment => segment.channels.filter(channel => !channel.name.trim()).map(channel => segment.segmentId + " " + channel.category));
            const unmet = segments.flatMap(segment => {
                const channels = engagement.segments.find(entry => entry.segmentId === segment.id)?.channels ?? [];
                return journeySuggestions(segment).filter(suggestion => !suggestionCovered(suggestion, channels)).map(suggestion => segment.id + " " + suggestion.stage + " " + suggestion.category + " " + suggestion.name);
            });
            expect(unnamed).toEqual([]);
            expect(unmet).toEqual([]);
        });

    });
});

describe("the examples match the code that reads them", () => {
    /**
     * THE EXAMPLES ARE CURRENT: each saved page of an example, read by the app's own reader for that page, comes back as it was saved. A field the interface gained since the
     * example was written (it would be filled with a default), or one it dropped, shows here: the example is then reworked (src/data/examples is the one copy).
     */
    const PAGES: { system: number; section: number; name: string; read: (value: unknown) => unknown }[] = [
        { system: 1, section: 3, name: "Legal Entity", read: asLegalEntityValue },
        { system: 1, section: 4, name: "Founders Profile", read: asFoundersProfileValue },
        { system: 2, section: 2, name: "Brand Style", read: (value) => ({ ...(asBrandStyleValue(value) as object) }) },
        { system: 3, section: 1, name: "Business Foundation", read: asBusinessFoundationValue },
        { system: 3, section: 2, name: "Customer Engagement", read: asBusinessEngagementValue },
        { system: 3, section: 3, name: "Infrastructure & Capability", read: asBusinessCapabilityValue },
        // (Revenue & Pricing is Section 4, Costs, Funding & Position Section 5 since 2026-11-17: Questions 20, section 11.)
        { system: 3, section: 4, name: "Revenue & Pricing", read: asFinancialSustainabilityValue },
        { system: 3, section: 5, name: "Costs, Funding & Position", read: asFinancialFoundationValue },
        { system: 4, section: 1, name: "Situation & Direction", read: asStrategyFoundationValue },
        { system: 4, section: 2, name: "Goals & Objectives", read: asStrategicPeriodValue }
    ];

    /** The environment the update command is asked in (the tests are not typed against Node). */
    const ENV = (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

    /** The paths where `read` differs from `saved`: added, removed or changed (the first few of each). */
    function differences(saved: unknown, read: unknown, path = "", out: string[] = []): string[] {
        if (out.length > 40) {
            return out;
        }
        if (Array.isArray(saved) && Array.isArray(read)) {
            if (saved.length !== read.length) {
                out.push(path + " length " + saved.length + " -> " + read.length);
            }
            saved.forEach((item, at) => differences(item, read[at], path + "[" + at + "]", out));
        } else if (saved && read && typeof saved === "object" && typeof read === "object") {
            const keys = new Set([...Object.keys(saved), ...Object.keys(read)]);
            for (const key of keys) {
                const one = (saved as Record<string, unknown>)[key];
                const other = (read as Record<string, unknown>)[key];
                if (other === undefined && one === undefined) {
                    continue;
                }
                if (!(key in (saved as object))) {
                    out.push(path + "." + key + " added " + String(JSON.stringify(other)).slice(0, 40));
                } else if (!(key in (read as object))) {
                    out.push(path + "." + key + " dropped " + String(JSON.stringify(one)).slice(0, 40));
                } else {
                    differences(one, other, path + "." + key, out);
                }
            }
        } else if (JSON.stringify(saved) !== JSON.stringify(read)) {
            out.push(path + " " + JSON.stringify(saved)?.slice(0, 40) + " -> " + JSON.stringify(read)?.slice(0, 40));
        }
        return out;
    }

    describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

        for (const page of PAGES) {
            it("keeps " + page.system + "." + page.section + " " + page.name + " as the app reads it", () => {
                const state = (example as unknown as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> }).systems[String(page.system)];
                const saved = state.responses.find(response => response.sectionNumber === page.section)?.value;
                expect(saved).toBeDefined();
                expect(differences(saved, page.read(saved))).toEqual([]);
            });
        }

    });

    /**
     * UPDATING THE EXAMPLES: \`UPDATE_EXAMPLES=1 npx vitest run src/services/examples.test.ts\` writes every page of both examples as the app reads it, into src/data/examples (the one copy).
     * Without the variable nothing is written.
     */
    describe.skipIf(!ENV.UPDATE_EXAMPLES)("updating the examples", () => {

        it("writes the examples as the app reads them", async () => {
            const { writeFileSync } = (await import("node:fs")) as unknown as { writeFileSync: (path: string, text: string) => void };
            for (const [file, example] of [["lumen-and-loom-studio.json", lumen], ["quillfield-automation-llc.json", quillfield]] as const) {
                const copy = JSON.parse(JSON.stringify(example)) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> };
                for (const page of PAGES) {
                    const response = copy.systems[String(page.system)].responses.find(entry => entry.sectionNumber === page.section);
                    if (response) {
                        response.value = page.read(response.value);
                    }
                }
                const text = JSON.stringify(copy, null, 2).split("\n").join("\r\n") + "\r\n";
                writeFileSync("src/data/examples/" + file, text);
            }
        });

    });
});

describe("the examples in the browser", () => {
    const stored = (id: string) => {
        OrganizationService.flushPendingWrites();
        return JSON.parse(localStorage.getItem(`northstardust-organization-${id}`) ?? "null");
    };

    beforeEach(() => {
        OrganizationService.flushPendingWrites();
        localStorage.clear();
    });

    describe("Reload refreshes the saved examples", () => {

        it("replaces the copy that has the example's id, keeping its name and creation time", async () => {
            const id = (lumen as { id: string }).id;
            localStorage.setItem("northstardust-organizations", JSON.stringify([{ id, name: "My Lumen", createdAt: 5 }]));
            localStorage.setItem(`northstardust-organization-${id}`, JSON.stringify({ id, name: "My Lumen", createdAt: 5, STALE: true, systems: {} }));
            expect(await refreshExampleOrganizations()).toEqual([id]);
            const now = stored(id);
            expect(now.STALE).toBeUndefined();
            expect(now.name).toBe("My Lumen");
            expect(now.createdAt).toBe(5);
        });

        it("replaces an imported copy too (a new id, the example's name)", async () => {
            const name = (lumen as { name: string }).name;
            localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: "org-imported", name, createdAt: 9 }, { id: "org-other", name: "Other", createdAt: 1 }]));
            localStorage.setItem("northstardust-organization-org-imported", JSON.stringify({ id: "org-imported", name, STALE: true, systems: {} }));
            localStorage.setItem("northstardust-organization-org-other", JSON.stringify({ id: "org-other", name: "Other", KEEP: true, systems: {} }));
            expect(await refreshExampleOrganizations()).toEqual(["org-imported"]);
            expect(stored("org-imported").STALE).toBeUndefined();
            expect(stored("org-imported").id).toBe("org-imported");
            expect(stored("org-other").KEEP).toBe(true);
        });

        it("brings back no example that is not among the saved ones", async () => {
            expect(await refreshExampleOrganizations()).toEqual([]);
        });

    });
});

describe("the examples answer the Segment's questions", () => {
    /**
     * THE EXAMPLES ANSWER THE SEGMENT'S QUESTIONS: for each Segment of each example, read with the example's own Positioning answers, every question the Segment is asked has an answer
     * and no answer stands outside the rules (a question not asked, an option not offered). The kind of area is held back while Planning and Launching, so the examples are read as planning.
     */
    describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

        const systems = example.systems as unknown as Record<string, { responses: { value: unknown }[] }>;
        const organisation = asLegalEntityValue(systems["1"].responses.find(response => (response as { sectionNumber?: number }).sectionNumber === 3)!.value).organisation;
        const currentStage = stageOf((example as unknown as { globalSettings: { openingDate: string } }).globalSettings.openingDate, new Date());
        const identity = { relationships: organisation.customerType, marketType: organisation.marketType, audience: organisation.audience, buyerCategory: organisation.buyerCategory, endUser: organisation.endUser, stage: currentStage, differentiation: organisation.differentiation, outcomeUser: organisation.outcomeUser };
        const segments = asBusinessFoundationValue(systems["3"].responses.find(response => (response as { sectionNumber?: number }).sectionNumber === 1)!.value).segments;

        // The Positioning answers of an example stand at its stage today and at every later one: where a stage allows fewer choices, the app empties the answer, and the example would then open with its Positioning blank.
        const stages = ["plan", "launch", "manage", "grow"] as const;
        const today = stages.indexOf(currentStage);
        it.each(stages.slice(today))("keeps its Positioning answers at the %s stage", stage => {
            expect(fitPositioningToStage(organisation, stage)).toBe(organisation);
        });

        it.each(segments.map(segment => [segment.name, segment] as const))("answers every question asked of %s, and nothing else", (_segmentName, segment) => {
            // (Where both relationships are chosen, the Segment is of businesses if it has the Business Data key.)
            const context = segmentContextFor(identity, segment.description["business-data"] !== undefined);
            // (Settled against the card's starts, which follow their source unsaved: B4, owner, 2026-11-17 08:38.)
            expect(segmentSettleSaved(segment.questions, context)).toEqual(segment.questions);
            // (A question with one option left is not shown, and holds that option as its answer: it is still asked. The Differentiation, and the end user's outcome, are answered by the
            // Positioning answer saved before 2026-11-08, their start, where the Segment saved none: segmentPositioningShown.)
            const shown = segmentPositioningShown(segment.questions, identity, context);
            const asked = SEGMENT_QUESTIONS.filter(question => segmentQuestionAsked(question, shown, context)).map(question => question.id);
            expect(asked.filter(id => !(shown[id]?.length))).toEqual([]);
            expect(Object.keys(segment.questions).filter(id => !asked.includes(id))).toEqual([]);
        });

        it.each(segments.flatMap(segment => segment.profiles.map(profile => [profile.name, segment, profile] as const)))("answers the Profile %s with answers that stand against its Segment", (_profileName, segment, profile) => {
            const context = segmentContextFor(identity, segment.description["business-data"] !== undefined);
            const answers = asProfileAnswers(profile.questions);
            expect(Object.keys(answers).length).toBeGreaterThan(5);
            expect(profileSettle(answers, segmentPositioningShown(segment.questions, identity, context), context)).toEqual(answers);
        });

        // The notes hold what the choices do not: the age is asked (A1), and a platform that is ticked is not named again in the note of the hubs.
        it.each(segments.flatMap(segment => segment.profiles.map(profile => [profile.name, profile] as const)))("keeps the notes of %s to what its choices do not say", (_profileName, profile) => {
            const answers = asProfileAnswers(profile.questions);
            expect(answers.a1?.[0]).toMatch(/^\d{2}$/);
            expect(profile.description.personal ?? "").not.toMatch(/\b\d{2}\b(?!-)/);
            const ticked = (answers.c2 ?? []).filter(id => id !== "other").map(id => id.replace(/-/g, " "));
            const hubs = (profile.description.hubs ?? "").toLowerCase();
            expect(ticked.filter(name => hubs.includes(name.replace("x twitter", "twitter")))).toEqual([]);
        });

    });
});
