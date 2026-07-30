import "../styles/system-confirmation.css";

interface SystemConfirmationProps {

    open: boolean;

    organizationName?: string;

    systemTitle: string;

    onCancel: () => void;

    onStart: () => void;

}

export default function SystemConfirmation({

    open,

    organizationName,

    systemTitle,

    onCancel,

    onStart

}: SystemConfirmationProps) {

    if (!open) return null;

    return (

        <div className="confirmation-overlay">

            <div className="confirmation-dialog">

                {organizationName ? (

                    <>
                        <h2 className="confirmation-title">
                            {organizationName}
                        </h2>

                        <p className="confirmation-question">
                            Begin {systemTitle}?
                        </p>
                    </>

                ) : (

                    <h2 className="confirmation-title">
                        Begin {systemTitle}?
                    </h2>

                )}

                <div className="confirmation-actions">

                    <button
                        className="confirmation-button secondary"
                        onClick={onCancel}
                    >
                        Back
                    </button>

                    <button
                        className="confirmation-button primary"
                        onClick={onStart}
                    >
                        Forward
                    </button>

                </div>

            </div>

        </div>

    );

}