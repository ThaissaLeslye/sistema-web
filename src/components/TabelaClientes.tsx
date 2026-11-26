import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Cliente, EstadoRequisicao } from "../types/banking";
import { formatarCpfCnpj } from "../utils/formatadores";

export interface TabelaClientesProps {
    estado: EstadoRequisicao<readonly Cliente[]>;
    onTentarNovamente: () => void;
}

// Renderiza os estados de carregamento, erro, vazio e a tabela semântica de clientes
export function TabelaClientes({
    estado,
    onTentarNovamente,
}: TabelaClientesProps) {
    if (estado.status === "idle" || estado.status === "loading") {
        return (
            <div className="estado-painel" role="status" aria-live="polite">
                <p className="estado-painel__texto">
                    Carregando lista de clientes...
                </p>
            </div>
        );
    }

    if (estado.status === "error") {
        return (
            <div className="estado-painel estado-painel--erro" role="alert">
                <p className="estado-painel__texto">{estado.mensagem}</p>
                <button
                    type="button"
                    className="botao-secundario"
                    onClick={onTentarNovamente}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (estado.dados.length === 0) {
        return (
            <div className="estado-painel" role="status" aria-live="polite">
                <p className="estado-painel__texto">
                    Nenhum cliente encontrado na planilha.
                </p>
            </div>
        );
    }

    return (
        <Table responsive hover className="align-middle caption-top mb-0">
            <caption className="small text-secondary pt-0">
                Lista de clientes cadastrados, documentos, contato, agência e
                estado civil
            </caption>
            <thead className="table-light">
                <tr>
                    <th
                        scope="col"
                        className="text-nowrap"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        Nome
                    </th>
                    <th
                        scope="col"
                        className="text-nowrap"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        CPF / CNPJ
                    </th>
                    <th
                        scope="col"
                        className="text-nowrap"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        E-mail
                    </th>
                    <th
                        scope="col"
                        className="text-nowrap"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        Agência
                    </th>
                    <th
                        scope="col"
                        className="text-nowrap"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        Estado civil
                    </th>
                    <th
                        scope="col"
                        className="text-nowrap text-center"
                        style={{ color: "var(--cor-primaria)" }}
                    >
                        Ações
                    </th>
                </tr>
            </thead>
            <tbody>
                {estado.dados.map((cliente) => (
                    <tr key={cliente.id}>
                        <td>{cliente.nome}</td>
                        <td className="text-nowrap">
                            {formatarCpfCnpj(cliente.cpfCnpj)}
                        </td>
                        <td>{cliente.email || "Não informado"}</td>
                        <td>{cliente.codigoAgencia ?? "Não informado"}</td>
                        <td>{cliente.estadoCivil}</td>
                        <td className="text-center">
                            <Link
                                to={`/clientes/${cliente.id}`}
                                className="btn btn-outline-primary btn-sm fw-semibold text-nowrap"
                                aria-label={`Ver detalhes de ${cliente.nome}`}
                            >
                                Ver detalhes
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
