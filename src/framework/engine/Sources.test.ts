// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { hostOf, isAcceptedHost, isAcceptedUrl, SOURCES, sourceLabel } from "./Sources";

/**
 * URLs that are NOT references, and so are exempt from the
 * accepted-sources rule. Each is matched as a prefix, with its reason.
 * Add to this list only for a URL a reader is never sent to.
 */
const NOT_REFERENCES: { prefix: string; reason: string }[] = [
    { prefix: "http://www.w3.org/2000/svg", reason: "the SVG XML namespace, not a link" },
    { prefix: "http://localhost", reason: "the local dev server" },
    { prefix: "https://example.com/", reason: "reserved example domain (RFC 2606): tests prove it is rejected" }
];

/** The files the scan reads: every source file and content Markdown under src/. */
const SCANNED = /\.(ts|tsx|css|md|html)$/;

const SRC = new URL("../../", import.meta.url);

function externalUrls(): { file: string; url: string }[] {
    const found: { file: string; url: string }[] = [];
    for (const file of readdirSync(SRC, { recursive: true })) {
        const path = file.replace(/\\/g, "/");
        if (!SCANNED.test(path)) {
            continue;
        }
        const text = readFileSync(new URL(path, SRC), "utf8");
        for (const match of text.matchAll(/https?:\/\/[^\s"'`)<>\\]+/g)) {
            found.push({ file: path, url: match[0] });
        }
    }
    return found;
}

describe("accepted sources", () => {

    it("accepts governments, universities and the named official bodies", () => {
        for (const host of [
            "sba.gov", "irs.gov", "federalreserve.gov", "extension.colostate.edu",
            "law.cornell.edu", "gov.uk", "ox.ac.uk", "abs.gov.au", "ec.europa.eu",
            "w3.org", "ifrs.org", "openstax.org"
        ]) {
            expect(isAcceptedHost(host), host).toBe(true);
        }
    });

    it("rejects open-edit, commercial and explainer sites", () => {
        for (const host of [
            "en.wikipedia.org", "corporatefinanceinstitute.com", "wallstreetprep.com",
            "wallstreetmojo.com", "investopedia.com", "klipfolio.com", "umbrex.com",
            "biz.libretexts.org", "govnews.com", "edu.example.com", ""
        ]) {
            expect(isAcceptedHost(host), host).toBe(false);
        }
    });

    it("reads the host without www and refuses plain http", () => {
        expect(hostOf("https://www.sba.gov/x")).toBe("sba.gov");
        // Built in two parts so the scan below does not read it as a link.
        expect(isAcceptedUrl("http" + "://www.sba.gov/x")).toBe(false);
        expect(isAcceptedUrl("not a url")).toBe(false);
    });

    it("names a source by its publisher and title", () => {
        expect(sourceLabel(SOURCES.breakEvenPoint))
            .toBe("U.S. Small Business Administration, “Calculate your startup costs: break-even point”");
    });

    it("keeps every registered source accepted and dated", () => {
        for (const [name, source] of Object.entries(SOURCES)) {
            expect(isAcceptedUrl(source.url), name).toBe(true);
            expect(source.checked, name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(source.publisher.length, name).toBeGreaterThan(0);
        }
    });

    it("finds no external URL in the app outside the accepted sources", () => {
        const urls = externalUrls();
        // The scan does read the files: the registered sources are in it.
        expect(urls.some(entry => entry.url === SOURCES.breakEvenPoint.url)).toBe(true);
        const refused = urls.filter(({ url }) =>
            !NOT_REFERENCES.some(exception => url.startsWith(exception.prefix)) && !isAcceptedUrl(url));
        expect(refused).toEqual([]);
    });

});
