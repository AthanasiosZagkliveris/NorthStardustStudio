import "../styles/business-documents.css";
import { type ForecastViewTable } from "../framework/engine/FinancialForecast.ts";

/**
 * ONE FORECAST TABLE, WHEREVER IT STANDS (the Workbook's Financial Forecast; owner, 2026-11-20 12:49 UTC+2; the Financials' Cash Flow tile drew it until it became a record, doc 48, section 14):
 * its caption, its note, a column per period, the subtotal columns set apart, a heading row, a row of words in place of figures, and the figures.
 */
export default function ForecastTable({ table, currency, format, annual = false }: { table: ForecastViewTable; currency: string; format: (amount: number) => string; annual?: boolean }) {
    return (
        <div className="business-forecast-table-wrap">
            {/* The table's caption: stays in view while a monthly table scrolls sideways. */}
            <p className="business-forecast-caption" id={"forecast-" + table.title.replace(/[^A-Za-z0-9]+/g, "-")}>{table.title}</p>
            {table.note && <p className="business-forecast-table-note">{table.note}</p>}
            <table
                className={"business-forecast-table" + (annual ? " business-forecast-annual" : "")}
                aria-labelledby={"forecast-" + table.title.replace(/[^A-Za-z0-9]+/g, "-")}
            >
                {annual && (
                    /* The same widths in all three tables. */
                    <colgroup>
                        <col className="business-forecast-label-col" />
                        {table.columns.map(column => <col className="business-forecast-value-col" key={column} />)}
                    </colgroup>
                )}
                <thead>
                    <tr>
                        <th scope="col">{currency || "Amount"}</th>
                        {table.columns.map((column, index) => (
                            <th
                                scope="col"
                                key={column}
                                title={column}
                                className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                            >
                                {/* A plan year by its number: its months are said once, in the note above and in the tooltip (owner, 2026-11-09). */}
                                {column.replace(/ \(.*\)$/, "")}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map(row => row.heading ? (
                        <tr key={row.label} className="business-forecast-heading">
                            <th scope="rowgroup">{row.label}</th>
                            <td colSpan={table.columns.length} />
                        </tr>
                    ) : row.text !== undefined ? (
                        /* Words in place of figures: "Income tax: Not chosen yet". */
                        <tr key={row.label} className="business-forecast-text">
                            <th scope="row">{row.label}</th>
                            {table.columns.map((column, index) => (
                                <td
                                    key={column}
                                    className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                                >
                                    {index === 0 ? row.text : ""}
                                </td>
                            ))}
                        </tr>
                    ) : (
                        <tr key={row.label} className={row.total ? "business-forecast-total" : undefined}>
                            <th scope="row">{row.label}</th>
                            {row.values.map((amount, index) => (
                                <td
                                    key={index}
                                    className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                                >
                                    {format(amount)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
