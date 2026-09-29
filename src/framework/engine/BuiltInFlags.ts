import type { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import {
    asBusinessCapabilityValue,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_RESOURCE_GROUPS
} from "./AnswerUtils.ts";
import type { Annotations, FieldAnnotation } from "./Annotations.ts";
import { fieldKey, sectionSegment } from "./FieldKeys.ts";

/*
    BUILT-IN STATUSES THAT MEAN "NEEDS INVESTIGATION".

    Some answers already hold their own way of saying "not known yet":
    a Resource whose Status is Needs Investigation (Business System,
    Infrastructure & Capability -- the Workspace, every resource under
    1. Resources, and every resource of the Offering's Capability).
    Such an answer is treated exactly as a field flagged Needs
    investigation: its page shows Needs review, the Review page lists
    it under Still open, and the documents print it as to be
    confirmed. Its Status field has no flag button of its own (a
    status field, FieldKinds.ts).

    Looked for across the Foundation and NOT the same, so not wired:
    a funding source's "Planned" (identified, not yet pursued: a
    decided state), the Legal Entity's "Not yet registered" (a state,
    and binary), Income Tax's "Not estimated" (a choice not to
    estimate), "Other" in any list (an answer of its own).

    The marks are built from the answers each time, never stored: the
    Status is the one place they are said.
*/

/** The Resource status that means the same as the flag. */
export const INVESTIGATION_STATUS = "investigation";

/**
 * The built-in "needs investigation" marks of one System's answers,
 * keyed and worded as field annotations (`builtIn`), for the page
 * and section statuses, the Review page and the documents.
 */
export function builtInFlags(systemNumber: number, session: InterviewSession | null | undefined): Annotations {

    const out: Annotations = {};

    if (!session) {
        return out;
    }

    for (const section of session.getSections()) {

        if (section.answer?.type !== AnswerType.BusinessCapability) {
            continue;
        }

        const capability = asBusinessCapabilityValue(session.getResponse(section.number));
        const pageTitle = section.number + ". " + section.title;
        const [infrastructure, offering] = BUSINESS_CAPABILITY_SECTIONS.map(sectionSegment);

        const mark = (path: string[], label: string, anchors: string[], rail: string): void => {
            const annotation: FieldAnnotation = {
                flag: "research",
                label,
                pageTitle,
                anchors,
                section: rail,
                kind: "none",
                builtIn: true
            };
            out[fieldKey({ systemNumber, sectionNumber: section.number, path })] = annotation;
        };

        if (capability.workspace.status === INVESTIGATION_STATUS) {
            mark([infrastructure, "resource-group-workspace", "status"], "Workspace",
                ["resource-group-workspace", "section-infrastructure-resources"], infrastructure);
        }

        for (const group of BUSINESS_RESOURCE_GROUPS) {
            for (const subsection of capability.resources[group.id] ?? []) {
                subsection.slots.forEach((slot, index) => {
                    if (slot.status === INVESTIGATION_STATUS) {
                        mark([infrastructure, slot.id, "status"],
                            slot.name.trim() || (subsection.name.trim() || group.label) + " resource " + (index + 1),
                            [slot.id, "subsection-" + group.id + "-" + subsection.id, "resource-group-" + group.id, "section-infrastructure-resources"],
                            infrastructure);
                    }
                });
            }
        }

        capability.offering.resources.forEach((slot, index) => {
            if (slot.status === INVESTIGATION_STATUS) {
                mark([offering, slot.id, "status"], slot.name.trim() || "Offering resource " + (index + 1),
                    [slot.id, "section-offering-resources"], offering);
            }
        });

    }

    return out;

}

/**
 * The marks to judge a System by: the person's own annotations over
 * the built-in ones (an annotation made on a field wins).
 */
export function withBuiltInFlags(annotations: Annotations, systemNumber: number, session: InterviewSession | null | undefined): Annotations {
    const builtIn = builtInFlags(systemNumber, session);
    return Object.keys(builtIn).length === 0 ? annotations : { ...builtIn, ...annotations };
}
