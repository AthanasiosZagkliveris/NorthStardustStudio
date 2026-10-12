import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openTile } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, groupHelpLines } from "../../framework/engine/AnswerUtils";

/* The help-texts document: a category's "i" says what its groups are, under the category's name in the dialog's header. */

afterEach(cleanup);

const show = () => render(<BusinessCapabilityEditor value={asBusinessCapabilityValue(undefined)} onChange={() => undefined} />);

function noteOf(name: string): string {
    fireEvent.click(screen.getByRole("button", { name: name + ": what this means" }));
    return (document.querySelector("[role=dialog].info-note-panel, .info-note-panel, [role=dialog]:not(.section-tile-dialog)") as HTMLElement | null)?.textContent ?? document.body.textContent ?? "";
}

describe("the help of a category's header", () => {

    it("groupHelpLines: one group is its text; several are one line each, the group's name first", () => {
        expect(groupHelpLines([{ label: "A", help: "Alpha things." }])).toEqual(["Alpha things."]);
        expect(groupHelpLines([{ label: "A", help: "Alpha things." }, { label: "B", help: "Beta things." }])).toEqual(["A: alpha things.", "B: beta things."]);
    });

    it("Equipment (one group in Infrastructure) says the text of Devices & Tools, not a general sentence", () => {
        show();
        openTile("Equipment");
        const text = noteOf("Equipment");
        expect(text).toMatch(/The devices and tools the team uses for its own work, bought or leased/);
        expect(text).not.toMatch(/Physical and digital resources the organization needs to operate/);
    });

    it("Vehicles (two groups) says one line for each", () => {
        show();
        openTile("Vehicles");
        const text = noteOf("Vehicles");
        // (The names of the groups are bold, as the Status's options are: each a name, then what it is.)
        expect(text).toMatch(/Company Vehicles: Cars and bikes the company owns or leases for general use/);
        expect(text).toMatch(/Vehicle Running Costs: Fuel and the everyday running costs of company vehicles/);
    });


});
