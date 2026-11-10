/*
    THE EXPORT DIALOGS (Conversation.tsx): "Sections Incomplete", which lists the empty answers page by page, and "Export Options", which
    chooses the Products or Processes, the Business document, the Capability and the formats, then writes the Markdown or PDF. Moved out of
    Conversation.tsx as they were (2026-11-11, the owner: "optimise the app and the folders"); the page keeps which dialog is open and the
    empty answers, because Escape and the page arrows read them. Not reachable today: Finish is hidden (ExportFlow.test.tsx keeps them working).
*/
import { useState } from "react";
import AddButton from "../components/controls/AddButton.tsx";
import TextBox from "../components/controls/TextBox.tsx";
import { InterviewSession } from "../framework/interview";
import { businessModelCanvas } from "../framework/engine/BusinessDocuments.ts";
import type { ValidationIssue } from "../framework/model";
import { processDisplayId, ProcessRecordValue, sopDisplayId, TableAnswerRow, asLegalEntityValue } from "../framework/engine/AnswerUtils.ts";
import { buildExportContent, buildMultiProductExportContent, buildSingleProductExportContent } from "../framework/engine/ExportContentBuilder.ts";
import { countryCurrency } from "../framework/engine/LegalEntityJurisdictions.ts";
import { OrganizationService } from "../services/OrganizationService";
import { StorageService } from "../services/StorageService";
import { toggledIn } from "../components/interview/fields/toggledIn";
import { IDENTITY_SYSTEM_NUMBER, reviewManager, ExportStep, CapabilityChoice, ExportScope, OperationsExportScope, OPERATIONS_PROCESS_LIBRARY_SECTION, OPERATIONS_OPERATIONAL_LOG_SECTION, OPERATIONS_ROLES_SECTION, PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS, extractProductNames, groupValidationIssues } from "./conversationHelpers";

export interface ExportFlowProps {
    /** Which dialog is open ("none": neither). */
    step: ExportStep;
    onStep: (step: ExportStep) => void;
    /** "Continue" on Sections Incomplete: the page opens Export Options. */
    onContinue: () => void;
    /** Grows by one each time Export Options opens: the Operations picker starts again from All Processes. */
    openCount: number;
    validationIssues: ValidationIssue[];
    session: InterviewSession;
    system: { id?: string } | undefined;
    organizationId: string | null;
    organizationName: string;
    selectedProductName: string | undefined;
    operationsProcesses: ProcessRecordValue[];
    legalEntity: ReturnType<typeof asLegalEntityValue>;
    foundersProfile: unknown;
    organisationCurrency: ReturnType<typeof countryCurrency>;
}

