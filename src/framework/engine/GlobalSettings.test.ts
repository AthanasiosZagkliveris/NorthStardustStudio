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
import { CHANNEL_FEE_DATA, CHANNEL_FEE_PROVIDERS, FEE_COUNTRIES } from "./ChannelFeeData";
import { shownChannelFees } from "./CalculatedLines";
import { BUSINESS_CHANNEL_CATEGORIES } from "./businessFoundation/channelCategories";

/* I1: Global Settings, the one store of the rates and limits the calculated lines read. */

describe("the starting values", () => {

    it("hold the cost model's examples and leave a country's or the user's own figure empty", () => {
        const settings = createGlobalSettings();
        expect(settings.channelFees.filter(row => row.country === "GB" && row.status === "checked").map(row => [row.channel, row.commission, row.fixedFee, row.chargeback])).toEqual([
            ["Stripe Terminal", "1.4", "0.10", "0.5"],
            ["Stripe", "1.5", "0.20", "0.5"],
            ["SumUp", "1.69", "0", "0.5"],
            ["Zettle", "1.75", "0", "0.5"],
            ["Shopify Payments", "2", "0.25", "0.5"],
            ["PayPal", "2.9", "0.30", "1"],
            ["Etsy", "10.5", "0.20", "0"],
            ["Amazon Handmade", "12", "0", "0"],
            ["Amazon", "15", "0", "0"],
            ["Gumroad", "10", "0.50", "0"]
        ]);
        expect(settings.channelFees).toHaveLength(CHANNEL_FEE_DATA.length);
        // (A row not checked yet holds no rate unless its note names a secondary source; a row not available holds none.)
        expect(settings.channelFees.filter(row => row.status === "not-available").every(row => row.commission === "" && row.fixedFee === "")).toBe(true);
        expect(settings.channelFees.filter(row => row.status === "not-checked" && row.commission !== "").every(row => row.note.includes("secondary source"))).toBe(true);
        expect(settings.targetReserveMonths).toBe("3");
        expect(settings.usefulLife).toEqual({ "furniture-fittings": "10", "devices-tools": "6", "company-vehicles": "5", "fixtures-displays": "10", "production-machinery": "15", "delivery-vehicles": "7" });
        expect([settings.onCostRate, settings.capitalisationLimit, settings.insurancePerEmployee, settings.incomeTaxRate]).toEqual(["", "", "", ""]);
        expect(capitalisationLimitOf(settings)).toBeNull();
    });

    it("an Organisation that never saved any has them", () => {
        expect(asGlobalSettings(undefined)).toMatchObject({ targetReserveMonths: "3" });
        expect(asGlobalSettings(undefined).channelFees).toHaveLength(CHANNEL_FEE_DATA.length);
    });

});

describe("reading what was saved", () => {

    it("keeps exactly what was saved: a cleared figure stays cleared, a removed channel stays removed", () => {
        const settings = asGlobalSettings({ targetReserveMonths: "", channelFees: [], channelFeeDataVersion: 1, usefulLife: {} });
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

/* THE CHANNEL FEE DATA (owner, 2026-11-15 15:10 and 15:11): every listed provider in each of the six countries; the screen shows what the answers use. */
describe("the channel fee data", () => {

    it("holds a row for every listed provider and marketplace in each of the six countries", () => {
        const marketplaces = BUSINESS_CHANNEL_CATEGORIES.find(category => category.label === "Marketplace")!.channels.map(channel => channel.label);
        const listed = [...new Set([...CHANNEL_FEE_PROVIDERS, ...marketplaces])];
        const missing = listed.flatMap(provider => FEE_COUNTRIES.filter(country => !CHANNEL_FEE_DATA.some(row => row.country === country.code &&
            (row.provider === provider || provider.toLowerCase().includes(row.provider.toLowerCase())))).map(country => provider + " in " + country.code));
        expect(missing).toEqual([]);
        // (One row only for each provider in each country.)
        expect(new Set(CHANNEL_FEE_DATA.map(row => row.provider + "|" + row.country)).size).toBe(CHANNEL_FEE_DATA.length);
    });

    it("migrates a saved table: its rows become the UK's, and the rows it lacks are added once", () => {
        const saved = asGlobalSettings({ channelFees: [{ id: "fee-1", channel: "Stripe", commission: "1.5", fixedFee: "0.20", chargeback: "0.5", note: "" }, { id: "fee-2", channel: "Wolt, Amazon", commission: "25", fixedFee: "0", chargeback: "0", note: "" }] });
        expect(saved.channelFees[0]).toMatchObject({ id: "fee-1", country: "GB", currency: "GBP", status: "checked" });
        expect(saved.channelFees[1]).toMatchObject({ id: "fee-2", country: "GB", status: "" });
        expect(saved.channelFees.filter(row => row.channel === "Stripe" && row.country === "GB")).toHaveLength(1);
        expect(saved.channelFees.some(row => row.channel === "Stripe" && row.country === "NZ")).toBe(true);
        // (Saved again, a row the user removed stays removed.)
        const again = asGlobalSettings({ ...saved, channelFees: saved.channelFees.filter(row => !(row.channel === "PayPal" && row.country === "GB")) });
        expect(again.channelFees.some(row => row.channel === "PayPal" && row.country === "GB")).toBe(false);
    });

    it("shows only the country's rows that the answers name, and every row the user made", () => {
        const table = [...createGlobalSettings().channelFees, { ...createChannelFeeRow("GB"), channel: "Not On The High Street" }];
        expect(shownChannelFees(table, "GB", ["Etsy", "Shopify Payments", "TikTok Shop"]).map(row => row.channel)).toEqual(["Shopify Payments", "Etsy", "TikTok Shop", "Not On The High Street"]);
        expect(shownChannelFees(table, "NZ", ["Amazon"]).map(row => [row.channel, row.status])).toEqual([["Amazon", "not-available"]]);
        expect(shownChannelFees(table, "US", [])).toEqual([]);
    });

});
