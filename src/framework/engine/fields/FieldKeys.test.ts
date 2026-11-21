import { afterEach, describe, expect, it, test } from "vitest";
import { clearFieldRegistry, currentFieldKey, fieldKey, isYesNoPair, parseFieldKey, registerField, registeredFields, sectionSegment, slug, writeField } from "./FieldKeys";
import { frameworkRegistry } from "../FrameworkRegistry";
import { AnswerType } from "../../enums/AnswerType";
import { pageFields } from "../../../components/interview/rails/railItems";
import { fieldKindOf } from "./FieldKinds.ts";

afterEach(clearFieldRegistry);

describe("field keys", () => {

    it("keeps a key saved under the US spelling when its label is written in UK English", () => {
        expect(slug("Organisation Name")).toBe(slug("Organization Name"));
        expect(sectionSegment("Organisation")).toBe("organization");
        expect(slug("Specialised Sectors")).toBe("specialized-sectors");
    });

    it("names a field by System, page and path, and reads the name back", () => {
        const key = fieldKey({ systemNumber: 1, sectionNumber: 3, path: ["organization", "legal-form"] });
        expect(key).toBe("1.3:organization/legal-form");
        expect(parseFieldKey(key)).toEqual({ systemNumber: 1, sectionNumber: 3, path: ["organization", "legal-form"] });
    });

    it("keeps a segment holding / or : whole", () => {
        const key = fieldKey({ systemNumber: 3, sectionNumber: 2, path: ["a/b", "c:d"] });
        expect(parseFieldKey(key)?.path).toEqual(["a/b", "c:d"]);
        expect(parseFieldKey("not a key")).toBeNull();
    });

    it("turns a label into a segment", () => {
        expect(slug("Legal Form")).toBe("legal-form");
        expect(slug("Infrastructure & Capability")).toBe("infrastructure-and-capability");
        expect(slug("  Working Hours / Month ")).toBe("working-hours-month");
    });

});

describe("reading and writing by path", () => {

    const value = { segments: [{ id: "seg-1", name: "Studios", offerings: [{ id: "off-1", price: "40" }] }] };

    it("writes a copy along the path, sharing the rest", () => {
        const next = writeField(value, ["segments", "seg-1", "offerings", "off-1", "price"], "45") as typeof value;
        expect(next.segments[0].offerings[0].price).toBe("45");
        expect(value.segments[0].offerings[0].price).toBe("40");
        expect(writeField({}, ["a", "b"], 1)).toEqual({ a: { b: 1 } });
        expect(writeField(value, ["segments", "missing", "name"], "x")).toEqual(value);
    });

});

describe("the field registry", () => {

    it("lists a page's fields as they are recorded", () => {
        registerField({ key: "1.3:organization/legal-form", label: "Legal Form", pageTitle: "3. Legal Entity" });
        registerField({ key: "1.4:founders", label: "Founders", pageTitle: "4. Founders Profile" });
        expect(registeredFields(1, 3).map(entry => entry.label)).toEqual(["Legal Form"]);
        expect(registeredFields()).toHaveLength(2);
    });

    it("knows a page's own sections without rendering it", () => {
        const identity = frameworkRegistry.getFramework("identity");
        const legal = identity.sections.find(section => section.answer?.type === AnswerType.LegalEntity)!;
        const fields = pageFields(1, legal);
        expect(fields[0]).toEqual({ key: "1." + legal.number + ":organization", label: "Organisation", pageTitle: legal.number + ". Legal Entity" });
        const definition = identity.sections[0];
        expect(pageFields(1, definition).map(field => field.key)).toContain("1.1:" + definition.answer!.parts![0].id);
    });

});

describe("a yes-or-no choice", () => {

    it("is two choices that are each other's no", () => {
        expect(isYesNoPair(["Yes", "No"])).toBe(true);
        expect(isYesNoPair(["Registered", "Not yet registered"])).toBe(true);
        expect(isYesNoPair(["Fixed", "Variable"])).toBe(false);
        expect(isYesNoPair(["Per month", "Per week"])).toBe(false);
        expect(isYesNoPair(["Yes", "No", "Maybe"])).toBe(false);
    });

});

describe("currentFieldKey", () => {

    it("leads a key saved under a renamed label to the field's key now", () => {
        expect(currentFieldKey("3.3:founders/founder-a/hours-given")).toBe("3.3:founders/founder-a/frequency");
        expect(currentFieldKey("3.3:founders/founder-a/delivery-hours-week")).toBe("3.3:founders/founder-a/delivery-hours");
        expect(currentFieldKey("3.3:founders/founder-a/working-hrs")).toBe("3.3:founders/founder-a/working-hours");
        // Brand › Style: its fields moved into cards.
        expect(currentFieldKey("2.2:colours/primary-a-usage")).toBe("2.2:colours/brand-colour-primary-a/usage");
        expect(currentFieldKey("2.2:colours/secondary-b-hex")).toBe("2.2:colours/brand-colour-secondary-b/colour");
        expect(currentFieldKey("2.2:typography/optional-purpose")).toBe("2.2:typography/brand-typeface-optional/purpose");
        expect(currentFieldKey("2.2:typography/primary-font")).toBe("2.2:typography/brand-typeface-primary");
        // Anything else is itself.
        expect(currentFieldKey("1.3:organization/legal-form")).toBe("1.3:organization/legal-form");
        expect(currentFieldKey("not a key")).toBe("not a key");
    });

});

describe("a field's kind", () => {

    test("is an answer unless it is a status, a link, a display setting, a name or a choice with its own not-yet", () => {
        expect(fieldKindOf(1, ["organization", "legal-form"]).kind).toBe("answer");
        expect(fieldKindOf(3, ["infrastructure", "res-1", "status"])).toEqual({ kind: "none", why: "status" });
        expect(fieldKindOf(3, ["infrastructure", "res-1", "performer"])).toEqual({ kind: "none", why: "link" });
        expect(fieldKindOf(4, ["theme-1", "metric-1", "currency"])).toEqual({ kind: "none", why: "display" });
        expect(fieldKindOf(3, ["income-tax"])).toEqual({ kind: "none", why: "has-own-option" });
        expect(fieldKindOf(1, ["legal-entity-expenses", "exp-1", "name"])).toEqual({ kind: "none", why: "name" });
    });

});