export default function ExportFlow({ step, onStep, onContinue, openCount, validationIssues, session, system, organizationId, organizationName, selectedProductName, operationsProcesses, legalEntity, foundersProfile, organisationCurrency }: ExportFlowProps) {

    const exportStep = step;
    const setExportStep = onStep;
    const openExportOptions = onContinue;
    const framework = session.getFramework();
    const isProductDevelopmentSystem = system?.id === "product-development";
    const isOperationsSystem = system?.id === "operations";

    const [capabilityChoice, setCapabilityChoice] = useState<CapabilityChoice>("original");
    const [otherCapabilityName, setOtherCapabilityName] = useState("");

    // The Business System can export its answers, or the Business
    // Model Canvas they add up to (see BusinessDocuments.ts).
    const [documentChoice, setDocumentChoice] = useState<"answers" | "canvas">("answers");
    const [includeMd, setIncludeMd] = useState(true);
    const [includePdf, setIncludePdf] = useState(false);

    // Defaults to "system" (the whole file, every Product) so
    // behavior is unchanged for anyone who doesn't touch this new
    // choice -- that was the ONLY export shape the Product
    // Development System produced before this option existed.
    const [exportScope, setExportScope] = useState<ExportScope>("system");

    // Defaults to "all" (every Process, exactly as before this
    // option existed) -- the picker below only appears once a
    // narrower scope is chosen. Both selection Sets are ephemeral
    // (index-keyed, not persisted into the saved Process Library
    // answer) and reset every time the Export Options dialog is
    // reopened, so a stale pick from a previous export can't
    // silently narrow a later one.
    const [operationsExportScope, setOperationsExportScope] = useState<OperationsExportScope>("all");
    const [selectedProcessIndexes, setSelectedProcessIndexes] = useState<Set<number>>(new Set());
    const [selectedSopKeys, setSelectedSopKeys] = useState<Set<string>>(new Set());

    // Reset the Operations System's own picker every time the
    // dialog opens, rather than only on mount -- otherwise a
    // scope/selection left over from a previous export (of a
    // since-edited Process Library) could silently narrow a
    // later "export everything" attempt. Done while drawing, so the
    // dialog opens already reset.
    const [seenOpenCount, setSeenOpenCount] = useState(openCount);
    if (openCount !== seenOpenCount) {
        setSeenOpenCount(openCount);
        setOperationsExportScope("all");
        setSelectedProcessIndexes(new Set());
        setSelectedSopKeys(new Set());
    }

    function toggleSelectedProcess(processIndex: number) {

        setSelectedProcessIndexes(current => toggledIn(current, processIndex));

    }

    function toggleSelectedSop(processIndex: number, sopIndex: number) {

        const key = `${processIndex}:${sopIndex}`;

        setSelectedSopKeys(current => toggledIn(current, key));

    }

    function handleFinalExport() {

        if (!session) {
            return;
        }

        const framework = session.getFramework();

        const capabilityLabel =
            capabilityChoice === "original"
                ? framework.metadata.capability
                : otherCapabilityName;

        const exportContent =
            system?.id === "business" && documentChoice === "canvas"
                ? businessModelCanvas({
                      identity: organizationId ? StorageService.loadInterview(organizationId, IDENTITY_SYSTEM_NUMBER) : null,
                      business: session,
                      organisationName: organizationName
                  }, capabilityLabel)
            : system?.id === "product-development" && organizationId
                ? (() => {

                      // One document load for the whole export, rather than
                      // one per (Product, Section) pair -- OrganizationService.
                      // getProductSectionResponse alone would re-parse the
                      // entire Organization document from localStorage once
                      // per lookup here.
                      const allProductAnswers =
                          OrganizationService.getAllProductSectionResponses(organizationId);

                      const getProductSectionResponse = (productName: string, sectionNumber: number) =>
                          allProductAnswers[productName]?.[String(sectionNumber)] ?? null;

                      // "This Product only" (exportScope === "product"): the
                      // shared Product Register (Section 1) narrowed down to
                      // just the selected Product's own row, followed by that
                      // Product's own Sections 2-7 -- everything flattened
                      // into one document, no Product-heading grouping, since
                      // there's only one Product's worth of content here.
                      const selectedProductId =
                          exportScope === "product"
                              ? OrganizationService.getSelectedProductId(organizationId)
                              : undefined;

                      if (selectedProductId) {

                          return buildSingleProductExportContent(
                              session,
                              capabilityLabel,
                              selectedProductId,
                              PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS,
                              getProductSectionResponse,
                              (sectionNumber, response) => {

                                  if (sectionNumber !== 1 || !Array.isArray(response)) {
                                      return response;
                                  }

                                  return (response as TableAnswerRow[]).filter(row => {
                                      const name = row["product"];
                                      return typeof name === "string" && name.trim() === selectedProductId;
                                  });

                              }
                          );

                      }

                      // "Whole System" (exportScope === "system", or no
                      // Product selected): the Product Register in full,
                      // followed by EVERY Product's own Sections 2-7,
                      // grouped one Product at a time (see
                      // buildMultiProductExportContent) -- unchanged from
                      // before this option existed.
                      return buildMultiProductExportContent(
                          session,
                          capabilityLabel,
                          extractProductNames(session.getResponse(1)),
                          PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS,
                          getProductSectionResponse
                      );

                  })()
                : system?.id === "operations"
                ? (() => {

                      // The FULL, unfiltered Process Library, with every
                      // Process/SOP's already-displayed ID (custom or
                      // auto-generated from its ORIGINAL position) stamped
                      // on -- shared by Section 2's own scope-filtered
                      // export below AND, unfiltered, by Sections 3/4's
                      // cross-reference (see BuildAnswerBlocksOptions.
                      // processLibrary): an Operational Log entry or a
                      // Roles & Responsibilities grouping should resolve
                      // against every actual Process, regardless of which
                      // subset the user chose to show under Section 2
                      // itself -- choosing "Selected Processes" narrows
                      // what Section 2 lists, it doesn't mean a Log entry
                      // pointing at an excluded Process should go blank.
                      const allProcessesRaw =
                          (session.getResponse(OPERATIONS_PROCESS_LIBRARY_SECTION) as ProcessRecordValue[] | undefined) ?? [];

                      const stampedAllProcesses = allProcessesRaw.map((process, processIndex) => ({
                          ...process,
                          id: processDisplayId(allProcessesRaw, processIndex),
                          sops: process.sops.map((sop, sopIndex) => ({
                              ...sop,
                              id: sopDisplayId(process.sops, sopIndex)
                          }))
                      }));

                      return buildExportContent(
                          session,
                          capabilityLabel,
                          (sectionNumber, response) => {

                              if (sectionNumber !== OPERATIONS_PROCESS_LIBRARY_SECTION || !Array.isArray(response)) {
                                  return response;
                              }

                              if (operationsExportScope === "selected-processes") {
                                  return stampedAllProcesses.filter((_, processIndex) => selectedProcessIndexes.has(processIndex));
                              }

                              if (operationsExportScope === "selected-sops") {

                                  // Keep only the Processes with at least 1
                                  // selected SOP, and within those, only the
                                  // SOPs the user actually ticked.
                                  return stampedAllProcesses
                                      .map((process, processIndex) => ({
                                          ...process,
                                          sops: process.sops.filter((_sop, sopIndex) =>
                                              selectedSopKeys.has(`${processIndex}:${sopIndex}`)
                                          )
                                      }))
                                      .filter(process => process.sops.length > 0);

                              }

                              return stampedAllProcesses;

                          },
                          (sectionNumber) => {

                              if (sectionNumber === OPERATIONS_PROCESS_LIBRARY_SECTION) {

                                  // The response this Section exports (see
                                  // above) is always `stampedAllProcesses`
                                  // (or a filtered subset of it), whose
                                  // `.id` fields already hold the FINAL
                                  // computed display ID, not raw initials
                                  // -- idsPreResolved tells the export
                                  // block to use them as-is rather than
                                  // recomputing (see its own doc comment
                                  // on BuildAnswerBlocksOptions).
                                  return {
                                      idsPreResolved: true,
                                      forceExpandProcessSops: operationsExportScope === "selected-sops"
                                  };

                              }

                              if (sectionNumber === OPERATIONS_OPERATIONAL_LOG_SECTION || sectionNumber === OPERATIONS_ROLES_SECTION) {

                                  // Unlike the Process Library Section's own
                                  // export above, resolveProcessLogLabel/
                                  // resolveProcessId (used to cross-
                                  // reference a Process from here) compute
                                  // the display ID themselves from raw
                                  // initials -- so this needs the RAW,
                                  // unstamped list, not `stampedAllProcesses`
                                  // (which would double-append a suffix on
                                  // top of the already-final one).
                                  return { processLibrary: allProcessesRaw };

                              }

                              return undefined;

                          }
                      );

                  })()
                // Every other System: what is saved, with the Identity
                // System facts the Business pages are answered against.
                : buildExportContent(session, capabilityLabel, undefined, undefined, {
                      legalEntity,
                      foundersProfile,
                      currency: organisationCurrency
                  });

        if (includeMd) {
            reviewManager.exportMarkdown(session, capabilityLabel, exportContent);
        }

        if (includePdf) {
            reviewManager.exportPdf(session, capabilityLabel, exportContent);
        }

        setExportStep("none");

    }

    const canConfirmCapability =
        capabilityChoice === "original" || otherCapabilityName.trim().length > 0;

    // A narrowed Operations export scope needs at least 1 picked
    // Process/SOP to actually produce anything -- otherwise "Export"
    // would silently hand back an empty document.
    const hasValidOperationsSelection =
        operationsExportScope === "all" ||
        (operationsExportScope === "selected-processes" && selectedProcessIndexes.size > 0) ||
        (operationsExportScope === "selected-sops" && selectedSopKeys.size > 0);

    const canExport = (includeMd || includePdf) && hasValidOperationsSelection;

    if (exportStep === "none") {
        return null;
    }

    return (
        <>
            {exportStep === "warning" && (
                <div className="confirmation-overlay" onClick={() => setExportStep("none")}>
                    <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>
                        <h2 className="confirmation-title">
                            Sections Incomplete
                        </h2>

                        {/*
                            What the list is and what the two buttons
                            do, before the list rather than after it.
                            A page of red names on their own reads as
                            a refusal; nothing here refuses anything.
                        */}
                        <p className="confirmation-lead">
                            These answers are still empty. Go back and fill them in, or
                            continue and export the System as it stands.
                        </p>

                        {/*
                            Grouped by the page each one is on, so the
                            reader sees three pages to return to
                            rather than eleven names in a column. A
                            page whose whole Section is incomplete is
                            its own heading and has nothing under it,
                            which is what the empty `units` means.
                        */}
                        <ul className="confirmation-warning-list">
                            {groupValidationIssues(validationIssues, framework.sections).map(group => (
                                <li key={group.number} className="confirmation-warning-group">

                                    <span className="confirmation-warning-page">
                                        {group.number}. {group.title}
                                    </span>

                                    {group.units.length > 0 && (
                                        <ul className="confirmation-warning-units">
                                            {group.units.map(unit => (
                                                <li key={unit.label}>
                                                    {unit.label} {unit.title}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                </li>
                            ))}
                        </ul>

                        <div className="confirmation-actions">
                            <AddButton look="confirmation-button secondary"
                                onClick={() => setExportStep("none")}>
                                Cancel
                            </AddButton>

                            <AddButton look="confirmation-button primary"
                                onClick={() => openExportOptions()}>
                                Continue
                            </AddButton>
                        </div>
                    </div>
                </div>
            )}

            {exportStep === "options" && (
                <div className="confirmation-overlay" onClick={() => setExportStep("none")}>
                    <div className="confirmation-dialog export-options-dialog" onClick={(event) => event.stopPropagation()}>
                        <h2 className="confirmation-title">
                            Export Options
                        </h2>

                        {isProductDevelopmentSystem && (
                            <div className="export-options-group">
                                <div className="export-options-label">Include</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="export-scope"
                                        checked={exportScope === "product"}
                                        onChange={() => setExportScope("product")}
                                    />
                                    This Product only
                                    {selectedProductName ? ` (${selectedProductName})` : ""}
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="export-scope"
                                        checked={exportScope === "system"}
                                        onChange={() => setExportScope("system")}
                                    />
                                    Whole System (all Products)
                                </label>
                            </div>
                        )}

                        {isOperationsSystem && (
                            <div className="export-options-group">
                                <div className="export-options-label">Include</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="operations-export-scope"
                                        checked={operationsExportScope === "all"}
                                        onChange={() => setOperationsExportScope("all")}
                                    />
                                    All Processes
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="operations-export-scope"
                                        checked={operationsExportScope === "selected-processes"}
                                        onChange={() => setOperationsExportScope("selected-processes")}
                                    />
                                    Selected Processes
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="operations-export-scope"
                                        checked={operationsExportScope === "selected-sops"}
                                        onChange={() => setOperationsExportScope("selected-sops")}
                                    />
                                    Selected SOPs
                                </label>

                                {operationsExportScope === "selected-processes" && (
                                    <div className="export-options-picker">
                                        {operationsProcesses.length === 0 && (
                                            <div className="export-options-picker-empty">
                                                No Processes yet.
                                            </div>
                                        )}
                                        {operationsProcesses.map((process, processIndex) => (
                                            <label
                                                key={processIndex}
                                                className="export-options-checkbox export-options-picker-row"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProcessIndexes.has(processIndex)}
                                                    onChange={() => toggleSelectedProcess(processIndex)}
                                                />
                                                {processDisplayId(operationsProcesses, processIndex)}
                                                {" - "}
                                                {process.name?.trim() || "Untitled Process"}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {operationsExportScope === "selected-sops" && (
                                    <div className="export-options-picker">
                                        {operationsProcesses.length === 0 && (
                                            <div className="export-options-picker-empty">
                                                No Processes yet.
                                            </div>
                                        )}
                                        {operationsProcesses.map((process, processIndex) => (
                                            <div key={processIndex} className="export-options-picker-process">
                                                <div className="export-options-picker-process-name">
                                                    {processDisplayId(operationsProcesses, processIndex)}
                                                    {" - "}
                                                    {process.name?.trim() || "Untitled Process"}
                                                </div>
                                                {process.sops.map((sop, sopIndex) => (
                                                    <label
                                                        key={sopIndex}
                                                        className="export-options-checkbox export-options-picker-row export-options-picker-row-nested"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSopKeys.has(`${processIndex}:${sopIndex}`)}
                                                            onChange={() => toggleSelectedSop(processIndex, sopIndex)}
                                                        />
                                                        {sopDisplayId(process.sops, sopIndex)}
                                                        {" - "}
                                                        {sop.name?.trim() || "Untitled SOP"}
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {system?.id === "business" && (
                            <div className="export-options-group">
                                <div className="export-options-label">Document</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="document-choice"
                                        checked={documentChoice === "answers"}
                                        onChange={() => setDocumentChoice("answers")}
                                    />
                                    The Business System's answers
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="document-choice"
                                        checked={documentChoice === "canvas"}
                                        onChange={() => setDocumentChoice("canvas")}
                                    />
                                    Business Model Canvas
                                </label>
                            </div>
                        )}

                        <div className="export-options-group">
                            <div className="export-options-label">Capability</div>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "original"}
                                    onChange={() => setCapabilityChoice("original")}
                                />
                                Original ({framework.metadata.capability})
                            </label>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "other"}
                                    onChange={() => setCapabilityChoice("other")}
                                />
                                Another Capability
                            </label>

                            {capabilityChoice === "other" && (
                                <TextBox
                                    className="export-options-text-input"
                                    placeholder="Capability name"
                                    value={otherCapabilityName}
                                    onChange={(event) => setOtherCapabilityName(event.target.value)}
                                />
                            )}
                        </div>

                        <div className="export-options-group">
                            <div className="export-options-label">Format</div>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includeMd}
                                    onChange={(event) => setIncludeMd(event.target.checked)}
                                />
                                Markdown (.md)
                            </label>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includePdf}
                                    onChange={(event) => setIncludePdf(event.target.checked)}
                                />
                                PDF
                            </label>
                        </div>

                        <div className="confirmation-actions">
                            <AddButton look="confirmation-button secondary"
                                onClick={() => setExportStep("none")}>
                                Cancel
                            </AddButton>

                            <AddButton look="confirmation-button primary"
                                onClick={handleFinalExport}
                                disabled={!canExport || !canConfirmCapability}>
                                Export
                            </AddButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
