import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import type { ExportBlock } from "./AnswerUtils.ts";
import { brandPictures, businessForecastContent, businessPlan } from "./BusinessDocuments.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MARKDOWN_IMAGE_MAX_BYTES, MarkdownExporter } from "./MarkdownExporter.ts";
import { PdfExporter, printableContent, svgAspect } from "./PdfExporter.ts";
import exampleText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

/* The brand's logo, icon and images in the Business Documents, from
   the Lumen & Loom Studio example with its Inventory page replaced. */

type SystemJson = Parameters<typeof InterviewSession.fromJSON>[0];

const example = JSON.parse(exampleText) as { systems: Record<string, SystemJson> };

const load = (number: number, id: string, system: SystemJson = example.systems[String(number)]) =>
    InterviewSession.fromJSON(system, frameworkRegistry.getFramework(id));

const svgLogo = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
const pngIcon = "data:image/png;base64,iVBORw0KGgo=";
const jpegPhoto = "data:image/jpeg;base64,/9j/4AAQ";
// Over the Markdown limit: a picture too large to carry in the file.
const bigPhoto = "data:image/jpeg;base64," + "A".repeat(Math.ceil(MARKDOWN_IMAGE_MAX_BYTES * 4 / 3) + 400);

/** The four Systems, the Brand System's Icon & Logo and Brand Images (the Style page's `inventory`) being `inventory`. */
function sessionsWith(inventory: unknown) {
    const brand = example.systems["2"] as unknown as { responses: { sectionNumber: number; value: unknown }[] };
    const responses = brand.responses.map(response => response.sectionNumber === 2 ? { ...response, value: { ...(response.value as object), inventory } } : response);
    return {
        identity: load(1, "identity"),
        brand: load(2, "brand", { ...(brand as object), responses } as unknown as SystemJson),
        business: load(3, "business"),
        strategy: load(4, "strategy"),
        organisationName: "Lumen & Loom Studio"
    };
}

const full = sessionsWith({
    icon: { file: { dataUrl: pngIcon, fileName: "icon.png" } },
    // Saved by the page's earlier two-file version: still the logo.
    logo: { svg: { dataUrl: svgLogo, fileName: "logo.svg" } },
    markDescription: "A loom's shuttle in a circle.",
    images: [
        { dataUrl: jpegPhoto, fileName: "studio.jpg", name: "Studio", description: "The studio at dusk." },
        { dataUrl: bigPhoto, fileName: "big.jpg", name: "Workshop", description: "" },
        { dataUrl: "", fileName: "", name: "Not uploaded", description: "Words, no picture." }
    ]
});

const empty = sessionsWith({ icon: {}, logo: {}, images: [] });

const appendixImages = (blocks: ExportBlock[]) => blocks.filter(block => block.kind === "images");

