interface InterviewHeaderProps {

    systemName: string;

    capability: string;

}

export default function InterviewHeader({

    systemName,

    capability

}: InterviewHeaderProps) {

    return (

        <header className="interview-header">

            <h1>

                {systemName}

            </h1>

            <p>

                {capability}

            </p>

        </header>

    );

}