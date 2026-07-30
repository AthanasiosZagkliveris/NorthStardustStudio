import "../../styles/product-selector.css";

interface ProductSelectorProps {
    /**
     * Every non-blank Product name currently in the shared
     * Product Register table (see Conversation.tsx's
     * SHARED_PRODUCT_REGISTER_BINDINGS).
     */
    products: string[];

    selected?: string;

    onSelect: (productName: string) => void;
}

/**
 * Lets the user pick which Product (from the shared Product
 * Register table above it) the rest of the Product
 * Development System's Sections should focus on. Editing
 * happens in the table itself -- this is purely a picker, so
 * it reuses the hover/selected visual language from the
 * Organizations list (item 3 / item 7) without an editable
 * text field of its own.
 */
export default function ProductSelector({ products, selected, onSelect }: ProductSelectorProps) {

    return (

        <div className="product-selector">

            <div className="product-selector-label">
                Select a Product to work on
            </div>

            {products.length === 0 ? (

                <div className="product-selector-hint">
                    Add a product to the table above, then select it here to continue.
                </div>

            ) : (

                <div className="product-selector-list">

                    {products.map(name => (

                        <button
                            type="button"
                            key={name}
                            className={
                                "product-selector-row" +
                                (selected === name ? " product-selector-row-selected" : "")
                            }
                            onClick={() => onSelect(name)}
                        >
                            {name}
                        </button>

                    ))}

                </div>

            )}

        </div>

    );

}
