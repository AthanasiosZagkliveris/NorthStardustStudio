import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateCss, generateDtcg, generateReport, measureAll, parseColour, resolveMode } from "../../../scripts/tokens/build.ts";
import { MODES, seeds } from "./tokens.ts";

/* The generated colour files are committed; they must be exactly what
   tokens.ts produces. When one of these fails: run `npm run tokens`
   and commit the result. */
const onDisk = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");

describe("the generated colour files", () => {

    it("colors.generated.css is what tokens.ts produces", () => {
        expect(onDisk("../colors.generated.css")).toBe(generateCss());
    });

    it("tokens.dtcg.json is what tokens.ts produces", () => {
        expect(onDisk("./tokens.dtcg.json")).toBe(generateDtcg());
    });

    it("contrast-report.md is what tokens.ts produces", () => {
        expect(onDisk("./contrast-report.md")).toBe(generateReport());
    });

    it("holds every pair of colours that meet at its ratio, in every reading mode", () => {
        const misses = measureAll().filter(measured => !measured.pass).map(m => m.mode + " " + m.id + " " + m.ratio.toFixed(2) + " < " + m.min);
        expect(misses).toEqual([]);
    });

    it("reads every seed of every mode as a plain colour", () => {
        for (const mode of MODES) {
            for (const name of Object.values(seeds[mode])) expect(parseColour(resolveMode(mode).get(name)!), mode + " " + name).not.toBeNull();
        }
    });

});
