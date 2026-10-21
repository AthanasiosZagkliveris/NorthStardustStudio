import { describe, expect, it } from "vitest";
import { componentTokens, cornerSteps, lookHeight, renderComponentTokens } from "./componentTokens.ts";
import { corners } from "../styles/tokens/tokens.ts";
import { sheetSource, stylesheet } from "../test/stylesheet.ts";

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

    it("have the corner steps the app's own token file holds (the app does not import the library, so it carries the three numbers itself)", () => {
        expect(corners).toEqual(cornerSteps());
    });

    it("are read by the stylesheets and written by none of them", () => {
        const source = sheetSource("global.css");
        expect(source.startsWith("/* Generated"), "global.css loads the generated tokens first").toBe(true);
        const global = source.slice(source.indexOf("* {"));
        for (const token of ["--card-cell-height", "--size-box-button", "--size-mark", "--control-square", "--box-radius", "--fold-arrow-size"]) {
            expect(global.includes(token + ":"), token + " is defined in global.css").toBe(false);
        }
    });

});
