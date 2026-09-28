import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { InterviewValidator } from "./InterviewValidator.ts";
import {
    asFoundersProfileValue,
    asLegalEntityValue,
    defaultAnswerValue,
    founderProfiles,
    isAnswerEmpty,
    numberedUnitCount,
    withFounderProfiles,
    withLegalEntityFounders,
    asBusinessCapabilityValue
} from "./AnswerUtils.ts";
import { sectionRailItems } from "../../components/interview/rails/railItems.ts";
import quillfieldText from "../../../docs/examples/quillfield-automation-llc.json?raw";

const legal = (founders: Record<string, unknown>[]) => asLegalEntityValue({ founders }).founders;

describe("the Founders Profile page", () => {

    test("is the Identity System's fourth page, after Legal Entity", () => {
        const sections = frameworkRegistry.getFramework("identity").sections;
        expect(sections.map(section => section.title)).toEqual(["Definition", "Ethics", "Legal Entity", "Founders Profile"]);
        expect(sections[3].number).toBe(4);
        expect(sections[3].answer?.type).toBe(AnswerType.FoundersProfile);
        expect(sections[3].answer?.nestedNumbering).toBe(true);
    });

    test("stores an object from the start, takes one number, and is never incomplete", () => {
        const answer = { type: AnswerType.FoundersProfile };
        expect(defaultAnswerValue(answer)).toEqual({ founders: [], teamGaps: "" });
        expect(numberedUnitCount(answer)).toBe(1);
        expect(isAnswerEmpty(answer, undefined)).toBe(false);
        expect(sectionRailItems(answer)).toEqual([
            { id: "founders", label: "1. Founders" },
            { id: "team-gaps-cover", label: "2. Team Gaps & Cover" }
        ]);
    });

    test("never holds the Identity System up", () => {
        const quill = JSON.parse(quillfieldText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
        const session = InterviewSession.fromJSON(quill.systems["1"], frameworkRegistry.getFramework("identity"));
        session.saveResponse(4, asFoundersProfileValue(undefined));
        expect(new InterviewValidator().validate(session).valid).toBe(true);
    });

});

describe("founders' profiles and the Legal Entity saved before them", () => {

    const founders = legal([
        { id: "a", name: "Ann", roles: ["Director"], experience: "Ten years in retail." },
        { id: "b", name: "Bo", roles: ["Old"] },
        { id: "c", name: "" }
    ]);

    test("a named founder without a profile takes the Legal Entity's roles and experience", () => {
        const profiles = founderProfiles(founders, { founders: [{ id: "b", roles: ["Designer"], years: "4" }] });
        expect(profiles.map(profile => profile.name)).toEqual(["Ann", "Bo"]);
        expect(profiles[0].roles).toEqual(["Director"]);
        expect(profiles[0].industryExperience).toBe("Ten years in retail.");
        // The page's own entry wins over what the Legal Entity row still carries.
        expect(profiles[1].roles).toEqual(["Designer"]);
        expect(profiles[1].years).toBe("4");
    });

    test("the page is seeded once, and loses nothing", () => {
        const seeded = withFounderProfiles({ founders: [{ id: "gone", skills: ["Kept"] }], teamGaps: "Advisors" }, founders);
        expect(seeded.founders.map(entry => entry.id)).toEqual(["gone", "a", "b"]);
        expect(seeded.founders[0].skills).toEqual(["Kept"]);
        expect(seeded.founders[1].industryExperience).toBe("Ten years in retail.");
        expect(seeded.teamGaps).toBe("Advisors");
        // Seeded, it no longer needs the Legal Entity row.
        expect(founderProfiles(legal([{ id: "a", name: "Ann" }]), seeded)[0].roles).toEqual(["Director"]);
        expect(withFounderProfiles(seeded, founders)).toEqual(seeded);
    });

    test("caps Key Achievements at three", () => {
        const value = asFoundersProfileValue({ founders: [{ id: "a", achievements: ["1", "2", "3", "4"] }] });
        expect(value.founders[0].achievements).toEqual(["1", "2", "3"]);
    });

    test("gives the Business System's founders their roles from the profile", () => {
        const capability = withLegalEntityFounders(asBusinessCapabilityValue(undefined), founders,
            { founders: [{ id: "b", roles: ["Designer", ""] }] });
        expect(capability.founders.map(founder => founder.roles)).toEqual([["Director"], ["Designer"]]);
    });

});
