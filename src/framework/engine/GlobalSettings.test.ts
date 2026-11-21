import { describe, expect, it } from "vitest";
import { asGlobalSettings, capitalisationLimitOf, channelFeeOf, createChannelFeeRow, createGlobalSettings, targetReserveMonthsOf, usefulLifeOf } from "./GlobalSettings";
import { CHANNEL_FEE_DATA, CHANNEL_FEE_PROVIDERS, FEE_COUNTRIES, paymentServiceName, providerOffered } from "./channels/ChannelFeeData";
import { ownFeeChannelNames, resetChannelFees, shownChannelFees } from "./financial/CalculatedLines";
import { asBusinessEngagementValue } from "./businessFoundation/engagementReaders";
import { BUSINESS_CHANNEL_CATEGORIES } from "./businessFoundation/channelCategories";
import { browserCountryHint } from "./BrowserRegion.ts";

/* I1: Global Settings, the one store of the rates and limits the calculated lines read. */

describe("the starting values", () => {

    it("hold the cost model's examples and leave a country's or the user's own figure empty", () => {
        const settings = createGlobalSettings();
        expect(settings.channelFees.filter(row => row.country === "GB" && row.status === "checked").map(row => [row.channel, row.commission, row.fixedFee, row.chargeback])).toEqual([
            ["Stripe Terminal", "1.4", "0.10", "0.5"],
            ["Stripe", "1.5", "0.20", "0.5"],
            ["SumUp", "1.69", "0", "0.5"],
            ["Square", "1.75", "0", "0.5"],
            ["Zettle", "1.75", "0", "0.5"],
            ["Shopify Payments", "2", "0.25", "0.5"],
            ["PayPal", "2.9", "0.30", "1"],
            ["Etsy", "10.5", "0.20", "0"],
            ["Amazon Handmade", "12", "0", "0"],
            ["Amazon", "15", "0", "0"],
            // (Checked 2026-11-17, the owner's yes of 07:16: eBay's two UK rows, Not On The High Street, Folksy, Fiverr, Upwork, TikTok Shop.)
            ["eBay (private seller)", "0", "0", "0"],
            ["eBay", "12.9", "0.30", "0.35"],
            ["Not On The High Street", "25", "0", "0"],
            ["Folksy", "6", "0", "0"],
            ["Gumroad", "10", "0.50", "0"],
            ["Fiverr", "20", "0", "0"],
            ["Upwork", "15", "0", "0"],
            ["TikTok Shop", "9", "0", "0"]
        ]);
        expect(settings.channelFees).toHaveLength(CHANNEL_FEE_DATA.length);
        // (A row not checked yet holds no rate unless its note names a secondary source; a row not available holds none.)
        expect(settings.channelFees.filter(row => row.status === "not-available").every(row => row.commission === "" && row.fixedFee === "")).toBe(true);
        expect(settings.channelFees.filter(row => row.status === "not-checked" && row.commission !== "").every(row => row.note.includes("secondary source"))).toBe(true);
        expect(settings.targetReserveMonths).toBe("3");
        expect(settings.usefulLife).toEqual({ "furniture-fittings": "10", "devices-tools": "6", "company-vehicles": "5", "fixtures-displays": "10", "production-machinery": "15", "delivery-vehicles": "7" });
        expect([settings.onCostRate, settings.capitalisationLimit, settings.insurancePerEmployee]).toEqual(["", "", ""]);
        // (No income tax rate: Page 4's Plan Settings own it.)
        expect("incomeTaxRate" in settings).toBe(false);
        expect(capitalisationLimitOf(settings)).toBeNull();
    });

    it("an Organisation that never saved any has them", () => {
        expect(asGlobalSettings(undefined)).toMatchObject({ targetReserveMonths: "3" });
        expect(asGlobalSettings(undefined).channelFees).toHaveLength(CHANNEL_FEE_DATA.length);
    });

});

