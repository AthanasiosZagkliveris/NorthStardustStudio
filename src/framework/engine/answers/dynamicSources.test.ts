import { describe, expect, it } from "vitest";
import { AnswerType } from "../../enums/AnswerType.ts";
import { offeringName } from "../export/ExportRenderers.ts";
import { asFinancialSustainabilityValue } from "../financial/revenueStored.ts";
import { bespokeDynamicOptions, sectionName } from "./dynamicSources.ts";
import lumenText from "../../../data/examples/lumen-and-loom-studio.json?raw";

const business = (JSON.parse(lumenText) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> })
    .systems["3"].responses;
const valueOf = (number: number) => business.find(response => response.sectionNumber === number)?.value;
const foundation = valueOf(1);
const revenue = valueOf(4);
const responseOf = (type: AnswerType) => (type === AnswerType.BusinessFoundation ? foundation : undefined);

describe("a Dynamic Field reading Revenue & Pricing", () => {

    it("lists each Revenue Stream by its Offering's name, once, in order", () => {
        const expected = [...new Set(asFinancialSustainabilityValue(revenue).streams
            .map(stream => offeringName(foundation, stream.offeringId)).filter(Boolean))];
        expect(expected.length).toBeGreaterThan(0);
        expect(bespokeDynamicOptions(AnswerType.FinancialSustainability, revenue, "Revenue Streams", responseOf)).toEqual(expected);
        expect(bespokeDynamicOptions(AnswerType.FinancialSustainability, revenue, "revenue stream", responseOf)).toEqual(expected);
    });

    it("skips a stream whose Offering is not chosen yet", () => {
        const value = { streams: [{ id: "s1", offeringId: "" }] };
        expect(bespokeDynamicOptions(AnswerType.FinancialSustainability, value, "Revenue Streams", responseOf)).toEqual([]);
    });

    it("gives nothing for another name or another page", () => {
        expect(bespokeDynamicOptions(AnswerType.FinancialSustainability, revenue, "Costs", responseOf)).toEqual([]);
        expect(bespokeDynamicOptions(AnswerType.Table, revenue, "Revenue Streams", responseOf)).toEqual([]);
    });

});

describe("a page's name", () => {

    it("leaves out the period placeholder", () => {
        expect(sectionName("Revenue & Pricing MM/YY - MM/YY")).toBe("Revenue & Pricing");
        expect(sectionName("Revenue & Pricing")).toBe("Revenue & Pricing");
        expect(sectionName("Goals & Objectives MM/YY - MM/YY")).toBe("Goals & Objectives");
    });

});