describe("the brand's pictures in the Business Documents", () => {

    test("the Plan and the Forecast carry the logo on their covers", () => {
        expect(businessPlan(full).documentLogo).toEqual({ src: svgLogo, alt: "Logo", title: "Logo" });
        expect(businessForecastContent(full, "annual", 1).documentLogo?.src).toBe(svgLogo);
    });

    test("the Appendix's brand guide shows the logo and icon, then the images with their words", () => {
        const appendix = businessPlan(full).sections.find(section => section.title === "Appendix")!;
        const images = appendixImages(appendix.blocks);
        expect(images).toHaveLength(2);
        expect(images[0].kind === "images" && images[0].items.map(item => item.title)).toEqual(["Logo", "Icon"]);
        expect(images[1].kind === "images" && images[1].items.map(item => [item.title, item.caption])).toEqual([
            ["Studio", "The studio at dusk."],
            ["Workshop", undefined]
        ]);
        expect(appendix.blocks).toContainEqual({ kind: "paragraph", text: "A loom's shuttle in a circle.", label: "Description" });
        expect(appendix.blocks).toContainEqual({ kind: "subheading", text: "Logo & Icon", level: 2 });
    });

    test("nothing at all where no pictures were uploaded", () => {
        const plan = businessPlan(empty);
        expect(plan.documentLogo).toBeUndefined();
        expect(businessForecastContent(empty, "annual", 1).documentLogo).toBeUndefined();
        const blocks = plan.sections.flatMap(section => section.blocks);
        expect(appendixImages(blocks)).toEqual([]);
        expect(blocks).not.toContainEqual({ kind: "subheading", text: "Logo & Icon", level: 2 });
        expect(blocks).not.toContainEqual({ kind: "subheading", text: "Brand Images", level: 2 });
        const html = new PdfExporter().buildHtml(plan);
        expect(html).not.toContain("<img");
        expect(html).not.toContain("class=\"print-frame\"");
        expect(new MarkdownExporter().toMarkdown(empty.business, "Foundation", plan)).not.toContain("![");
    });

    test("the PDF draws the logo on the cover and at every page's head, and the figures whole", () => {
        const html = new PdfExporter().buildHtml(businessPlan(full));
        expect(html).toContain(`<div class="document-logo"><img src="${svgLogo}" alt="Logo" /></div>`);
        expect(html).toContain(`<table class="print-frame"><thead><tr><td><div class="print-head"><img src="${svgLogo}" alt="" />`);
        expect(html).toContain("<figcaption><strong>Studio</strong><span>The studio at dusk.</span></figcaption>");
        expect(html).toContain(".export-figure { margin: 0 0 16px; break-inside: avoid;");
    });

    test("Markdown carries a small picture as a data URL, and names a large one instead", () => {
        const md = new MarkdownExporter().toMarkdown(full.business, "Foundation", businessPlan(full));
        expect(md.startsWith(`![Logo](${svgLogo})\n\n# Business Plan:`)).toBe(true);
        expect(md).toContain(`![Studio](${jpegPhoto})\n\n**Studio**: The studio at dusk.`);
        expect(md).toContain("_**Workshop**_");
        expect(md).not.toContain(bigPhoto);
    });

    test("only a data URL of an image is ever written", () => {
        const pictures = brandPictures({ logo: { file: { dataUrl: "javascript:alert(1)", fileName: "x" } }, images: [{ dataUrl: "data:text/html;base64,AA", name: "x", description: "", fileName: "" }] });
        expect(pictures.logo).toBeUndefined();
        expect(pictures.images).toEqual([]);
    });

});

describe("pictures made ready to print", () => {

    test("an SVG goes in drawn as a PNG, and a picture that will not load is left out", async () => {
        const drawn: string[] = [];
        const prepare = async (src: string) => {
            drawn.push(src);
            return src.startsWith("data:image/svg+xml") ? "data:image/png;base64,UkFTVEVS" : src === jpegPhoto ? null : src;
        };
        const ready = await printableContent(businessPlan(full), prepare);
        expect(drawn).toContain(svgLogo);
        expect(ready.documentLogo?.src).toBe("data:image/png;base64,UkFTVEVS");
        const images = appendixImages(ready.sections.find(section => section.title === "Appendix")!.blocks);
        expect(images[0].kind === "images" && images[0].items.map(item => item.src)).toEqual(["data:image/png;base64,UkFTVEVS", pngIcon]);
        // The photo that failed is gone; the one that loaded stays.
        expect(images[1].kind === "images" && images[1].items.map(item => item.title)).toEqual(["Workshop"]);
    });

    test("an SVG is drawn in its own shape, read from its viewBox or its size", () => {
        const svg = (markup: string) => "data:image/svg+xml;base64," + btoa(markup);
        expect(svgAspect(svg("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 352 64\"></svg>"))).toBe(5.5);
        expect(svgAspect(svg("<svg width=\"32\" height=\"64\"></svg>"))).toBe(0.5);
        expect(svgAspect(svg("<svg></svg>"))).toBeNull();
    });

    test("a logo that will not load leaves the cover and page heads without one", async () => {
        const ready = await printableContent(businessPlan(full), async () => null);
        expect(ready.documentLogo).toBeUndefined();
        expect(appendixImages(ready.sections.flatMap(section => section.blocks))).toEqual([]);
        expect(new PdfExporter().buildHtml(ready)).not.toContain("<img");
    });

});
