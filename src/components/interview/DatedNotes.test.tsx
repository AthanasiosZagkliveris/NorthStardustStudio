import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { noteNow, noteStamped } from "./BusinessCardFields";
import { isoToDisplay } from "./DateCellInput";
import { openCard, openTile } from "../../test/interviewTestUtils";
import { PreferencesService } from "../../services/PreferencesService";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

/* G9: a note is stamped with the moment it was recorded, and "Add Date" adds the day to its text. */

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} />;
}

const NOW = new Date(2027, 2, 12, 14, 5);
const shown = (iso: string) => isoToDisplay(iso, PreferencesService.getDateFormat());

beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe("the record stamp of a note", () => {

    it("is the moment, to the minute, in local time", () => {
        expect(noteNow(NOW)).toBe("2027-03-12T14:05");
        expect(noteNow(new Date(2027, 0, 2, 3, 4))).toBe("2027-01-02T03:04");
    });

    it("a note first written is stamped now; an edit keeps the stamp; an emptied note loses it; an older note gets none made up", () => {
        expect(noteStamped("", "Ask the landlord", "", NOW)).toBe("2027-03-12T14:05");
        expect(noteStamped("Ask the landlord", "Ask the landlord twice", "2027-01-01T09:00", NOW)).toBe("2027-01-01T09:00");
        expect(noteStamped("Ask the landlord", "", "2027-01-01T09:00", NOW)).toBe("");
        expect(noteStamped("   ", "Hello", "", NOW)).toBe("2027-03-12T14:05");
        expect(noteStamped("Written before the stamp existed", "Written before, and more", "", NOW)).toBe("");
    });

    it("is read as a real moment or not at all", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            offering: { resources: [{ id: "a", noteRecorded: "2027-03-12T14:05" }, { id: "b", noteRecorded: "2027-03-12T25:61" }, { id: "c", noteRecorded: "2027-02-30T10:00" }, { id: "d", noteRecorded: "yesterday" }] }
        });
        expect(read.offering.resources.map(entry => entry.noteRecorded)).toEqual(["2027-03-12T14:05", "", "", ""]);
        expect(asBusinessCapabilityValue(read)).toEqual(read);
    });

});

describe("the note on a card", () => {

    function setup() {
        let latest: Value | undefined;
        const value = asBusinessCapabilityValue(undefined);
        render(<Harness
            initial={{ ...value, resources: { equipment: [{ id: "devices-tools", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Laptop", status: "exists" }] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Equipment");
        openCard("Laptop");
        return () => latest!.resources.equipment[0].slots[0];
    }

    it("shows no stamp until something is written, then the moment it was recorded, read-only, and keeps it as the text grows", () => {
        const slot = setup();
        fireEvent.click(screen.getByRole("checkbox", { name: /Description \/ Relevant Information/ }));
        expect(screen.queryByText(/^Recorded /)).toBeNull();
        fireEvent.change(screen.getByLabelText("Resource 1 description"), { target: { value: "Bought second-hand" } });
        expect(slot().noteRecorded).toBe("2027-03-12T14:05");
        expect(screen.getByText("Recorded " + shown("2027-03-12") + " 14:05")).toBeTruthy();
        vi.setSystemTime(new Date(2027, 3, 1, 9, 30));
        fireEvent.change(screen.getByLabelText("Resource 1 description"), { target: { value: "Bought second-hand, 2 years old" } });
        expect(slot().noteRecorded).toBe("2027-03-12T14:05");
    });

    it("Add Date adds today to the text, on its own line, and stamps an empty note", () => {
        const slot = setup();
        fireEvent.click(screen.getByRole("checkbox", { name: /Description \/ Relevant Information/ }));
        fireEvent.click(screen.getByRole("button", { name: "+ Add Date" }));
        expect(slot().description).toBe(shown("2027-03-12") + " ");
        expect(slot().noteRecorded).toBe("2027-03-12T14:05");
        fireEvent.change(screen.getByLabelText("Resource 1 description"), { target: { value: shown("2027-03-12") + " Called them" } });
        fireEvent.click(screen.getByRole("button", { name: "+ Add Date" }));
        expect(slot().description).toBe(shown("2027-03-12") + " Called them\n" + shown("2027-03-12") + " ");
    });

    it("unticking clears the text and the stamp", () => {
        const slot = setup();
        fireEvent.click(screen.getByRole("checkbox", { name: /Description \/ Relevant Information/ }));
        fireEvent.change(screen.getByLabelText("Resource 1 description"), { target: { value: "Note" } });
        fireEvent.click(screen.getByRole("checkbox", { name: /Description \/ Relevant Information/ }));
        expect(slot()).toMatchObject({ description: "", noteRecorded: "" });
    });

    it("an activity and a partner have the same dated note", () => {
        const value = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...value, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Open the shop" }] }] }} />);
        openTile("Operational");
        openCard("Open the shop");
        fireEvent.click(screen.getByRole("checkbox", { name: /Description \/ Relevant Information/ }));
        expect(screen.getByRole("button", { name: "+ Add Date" })).toBeTruthy();
        cleanup();
        render(<Harness initial={{ ...value, providers: [{ ...createBusinessPartner("Acme", "suppliers"), group: "technical-support" }] }} />);
        openTile("Suppliers");
        openCard("Acme");
        fireEvent.click(screen.getByRole("checkbox", { name: /Description \/ Relevant Information/ }));
        expect(screen.getByRole("button", { name: "+ Add Date" })).toBeTruthy();
    });

});
