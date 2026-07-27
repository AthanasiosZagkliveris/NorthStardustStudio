import "../styles/workspace.css";

interface AppFooterProps {

    onBack?: () => void;

    primaryText?: string;

    onPrimary?: () => void;

    primaryDisabled?: boolean;

    secondaryText?: string;

    onSecondary?: () => void;

    secondaryDisabled?: boolean;

}

export default function AppFooter({

    onBack,

    primaryText,

    onPrimary,

    primaryDisabled = false,

    secondaryText,

    onSecondary,

    secondaryDisabled = false

}: AppFooterProps) {

    return (

        <footer className="workspace-footer">

            <button
                type="button"
                className="back-link"
                onClick={onBack}
            >
                ← Back
            </button>

            <div className="workspace-footer-actions">

                {secondaryText && (

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onSecondary}
                        disabled={secondaryDisabled}
                    >
                        {secondaryText}
                    </button>

                )}

                {primaryText && (

                    <button
                        type="button"
                        className="primary-button"
                        onClick={onPrimary}
                        disabled={primaryDisabled}
                    >
                        {primaryText}
                    </button>

                )}

            </div>

        </footer>

    );

}