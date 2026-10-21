/**
 * THE PROCESS, LOG, STRATEGY AND ROLES ANSWERS. One function per Answer Structure, each given the scope of the renderer (scope.ts). Split out of AnswerRenderer.tsx.
 */
import { CSSProperties } from "react";
import CardShell from "../../cards/CardShell.tsx";
import ProcessLibraryEditor from "../ProcessLibraryEditor.tsx";
import OperationalLogEditor from "../OperationalLogEditor.tsx";
import RolesResponsibilitiesEditor from "../RolesResponsibilitiesEditor.tsx";
import StrategyFoundationEditor from "../StrategyFoundationEditor.tsx";
import StrategicPeriodEditor from "../StrategicPeriodEditor.tsx";
import StrategicRoadmapEditor from "../StrategicRoadmapEditor.tsx";
import { OperationalLogAnswerValue, ProcessLibraryAnswerValue, RolesResponsibilitiesAnswerValue, strategyThemeName } from "../../../../framework/engine/AnswerUtils.ts";
import SectionTiles from "../../tiles/SectionTiles.tsx";
import { workHue } from "../../../../framework/engine/WorkColours.ts";

import type { AnswerScope } from "./scope.ts";

export function renderProcessLibrary(scope: AnswerScope) {

    const { value, onChange, disabled, ownerSuggestions } = scope;

    const processes: ProcessLibraryAnswerValue =
        Array.isArray(value) ? value as ProcessLibraryAnswerValue : [];

    return (

        <ProcessLibraryEditor
            value={processes}
            onChange={onChange}
            disabled={disabled}
            ownerSuggestions={ownerSuggestions}
        />

    );

}

export function renderOperationalLog(scope: AnswerScope) {

    const { value, onChange, disabled, processLibraryProcesses } = scope;

    const rows: OperationalLogAnswerValue =
        Array.isArray(value) ? value as OperationalLogAnswerValue : [];

    return (

        <OperationalLogEditor
            value={rows}
            onChange={onChange}
            disabled={disabled}
            processes={processLibraryProcesses ?? []}
        />

    );

}

export function renderStrategyFoundation(scope: AnswerScope) {

    const { value, onChange, disabled, columnNumberOffset, identityVision, organisationCurrency, legalEntityFounders, columnsDivider, showInstructions, strategy } = scope;

    return (

        <StrategyFoundationEditor
            value={value}
            startNumber={(columnNumberOffset ?? 0) + 1}
            columnsDivider={columnsDivider}
            showInstructions={showInstructions}
            onChange={onChange}
            disabled={disabled}
            guardThemeRemoval={strategy?.guardThemeRemoval}
            guardPeriodChange={strategy?.guardPeriodChange}
            periodTiles={strategy?.onChangePeriod ? (args) => (
                <StrategicPeriodEditor
                    embedded
                    only={args.only}
                    value={strategy.period}
                    onChange={strategy.onChangePeriod!}
                    foundation={args.foundation}
                    founders={(legalEntityFounders ?? []).filter(founder => founder.name.trim().length > 0)}
                    organisationCurrency={organisationCurrency}
                    disabled={disabled}
                    onEditTheme={args.onEditTheme}
                    onRemoveTheme={args.onRemoveTheme}
                    onAddTheme={args.onAddTheme}
                    trailing={args.trailing}
                    roadmap={() => (
                        <StrategicRoadmapEditor
                            foundation={args.foundation}
                            period={strategy.period}
                            columnsDivider={columnsDivider}
                            showInstructions={showInstructions}
                        />
                    )}
                />
            ) : undefined}
            vision={identityVision}
            situationDraft={strategy?.situationDraft ?? ""}
            guardSituationRefresh={strategy?.guardSituationRefresh}
            openBusinessPage={strategy?.openBusinessPage}
            financialPlan={strategy?.financialPlan ?? null}
        />

    );

}

// Both of the remaining Strategy pages are drawn from the
        // Foundation page's answer, which lives in ANOTHER Section --
        // so it is handed in rather than read here. Without it there
        // is nothing to develop or draw, and the page says so.
export function renderStrategicPeriod(scope: AnswerScope) {

    const { value, onChange, disabled, organisationCurrency, legalEntityFounders, columnsDivider, showInstructions, strategy } = scope;

    if (!strategy) {
        return null;
    }

    return (

        <StrategicPeriodEditor
            value={value}
            foundation={strategy.foundation}
            founders={(legalEntityFounders ?? []).filter(founder => founder.name.trim().length > 0)}
            organisationCurrency={organisationCurrency}
            columnsDivider={columnsDivider}
            showInstructions={showInstructions}
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderStrategicRoadmap(scope: AnswerScope) {

    const { columnsDivider, showInstructions, strategy } = scope;

    if (!strategy) {
        return null;
    }

    // The Roadmap is one large tile of its own, opening the roadmap in its dialog.
    return (
        <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page column-tiles-page-wide" style={{ "--answer-column-count": 1 } as CSSProperties}>
            <CardShell
                
                data-anchor="column-tiles"
                style={{ "--strategy-theme-hue": workHue("decide") } as CSSProperties}
            >
                <div className="card-scroll">
                    <div className="business-capability-section business-capability-tiles-section">
                        <div className="business-capability-heading-spacer" aria-hidden="true" />
                        <SectionTiles
                            small
                            label="Roadmap"
                            hue={workHue("decide")}
                            tiles={[{
                                id: "roadmap",
                                title: "Roadmap",
                                view: true,
                                items: strategy.foundation.themes.map(theme => strategyThemeName(theme)).filter(name => name.trim().length > 0).slice(0, 6),
                                itemMarks: strategy.foundation.themes.map(() => ({ bullet: true })),
                                content: () => (
                                    <div className="column-tile-content">
                                        <StrategicRoadmapEditor
                                            foundation={strategy.foundation}
                                            period={strategy.period}
                                            columnsDivider={columnsDivider}
                                            showInstructions={showInstructions}
                                        />
                                    </div>
                                )
                            }]}
                        />
                    </div>
                </div>
            </CardShell>
        </div>
    );

}

export function renderRolesResponsibilities(scope: AnswerScope) {

    const { value, onChange, disabled, processLibraryProcesses } = scope;

    const notes: RolesResponsibilitiesAnswerValue =
        value && typeof value === "object" && !Array.isArray(value)
            ? value as RolesResponsibilitiesAnswerValue
            : {};

    return (

        <RolesResponsibilitiesEditor
            value={notes}
            onChange={onChange}
            disabled={disabled}
            processes={processLibraryProcesses ?? []}
        />

    );

}

