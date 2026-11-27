import { useEffect, useRef, useState } from "react";

import AddButton from "../controls/AddButton";
import FieldLabel from "../controls/FieldLabel";
import RatingScale, { type Rating } from "../controls/RatingScale";
import RatingScaleGroup from "../controls/RatingScaleGroup";
import TextField from "../controls/TextField";
import TickField from "../controls/TickField";
import FittingRadioChoice from "../interview/editors/foundation/FittingRadioChoice";
import OptionPicker from "../interview/fields/OptionPicker";
import { COUNTRIES } from "../../framework/engine/legal/LegalEntityJurisdictions";
import { BETA_QUESTIONNAIRE, SUS_STATEMENTS, type BetaAnswer, type BetaQuestion } from "../../data/betaQuestionnaire";
import { BETA_CHANGED_EVENT, BetaQuestionnaireService, answerKey, isAsked, missingAnswers, type BetaRecord } from "../../services/BetaQuestionnaireService";

import "../../styles/beta-questionnaire.css";

const COUNTRY_NAMES = COUNTRIES.map(country => country.name);

/** The record on this device, read again whenever it changes (an answer, a send, the receipt). */
function useBetaRecord(): BetaRecord {
    const [record, setRecord] = useState(BetaQuestionnaireService.read);
    useEffect(() => {
        const update = () => setRecord(BetaQuestionnaireService.read());
        window.addEventListener(BETA_CHANGED_EVENT, update);
        window.addEventListener("online", update);
        return () => {
            window.removeEventListener(BETA_CHANGED_EVENT, update);
            window.removeEventListener("online", update);
        };
    }, []);
    return record;
}

/** One question's control, by its kind: the app's own controls (Research 8, section 8.1). */
function QuestionControl({ question, keyName, value, label, record, done }: { question: BetaQuestion; keyName: string; value: BetaAnswer | undefined; label: string; record: BetaRecord; done: boolean }) {
    const give = (next: BetaAnswer | undefined) => BetaQuestionnaireService.answer(keyName, next);
    const name = "beta-" + keyName.replace(":", "-");
    switch (question.kind) {
        case "consent":
            return (
                <div className="beta-question-consent">
                    <TickField checked={value === true} disabled={done} onChange={event => give(event.currentTarget.checked ? true : undefined)}>
                        <FieldLabel>{question.words}</FieldLabel>
                    </TickField>
                    {question.withEmail && value === true && (
                        <TextField value={record.email ?? ""} onChange={BetaQuestionnaireService.email} className="interview-input" ariaLabel="Your email" placeholder="Your email" list={false} disabled={done} />
                    )}
                </div>
            );
        case "single":
            return (
                <FittingRadioChoice label={label} group={name} value={typeof value === "string" ? value : ""} disabled={done}
                    options={(question.options ?? []).map(option => ({ id: option, label: option }))} onChange={give} />
            );
        case "multi": {
            const ticked = Array.isArray(value) ? value as string[] : [];
            const full = question.max !== undefined && ticked.length >= question.max;
            return (
                <div className="beta-question-ticks" role="group" aria-label={label}>
                    {(question.options ?? []).map(option => (
                        <TickField key={option} checked={ticked.includes(option)} disabled={done || (full && !ticked.includes(option))}
                            onChange={event => {
                                const next = event.currentTarget.checked ? [...ticked, option] : ticked.filter(entry => entry !== option);
                                give(next.length > 0 ? next : undefined);
                            }}>
                            <FieldLabel>{option}</FieldLabel>
                        </TickField>
                    ))}
                </div>
            );
        }
        case "country":
            return <OptionPicker label={label} options={COUNTRY_NAMES} value={typeof value === "string" ? value : ""} searchable disabled={done} onChange={give} />;
        case "scale":
            if (question.from === 1 && question.to === 5) {
                return <RatingScale label={label} name={name} value={typeof value === "number" ? value as Rating : undefined} lowLabel={question.lowWords} highLabel={question.highWords} disabled={done} onChange={give} />;
            }
            // (A wider scale, 0 to 10: its points as the radio choice, in a row where it fits and a column where it does not.)
            return (
                <FittingRadioChoice label={label} group={name} value={typeof value === "number" ? String(value) : ""} disabled={done}
                    options={Array.from({ length: (question.to ?? 10) - (question.from ?? 0) + 1 }, (_, at) => String((question.from ?? 0) + at)).map(point => ({ id: point, label: point }))}
                    onChange={next => give(Number(next))} />
            );
        case "sus": {
            const ratings = Array.isArray(value) ? value as number[] : [];
            return (
                <RatingScaleGroup label={label} name={name} lowLabel={question.lowWords ?? ""} highLabel={question.highWords ?? ""} disabled={done}
                    rows={SUS_STATEMENTS.map((statement, at) => ({ id: String(at), label: statement }))}
                    values={Object.fromEntries(ratings.map((rating, at) => [String(at), rating >= 1 ? rating as Rating : undefined]))}
                    onChange={(id, next) => {
                        const all = SUS_STATEMENTS.map((_, at) => ratings[at] ?? 0);
                        all[Number(id)] = next ?? 0;
                        give(all.some(rating => rating > 0) ? all : undefined);
                    }} />
            );
        }
        case "text":
            return <TextField className="interview-input" value={typeof value === "string" ? value : ""} onChange={next => give(next.trim() === "" ? undefined : next)} ariaLabel={label} disabled={done} />;
    }
}

