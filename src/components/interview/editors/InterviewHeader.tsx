import type { ReactNode } from "react";

import { getCapabilityColor } from "../../../data/capabilities";
import { getSystemIcon } from "../../../data/systemIcons";

interface InterviewHeaderProps {
    /** Left out on a page that belongs to no System (the Workbook): its title is the name alone. */
    systemNumber?: string;
    systemName: string;
    capabilityId?: string;

    /**
     * The current page's own title, joined onto the System title
     * with a spaced em dash -- "1. Identity System — Definition: Who
     * are you?". A Strategy title's own " · Jan 2027 – Dec 2029"
     * period suffix keeps its middle dot. Passed only for a page that has moved its title up
     * here (a column-layout Section; see Conversation.tsx), which
     * then renders no separate heading of its own below. Omitted
     * everywhere else, leaving the System title exactly as it was.
     */
    pageTitle?: string;

    /**
     * The page title shown in capitals ("— INTRODUCTION"), by CSS
     * alone: the text stays as written, so a screen reader reads
     * "Introduction", not a spelled-out word.
     */
    pageTitleCapitals?: boolean;

    /** What stands after the title, inside the heading. */
    note?: ReactNode;

    /** The icon before the title on a page that belongs to no System (the Workbook's), drawn as a System's is. */
    icon?: string;

    /** What stands at the right end of the title's row (the Workbook's section buttons), on the title's line. */
    actions?: ReactNode;
}

export default function InterviewHeader({
    systemNumber,
    systemName,
    capabilityId,
    pageTitle,
    pageTitleCapitals = false,
    note,
    icon: ownIcon,
    actions
}: InterviewHeaderProps) {

    const color = getCapabilityColor(capabilityId);
    const icon = ownIcon ?? (systemNumber ? getSystemIcon(Number(systemNumber)) : undefined);

    return (

        <header
            className="interview-header"
            style={{ "--capability-color": color } as React.CSSProperties}
        >

            <div className="interview-header-title-row">

                {icon && (
                    <img
                        src={icon}
                        alt=""
                        className="interview-header-icon"
                    />
                )}

                <h1>
                    {systemNumber ? `${systemNumber}. ${systemName}` : systemName}
                    {pageTitle && (
                        <span className={"interview-header-page-title" + (pageTitleCapitals ? " interview-header-page-title-capitals" : "")}>
                            {` — ${pageTitle}`}
                        </span>
                    )}
                    {note}
                </h1>

                {actions}

            </div>

            <div className="interview-divider" />

        </header>

    );

}
