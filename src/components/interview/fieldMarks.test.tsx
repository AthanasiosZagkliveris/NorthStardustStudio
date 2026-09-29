import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { FieldPageProvider } from "./fieldMarks";
import { BusinessField } from "./BusinessCardFields";
import { clearFieldRegistry, registeredFields } from "../../framework/engine/FieldKeys";

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
