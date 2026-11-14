import { describe, expect, it } from "vitest";

import {
    asGlobalSettings,
    capitalisationLimitOf,
    channelFeeOf,
    createChannelFeeRow,
    createGlobalSettings,
    employerOnCosts,
    targetReserveMonthsOf,
    usefulLifeOf
} from "./GlobalSettings";

/* I1: Global Settings, the one store of the rates and limits the calculated lines read. */

describe("the starting values", () => {

    it("hold the cost model's examples and leave a country's or the user's own figure empty", () => {
        const settings = createGlobalSettings();
        expect(settings.channelFees.map(row => [row.channel, row.commission, row.fixedFee, row.chargeback])).toEqual([
            ["Stripe Terminal", "1.4", "0.10", "0.5"],
            ["Stripe", "1.5", "0.20", "0.5"],
            ["SumUp", "1.69", "0", "0.5"],
            ["Shopify Payments", "2", "0.25", "0.5"],
            ["Etsy", "10.5", "0.20", "0"],
            ["PayPal", "3.5", "0.35", "1"],
            ["Wolt, Amazon", "25", "0", "0"]
        ]);
        expect(settings.targetReserveMonths).toBe("3");
        expect(settings.usefulLife).toEqual({ "furniture-fittings": "10", "devices-tools": "6", "company-vehicles": "5", "fixtures-displays": "10", "production-machinery": "15", "delivery-vehicles": "7" });
        expect([settings.onCostRate, settings.capitalisationLimit, settings.insurancePerEmployee, settings.incomeTaxRate]).toEqual(["", "", "", ""]);
        expect(capitalisationLimitOf(settings)).toBeNull();
    });

    it("an Organisation that never saved any has them", () => {
        expect(asGlobalSettings(undefined)).toMatchObject({ targetReserveMonths: "3" });
        expect(asGlobalSettings(undefined).channelFees).toHaveLength(7);
    });

});

describe("reading what was saved", () => {

    it("keeps exactly what was saved: a cleared figure stays cleared, a removed channel stays removed", () => {
        const settings = asGlobalSettings({ targetReserveMonths: "", channelFees: [], usefulLife: {} });
        expect(settings.targetReserveMonths).toBe("");
        expect(settings.channelFees).toEqual([]);
        expect(settings.usefulLife).toEqual({});
    });

    it("cleans a figure to digits and one point", () => {
        const settings = asGlobalSettings({ onCostRate: "2,5%", capitalisationLimit: "5.0.0", insurancePerEmployee: 40, incomeTaxRate: "-9" });
        expect([settings.onCostRate, settings.capitalisationLimit, settings.insurancePerEmployee, settings.incomeTaxRate]).toEqual(["25", "5.00", "40", "9"]);
    });

    it("is idempotent", () => {
        const once = asGlobalSettings(createGlobalSettings());
        expect(asGlobalSettings(JSON.parse(JSON.stringify(once)))).toEqual(once);
    });

    it("keeps only the useful life of the known asset groups", () => {
        expect(asGlobalSettings({ usefulLife: { "devices-tools": "4", premises: "30" } }).usefulLife).toEqual({ "devices-tools": "4" });
    });

});

describe("the readers", () => {

    it("give the useful life of a group, the capitalisation limit and the reserve", () => {
        const settings = { ...createGlobalSettings(), capitalisationLimit: "500", targetReserveMonths: "6" };
        expect(usefulLifeOf(settings, "production-machinery")).toBe(15);
        expect(usefulLifeOf(settings, "furniture-fittings")).toBe(10);
        expect(usefulLifeOf({ ...settings, usefulLife: {} }, "furniture-fittings")).toBeNull();
        expect(capitalisationLimitOf(settings)).toBe(500);
        expect(targetReserveMonthsOf(settings)).toBe(6);
        expect(targetReserveMonthsOf({ ...settings, targetReserveMonths: "" })).toBe(3);
    });

    it("work out the channel fee of the cost model: Stripe (UK cards, checked 14/11/2026) on 100,000 and 4,000 orders is 2,800", () => {
        const stripe = createGlobalSettings().channelFees.find(row => row.channel === "Stripe")!;
        expect(channelFeeOf(stripe, 100000, 4000)).toBe(2800);
        expect(channelFeeOf({ ...createChannelFeeRow(), commission: "25" }, 1000, 0)).toBe(250);
    });

    it("work out employer on-costs: 6,000 of salaries at 25% is 1,500; nothing while no coefficient is set", () => {
        expect(employerOnCosts({ ...createGlobalSettings(), onCostRate: "25" }, 6000)).toBe(1500);
        expect(employerOnCosts(createGlobalSettings(), 6000)).toBe(0);
    });

});
