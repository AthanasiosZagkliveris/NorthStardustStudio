import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";

import BusinessEngagementEditor from "./BusinessEngagementEditor";
import {
    BUSINESS_JOURNEY_STAGES,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessOffering,
    createBusinessSegmentEngagement
} from "../../framework/engine/AnswerUtils";

/**
 * A Segment with two named Offerings, and one Channel that carries
 * both of them at the first Journey Stage -- so both Offerings get
 * an actual Customer Relationship block (relationshipsFor reads its
 * Offerings off the Channels table's interactions, not off Page 1
 * directly: an Offering with no channel and stage recorded against
 * it has no relationship row to fold at all).
 */
function engagementScenario() {

    const segment = createBusinessCustomerSegment([]);
    const audit = { ...createBusinessOffering(), name: "Audit" };
    const retainer = { ...createBusinessOffering(), name: "Retainer" };

    const foundation = {
        ...asBusinessFoundationValue(undefined),
        segments: [{
            ...segment,
            name: "Firms",
            offerings: [audit, retainer]
        }]
    };

    const engagement = {
        ...asBusinessEngagementValue(undefined),
        segments: [{
            ...createBusinessSegmentEngagement(segment.id),
            channels: [{
                ...createBusinessChannel(),
                id: segment.id + "-channel",
                category: "Website",
                offerings: [audit.id, retainer.id],
                stages: [BUSINESS_JOURNEY_STAGES[0].id]
            }]
        }]
    };

    return { foundation, engagement };

}

function Harness() {
    const { foundation, engagement } = engagementScenario();
    const [value, setValue] = useState<unknown>(engagement);
    return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
}

afterEach(cleanup);

describe("BusinessEngagementEditor folding", () => {

    it("folds per-Offering blocks but keeps the page sections open", () => {

        render(<Harness />);

        const all = screen.getAllByRole("button").filter(b => b.classList.contains("strategy-box-toggle"));
        const offeringBlocks = all.filter(b => /Audit|Retainer/.test(b.getAttribute("aria-label") ?? ""));
        const sections = all.filter(b => /Customer Channel|Customer Relationship/.test(b.getAttribute("aria-label") ?? ""));

        expect(offeringBlocks.length).toBeGreaterThan(0);
        offeringBlocks.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("false"));
        sections.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));

    });

});
