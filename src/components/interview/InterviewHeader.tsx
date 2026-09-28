import { getCapabilityColor } from "../../data/capabilities";
import { getSystemIcon } from "../../data/systemIcons";

interface InterviewHeaderProps {
    systemNumber: string;
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
}

export default function InterviewHeader({
    systemNumber,
    systemName,
    capabilityId,
    pageTitle
}: InterviewHeaderProps) {

    const color = getCapabilityColor(capabilityId);
    const icon = getSystemIcon(Number(systemNumber));

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
                    {systemNumber}. {systemName}
                    {pageTitle && (
                        <span className="interview-header-page-title">
                            {` — ${pageTitle}`}
                        </span>
                    )}
                </h1>

            </div>

            <div className="interview-divider" />

        </header>

    );

}
