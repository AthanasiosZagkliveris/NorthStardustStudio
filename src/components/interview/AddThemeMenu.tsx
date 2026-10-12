import InfoNote, { InfoPoint } from "./InfoNote.tsx";

interface AddThemeMenuProps {

    disabled?: boolean;

    /** Guidance for adding Themes: an "i" in the tile's corner. */
    info?: InfoPoint[];

    /** Makes a blank Theme and shows its card. */
    onAdd: () => void;

}

/**
 * "Add Card" for a Theme: the standard small dashed tile. Pressing it makes the Theme and shows its card at once; the common
 * Themes are the guidance of its "i".
 */
export default function AddThemeMenu({ disabled = false, info, onAdd }: AddThemeMenuProps) {

    return (

        <div className="strategy-add-menu add-card-slot" style={{ gridColumn: -2 }}>

            <button
                type="button"
                className="add-card-tile"
                aria-label="Add Card"
                title="Add Theme"
                disabled={disabled}
                onClick={onAdd}
            >
                <span className="add-card-plus" aria-hidden="true">+</span>
                <span className="add-card-words">Add Card</span>
            </button>

            {info && info.length > 0 && <InfoNote label="Adding Themes" points={info} fullList size="double" />}

        </div>

    );

}
