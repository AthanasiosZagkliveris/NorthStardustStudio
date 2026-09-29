import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { AnnotationProvider } from "./fieldAnnotations";
import { BusinessField } from "./BusinessCardFields";
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
                    <BusinessField label="Purpose">
                        <input className="interview-input" aria-label="Purpose" />
                    </BusinessField>
                </div>
            </section>
        </AnnotationProvider>
    );
    return organization.id;
}

describe("the field menu", () => {

    it("offers the three flags, keeps the one chosen with the answers, and clears it", () => {

        const organizationId = renderField();

        fireEvent.click(screen.getByRole("button", { name: "Flag or note: Purpose" }));

        expect(screen.getAllByRole("menuitemradio").map(item => item.textContent)).toEqual(["Not sure yet", "Needs research", "Doesn't apply"]);
        expect(screen.queryByRole("menuitem", { name: "Clear flag" })).toBeNull();

        act(() => { fireEvent.click(screen.getByRole("menuitemradio", { name: "Not sure yet" })); });

        const key = "3.2:customer-channel/channel-abc/purpose";
        expect(OrganizationService.getAnnotations(organizationId)[key]).toMatchObject({
            flag: "not-sure", label: "Purpose", pageTitle: "2. Customer Engagement", anchors: ["channel-abc"], section: "customer-channel"
        });
        expect(screen.getByText("Not sure yet", { selector: ".field-status-flag" })).toBeTruthy();
        expect(document.querySelector("[data-field-key]")?.getAttribute("data-field-key")).toBe(key);

        // Needs research, with what to find out.
        fireEvent.click(screen.getByRole("button", { name: "Flag or note: Purpose" }));
        act(() => { fireEvent.click(screen.getByRole("menuitemradio", { name: "Needs research" })); });
        act(() => { fireEvent.change(screen.getByRole("textbox", { name: "What do I need to find out?" }), { target: { value: "Ask three buyers" } }); });
        expect(OrganizationService.getAnnotations(organizationId)[key]).toMatchObject({ flag: "research", research: "Ask three buyers" });
        expect(screen.getByText(/Needs research: Ask three buyers/)).toBeTruthy();

        act(() => { fireEvent.click(screen.getByRole("menuitem", { name: "Clear flag" })); });
        expect(OrganizationService.getAnnotations(organizationId)[key]).toBeUndefined();

    });

    it("closes on Escape without leaving the page", () => {
        renderField();
        fireEvent.click(screen.getByRole("button", { name: "Flag or note: Purpose" }));
        let reached = false;
        const onWindow = () => { reached = true; };
        window.addEventListener("keydown", onWindow);
        fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
        window.removeEventListener("keydown", onWindow);
        expect(screen.queryByRole("menu")).toBeNull();
        expect(reached).toBe(false);
    });

    it("is not offered on a value the person does not give: shown, worked out or read from elsewhere", () => {
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
                </section>
            </AnnotationProvider>
        );
        expect(screen.queryByRole("button", { name: "Flag or note: Responsibility" })).toBeNull();
        expect(screen.getByRole("button", { name: "Flag or note: Performer" })).toBeTruthy();
        expect(registeredFields(3, 3).map(entry => entry.label + ":" + entry.kind).sort())
            .toEqual(["Performer:answer", "Responsibility:derived"]);
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
        expect(screen.queryByRole("button", { name: "Flag or note: Registered for Sales Tax" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Flag or note: Conditions" })).toBeNull();
        expect(registeredFields(1, 3).map(entry => entry.label + ":" + entry.kind).sort())
            .toEqual(["Conditions:optional", "Registered for Sales Tax:binary"]);
    });

    it("is not drawn outside a page that keeps annotations", () => {
        render(<BusinessField label="Purpose"><input /></BusinessField>);
        expect(screen.queryByRole("button", { name: "Flag or note: Purpose" })).toBeNull();
    });

});
