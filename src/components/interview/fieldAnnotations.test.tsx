import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { AnnotationProvider } from "./fieldAnnotations";
import { BusinessField } from "./BusinessCardFields";
import { FieldFlagButton } from "./fieldAnnotations";
import { OrganizationService } from "../../services/OrganizationService";
import { clearFieldRegistry, registeredFields } from "../../framework/engine/FieldKeys";

afterEach(() => {
    cleanup();
    localStorage.clear();
    clearFieldRegistry();
});

function renderField() {
    const organization = OrganizationService.create("Lumen");
    render(
        <AnnotationProvider organizationId={organization.id} systemNumber={3} sectionNumber={2} pageTitle="2. Customer Engagement">
            <section data-rail="customer-channel">
                <div data-anchor="channel-abc">
                    <BusinessField label="Purpose" flag="investigation">
                        <input className="interview-input" aria-label="Purpose" />
                    </BusinessField>
                </div>
            </section>
        </AnnotationProvider>
    );
    return organization.id;
}

describe("the flag button", () => {

    it("on a researchable field, sets Needs investigation at once, with its one line, and clears it when pressed again", () => {

        const organizationId = renderField();
        const key = "3.2:customer-channel/channel-abc/purpose";

        act(() => { fireEvent.click(screen.getByRole("button", { name: "Flag: Purpose" })); });

        // No menu: the one flag this field can carry is set.
        expect(screen.queryByRole("menu")).toBeNull();
        expect(OrganizationService.getAnnotations(organizationId)[key]).toMatchObject({
            flag: "research", label: "Purpose", pageTitle: "2. Customer Engagement", anchors: ["channel-abc"], section: "customer-channel", kind: "answer"
        });
        expect(screen.getByRole("button", { name: "Flag: Purpose" }).getAttribute("aria-pressed")).toBe("true");
        expect(document.querySelector("[data-field-key]")?.getAttribute("data-field-key")).toBe(key);

        // Its optional line, what to find out.
        const line = screen.getByRole("textbox", { name: "What do I need to find out?" });
        expect(document.activeElement).toBe(line);
        act(() => { fireEvent.change(line, { target: { value: "Ask three buyers" } }); });
        expect(OrganizationService.getAnnotations(organizationId)[key]).toMatchObject({ flag: "research", research: "Ask three buyers" });
        expect(screen.getByText(/Needs investigation: Ask three buyers/)).toBeTruthy();

        act(() => { fireEvent.click(screen.getByRole("button", { name: "Flag: Purpose" })); });
        expect(OrganizationService.getAnnotations(organizationId)[key]).toBeUndefined();
        expect(screen.queryByText(/Needs investigation/)).toBeNull();

    });

    it("on a legal or tax item, offers Needs investigation and Doesn't apply", () => {

        const organization = OrganizationService.create("Lumen");
        render(
            <AnnotationProvider organizationId={organization.id} systemNumber={1} sectionNumber={3} pageTitle="3. Legal Entity">
                <section data-rail="legal-entity-expenses">
                    <BusinessField label="Cost (GBP)">
                        <input className="interview-input" aria-label="Cost (GBP)" />
                    </BusinessField>
                </section>
            </AnnotationProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "Flag: Cost (GBP)" }));
        expect(screen.getAllByRole("menuitemradio").map(item => item.textContent)).toEqual(["Needs investigation", "Doesn't apply"]);
        expect(screen.queryByRole("menuitem", { name: "Clear flag" })).toBeNull();

        act(() => { fireEvent.click(screen.getByRole("menuitemradio", { name: "Doesn't apply" })); });
        const key = "1.3:legal-entity-expenses/cost-gbp";
        expect(OrganizationService.getAnnotations(organization.id)[key]).toMatchObject({ flag: "not-applicable", kind: "answer" });
        expect(screen.getByText("Doesn't apply", { selector: ".field-status-flag" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Flag: Cost (GBP)" }));
        act(() => { fireEvent.click(screen.getByRole("menuitem", { name: "Clear flag" })); });
        expect(OrganizationService.getAnnotations(organization.id)[key]).toBeUndefined();

    });

    it("closes on Escape without leaving the page", () => {
        renderField();
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Flag: Purpose" })); });
        let reached = false;
        const onWindow = () => { reached = true; };
        window.addEventListener("keydown", onWindow);
        fireEvent.keyDown(screen.getByRole("textbox", { name: "What do I need to find out?" }), { key: "Escape" });
        window.removeEventListener("keydown", onWindow);
        expect(screen.queryByRole("textbox", { name: "What do I need to find out?" })).toBeNull();
        expect(reached).toBe(false);
    });

    it("is offered only on a researchable field; the others are answers, or nothing to note", () => {
        const organization = OrganizationService.create("Lumen");
        render(
            <AnnotationProvider organizationId={organization.id} systemNumber={3} sectionNumber={3} pageTitle="3. Infrastructure & Capability">
                <section data-rail="offering-s-capability">
                    <BusinessField label="Responsibility">
                        <span className="business-capability-automatic">Jordan Ellis</span>
                    </BusinessField>
                    <BusinessField label="Performer">
                        <input className="interview-input" aria-label="Performer" />
                    </BusinessField>
                    <BusinessField label="Status">
                        <input className="interview-input" aria-label="Status" />
                    </BusinessField>
                    <BusinessField label="Currency">
                        <input className="interview-input" aria-label="Currency" />
                    </BusinessField>
                    <BusinessField label="Price">
                        <input className="interview-input" aria-label="Price" />
                    </BusinessField>
                </section>
            </AnnotationProvider>
        );
        for (const label of ["Responsibility", "Performer", "Status", "Currency", "Price"]) {
            expect(screen.queryByRole("button", { name: "Flag: " + label })).toBeNull();
        }
        expect(registeredFields(3, 3).map(entry => entry.label + ":" + entry.kind + (entry.why ? ":" + entry.why : "")).sort())
            .toEqual(["Currency:none:display", "Performer:none:link", "Price:answer", "Responsibility:none:derived", "Status:none:status"]);
    });

    it("is not offered on a yes or a no, nor on an optional text opened by its tick box", () => {
        const organization = OrganizationService.create("Lumen");
        render(
            <AnnotationProvider organizationId={organization.id} systemNumber={1} sectionNumber={3} pageTitle="3. Legal Entity">
                <section data-rail="tax-business-registration">
                    <BusinessField label="Registered for Sales Tax">
                        <input type="checkbox" aria-label="Registered for Sales Tax" />
                    </BusinessField>
                    <div data-field-kind="optional">
                        <BusinessField label="Conditions">
                            <textarea aria-label="Conditions" />
                        </BusinessField>
                    </div>
                </section>
            </AnnotationProvider>
        );
        expect(screen.queryByRole("button", { name: "Flag: Registered for Sales Tax" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Flag: Conditions" })).toBeNull();
        expect(registeredFields(1, 3).map(entry => entry.label + ":" + entry.kind + ":" + entry.why).sort())
            .toEqual(["Conditions:none:optional-tick", "Registered for Sales Tax:none:binary"]);
    });

    it("is not offered on the Founders Profile, which holds personal information, though its answers can be noted", () => {
        const organization = OrganizationService.create("Lumen");
        render(
            <AnnotationProvider organizationId={organization.id} systemNumber={1} sectionNumber={4} pageTitle="4. Founders Profile">
                <section data-rail="founders">
                    <BusinessField label="Management Experience">
                        <textarea aria-label="Management Experience" />
                    </BusinessField>
                </section>
            </AnnotationProvider>
        );
        expect(screen.queryByRole("button", { name: "Flag: Management Experience" })).toBeNull();
        expect(registeredFields(1, 4)[0].kind).toBe("answer");
        expect(registeredFields(1, 4)[0].flag).toBeUndefined();
    });

    it("sits on a card's head, for the card as a whole (a legal requirement)", () => {
        const organization = OrganizationService.create("Lumen");
        render(
            <AnnotationProvider organizationId={organization.id} systemNumber={1} sectionNumber={3} pageTitle="3. Legal Entity">
                <section data-rail="additional-legal-requirements">
                    <div data-anchor="legal-requirement-r1">
                        <div className="legal-entity-card-head">
                            <FieldFlagButton label="Requirement 1: Food licence" card flag="investigation-or-not-applicable" />
                        </div>
                    </div>
                </section>
            </AnnotationProvider>
        );
        fireEvent.click(screen.getByRole("button", { name: "Flag: Requirement 1: Food licence" }));
        act(() => { fireEvent.click(screen.getByRole("menuitemradio", { name: "Needs investigation" })); });
        expect(OrganizationService.getAnnotations(organization.id)["1.3:additional-legal-requirements/legal-requirement-r1"])
            .toMatchObject({ flag: "research", anchors: ["legal-requirement-r1"] });
        expect(document.querySelector("[data-anchor=legal-requirement-r1]")?.getAttribute("data-field-key")).toBe("1.3:additional-legal-requirements/legal-requirement-r1");
    });

    it("is not drawn outside a page that keeps annotations", () => {
        render(<BusinessField label="Purpose"><input /></BusinessField>);
        expect(screen.queryByRole("button", { name: "Flag: Purpose" })).toBeNull();
    });

});
