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

        // Clicking the dimmed backdrop (anywhere outside the dialog
        // box itself) closes this the same way "Back" does -- the
        // dialog box below stops the click from ever reaching here
        // when the click actually landed inside it.
        <div className="confirmation-overlay" onClick={onCancel}>

            <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>

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