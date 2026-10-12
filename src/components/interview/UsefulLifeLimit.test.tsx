import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openTile } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";
import { createGlobalSettings } from "../../framework/engine/GlobalSettings";

/* A card does not ask its useful life (Global Settings > Useful Life lists the assets at or above the capitalisation limit under their group). */

afterEach(cleanup);

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });

function show(limit: string, price: string, services = false) {
    const technician = { ...createBusinessPartner("Electrician", "suppliers"), id: "elec", name: "Electrician", group: "technical-support", cost: cost("800", "per-project") };
    const oven = {
        ...createBusinessResourceSlot(), id: "oven", name: "Oven", status: "costs", category: "equipment", group: "devices-tools", quantity: "1", cost: cost(price, "per-unit", "item"),
        extraStatuses: services ? [{ id: "x", status: "partners-suppliers", providerId: "elec", activityId: "" }] : []
    };
    const initial = { ...asBusinessCapabilityValue(undefined), resources: { equipment: [{ id: "devices-tools", name: "", slots: [oven] }] }, providers: services ? [technician] : [] };
    function Harness() {
        const [value, setValue] = useState<unknown>(initial);
        return <BusinessCapabilityEditor value={value} onChange={setValue} globalSettings={{ ...createGlobalSettings(), capitalisationLimit: limit }} />;
    }
    render(<Harness />);
    openTile("Equipment", undefined, "Oven");
    return screen.queryByLabelText("Resource 1 useful life in years") as HTMLInputElement | null;
}

describe("Useful life is not asked on a card", () => {

    it("an asset card has no Useful life field, whatever it costs: the years are set under the group on Global Settings", () => {
        expect(show("500", "1500")).toBeNull();
        cleanup();
        expect(show("", "20")).toBeNull();
    });

});
