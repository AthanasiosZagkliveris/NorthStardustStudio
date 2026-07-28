import { InterviewSession } from "../interview";
import { buildAnswerBlocks, ExportBlock } from "./AnswerUtils.ts";

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
 * The exportable content of a full Interview
 * Session, shared by every export format
 * (Markdown, PDF).
 */
export interface ExportContent {
    systemNumber: string;
    systemName: string;
    capability: string;
    sections: ExportSectionContent[];
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
