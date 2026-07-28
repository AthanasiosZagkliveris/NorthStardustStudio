import { getCapabilityColor } from "../../data/capabilities";
import { getSystemIcon } from "../../data/systemIcons";

interface InterviewHeaderProps {
    systemNumber: string;
    systemName: string;
    capabilityId?: string;
}

export default function InterviewHeader({
    systemNumber,
    systemName,
    capabilityId
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
                </h1>

            </div>

            <div className="interview-divider" />

        </header>

    );

}
