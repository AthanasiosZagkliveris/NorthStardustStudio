import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * Catches unexpected rendering errors anywhere below it
 * in the tree.
 *
 * Without this, an uncaught error during render (for
 * example, a Section missing an Answer Definition)
 * causes React to unmount the entire application,
 * leaving a blank white page with no indication of
 * what happened. This boundary shows a recoverable
 * message instead, and offers a way to clear any
 * corrupted saved Interview data.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("North Stardust Studio crashed while rendering.", error, info);
    }

    private handleReload = (): void => {
        window.location.href = "/";
    };

    private handleClearAndReload = (): void => {
        try {
            localStorage.removeItem("northstardust-interview");
        } catch {
            // Ignore -- storage may be unavailable.
        }
        window.location.href = "/";
    };

    render() {

        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <div className="error-boundary">
                <h1>Something went wrong.</h1>
                <p>
                    North Stardust Studio hit an unexpected error and
                    couldn&apos;t display this page.
                </p>
                <p className="error-boundary-detail">
                    {this.state.error.message}
                </p>
                <div className="error-boundary-actions">
                    <button type="button" onClick={this.handleReload}>
                        Reload
                    </button>
                    <button type="button" onClick={this.handleClearAndReload}>
                        Clear Saved Interview &amp; Reload
                    </button>
                </div>
            </div>
        );

    }

}

export default ErrorBoundary;
