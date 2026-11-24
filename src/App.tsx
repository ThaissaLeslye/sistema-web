import { useEffect, useState } from "react";
import {
    inspecionarAbasPlanilha,
    type RelatorioInspecaoAba,
} from "./services/inspecaoCsv";

function App() {
    const [statusInspecao, setStatusInspecao] = useState<
        "carregando" | "concluido" | "erro"
    >("carregando");
    const [relatorios, setRelatorios] = useState<RelatorioInspecaoAba[]>([]);
    const [erroDetalhes, setErroDetalhes] = useState<string>("");

    useEffect(() => {
        let ativo = true;

        async function executarInspecao(): Promise<void> {
            try {
                const dados = await inspecionarAbasPlanilha();
                if (!ativo) return;

                setRelatorios(dados);
                setStatusInspecao("concluido");
                console.warn(
                    "=== INSPEÇÃO HTTP DAS ABAS CSV (SISTEMA WEB) ===",
                );
                for (const item of dados) {
                    console.warn(
                        `[Aba: ${item.aba}] Status: ${item.statusHttp} | Content-Type: ${item.contentType}`,
                    );
                    console.warn("Cabeçalho:", item.cabecalhoBruto);
                    console.warn(
                        "Amostra (5 primeiras linhas):",
                        item.amostraLinhas,
                    );
                }
            } catch (erro: unknown) {
                if (!ativo) return;
                const mensagem =
                    erro instanceof Error
                        ? erro.message
                        : "Erro desconhecido ao acessar a planilha.";
                setErroDetalhes(mensagem);
                setStatusInspecao("erro");
            }
        }

        void executarInspecao();

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
                            Diagnóstico de Dados CSV
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
                    aria-labelledby="titulo-inspecao"
                    style={{
                        backgroundColor: "var(--cor-superficie)",
                        border: "1px solid var(--cor-borda)",
                        borderRadius: "8px",
                        padding: "1.5rem",
                    }}
                >
                    <h1
                        id="titulo-inspecao"
                        style={{
                            margin: "0 0 0.5rem",
                            fontSize: "1.5rem",
                            color: "var(--cor-primaria-escura)",
                        }}
                    >
                        Inspeção HTTP das Abas CSV
                    </h1>

                    {statusInspecao === "carregando" && (
                        <p
                            style={{
                                margin: 0,
                                color: "var(--cor-texto-secundario)",
                            }}
                        >
                            Consultando abas clientes, contas e agencias via
                            Fetch API...
                        </p>
                    )}

                    {statusInspecao === "erro" && (
                        <p
                            role="alert"
                            style={{ margin: 0, color: "var(--cor-erro)" }}
                        >
                            Falha na requisição: {erroDetalhes}
                        </p>
                    )}

                    {statusInspecao === "concluido" && (
                        <div
                            style={{
                                display: "grid",
                                gap: "1rem",
                                marginTop: "1rem",
                            }}
                        >
                            {relatorios.map((item) => (
                                <article
                                    key={item.aba}
                                    style={{
                                        border: "1px solid var(--cor-borda)",
                                        borderRadius: "6px",
                                        padding: "1rem",
                                        backgroundColor:
                                            "var(--cor-fundo-pagina)",
                                    }}
                                >
                                    <strong>
                                        Aba: {item.aba} (HTTP {item.statusHttp}{" "}
                                        · {item.totalLinhas} linhas)
                                    </strong>
                                    <p
                                        style={{
                                            margin: "0.25rem 0",
                                            fontSize: "0.85rem",
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        Content-Type:{" "}
                                        {item.contentType ?? "não informado"}
                                    </p>
                                    <pre
                                        style={{
                                            margin: "0.5rem 0 0",
                                            padding: "0.75rem",
                                            backgroundColor:
                                                "var(--cor-superficie)",
                                            border: "1px solid var(--cor-borda)",
                                            borderRadius: "4px",
                                            overflowX: "auto",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        {[
                                            item.cabecalhoBruto,
                                            ...item.amostraLinhas,
                                        ].join("\n")}
                                    </pre>
                                </article>
                            ))}
                        </div>
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
