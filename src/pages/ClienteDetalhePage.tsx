import { Card, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useDadosBancarios } from "../hooks/useDadosBancarios";
import {
    buscarAgenciaDoCliente,
    buscarClientePorId,
    filtrarContasDoCliente,
} from "../utils/detalhesCliente";
import {
    formatarCpfCnpj,
    formatarData,
    formatarMoeda,
    formatarTipoConta,
} from "../utils/formatadores";

export function ClienteDetalhePage() {
    const { id } = useParams();
    const { estado, clientes, contas, agencias, recarregar } =
        useDadosBancarios();

    const linkVoltar = (
        <div className="mb-3">
            <Link to="/" className="text-decoration-none small fw-semibold">
                ← Voltar para clientes
            </Link>
        </div>
    );

    if (estado.status === "idle" || estado.status === "loading") {
        return (
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-detalhe-carregando"
            >
                {linkVoltar}
                <h1
                    id="titulo-detalhe-carregando"
                    className="h4 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Detalhes do Cliente
                </h1>
                <div className="estado-painel" role="status" aria-live="polite">
                    <p className="estado-painel__texto">
                        Carregando dados do cliente...
                    </p>
                </div>
            </section>
        );
    }

    if (estado.status === "error") {
        return (
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-detalhe-erro"
            >
                {linkVoltar}
                <h1
                    id="titulo-detalhe-erro"
                    className="h4 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Detalhes do Cliente
                </h1>
                <div className="estado-painel estado-painel--erro" role="alert">
                    <p className="estado-painel__texto">{estado.mensagem}</p>
                    <button
                        type="button"
                        className="botao-secundario"
                        onClick={recarregar}
                    >
                        Tentar novamente
                    </button>
                </div>
            </section>
        );
    }

    const cliente = buscarClientePorId(clientes, id);

    if (!cliente) {
        return (
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-cliente-nao-encontrado"
            >
                {linkVoltar}
                <h1
                    id="titulo-cliente-nao-encontrado"
                    className="h4 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Cliente não encontrado
                </h1>
                <div className="estado-painel" role="status" aria-live="polite">
                    <p className="estado-painel__texto mb-3">
                        Nenhum cliente cadastrado corresponde ao identificador{" "}
                        <strong>{id ?? "não informado"}</strong>.
                    </p>
                    <Link to="/" className="btn btn-primary btn-sm fw-semibold">
                        Voltar para a listagem de clientes
                    </Link>
                </div>
            </section>
        );
    }

    const contasDoCliente = filtrarContasDoCliente(contas, cliente.cpfCnpj);
    const agenciaDoCliente = buscarAgenciaDoCliente(
        agencias,
        cliente.codigoAgencia,
    );

    return (
        <div className="d-flex flex-column gap-4">
            {/* Seção 1: Dados cadastrais completos do cliente */}
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-detalhe-cliente"
            >
                {linkVoltar}

                <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 border-bottom pb-3 mb-3">
                    <div>
                        <p
                            className="medium text-secondary mb-1"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            Ficha Cadastral
                        </p>
                        <h1
                            id="titulo-detalhe-cliente"
                            className="h4 fw-bold mb-0"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            {cliente.nome}
                        </h1>
                    </div>
                    <span
                        className="small fw-semibold"
                        style={{ color: "var(--cor-texto-secundario)" }}
                    >
                        ID: {cliente.id}
                    </span>
                </div>

                <dl className="row g-3 mb-0">
                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            CPF / CNPJ
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {formatarCpfCnpj(cliente.cpfCnpj)}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            RG
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {cliente.rg || "Não informado"}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            Nome social
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {cliente.nomeSocial || "Não informado"}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            Data de nascimento
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {formatarData(cliente.dataNascimento)}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            Estado civil
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {cliente.estadoCivil}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            E-mail
                        </dt>
                        <dd
                            className="mb-0 text-break"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {cliente.email || "Não informado"}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            Renda anual
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {formatarMoeda(cliente.rendaAnual)}
                        </dd>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            Patrimônio
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {formatarMoeda(cliente.patrimonio)}
                        </dd>
                    </div>

                    <div className="col-12 col-lg-4">
                        <dt
                            className="small text-uppercase fw-semibold"
                            style={{ color: "var(--cor-primaria)" }}
                        >
                            Endereço
                        </dt>
                        <dd
                            className="mb-0"
                            style={{ color: "var(--cor-texto-secundario)" }}
                        >
                            {cliente.endereco || "Não informado"}
                        </dd>
                    </div>
                </dl>
            </section>

            {/* Seção 2: Agência bancária vinculada */}
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-agencia-cliente"
            >
                <h2
                    id="titulo-agencia-cliente"
                    className="h5 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Agência Vinculada
                </h2>

                {agenciaDoCliente ? (
                    <Card className="border bg-light">
                        <Card.Body>
                            <dl className="row g-3 mb-0">
                                <div className="col-12 col-sm-6 col-lg-3">
                                    <dt
                                        className="small text-uppercase fw-semibold"
                                        style={{
                                            color: "var(--cor-primaria)",
                                        }}
                                    >
                                        ID da Agência
                                    </dt>
                                    <dd
                                        className="mb-0"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {agenciaDoCliente.id}
                                    </dd>
                                </div>

                                <div className="col-12 col-sm-6 col-lg-3">
                                    <dt
                                        className="small text-uppercase fw-semibold"
                                        style={{
                                            color: "var(--cor-primaria)",
                                        }}
                                    >
                                        Código
                                    </dt>
                                    <dd
                                        className="mb-0"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {agenciaDoCliente.codigo}
                                    </dd>
                                </div>

                                <div className="col-12 col-sm-6 col-lg-3">
                                    <dt
                                        className="small text-uppercase fw-semibold"
                                        style={{
                                            color: "var(--cor-primaria)",
                                        }}
                                    >
                                        Nome
                                    </dt>
                                    <dd
                                        className="mb-0"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {agenciaDoCliente.nome}
                                    </dd>
                                </div>

                                <div className="col-12 col-sm-6 col-lg-3">
                                    <dt
                                        className="small text-uppercase fw-semibold"
                                        style={{
                                            color: "var(--cor-primaria)",
                                        }}
                                    >
                                        Endereço
                                    </dt>
                                    <dd
                                        className="mb-0"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {agenciaDoCliente.endereco ||
                                            "Não informado"}
                                    </dd>
                                </div>
                            </dl>
                        </Card.Body>
                    </Card>
                ) : (
                    <div
                        className="estado-painel"
                        role="status"
                        aria-live="polite"
                    >
                        <p className="estado-painel__texto">
                            Agência não localizada (código consultado:{" "}
                            <strong>
                                {cliente.codigoAgencia ?? "não informado"}
                            </strong>
                            ).
                        </p>
                    </div>
                )}
            </section>

            {/* Seção 3: Contas bancárias vinculadas ao cliente */}
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-contas-cliente"
            >
                <h2
                    id="titulo-contas-cliente"
                    className="h5 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Contas Bancárias
                </h2>

                {contasDoCliente.length === 0 ? (
                    <div
                        className="estado-painel"
                        role="status"
                        aria-live="polite"
                    >
                        <p className="estado-painel__texto">
                            Este cliente não possui contas cadastradas.
                        </p>
                    </div>
                ) : (
                    <Table
                        responsive
                        hover
                        className="align-middle caption-top mb-0"
                    >
                        <caption className="small pt-0 text-secondary">
                            Contas bancárias vinculadas a {cliente.nome}
                        </caption>
                        <thead className="table-light">
                            <tr>
                                <th
                                    scope="col"
                                    style={{
                                        color: "var(--cor-primaria)",
                                    }}
                                >
                                    ID da Conta
                                </th>
                                <th
                                    scope="col"
                                    className="text-nowrap"
                                    style={{
                                        color: "var(--cor-primaria)",
                                    }}
                                >
                                    Tipo
                                </th>
                                <th
                                    scope="col"
                                    className="text-nowrap"
                                    style={{
                                        color: "var(--cor-primaria)",
                                    }}
                                >
                                    Saldo
                                </th>
                                <th
                                    scope="col"
                                    className="text-nowrap"
                                    style={{
                                        color: "var(--cor-primaria)",
                                    }}
                                >
                                    Limite de Crédito
                                </th>
                                <th
                                    scope="col"
                                    className="text-nowrap"
                                    style={{
                                        color: "var(--cor-primaria)",
                                    }}
                                >
                                    Crédito Disponível
                                </th>
                            </tr>
                        </thead>
                        <tbody className="fw-semibold">
                            {contasDoCliente.map((conta) => (
                                <tr key={conta.id}>
                                    <td
                                        className="text-nowrap"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {conta.id}
                                    </td>
                                    <td
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {formatarTipoConta(conta.tipo)}
                                    </td>
                                    <td
                                        className="text-nowrap"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {formatarMoeda(conta.saldo)}
                                    </td>
                                    <td
                                        className="text-nowrap"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {formatarMoeda(conta.limiteCredito)}
                                    </td>
                                    <td
                                        className="text-nowrap"
                                        style={{
                                            color: "var(--cor-texto-secundario)",
                                        }}
                                    >
                                        {formatarMoeda(conta.creditoDisponivel)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </section>
        </div>
    );
}
