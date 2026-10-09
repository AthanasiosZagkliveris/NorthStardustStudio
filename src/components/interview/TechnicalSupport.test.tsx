import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openCard, openTile } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot, serviceAssetLinks, servicesOfAsset } from "../../framework/engine/AnswerUtils";
import { asLegalEntityValue } from "../../framework/engine/AnswerUtils";
import { assetValue, asFinancialFoundationValue, consolidateCosts } from "../../framework/engine/FinancialModel";

/* H2: a Technical Support service named by an asset card is added to that asset's value; one not named stays its own cost. */

afterEach(cleanup);

const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", unit: "", currency: "" });
const supplier = (id: string, group: string, price: string) => ({ ...createBusinessPartner(id, "suppliers"), id, name: id, group, cost: cost(price, "per-project") });
const oven = (extra: object = {}) => ({
    ...createBusinessResourceSlot(), id: "oven", name: "Oven", status: "costs", category: "equipment", group: "devices-tools",
    cost: cost("4000", "per-unit"), extraStatuses: [{ id: "x1", status: "partners-suppliers", providerId: "elec", activityId: "" }], ...extra
});
const capability = (slot = oven()) => ({
    ...asBusinessCapabilityValue(undefined),
    providers: [supplier("elec", "technical-support", "800"), supplier("seller", "goods-equipment", "50")],
    resources: { equipment: [{ id: "devices-tools", name: "", slots: [slot] }] }
});

describe("services bundled into an asset", () => {

    it("a Technical Support supplier named by the asset is linked to it; another group, or an unnamed one, is not", () => {
        const value = asBusinessCapabilityValue(capability());
        expect(serviceAssetLinks(value)).toEqual({ elec: "oven" });
        expect(servicesOfAsset(value, "oven").map(partner => partner.id)).toEqual(["elec"]);
        const other = asBusinessCapabilityValue(capability(oven({ extraStatuses: [{ id: "x1", status: "partners-suppliers", providerId: "seller", activityId: "" }] })));
        expect(serviceAssetLinks(other)).toEqual({});
    });

    it("an asset that is not costing, or not a purchase, takes no service", () => {
        expect(serviceAssetLinks(asBusinessCapabilityValue(capability(oven({ status: "exists" }))))).toEqual({});
    });

    it("the cost line of the service says the asset it goes into, and the asset is worth both", () => {
        const sources = { legalEntity: asLegalEntityValue({}), capability: asBusinessCapabilityValue(capability()), resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false };
        const lines = consolidateCosts(asFinancialFoundationValue({}), sources);
        expect(lines.find(line => line.id === "elec")?.capitalisedInto).toBe("oven");
        expect(lines.find(line => line.id === "oven")?.capitalisedInto).toBeUndefined();
        expect(assetValue(lines, "oven")).toBe(4800);
    });

});

describe("the asset card", () => {

    it("shows the value with its services", () => {
        function Harness() {
            const [value, setValue] = useState<unknown>(capability());
            return <BusinessCapabilityEditor value={value} onChange={setValue} organisationCurrency="EUR" />;
        }
        render(<Harness />);
        openTile("Equipment");
        openCard("Oven");
        expect(screen.getByText(/Value with its services: .*4,?800/)).toBeTruthy();
    });

});
