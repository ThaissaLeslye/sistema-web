import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: "",
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            errorMessage:
                error.message ||
                "Ocorreu uma falha inesperada ao carregar esta tela.",
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    }

    private handleRecarregar = (): void => {
        this.setState({ hasError: false, errorMessage: "" });
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    role="alert"
                    style={{
                        maxWidth: "520px",
                        margin: "4rem auto",
                        padding: "2rem",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        fontFamily: "system-ui, sans-serif",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "1.25rem",
                            color: "#003B73",
                            marginBottom: "0.75rem",
                        }}
                    >
                        Não foi possível exibir esta página
                    </h1>
                    <p
                        style={{
                            fontSize: "0.95rem",
                            color: "#475569",
                            marginBottom: "1.5rem",
                        }}
                    >
                        {this.state.errorMessage}
                    </p>
                    <button
                        type="button"
                        onClick={this.handleRecarregar}
                        style={{
                            backgroundColor: "#0070C0",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.625rem 1.25rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Recarregar aplicação
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
