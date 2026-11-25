import { formatarCpfCnpj } from "../utils/formatadores";
import type { Cliente, EstadoRequisicao } from "../types/banking";

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
        <div className="tabela-responsiva">
            <table className="tabela-clientes">
                <caption className="tabela-clientes__legenda">
                    Lista de clientes cadastrados, documentos, contato, agência
                    e estado civil
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">CPF / CNPJ</th>
                        <th scope="col">E-mail</th>
                        <th scope="col">Agência</th>
                        <th scope="col">Estado civil</th>
                    </tr>
                </thead>
                <tbody>
                    {estado.dados.map((cliente) => (
                        <tr key={cliente.id}>
                            <td>{cliente.nome}</td>
                            <td>{formatarCpfCnpj(cliente.cpfCnpj)}</td>
                            <td>{cliente.email || "Não informado"}</td>
                            <td>{cliente.codigoAgencia ?? "Não informado"}</td>
                            <td>{cliente.estadoCivil}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
