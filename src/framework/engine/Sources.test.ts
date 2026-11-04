// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { harvardCitation, harvardDate, harvardParts, harvardReference, hostOf, isAcceptedHost, isAcceptedUrl, referenceList, SOURCES, sourceLabel } from "./Sources";

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

    it("writes a source as a Harvard reference, and cites it by author and year", () => {
        expect(harvardReference(SOURCES.ukSicCodes)).toBe(
            "Companies House (2025) Standard industrial classification of economic activities (SIC). Available at: " +
            SOURCES.ukSicCodes.url + " (Accessed: 1 October 2026).");
        expect(sourceLabel(SOURCES.ukSicCodes)).toBe(harvardReference(SOURCES.ukSicCodes));
        // A part of a book: the part in quotation marks, the book in italics, then place and publisher.
        const chapter = harvardParts(SOURCES.breakEvenInDollars);
        expect(chapter.map(part => part.text).join("")).toBe(
            "Franklin, M., Graybeal, P. and Cooper, D. (2019) ‘3.2 Calculate a Break-Even Point in Units and Dollars’, in Principles of Accounting, Volume 2: Managerial Accounting. " +
            "Houston, TX: OpenStax, Rice University. Available at: " + SOURCES.breakEvenInDollars.url + " (Accessed: 29 September 2026).");
        expect(chapter.filter(part => part.italic).map(part => part.text)).toEqual(["Principles of Accounting, Volume 2: Managerial Accounting"]);
        expect(chapter.filter(part => part.link).map(part => part.text)).toEqual([SOURCES.breakEvenInDollars.url]);
        // An article: the journal in italics, then volume, issue and pages; four or more authors as "et al.".
        expect(harvardReference(SOURCES.customerLifetime)).toContain("Gupta, S. et al. (2006) ‘Modeling Customer Lifetime Value’, Journal of Service Research, 9(2), pp. 139–155. Available at:");
        // Editors.
        expect(harvardReference(SOURCES.contrastRatio)).toMatch(/^Kirkpatrick, A\. et al\. \(eds\) \(2025\) /);
        // A title that ends in a question mark takes no full stop.
        expect(harvardReference(SOURCES.frs102Intangibles)).toContain("what's changed? Available at:");
        // In the text: surnames and year.
        expect(harvardCitation(SOURCES.breakEvenInDollars)).toBe("(Franklin, Graybeal and Cooper, 2019)");
        expect(harvardCitation(SOURCES.loanRepayment)).toBe("(Gutierrez and Dalsted, 2012)");
        expect(harvardCitation(SOURCES.customerLifetime)).toBe("(Gupta et al., 2006)");
        expect(harvardCitation(SOURCES.breakEvenPoint)).toBe("(U.S. Small Business Administration, n.d.)");
        expect(harvardDate("2026-10-01")).toBe("1 October 2026");
    });

    it("lists every source once, in alphabetical order, as a reference list does", () => {
        const list = referenceList();
        expect(list).toHaveLength(Object.keys(SOURCES).length);
        const lines = list.map(({ source }) => harvardReference(source));
        expect([...lines].sort((one, other) => one.localeCompare(other, "en-GB", { sensitivity: "base" }))).toEqual(lines);
        expect(list[0].id).toBe("frs102Intangibles");
    });

    it("keeps every registered source accepted and dated", () => {
        for (const [name, source] of Object.entries(SOURCES)) {
            expect(isAcceptedUrl(source.url), name).toBe(true);
            expect(source.checked, name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(source.publisher.length, name).toBeGreaterThan(0);
            expect(source.authors.length, name).toBeGreaterThan(0);
            expect(source.year, name).toMatch(/^(?:\d{4}|n\.d\.)$/);
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
