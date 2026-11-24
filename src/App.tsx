import { TabelaClientes } from "./components/TabelaClientes";
import { useDadosBancarios } from "./hooks/useDadosBancarios";
import type { Cliente, EstadoRequisicao } from "./types/banking";

function App() {
    const { estado, recarregar } = useDadosBancarios();

    const estadoClientes: EstadoRequisicao<readonly Cliente[]> =
        estado.status === "success"
            ? { status: "success", dados: estado.dados.clientes }
            : estado;

    return (
        <>
            <a href="#conteudo-principal" className="skip-link">
                Pular para o conteúdo principal
            </a>

            <header className="cabecalho-institucional">
                <div className="cabecalho-institucional__conteudo">
                    <div>
                        <strong className="cabecalho-institucional__marca">
                            Sistema Web
                        </strong>
                        <span className="cabecalho-institucional__subtitulo">
                            Gestão de Clientes
                        </span>
                    </div>

                    <nav aria-label="Navegação principal">
                        <span className="cabecalho-institucional__status">
                            Clientes cadastrados
                        </span>
                    </nav>
                </div>
            </header>

            <main id="conteudo-principal" className="conteudo-principal">
                <section
                    className="painel-secao"
                    aria-labelledby="titulo-listagem-clientes"
                >
                    <div className="painel-secao__cabecalho">
                        <h1
                            id="titulo-listagem-clientes"
                            className="painel-secao__titulo"
                        >
                            Clientes
                        </h1>
                        {estado.status === "success" && (
                            <p className="painel-secao__resumo">
                                Total carregado: {estado.dados.clientes.length}{" "}
                                clientes
                            </p>
                        )}
                    </div>

                    <TabelaClientes
                        estado={estadoClientes}
                        onTentarNovamente={recarregar}
                    />
                </section>
            </main>

            <footer className="rodape-institucional">
                <div className="rodape-institucional__conteudo">
                    Suporte: Central do banco · Telefone: (00) 0000-0000
                </div>
            </footer>
        </>
    );
}

export default App;
