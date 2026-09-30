import { describe, expect, test } from "vitest";

import { STRATEGY_METRIC_UNITS, migratedMetricUnit } from "./AnswerUtils.ts";

describe("a Metric's unit", () => {

    test("offers Number, Percentage and Currency only", () => {
        expect([...STRATEGY_METRIC_UNITS]).toEqual(["Number", "Percentage", "Currency"]);
    });

    test("reads a saved Custom unit as one of them, keeping any words in the Description", () => {
        expect(migratedMetricUnit("Custom", "£", "", "Funding confirmed")).toEqual({ unit: "Currency", currency: "GBP", description: "Funding confirmed" });
        expect(migratedMetricUnit("Custom", "usd", "", "")).toMatchObject({ unit: "Currency", currency: "USD" });
        expect(migratedMetricUnit("Custom", "€", "", "")).toMatchObject({ unit: "Currency", currency: "EUR" });
        expect(migratedMetricUnit("Custom", "%", "", "")).toMatchObject({ unit: "Percentage" });
        expect(migratedMetricUnit("Custom", "", "", "")).toMatchObject({ unit: "Number" });
        expect(migratedMetricUnit("Custom", "hours per build", "", "Time on a build")).toEqual({
            unit: "Number", currency: "", description: "Time on a build\nUnit: hours per build"
        });
        // Any other unit is as it was.
        expect(migratedMetricUnit("Percentage", "", "", "x")).toEqual({ unit: "Percentage", currency: "", description: "x" });
    });

});
