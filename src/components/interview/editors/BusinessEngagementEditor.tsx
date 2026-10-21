import { CSSProperties } from "react";
import CardShell from "../cards/CardShell.tsx";
import { segmentHue } from "../../../framework/engine/AnswerUtils.ts";
import { BusinessEmpty } from "../cards/BusinessCardFields.tsx";
import FoldAllToggle from "../fields/FoldAllToggle.tsx";
import { ActionPicker } from "./ChannelResources.tsx";
import { IsolationNote } from "./ActionMarkers.tsx";
import FoldArrow from "../fields/FoldArrow.tsx";
import { SECTIONS, segmentQuestions } from "./BusinessEngagementModel.ts";
import "../../../styles/demand.css";
import { BusinessEngagementEditorProps } from "./engagement/shared.tsx";

import { useEngagementState } from "./engagement/useEngagementState.tsx";
import { useEngagementChannelBoxes } from "./engagement/useEngagementChannelBoxes.tsx";
import { useEngagementRelationships } from "./engagement/useEngagementRelationships.tsx";
import { useEngagementDemand } from "./engagement/useEngagementDemand.tsx";

export default function BusinessEngagementEditor(props: BusinessEngagementEditorProps) {

    const part1 = useEngagementState(props);
    const part2 = { ...part1, ...useEngagementChannelBoxes({ ...part1 }) };
    const part3 = { ...part1, ...part2, ...useEngagementRelationships({ ...part1, ...part2 }) };
    const part4 = { ...part1, ...part2, ...part3, ...useEngagementDemand({ ...part1, ...part2, ...part3 }) };
    const { asTiles, channelCategoryFoldKeys, channelResourceTable, channelTiles, channelsFor, clearIsolation, collapsed, columnsDivider, demandFor, engagedOfferingIds, foldingSection, folds, heads, isolated, isolationNames, referenceColumn, relationshipsFor, segments, toggle } = part4;

    return (

        <div
            className="answer-columns business-foundation business-engagement"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {/* A resource waiting for one of its channel's actions: the table's action lines take a click. */}
            <ActionPicker />

            {/* Row 1: the two section titles. */}
            {/* (As tiles, each section carries its own title inside the Segment's frame: the same two titles are not said again above it.) */}
            {!asTiles && heads.map(head => (
                <h3 className="answer-column-label" key={"title-" + head.number}>
                    <span className="answer-column-label-number">
                        {head.number + "."}
                    </span>
                    <span className="answer-column-label-text">{head.title}</span>
                </h3>
            ))}

            {/* Row 3: the process line, the boundary between what
                the page says and what it asks. */}
            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* Row 4: ONE INPUT CARD PER SEGMENT, in the Segment's
                own colour -- Page 1's card, continued.

                Both sections are answered about a Segment, so a
                Segment is what a card holds: the Foundation it
                refers to, the channels that reach it, and the
                relationships kept with its Profiles. */}
            {segments.length === 0 ? (
                <div className="business-engagement-page-empty">
                    <BusinessEmpty>
                        Define a Customer Segment on the Foundation page first.
                        Everything on this page is answered about one.
                    </BusinessEmpty>
                </div>
            ) : segments.map((segment, segmentIndex) => {

                const key = "engagement-" + segment.id;

                const open = !collapsed.has(key);

                const segmentArrow = (
                    <FoldArrow
                        open={open}
                        label={"Segment " + (segmentIndex + 1)}
                        onToggle={() => toggle(key)}
                    />
                );

                return (
                    <CardShell
                        
                        key={segment.id}
                        data-anchor={"engagement-segment-" + segment.id}
                        role="group"
                        aria-label={"Segment " + (segmentIndex + 1) + ": " +
                            (segment.name.trim().length > 0 ? segment.name.trim() : "Not named yet")}
                        /* The Segment's OWN colour, chosen on Page 1
                           and carried here: the same Segment is the
                           same colour on both pages, which is most
                           of what makes this read as the next page
                           rather than a different feature. */
                        style={{ "--strategy-theme-hue": segmentHue(segment) } as CSSProperties}
                    >

                        {/* NO HEAD ROW OF ITS OWN: the card's fold arrow
                            stands next to "1. SEGMENT", the first
                            column's heading, in the card's arrow
                            column. Folded, that heading stands alone
                            with the Segment's name, as a folded card
                            shows its name. */}
                        {open ? (
                            <div className="business-engagement-references">

                                <div className="business-engagement-reference-columns">

                                    {referenceColumn(
                                        "Segment",
                                        "Segment",
                                        segmentQuestions,
                                        [{
                                            key: segment.id,
                                            name: segment.name,
                                            description: segment.description
                                        }],
                                        true,
                                        segmentIndex + 1,
                                        segmentArrow
                                    )}

                                    {referenceColumn(
                                        "Profiles",
                                        "Profile",
                                        () => SECTIONS.channels.profileInformation,
                                        segment.profiles.map(profile => ({
                                            key: profile.id,
                                            name: profile.name,
                                            description: profile.description
                                        })),
                                        true
                                    )}

                                    {referenceColumn(
                                        "Offerings",
                                        "Offering",
                                        () => SECTIONS.channels.offeringInformation,
                                        segment.offerings.map(offering => ({
                                            key: offering.id,
                                            name: offering.name,
                                            description: offering.description
                                        })),
                                        true
                                    )}

                                </div>

                            </div>
                        ) : (
                            <div className="business-engagement-references business-engagement-segment-folded">
                                <span className="business-foundation-label-info">
                                    <span className="field-group-title business-foundation-subhead">
                                        {segmentArrow}
                                        <span className="business-engagement-reference-number">
                                            {(segmentIndex + 1) + "."}
                                        </span>
                                        Segment
                                    </span>
                                </span>
                                <span className="strategy-name-static">
                                    {segment.name.trim().length > 0
                                        ? segment.name
                                        : "Not named yet"}
                                </span>
                            </div>
                        )}

                        {open && (
                        <>

                                {/* Each section folds away. Both of
                                    them run to a table, and a founder
                                    working on one has no use for the
                                    other underfoot. */}
                                {foldingSection(
                                    segment.id + "-channels",
                                    "1. Customer Channel",
                                    () => (
                                        <>
                                            {asTiles ? channelTiles(segment) : channelsFor(segment)}
                                            {channelResourceTable(segment)}
                                        </>
                                    ),
                                    0,
                                    <>
                                        {isolated && isolated.segmentId === segment.id && (
                                            <IsolationNote
                                                kind={isolated.kind === "action" ? "shared" : "linked"}
                                                names={isolationNames()}
                                                onClear={clearIsolation}
                                            />
                                        )}
                                        <FoldAllToggle
                                            ids={channelCategoryFoldKeys(segment.id)}
                                            folds={folds}
                                            label="channel categories"
                                        />
                                    </>
                                )}

                                <>
                                {foldingSection(
                                    segment.id + "-relationships",
                                    "2. Customer Relationship",
                                    () => relationshipsFor(segment),
                                    1,
                                    <FoldAllToggle
                                        ids={engagedOfferingIds(segment).map(
                                            offeringId => "relationship-offering-" + offeringId
                                        )}
                                        /* Cascades into each Offering's
                                           Demand & Conversion block. */
                                        nested={engagedOfferingIds(segment).map(
                                            offeringId => "demand-" + offeringId
                                        )}
                                        folds={folds}
                                        label="offerings"
                                    />
                                )}

                                {/* DEMAND & CONVERSION, a section of its own after the table: for each Offering, how its customers come, and so how many sales to expect. */}
                                {foldingSection(
                                    segment.id + "-demand",
                                    "3. Demand & Conversion",
                                    () => (
                                        <div className="business-demand-section">
                                            {engagedOfferingIds(segment).map(offeringId => (
                                                <div className="business-demand-cell" key={offeringId} data-anchor={"demand-section-" + offeringId}>
                                                    {demandFor(segment, offeringId, segment.offerings.find(offering => offering.id === offeringId)?.name.trim() || "Offering")}
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                    1
                                )}
                                </>
                        </>
                        )}

                    </CardShell>
                );

            })}

        </div>

    );

}
