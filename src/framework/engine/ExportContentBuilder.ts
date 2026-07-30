import { InterviewSession } from "../interview";
import { buildAnswerBlocks, defaultAnswerValue, ExportBlock } from "./AnswerUtils.ts";

/**
 * The exportable content of a single Section:
 * its number, title, and the user's answer only.
 * Help, Questions and Scope content are intentionally
 * excluded from every export format.
 */
export interface ExportSectionContent {
    number: number;
    title: string;
    blocks: ExportBlock[];
}

/**
 * One Product's own set of per-Product Sections (see
 * buildMultiProductExportContent) -- e.g. Product "Alpha"'s
 * own Product Validation, Product Brief, ... Product Review,
 * grouped together and in that order, rather than scattered
 * one Product at a time inside each Section.
 */
export interface ExportProductGroup {
    productName: string;
    sections: ExportSectionContent[];
}

/**
 * The exportable content of a full Interview
 * Session, shared by every export format
 * (Markdown, PDF).
 *
 * `productGroups` is only present for a System with per-Product
 * Sections (see buildMultiProductExportContent): each format
 * renders `sections` first (e.g. the Product Register itself),
 * then one heading per Product with that Product's OWN Sections
 * nested underneath -- all of Product 1's Sections together,
 * then all of Product 2's, and so on -- rather than grouping by
 * Section with every Product listed underneath it.
 */
export interface ExportContent {
    systemNumber: string;
    systemName: string;
    capability: string;
    sections: ExportSectionContent[];
    productGroups?: ExportProductGroup[];
}

/**
 * Builds the structured content shared by every
 * export format. Only the System's identity, the
 * chosen Capability, and each Section's number,
 * title and answer are included.
 */
export function buildExportContent(
    session: InterviewSession,
    capabilityLabel: string
): ExportContent {

    const framework = session.getFramework();

    const sections: ExportSectionContent[] = framework.sections.map(section => {

        const response = session.getResponse(section.number);

        return {
            number: section.number,
            title: section.title,
            blocks: buildAnswerBlocks(section.answer, response)
        };

    });

    return {
        systemNumber: String(framework.metadata.systemNumber),
        systemName: framework.metadata.systemName,
        capability: capabilityLabel.trim().length > 0
            ? capabilityLabel.trim()
            : framework.metadata.capability,
        sections
    };

}

/**
 * Builds export content for a System whose Sections are answered
 * once PER PRODUCT rather than once per System (currently only the
 * Product Development System's Sections 2-7 -- see
 * OrganizationService.productAnswers). `sectionNumbersWithoutSharedAnswer`
 * marks which Section numbers to treat this way; every other Section
 * (e.g. the Product Register itself) exports its single current
 * response exactly like `buildExportContent` does, in `sections`.
 *
 * The per-Product Sections are grouped PER PRODUCT (`productGroups`):
 * all of Product 1's own Sections together, in Section order, then
 * all of Product 2's, and so on -- rather than one Section at a time
 * with every Product listed underneath it.
 *
 * The Framework Engine has no knowledge of the app's storage layer,
 * so the per-Product answer lookup is supplied by the caller (see
 * Conversation.tsx) rather than imported here.
 */
export function buildMultiProductExportContent(
    session: InterviewSession,
    capabilityLabel: string,
    productNames: string[],
    sectionNumbersWithoutSharedAnswer: Set<number>,
    getProductSectionResponse: (productName: string, sectionNumber: number) => unknown | null
): ExportContent {

    const framework = session.getFramework();

    const hasProducts = productNames.length > 0;

    // Sections that stay System-wide (e.g. the Product Register
    // itself) -- also every Section if there are no Products yet,
    // so nothing silently disappears from the export before any
    // Product exists to group by.
    const sections: ExportSectionContent[] = framework.sections
        .filter(section => !hasProducts || !sectionNumbersWithoutSharedAnswer.has(section.number))
        .map(section => {

            const response = session.getResponse(section.number);

            return {
                number: section.number,
                title: section.title,
                blocks: buildAnswerBlocks(section.answer, response)
            };

        });

    const perProductSectionDefinitions = framework.sections.filter(
        section => sectionNumbersWithoutSharedAnswer.has(section.number)
    );

    const productGroups: ExportProductGroup[] | undefined = hasProducts
        ? productNames.map(name => ({
              productName: name,
              sections: perProductSectionDefinitions.map(section => {

                  const stored = getProductSectionResponse(name, section.number);
                  const value = stored ?? defaultAnswerValue(section.answer);

                  return {
                      number: section.number,
                      title: section.title,
                      blocks: buildAnswerBlocks(section.answer, value)
                  };

              })
          }))
        : undefined;

    return {
        systemNumber: String(framework.metadata.systemNumber),
        systemName: framework.metadata.systemName,
        capability: capabilityLabel.trim().length > 0
            ? capabilityLabel.trim()
            : framework.metadata.capability,
        sections,
        productGroups
    };

}

/**
 * Builds export content for a single Product within a System whose
 * Sections are otherwise answered once PER PRODUCT (see
 * buildMultiProductExportContent above) -- the Product Development
 * System's "export this Product only" option. Unlike
 * buildMultiProductExportContent, this never produces
 * `productGroups`: everything (the shared Section, filtered down to
 * this one Product, followed by this Product's own per-Product
 * Sections) is returned as one flat `sections` list, in Section
 * order, since there is only ever one Product's worth of content to
 * show -- a "## ProductName" grouping heading would be redundant.
 *
 * `filterSharedResponse` lets the caller narrow a shared Section's
 * response down to just this Product's own piece of it (e.g. the
 * Product Register table's rows down to this Product's one row) --
 * the Framework Engine has no knowledge of the app's row shape, so
 * this is supplied by the caller (see Conversation.tsx) rather than
 * imported here, the same way `getProductSectionResponse` already is.
 */
export function buildSingleProductExportContent(
    session: InterviewSession,
    capabilityLabel: string,
    productName: string,
    sectionNumbersWithoutSharedAnswer: Set<number>,
    getProductSectionResponse: (productName: string, sectionNumber: number) => unknown | null,
    filterSharedResponse: (sectionNumber: number, response: unknown) => unknown
): ExportContent {

    const framework = session.getFramework();

    const sharedSections: ExportSectionContent[] = framework.sections
        .filter(section => !sectionNumbersWithoutSharedAnswer.has(section.number))
        .map(section => {

            const response = filterSharedResponse(
                section.number,
                session.getResponse(section.number)
            );

            return {
                number: section.number,
                title: section.title,
                blocks: buildAnswerBlocks(section.answer, response)
            };

        });

    const perProductSections: ExportSectionContent[] = framework.sections
        .filter(section => sectionNumbersWithoutSharedAnswer.has(section.number))
        .map(section => {

            const stored = getProductSectionResponse(productName, section.number);
            const value = stored ?? defaultAnswerValue(section.answer);

            return {
                number: section.number,
                title: section.title,
                blocks: buildAnswerBlocks(section.answer, value)
            };

        });

    return {
        systemNumber: String(framework.metadata.systemNumber),
        systemName: `${framework.metadata.systemName} - ${productName}`,
        capability: capabilityLabel.trim().length > 0
            ? capabilityLabel.trim()
            : framework.metadata.capability,
        sections: [...sharedSections, ...perProductSections]
    };

}
