import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessFoundationEditor from "./BusinessFoundationEditor";
import { toggles } from "../../../test/interviewTestUtils";
import {
    asBusinessFoundationValue,
    businessFoundationSubsectionsEmpty,
    createBusinessCustomerProfile,
    createBusinessCustomerSegment
} from "../../../framework/engine/AnswerUtils";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessFoundationEditor value={value} onChange={setValue} />;
}


function twoProfiles() {
    const segment = createBusinessCustomerSegment([]);
    return {
        ...asBusinessFoundationValue(undefined),
        segments: [{ ...segment, profiles: [createBusinessCustomerProfile(), createBusinessCustomerProfile()] }]
    };
}

afterEach(cleanup);

describe("BusinessFoundationEditor folding", () => {

    it("starts Profile cards collapsed but the Segment open", () => {

        render(<Harness initial={twoProfiles()} />);

        toggles(/Profile \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));
        toggles(/Segment \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

    it("opens a newly added Profile", () => {

        render(<Harness initial={twoProfiles()} />);

        fireEvent.click(screen.getByRole("button", { name: /\+ Add Profile/ }));

        const profileToggles = toggles(/Profile \d+$/);
        expect(profileToggles).toHaveLength(3);
        expect(profileToggles[2].getAttribute("aria-expanded")).toBe("true");

    });

    it("expands all Profiles in a Segment", () => {

        render(<Harness initial={twoProfiles()} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));

        toggles(/Profile \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

});

describe("BusinessFoundationEditor industry outlook", () => {

    it("asks it with Market Size, in one box, as choice questions and no free text", () => {

        render(<Harness initial={twoProfiles()} />);

        expect(screen.getByRole("radiogroup", { name: "How would you describe the current trajectory of the target industry/niche?" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "What is the biggest macro trend impacting your buyers right now?" })).toBeTruthy();
        expect(screen.queryByLabelText(/Segment 1 description:/)).toBeNull();
        expect(screen.getByRole("button", { name: "Market Size & Industry Outlook: what this means" })).toBeTruthy();

    });

    it("moves an outlook saved in its own box into the Market Size box", () => {

        const saved = (description: Record<string, string>) =>
            asBusinessFoundationValue({ segments: [{ id: "s", name: "Firms", description }] }).segments[0].description;
        expect(saved({ "market-size": "1,200 firms", "industry-outlook": "Growing." }))
            .toEqual({ "market-size": "1,200 firms\n\nGrowing." });
        expect(saved({ "industry-outlook": "Growing." })).toEqual({ "market-size": "Growing." });
        expect(saved({ "market-size": "1,200 firms", "industry-outlook": "" })).toEqual({ "market-size": "1,200 firms" });

    });

    it("loads a Segment saved without it unchanged, and never counts it as missing", () => {

        const saved = { segments: [{ id: "s", name: "Firms", description: { "market-size": "1,200 firms" } }] };
        const segment = asBusinessFoundationValue(saved).segments[0];
        expect(segment.description).toEqual({ "market-size": "1,200 firms" });

        const answered = {
            segments: [{
                id: "s", name: "Firms", description: {}, valueProposition: "We save time.",
                profiles: [{ ...createBusinessCustomerProfile(), name: "Office manager" }],
                competitors: [{ id: "c", name: "Zapier" }],
                offerings: [{ id: "o", name: "Audit" }]
            }]
        };
        expect(businessFoundationSubsectionsEmpty(answered)).toEqual([false, false, false, false]);

    });

});

describe("BusinessFoundationEditor follows the Identity answers", () => {

    const identity = (relationships: string[], audience: string[] = [], marketType = "single") => ({ relationships, marketType, audience });

    function Identified({ identity: given }: { identity?: ReturnType<typeof identity> }) {
        const [value, setValue] = useState<unknown>(twoProfiles());
        return <BusinessFoundationEditor value={value} onChange={setValue} identity={given} />;
    }

    it("asks people's Demographics and not Business Data for a B2C seller", () => {
        render(<Identified identity={identity(["b2c"])} />);
        expect(screen.queryByRole("radiogroup", { name: "What age group are the people who pay?" })).not.toBeNull();
        expect(screen.queryByText("Business Data")).toBeNull();
    });

    it("asks Business Data without its tick, and not Demographics, for a B2B seller", () => {
        render(<Identified identity={identity(["b2b"])} />);
        expect(screen.queryByRole("radiogroup", { name: "What age group are the people who pay?" })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "What type of organisation are they?" })).not.toBeNull();
        expect(screen.queryByRole("checkbox", { name: /Business Data/ })).toBeNull();
    });

    it("makes the first two Segments for the user, People then Businesses, when both relationships are chosen", () => {
        function Held() {
            const [value, setValue] = useState<unknown>(twoProfiles());
            return <BusinessFoundationEditor value={value} onChange={setValue} identity={identity(["b2c", "b2b"])} />;
        }
        render(<Held />);
        expect(screen.queryByRole("checkbox", { name: /Business Data/ })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "Who is this Segment's customer?" })).toBeNull();
        expect(screen.queryAllByRole("radiogroup", { name: "What age group are the people who pay?" }).length).toBe(1);
        expect(screen.queryAllByRole("radiogroup", { name: "What is the size of the target organization?" }).length).toBe(1);
    });

});

describe("BusinessFoundationEditor asks its questions", () => {

    it("saves a choice on the Segment, and offers the age terms of the Positioning life stage", () => {
        let saved: unknown;
        function Held() {
            const [value, setValue] = useState<unknown>(twoProfiles());
            saved = value;
            return <BusinessFoundationEditor value={value} onChange={setValue} identity={{ relationships: ["b2c"], marketType: "single", audience: ["adult"] }} />;
        }
        render(<Held />);
        const ages = screen.getByRole("radiogroup", { name: "What age group are the people who pay?" });
        expect(Array.from(ages.querySelectorAll("label")).map(label => label.textContent)).toEqual(["Established 25–39", "Peak 40–54", "Mature 55–64"]);
        fireEvent.click(screen.getByRole("radio", { name: "Peak 40–54" }));
        expect(asBusinessFoundationValue(saved).segments[0].questions).toEqual({ age: ["peak"], work: ["working"] });
    });

    it("has no free-text box in a box of the Segment's Description", () => {
        render(<Harness initial={twoProfiles()} />);
        expect(screen.queryByLabelText(/Segment 1 description:/)).toBeNull();
    });

});
