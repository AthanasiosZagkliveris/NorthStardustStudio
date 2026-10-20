import BackButton from "./controls/BackButton.tsx";
import AddButton from "./controls/AddButton.tsx";
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

            <BackButton className="back-link" onClick={onBack} />

            <div className="workspace-footer-actions">

                {secondaryText && (

                    <AddButton look="secondary-button"
                        onClick={onSecondary}
                        disabled={secondaryDisabled}>
                        {secondaryText}
                    </AddButton>

                )}

                {primaryText && (

                    <AddButton look="primary-button"
                        onClick={onPrimary}
                        disabled={primaryDisabled}>
                        {primaryText}
                    </AddButton>

                )}

            </div>

        </footer>

    );

}