/**
 * THE BETA QUESTIONNAIRE (Research 8; its base, section 8), a section of the Workbook during the Beta: its sections in order, each question with the app's own
 * control, every answer saved on this device as it is given. Send is pressed once every required answer is given; the answers then wait on this device until
 * they are sent, and the document downloads open with their receipt.
 */
export default function BetaQuestionnaire({ onDocuments }: { /** Back to the Business Documents, once sent. */ onDocuments?: () => void }) {
    const record = useBetaRecord();
    const done = record.status !== "answering";
    const [missing, setMissing] = useState<string[]>([]);
    const top = useRef<HTMLParagraphElement | null>(null);

    // (A question answered since Send was pressed leaves the list of those still to give.)
    useEffect(() => {
        if (missing.length > 0) {
            setMissing(missingAnswers(record));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record]);

    const send = () => {
        const still = missingAnswers(record);
        setMissing(still);
        if (still.length > 0) {
            document.querySelector<HTMLElement>("[data-beta-key=\"" + still[0].replace(":email", "") + "\"]")?.scrollIntoView?.({ block: "center" });
            return;
        }
        BetaQuestionnaireService.send();
        top.current?.scrollIntoView?.({ block: "start" });
    };

    const systems = record.systems ?? [];

    return (
        <section className="handbook-section beta-questionnaire" aria-label="Beta Questionnaire">

            <p ref={top} className="handbook-text" role="status">
                {record.status === "sent"
                    ? "Thank you. Your answers are sent, and your documents are ready to download."
                    : record.status === "waiting"
                        ? "Thank you. Your answers are saved, and they are sent as soon as this device is online. Your documents open once they arrive."
                        : "Thank you for trying TILES. These questions take about ten minutes, and your answers shape what comes next. Every answer saves as you go, and once you send them your documents are ready to download."}
            </p>

            {record.status === "sent" && onDocuments && (
                <AddButton look="primary-button" className="beta-questionnaire-send" onClick={onDocuments}>Go to the documents</AddButton>
            )}

            {BETA_QUESTIONNAIRE.map(section => {
                const asked = section.questions.filter(question => isAsked(question, record));
                if (asked.length === 0) {
                    return null;
                }
                // (A question asked for each System: once for every System the founder answered in, under its name.)
                const rounds = asked.some(question => question.when === "per-system") ? systems.map(system => ({ system, title: section.title + ": " + system })) : [{ system: undefined, title: section.title }];
                return rounds.map(round => (
                    <div className="handbook-part beta-questionnaire-part" key={round.title}>
                        <h3 className="handbook-heading">{round.title}</h3>
                        {asked.map(question => {
                            const key = answerKey(question, round.system);
                            // (The usability statements are asked as one, between the numbered questions: their words alone.)
                            const label = question.kind === "sus" ? question.words : question.number + ". " + question.words;
                            const open = missing.includes(key) || missing.includes(key + ":email");
                            return (
                                <div key={key} className={"beta-question" + (open ? " business-field-missing" : "")} data-beta-key={key}>
                                    {question.kind !== "consent" && <FieldLabel className="beta-question-words">{label}</FieldLabel>}
                                    {/* (What a scale's two ends mean, once, under its words: the rounds show their numbers.) */}
                                    {(question.kind === "scale" || question.kind === "sus") && <p className="beta-question-ends">{question.from} = {question.lowWords}, {question.to} = {question.highWords}.</p>}
                                    <QuestionControl question={question} keyName={key} value={record.answers[key]} label={label} record={record} done={done} />
                                </div>
                            );
                        })}
                    </div>
                ));
            })}

            {record.status === "answering" && (
                <div className="beta-questionnaire-foot">
                    {missing.length > 0 && <p className="handbook-text" role="alert">A few answers are still to give: they are marked above.</p>}
                    <AddButton look="primary-button" className="beta-questionnaire-send" onClick={send}>Send</AddButton>
                </div>
            )}

        </section>
    );
}