describe("reading what was saved", () => {

    it("keeps exactly what was saved: a cleared figure stays cleared, a removed channel stays removed", () => {
        const settings = asGlobalSettings({ targetReserveMonths: "", channelFees: [], channelFeeDataVersion: 3, usefulLife: {} });
        expect(settings.targetReserveMonths).toBe("");
        expect(settings.channelFees).toEqual([]);
        expect(settings.usefulLife).toEqual({});
    });

    it("cleans a figure to digits and one point", () => {
        const settings = asGlobalSettings({ onCostRate: "2,5%", capitalisationLimit: "5.0.0", insurancePerEmployee: 40, incomeTaxRate: "-9" });
        expect([settings.onCostRate, settings.capitalisationLimit, settings.insurancePerEmployee]).toEqual(["25", "5.00", "40"]);
        expect("incomeTaxRate" in settings).toBe(false);
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

});

/* THE CHANNEL FEE DATA (owner, 2026-11-15 15:10 and 15:11): every listed provider in each of the six countries; the screen shows what the answers use. */
describe("the channel fee data", () => {

    it("gives a table saved at version 2 the rows checked on 2026-11-17, keeps a row the founder changed, and adds the new providers in the data's order", () => {
        const v2 = createGlobalSettings().channelFees.map(row => row.channel === "Square" || (row.channel === "eBay" && row.country !== "NZ") || row.channel === "Wolt" && row.country === "GB"
            ? { ...row, status: "not-checked" as const, commission: "", fixedFee: "", chargeback: "", note: "Not checked yet" }
            : row).filter(row => row.channel !== "PayPal Point of Sale" && row.channel !== "eBay (private seller)");
        // (The founder filled in Square's US rate by hand: it stays theirs.)
        const own = v2.map(row => row.channel === "Square" && row.country === "US" ? { ...row, commission: "2.7" } : row);
        const read = asGlobalSettings({ channelFees: [...own, { ...createChannelFeeRow("GB"), channel: "Vinted", commission: "5" }], channelFeeDataVersion: 2 }).channelFees;
        expect(read.find(row => row.channel === "Square" && row.country === "GB")).toMatchObject({ status: "checked", commission: "1.75" });
        expect(read.find(row => row.channel === "Square" && row.country === "US")).toMatchObject({ status: "not-checked", commission: "2.7" });
        expect(read.find(row => row.channel === "Wolt" && row.country === "GB")?.status).toBe("not-available");
        // (PayPal Point of Sale before PayPal, so a card named after it takes its own row.)
        const at = (channel: string) => read.findIndex(row => row.channel === channel && row.country === "US");
        expect(at("PayPal Point of Sale")).toBeGreaterThan(-1);
        expect(at("PayPal Point of Sale")).toBeLessThan(at("PayPal"));
        expect(read[read.length - 1].channel).toBe("Vinted");
    });

    it("never offers a provider where it does not sell, and names Zettle PayPal Point of Sale in the US", () => {
        expect(providerOffered("Square", "NZ")).toBe(false);
        expect(providerOffered("Square", "GB")).toBe(true);
        expect(providerOffered("Folksy", "US")).toBe(false);
        expect(providerOffered("Folksy", undefined)).toBe(true);
        expect(paymentServiceName("Zettle", "US")).toBe("PayPal Point of Sale");
        expect(paymentServiceName("Zettle", "GB")).toBe("Zettle");
    });

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
        // (The old combined "Wolt, Amazon" row is gone: Wolt and Amazon have rows of their own.)
        expect(saved.channelFees.some(row => row.channel === "Wolt, Amazon")).toBe(false);
        expect(saved.channelFees.filter(row => row.country === "GB" && (row.channel === "Wolt" || row.channel === "Amazon"))).toHaveLength(2);
        expect(saved.channelFees.filter(row => row.channel === "Stripe" && row.country === "GB")).toHaveLength(1);
        expect(saved.channelFees.some(row => row.channel === "Stripe" && row.country === "NZ")).toBe(true);
        // (Saved again, a row the user removed stays removed.)
        const again = asGlobalSettings({ ...saved, channelFees: saved.channelFees.filter(row => !(row.channel === "PayPal" && row.country === "GB")) });
        expect(again.channelFees.some(row => row.channel === "PayPal" && row.country === "GB")).toBe(false);
    });

    it("shows only the country's rows that the answers name; a row made by hand that no channel names leaves (owner, 2026-11-15 16:37)", () => {
        const table = [...createGlobalSettings().channelFees, { ...createChannelFeeRow("GB"), channel: "Vinted" }];
        expect(shownChannelFees(table, "GB", ["Etsy", "Shopify Payments", "TikTok Shop"]).map(row => row.channel)).toEqual(["Shopify Payments", "Etsy", "TikTok Shop"]);
        expect(shownChannelFees(table, "GB", ["Vinted"]).map(row => row.channel)).toEqual(["Vinted"]);
        expect(shownChannelFees(table, "NZ", ["Amazon"]).map(row => [row.channel, row.status])).toEqual([["Amazon", "not-available"]]);
        expect(shownChannelFees(table, "US", [])).toEqual([]);
    });

});

