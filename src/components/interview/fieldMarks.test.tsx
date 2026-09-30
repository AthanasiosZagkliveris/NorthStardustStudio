import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { FieldPageProvider } from "./fieldMarks";
import { BusinessField } from "./BusinessCardFields";
import { clearFieldRegistry, currentFieldKey, registeredFields } from "../../framework/engine/FieldKeys";

afterEach(() => {
    cleanup();
    clearFieldRegistry();
});

describe("every field knows its key", () => {

    it("from its page, its section, its card and its label, marked on its holder", () => {
        render(
            <FieldPageProvider organizationId="org-1" systemNumber={3} sectionNumber={2} pageTitle="2. Customer Engagement">
                <section data-rail="customer-channel">
                    <div data-anchor="channel-abc">
                        <BusinessField label="Purpose">
                            <input className="interview-input" aria-label="Purpose" />
                        </BusinessField>
                    </div>
                </section>
            </FieldPageProvider>
        );
        expect(document.querySelector("[data-field-key]")?.getAttribute("data-field-key")).toBe("3.2:customer-channel/channel-abc/purpose");
        expect(registeredFields(3, 2)).toEqual([
            { key: "3.2:customer-channel/channel-abc/purpose", label: "Purpose", pageTitle: "2. Customer Engagement", kind: "answer", anchors: ["channel-abc"] }
        ]);
    });

    it("tells an answer from what is none of the person's answers", () => {
        render(
            <FieldPageProvider organizationId="org-1" systemNumber={3} sectionNumber={3} pageTitle="3. Infrastructure & Capability">
                <section data-rail="offering-s-capability">
                    <BusinessField label="Responsibility">
                        <span className="business-capability-automatic">Jordan Ellis</span>
                    </BusinessField>
                    <BusinessField label="Status">
                        <input className="interview-input" aria-label="Status" />
                    </BusinessField>
                    <BusinessField label="Registered">
                        <input type="checkbox" aria-label="Registered" />
                    </BusinessField>
                    <div data-field-kind="optional">
                        <BusinessField label="Conditions">
                            <textarea aria-label="Conditions" />
                        </BusinessField>
                    </div>
                    <BusinessField label="Price">
                        <input className="interview-input" aria-label="Price" />
                    </BusinessField>
                </section>
            </FieldPageProvider>
        );
        expect(registeredFields(3, 3).map(entry => entry.label + ":" + entry.kind + (entry.why ? ":" + entry.why : "")).sort()).toEqual([
            "Conditions:none:optional-tick", "Price:answer", "Registered:none:binary", "Responsibility:none:derived", "Status:none:status"
        ]);
    });

    it("is not recorded outside a page", () => {
        render(<BusinessField label="Purpose"><input /></BusinessField>);
        expect(registeredFields()).toHaveLength(0);
        expect(document.querySelector("[data-field-key]")).toBeNull();
    });

});

describe("every control has a key, whatever draws it", () => {

    it("marks controls no label component reaches, and cards, from where they sit and what they are called", async () => {
        render(
            <FieldPageProvider organizationId="org-1" systemNumber={3} sectionNumber={2} pageTitle="2. Customer Engagement">
                <section data-rail="positioning">
                    <textarea aria-label="Positioning" />
                </section>
                <section data-rail="customer-relationship">
                    <div className="business-foundation-card" data-anchor="rel-1">
                        <input className="card-name-input" aria-label="Relationship 1 name" defaultValue="Retainer clients" />
                        <textarea aria-label="Approach for Discovery" />
                        <button type="button" className="option-picker-trigger" aria-label="Journey Stage 1: Discovery" />
                    </div>
                </section>
            </FieldPageProvider>
        );
        // The observer marks on its first pass, straight after mounting.
        await new Promise(resolve => setTimeout(resolve, 0));
        const keyOf = (name: string) => document.querySelector("[aria-label='" + name + "']")?.getAttribute("data-field-key");
        expect(keyOf("Positioning")).toBe("3.2:positioning");
        expect(keyOf("Approach for Discovery")).toBe("3.2:customer-relationship/rel-1/approach-for-discovery");
        expect(keyOf("Journey Stage 1: Discovery")).toBe("3.2:customer-relationship/rel-1/journey-stage-1");
        expect(document.querySelector("[data-anchor=rel-1]")?.getAttribute("data-field-key")).toBe("3.2:customer-relationship/rel-1");
        expect(registeredFields(3, 2).map(entry => entry.label)).toEqual(expect.arrayContaining(["Retainer clients", "Approach for Discovery", "Journey Stage 1"]));
    });

});

describe("a field's key, by its id", () => {

    it("stays the same when the field's label is renamed, so a link to it keeps working", () => {
        const page = (label: string) => (
            <FieldPageProvider organizationId="org-1" systemNumber={3} sectionNumber={3} pageTitle="3. Infrastructure & Capability">
                <section data-rail="founders">
                    <div data-anchor="founder-a">
                        <BusinessField label={label} fieldId="working-hours">
                            <input className="interview-input" aria-label="Maya working hours a month" />
                        </BusinessField>
                    </div>
                </section>
            </FieldPageProvider>
        );
        const { rerender } = render(page("Working Hours / Month"));
        const before = document.querySelector("[data-field-key]")?.getAttribute("data-field-key");
        rerender(page("Working Hrs"));
        expect(before).toBe("3.3:founders/founder-a/working-hours");
        expect(document.querySelector("[data-field-key]")?.getAttribute("data-field-key")).toBe(before);
        // A link saved under the old label's slug leads there too.
        expect(currentFieldKey("3.3:founders/founder-a/working-hours-month")).toBe(before);
    });

});
