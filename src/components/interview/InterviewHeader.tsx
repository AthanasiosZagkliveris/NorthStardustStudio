interface InterviewHeaderProps {
    systemNumber: string;
    systemName: string;
}

export default function InterviewHeader({
    systemNumber,
    systemName
}: InterviewHeaderProps) {

    return (

        <header className="interview-header">

            <h1>
                {systemNumber}. {systemName}
            </h1>

            <div className="interview-divider" />

        </header>

    );

}