/* THE USER'S OWN SUBCHANNELS AND THE RESET (owner, 2026-11-15 15:54). */
describe("a subchannel named by the user, and the reset of the Channel Fee Table", () => {

    it("lists each subchannel of a paying category named by the user, once; a listed one, a blank one or one not yet named is not", () => {
        const engagement = asBusinessEngagementValue({
            segments: [
                { segmentId: "a", channels: [
                    { id: "1", category: "Marketplace", name: "Vinted", offerings: ["*"], stages: [] },
                    { id: "2", category: "Marketplace", name: "Etsy", offerings: ["*"], stages: [] },
                    { id: "3", category: "Direct Payment", name: "Other", offerings: ["*"], stages: [] },
                    { id: "4", category: "Social Media", name: "Bluesky", offerings: ["*"], stages: [] }
                ] },
                { segmentId: "b", channels: [{ id: "5", category: "Marketplace", name: "vinted", offerings: ["*"], stages: [] }] }
            ]
        });
        expect(ownFeeChannelNames(engagement)).toEqual(["Vinted"]);
    });

    it("the reset gives back the country's rows from the app's data and keeps the rows the user made and other countries' rows", () => {
        const data = createGlobalSettings().channelFees;
        const own = { ...createChannelFeeRow("GB"), channel: "Vinted", commission: "25" };
        const edited = data.map(row => row.channel === "Stripe" && row.country === "GB" ? { ...row, commission: "9" } : row)
            .filter(row => !(row.channel === "PayPal" && row.country === "GB"))
            .map(row => row.channel === "Stripe" && row.country === "US" ? { ...row, commission: "7" } : row);
        const reset = resetChannelFees([...edited, own], "GB", data);
        expect(reset.find(row => row.channel === "Stripe" && row.country === "GB")?.commission).toBe("1.5");
        expect(reset.some(row => row.channel === "PayPal" && row.country === "GB")).toBe(true);
        expect(reset.find(row => row.channel === "Stripe" && row.country === "US")?.commission).toBe("7");
        expect(reset.find(row => row.channel === "Vinted")?.commission).toBe("25");
        expect(reset).toHaveLength(data.length + 1);
    });

});

const SIX = ["GB", "IE", "US", "CA", "AU", "NZ"];

describe("the country a browser suggests", () => {

    it("is the region of the language", () => {
        expect(browserCountryHint(["en-GB"], "", SIX)).toBe("GB");
        expect(browserCountryHint(["fr-CA", "en-US"], "", SIX)).toBe("CA");
        expect(browserCountryHint(["en_AU"], "", SIX)).toBe("AU");
    });

    it("falls back to the time zone where the language names no region of the six", () => {
        expect(browserCountryHint(["en"], "Europe/Dublin", SIX)).toBe("IE");
        expect(browserCountryHint(["de-DE"], "Pacific/Auckland", SIX)).toBe("NZ");
        expect(browserCountryHint([], "America/Chicago", SIX)).toBe("US");
    });

    it("suggests nothing for any other country", () => {
        expect(browserCountryHint(["de-DE"], "Europe/Berlin", SIX)).toBe("");
        expect(browserCountryHint([], "", SIX)).toBe("");
    });

});
