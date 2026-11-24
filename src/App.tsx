import { useEffect, useState } from "react";
import {
    carregarDadosBancarios,
    type DadosPlanilhaBancaria,
} from "./services/planilhaService";
import type { EstadoRequisicao } from "./types/banking";

function App() {
    const [estadoDados, setEstadoDados] = useState<
        EstadoRequisicao<DadosPlanilhaBancaria>
    >({ status: "loading" });

    useEffect(() => {
        let ativo = true;

        async function inicializarDados(): Promise<void> {
            try {
                const dados = await carregarDadosBancarios();
                if (!ativo) return;
                setEstadoDados({ status: "success", dados });
            } catch (erro: unknown) {
                if (!ativo) return;
                const mensagem =
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível carregar os dados da planilha.";
                setEstadoDados({ status: "error", mensagem });
            }
        }

        void inicializarDados();

        return () => {
            ativo = false;
        };
    }, []);

    return (
        <>
            <a href="#conteudo-principal" className="skip-link">
                Pular para o conteúdo principal
            </a>

            <header
                style={{
                    backgroundColor: "var(--cor-primaria-escura)",
                    color: "#FFFFFF",
                    padding: "1rem 1.5rem",
                }}
            >
                <div
                    style={{
                        maxWidth: "var(--largura-maxima-container)",
                        margin: "0 auto",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                    }}
                >
                    <div>
                        <strong
                            style={{
                                fontSize: "1.25rem",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Sistema Web
                        </strong>
                        <span
                            style={{
                                display: "block",
                                fontSize: "0.8125rem",
                                opacity: 0.85,
                            }}
                        >
                            Gestão de Clientes
                        </span>
                    </div>

                    <nav aria-label="Navegação principal">
                        <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                            Camada de Dados Ativa
                        </span>
                    </nav>
                </div>
            </header>

            <main
                id="conteudo-principal"
                style={{
                    flex: 1,
                    width: "100%",
                    maxWidth: "var(--largura-maxima-container)",
                    margin: "0 auto",
                    padding: "2rem 1.5rem",
                }}
            >
                <section
                    aria-labelledby="titulo-status-dados"
                    style={{
                        backgroundColor: "var(--cor-superficie)",
                        border: "1px solid var(--cor-borda)",
                        borderRadius: "8px",
                        padding: "1.5rem",
                    }}
                >
                    <h1
                        id="titulo-status-dados"
                        style={{
                            margin: "0 0 0.5rem",
                            fontSize: "1.5rem",
                            color: "var(--cor-primaria-escura)",
                        }}
                    >
                        Portal de Gestão de Clientes
                    </h1>

                    {estadoDados.status === "loading" && (
                        <p
                            style={{
                                margin: 0,
                                color: "var(--cor-texto-secundario)",
                            }}
                        >
                            Carregando e normalizando dados da planilha...
                        </p>
                    )}

                    {estadoDados.status === "error" && (
                        <p
                            role="alert"
                            style={{ margin: 0, color: "var(--cor-erro)" }}
                        >
                            {estadoDados.mensagem}
                        </p>
                    )}

                    {estadoDados.status === "success" && (
                        <p
                            style={{
                                margin: 0,
                                color: "var(--cor-texto-secundario)",
                            }}
                        >
                            Base sincronizada com sucesso:{" "}
                            <strong>
                                {estadoDados.dados.clientes.length} clientes
                            </strong>
                            ,{" "}
                            <strong>
                                {estadoDados.dados.contas.length} contas
                            </strong>{" "}
                            e{" "}
                            <strong>
                                {estadoDados.dados.agencias.length} agências
                            </strong>{" "}
                            carregados.
                        </p>
                    )}
                </section>
            </main>

            <footer
                style={{
                    borderTop: "1px solid var(--cor-borda)",
                    backgroundColor: "var(--cor-superficie)",
                    color: "var(--cor-texto-secundario)",
                    fontSize: "0.875rem",
                    padding: "1rem 1.5rem",
                }}
            >
                <div
                    style={{
                        maxWidth: "var(--largura-maxima-container)",
                        margin: "0 auto",
                    }}
                >
                    Suporte: Central do banco · Telefone: (00) 0000-0000
                </div>
            </footer>
        </>
    );
}

export default App;
