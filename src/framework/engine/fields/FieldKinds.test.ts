import { describe, expect, test } from "vitest";

import { fieldKindOf, kindIsAnswer } from "./FieldKinds.ts";

describe("a field's kind", () => {

    test("is an answer unless it is a status, a link, a display setting, a name or a choice with its own not-yet", () => {
        expect(fieldKindOf(1, ["organization", "legal-form"]).kind).toBe("answer");
        expect(fieldKindOf(3, ["infrastructure", "res-1", "status"])).toEqual({ kind: "none", why: "status" });
        expect(fieldKindOf(3, ["infrastructure", "res-1", "performer"])).toEqual({ kind: "none", why: "link" });
        expect(fieldKindOf(4, ["theme-1", "metric-1", "currency"])).toEqual({ kind: "none", why: "display" });
        expect(fieldKindOf(3, ["income-tax"])).toEqual({ kind: "none", why: "has-own-option" });
        expect(fieldKindOf(1, ["legal-entity-expenses", "exp-1", "name"])).toEqual({ kind: "none", why: "name" });
        expect(kindIsAnswer("answer")).toBe(true);
        expect(kindIsAnswer("none")).toBe(false);
    });

});
