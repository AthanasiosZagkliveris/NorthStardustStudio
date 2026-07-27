import "../styles/system-confirmation.css";

interface SystemConfirmationProps {

    open: boolean;

    systemTitle: string;

    onCancel: () => void;

    onStart: () => void;

}

export default function SystemConfirmation({

    open,

    systemTitle,

    onCancel,

    onStart

}: SystemConfirmationProps) {

    if (!open) return null;

    return (

        <div className="confirmation-overlay">

            <div className="confirmation-dialog">

                <h2 className="confirmation-title">

                    Begin {systemTitle}?

                </h2>

                <p className="confirmation-message">

                    The AI Assistant will interview you to complete this Framework System.

                </p>

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
                        Begin Interview
                    </button>

                </div>

            </div>

        </div>

    );

}