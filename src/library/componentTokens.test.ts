import { describe, expect, it } from "vitest";
import { componentTokens, lookHeight, renderComponentTokens } from "./componentTokens.ts";
import { stylesheet } from "../test/stylesheet.ts";

/* The sizes of the components are written once, in the library, and the stylesheets read them
   (src/styles/components.generated.css, written by npm run library:tokens). */

describe("the component tokens", () => {

    it("are what the library says: the generated stylesheet is the library's, token by token", () => {
        const generated = stylesheet("components.generated.css");
        for (const t of componentTokens()) expect(generated, t.token).toContain(t.token + ": " + t.value + ";");
        expect(generated.replace(/\s+/g, " ")).toBe(renderComponentTokens().replace(/\s+/g, " "));
    });

    it("hold the sizes of the owner's decisions: a cell 44, a box button 32, a mark 24", () => {
        expect(lookHeight("TXT.001")).toBe(44);
        expect(lookHeight("BTN.001")).toBe(32);
        expect(lookHeight("BTN.002")).toBe(24);
        expect(lookHeight("TIK.001")).toBe(24);
    });

    it("are read by the stylesheets and written by none of them", () => {
        const global = stylesheet("global.css");
        for (const token of ["--card-cell-height", "--size-box-button", "--size-mark", "--control-square", "--box-radius", "--fold-arrow-size"]) {
            expect(global.includes(token + ":"), token + " is defined in global.css").toBe(false);
        }
    });

});
