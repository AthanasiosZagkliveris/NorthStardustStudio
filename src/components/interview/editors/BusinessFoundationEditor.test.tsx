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

    it("asks it with Market Size, in one box with one note", () => {

        render(<Harness initial={twoProfiles()} />);

        const merged = screen.getByLabelText("Segment 1 description: Market Size & Industry Outlook") as HTMLTextAreaElement;
        expect(merged.tagName).toBe("TEXTAREA");
        expect(screen.queryByLabelText("Segment 1 description: Industry Outlook & Trends")).toBeNull();
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
        expect(screen.queryByLabelText("Segment 1 description: Demographics")).not.toBeNull();
        expect(screen.queryByText("Business Data")).toBeNull();
    });

    it("asks Business Data without its tick, and not Demographics, for a B2B seller", () => {
        render(<Identified identity={identity(["b2b"])} />);
        expect(screen.queryByLabelText("Segment 1 description: Demographics")).toBeNull();
        expect(screen.queryByLabelText("Segment 1 description: Business Data")).not.toBeNull();
        expect(screen.queryByRole("checkbox", { name: /Business Data/ })).toBeNull();
    });

    it("keeps every box, with the tick, when nothing or several relationships are chosen", () => {
        render(<Identified identity={identity(["b2c", "b2b"])} />);
        expect(screen.queryByLabelText("Segment 1 description: Demographics")).not.toBeNull();
        expect(screen.queryByRole("checkbox", { name: /Business Data/ })).not.toBeNull();
    });

});

describe("BusinessFoundationEditor keeps what is written", () => {
    it("still shows Demographics for a B2B seller when the Segment has text in it", () => {
        const base = twoProfiles();
        const written = { ...base, segments: [{ ...base.segments[0], description: { demographics: "Managing partners aged 30 to 60" } }] };
        function Held() {
            const [value, setValue] = useState<unknown>(written);
            return <BusinessFoundationEditor value={value} onChange={setValue} identity={{ relationships: ["b2b"], marketType: "single", audience: [] }} />;
        }
        render(<Held />);
        expect(screen.queryByLabelText("Segment 1 description: Demographics")).not.toBeNull();
    });
});
