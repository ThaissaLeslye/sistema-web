import { useRef, useState } from "react";
import { Button, Form, InputGroup, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import { TabelaClientes } from "../components/TabelaClientes";
import { useDadosBancarios } from "../hooks/useDadosBancarios";
import type { Cliente, EstadoRequisicao } from "../types/banking";
import { filtrarClientes } from "../utils/filtrosClientes";

const ITENS_POR_PAGINA = 10;

export function ClientesPage() {
    const { estado, recarregar } = useDadosBancarios();
    const [termoBusca, setTermoBusca] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const inputBuscaRef = useRef<HTMLInputElement | null>(null);

    // Derivação da lista filtrada e da fatia paginada sem mutar os dados originais
    const todosClientes: readonly Cliente[] =
        estado.status === "success" ? estado.dados.clientes : [];

    const clientesFiltrados = filtrarClientes(todosClientes, termoBusca);
    const totalFiltrados = clientesFiltrados.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(totalFiltrados / ITENS_POR_PAGINA),
    );
    const paginaSegura = Math.min(paginaAtual, totalPaginas);

    const indiceInicial = (paginaSegura - 1) * ITENS_POR_PAGINA;
    const clientesPaginados = clientesFiltrados.slice(
        indiceInicial,
        indiceInicial + ITENS_POR_PAGINA,
    );

    const estadoClientesPaginados: EstadoRequisicao<readonly Cliente[]> =
        estado.status === "success"
            ? { status: "success", dados: clientesPaginados }
            : estado;

    const handleAlterarBusca = (novoTermo: string): void => {
        setTermoBusca(novoTermo);
        setPaginaAtual(1);
    };

    const handleLimparBusca = (): void => {
        setTermoBusca("");
        setPaginaAtual(1);
        inputBuscaRef.current?.focus();
    };

    const buscaSemResultados =
        estado.status === "success" &&
        todosClientes.length > 0 &&
        totalFiltrados === 0;

    return (
        <section
            className="bg-white border rounded-3 p-3 p-md-4"
            aria-labelledby="titulo-listagem-clientes"
        >
            {/* Cabeçalho da seção com título, resumo acessível e ação de cadastro */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                    <h1
                        id="titulo-listagem-clientes"
                        className="h4 text-uppercase fw-bold mb-1"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        Clientes
                    </h1>
                    {estado.status === "success" && (
                        <p
                            className="mb-0 small"
                            role="status"
                            aria-live="polite"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {termoBusca.trim() !== ""
                                ? `${totalFiltrados} ${totalFiltrados === 1 ? "cliente encontrado" : "clientes encontrados"} de ${todosClientes.length}`
                                : `Total de clintes: ${todosClientes.length}`}
                        </p>
                    )}
                </div>

                <Link
                    to="/clientes/novo"
                    className="btn btn-primary btn-md fw-semibold"
                >
                    Novo Cliente
                </Link>
            </div>

            {/* Controle de pesquisa por nome ou documento */}
            <div className="mb-3">
                <Form.Label
                    htmlFor="campo-busca-clientes"
                    className="small fw-semibold text-uppercase mb-1"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Buscar por nome ou CPF/CNPJ
                </Form.Label>
                <InputGroup>
                    <Form.Control
                        ref={inputBuscaRef}
                        id="campo-busca-clientes"
                        type="search"
                        value={termoBusca}
                        onChange={(evento) =>
                            handleAlterarBusca(evento.target.value)
                        }
                        placeholder="Ex.: Marina ou 123.456.789-09"
                        disabled={estado.status !== "success"}
                    />
                    {termoBusca.length > 0 && (
                        <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={handleLimparBusca}
                        >
                            Limpar
                        </Button>
                    )}
                </InputGroup>
            </div>

            {/* Exibição condicional entre busca sem correspondência e tabela paginada */}
            {buscaSemResultados ? (
                <div className="estado-painel" role="status" aria-live="polite">
                    <p className="estado-painel__texto mb-2">
                        Nenhum cliente encontrado para{" "}
                        <strong>“{termoBusca.trim()}”</strong>.
                    </p>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        onClick={handleLimparBusca}
                    >
                        Limpar busca
                    </Button>
                </div>
            ) : (
                <>
                    <TabelaClientes
                        estado={estadoClientesPaginados}
                        onTentarNovamente={recarregar}
                    />

                    {estado.status === "success" && totalFiltrados > 0 && (
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 border-top">
                            <span
                                className="small"
                                style={{
                                    color: "var(--cor-texto-secundario)",
                                }}
                            >
                                Página {paginaSegura} de {totalPaginas}
                            </span>

                            <nav aria-label="Paginação da listagem de clientes">
                                <Pagination className="mb-0" size="sm">
                                    <Pagination.Prev
                                        disabled={paginaSegura <= 1}
                                        onClick={() =>
                                            setPaginaAtual((atual) =>
                                                Math.max(1, atual - 1),
                                            )
                                        }
                                    >
                                        Anterior
                                    </Pagination.Prev>

                                    {Array.from(
                                        { length: totalPaginas },
                                        (_, indice) => {
                                            const numeroPagina = indice + 1;
                                            return (
                                                <Pagination.Item
                                                    key={numeroPagina}
                                                    active={
                                                        numeroPagina ===
                                                        paginaSegura
                                                    }
                                                    onClick={() =>
                                                        setPaginaAtual(
                                                            numeroPagina,
                                                        )
                                                    }
                                                >
                                                    {numeroPagina}
                                                </Pagination.Item>
                                            );
                                        },
                                    )}

                                    <Pagination.Next
                                        disabled={paginaSegura >= totalPaginas}
                                        onClick={() =>
                                            setPaginaAtual((atual) =>
                                                Math.min(
                                                    totalPaginas,
                                                    atual + 1,
                                                ),
                                            )
                                        }
                                    >
                                        Próxima
                                    </Pagination.Next>
                                </Pagination>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
