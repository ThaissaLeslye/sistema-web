import { Link } from "react-router-dom";
import { TabelaClientes } from "../components/TabelaClientes";
import { useDadosBancarios } from "../hooks/useDadosBancarios";
import type { Cliente, EstadoRequisicao } from "../types/banking";

export function ClientesPage() {
    const { estado, recarregar } = useDadosBancarios();

    // Projeção tipada apenas da fatia de clientes para o componente tabular
    const estadoClientes: EstadoRequisicao<readonly Cliente[]> =
        estado.status === "success"
            ? { status: "success", dados: estado.dados.clientes }
            : estado;

    return (
        <section
            className="bg-white border rounded-3 p-3 p-md-4"
            aria-labelledby="titulo-listagem-clientes"
        >
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
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            Total carregado: {estado.dados.clientes.length}{" "}
                            clientes
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

            <TabelaClientes
                estado={estadoClientes}
                onTentarNovamente={recarregar}
            />
        </section>
    );
}
