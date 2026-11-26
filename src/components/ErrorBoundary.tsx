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
                        maxWidth: "36rem",
                        margin: "3rem auto",
                        padding: "1.5rem",
                        backgroundColor: "var(--cor-superficie)",
                        border: "1px solid var(--cor-erro)",
                        borderRadius: "8px",
                        color: "var(--cor-texto-principal)",
                    }}
                >
                    <h1
                        style={{
                            marginTop: 0,
                            fontSize: "1.25rem",
                            color: "var(--cor-erro)",
                        }}
                    >
                        Ocorreu um erro inesperado na aplicação
                    </h1>
                    <p style={{ color: "var(--cor-texto-secundario)" }}>
                        {this.state.errorMessage ||
                            "Não foi possível renderizar esta tela."}
                    </p>
                    <button
                        type="button"
                        onClick={() => this.handleRecarregar()}
                        style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "var(--cor-primaria)",
                            color: "var(--cor-superficie)",
                            border: "1px solid var(--cor-primaria)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Recarregar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
