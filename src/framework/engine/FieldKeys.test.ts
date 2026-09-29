import { afterEach, describe, expect, it } from "vitest";

import {
    clearFieldRegistry,
    fieldKey,
    isWithin,
    pageKeyPrefix,
    parseFieldKey,
    readField,
    registerField,
    registeredFields,
    slug,
    writeField
} from "./FieldKeys";
import { frameworkRegistry } from "./FrameworkRegistry";
import { AnswerType } from "../enums/AnswerType";
import { pageFields } from "../../components/interview/rails/railItems";

afterEach(clearFieldRegistry);

describe("field keys", () => {

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

    it("tells whether a key lies inside another", () => {
        expect(isWithin("1.3:organization/legal-form", "1.3:organization")).toBe(true);
        expect(isWithin("1.3:organizations", "1.3:organization")).toBe(false);
        expect(isWithin("1.3:organization", pageKeyPrefix(1, 3))).toBe(true);
        expect(isWithin("1.4:x", pageKeyPrefix(1, 3))).toBe(false);
    });

});

describe("reading and writing by path", () => {

    const value = { segments: [{ id: "seg-1", name: "Studios", offerings: [{ id: "off-1", price: "40" }] }] };

    it("walks objects by key and arrays by an element's id", () => {
        expect(readField(value, ["segments", "seg-1", "name"])).toBe("Studios");
        expect(readField(value, ["segments", "seg-1", "offerings", "off-1", "price"])).toBe("40");
        expect(readField(value, ["segments", "0", "name"])).toBe("Studios");
        expect(readField(value, ["segments", "missing", "name"])).toBeUndefined();
    });

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
        expect(fields[0]).toEqual({ key: "1." + legal.number + ":organization", label: "Organization", pageTitle: legal.number + ". Legal Entity" });
        const definition = identity.sections[0];
        expect(pageFields(1, definition).map(field => field.key)).toContain("1.1:" + definition.answer!.parts![0].id);
    });

});
