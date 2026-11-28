import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, type ChangeEvent } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDadosBancarios } from "../hooks/useDadosBancarios";
import {
    criarEsquemaNovoCliente,
    type NovoClienteFormInput,
    type NovoClienteFormOutput,
} from "../utils/clienteSchema";
import {
    aplicarMascaraCpfCnpj,
    aplicarMascaraData,
} from "../utils/formatadores";
import {
    ESTADOS_CIVIS_PF,
    ehPessoaJuridica,
    extrairDigitos,
} from "../utils/normalizadores";

export interface EstadoNavegacaoCadastro {
    clienteCadastrado?: {
        id: string;
        nome: string;
    };
}

export function NovoClientePage() {
    const navigate = useNavigate();
    const { estado, clientes, agencias, adicionarCliente, recarregar } =
        useDadosBancarios();

    const esquema = useMemo(
        () =>
            criarEsquemaNovoCliente({
                clientesExistentes: clientes,
                agenciasDisponiveis: agencias,
            }),
        [clientes, agencias],
    );

    const {
        register,
        handleSubmit,
        control,
        getValues,
        setValue,
        formState: { errors, isSubmitting, submitCount },
    } = useForm<NovoClienteFormInput, unknown, NovoClienteFormOutput>({
        resolver: zodResolver(esquema),
        defaultValues: {
            nome: "",
            nomeSocial: "",
            cpfCnpj: "",
            rg: "",
            dataNascimento: "",
            email: "",
            endereco: "",
            rendaAnual: "",
            patrimonio: "",
            estadoCivil: "",
            codigoAgencia: "",
        },
    });

    const documentoAtual = useWatch({
        control,
        name: "cpfCnpj",
        defaultValue: "",
    });
    const pessoaJuridica = ehPessoaJuridica(documentoAtual);
    const possuiErros = submitCount > 0 && Object.keys(errors).length > 0;

    const handleChangeDocumento = (
        evento: ChangeEvent<HTMLInputElement>,
    ): void => {
        const valorFormatado = aplicarMascaraCpfCnpj(evento.target.value);
        evento.target.value = valorFormatado;

        const digitos = extrairDigitos(valorFormatado);
        if (digitos.length === 14) {
            setValue("estadoCivil", "Não Possui", { shouldValidate: true });
        } else if (getValues("estadoCivil") === "Não Possui") {
            setValue("estadoCivil", "", { shouldValidate: false });
        }
    };

    const handleChangeData = (evento: ChangeEvent<HTMLInputElement>): void => {
        evento.target.value = aplicarMascaraData(evento.target.value);
    };

    const onSubmit = (dadosValidos: NovoClienteFormOutput): void => {
        const clienteCriado = adicionarCliente(dadosValidos);
        const estadoNavegacao: EstadoNavegacaoCadastro = {
            clienteCadastrado: {
                id: clienteCriado.id,
                nome: clienteCriado.nome,
            },
        };

        navigate("/", { state: estadoNavegacao });
    };

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
                aria-labelledby="titulo-novo-cliente-carregando"
            >
                {linkVoltar}
                <h1
                    id="titulo-novo-cliente-carregando"
                    className="h4 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Novo Cliente
                </h1>
                <div className="estado-painel" role="status" aria-live="polite">
                    <p className="estado-painel__texto">
                        Carregando agências e dados de referência...
                    </p>
                </div>
            </section>
        );
    }

    if (estado.status === "error") {
        return (
            <section
                className="bg-white border rounded-3 p-3 p-md-4"
                aria-labelledby="titulo-novo-cliente-erro"
            >
                {linkVoltar}
                <h1
                    id="titulo-novo-cliente-erro"
                    className="h4 text-uppercase fw-bold mb-3"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Novo Cliente
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

    return (
        <section
            className="bg-white border rounded-3 p-3 p-md-4"
            aria-labelledby="titulo-novo-cliente"
        >
            {linkVoltar}

            <div className="border-bottom pb-3 mb-3">
                <h1
                    id="titulo-novo-cliente"
                    className="h4 text-uppercase fw-bold mb-1"
                    style={{ color: "var(--cor-primaria)" }}
                >
                    Novo Cliente
                </h1>
                <p
                    className="small mb-0"
                    style={{ color: "var(--cor-texto-secundario)" }}
                >
                    Campos marcados com{" "}
                    <span className="text-danger fw-bold">*</span> são
                    obrigatórios.
                </p>
            </div>

            {possuiErros && (
                <Alert variant="danger" role="alert" className="mb-3">
                    Revise os campos destacados abaixo antes de concluir o
                    cadastro.
                </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Row className="g-3">
                    {/* Nome completo / Razão social */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-nome">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                {pessoaJuridica
                                    ? "Razão social"
                                    : "Nome completo"}{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                autoComplete="name"
                                placeholder={
                                    pessoaJuridica
                                        ? "Ex.: Padaria Estrela Ltda"
                                        : "Ex.: Marina Souza Lima"
                                }
                                required
                                isInvalid={Boolean(errors.nome)}
                                aria-invalid={Boolean(errors.nome)}
                                aria-describedby={
                                    errors.nome ? "erro-nome" : undefined
                                }
                                {...register("nome")}
                            />
                            {errors.nome && (
                                <Form.Control.Feedback
                                    id="erro-nome"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.nome.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Nome social / Nome fantasia (opcional) */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-nome-social">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                {pessoaJuridica
                                    ? "Nome fantasia"
                                    : "Nome social"}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                autoComplete="nickname"
                                placeholder="Opcional"
                                isInvalid={Boolean(errors.nomeSocial)}
                                aria-invalid={Boolean(errors.nomeSocial)}
                                aria-describedby={
                                    errors.nomeSocial
                                        ? "erro-nomeSocial"
                                        : undefined
                                }
                                {...register("nomeSocial")}
                            />
                            {errors.nomeSocial && (
                                <Form.Control.Feedback
                                    id="erro-nomeSocial"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.nomeSocial.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* CPF / CNPJ */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-cpf-cnpj">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                CPF / CNPJ{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={18}
                                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                required
                                isInvalid={Boolean(errors.cpfCnpj)}
                                aria-invalid={Boolean(errors.cpfCnpj)}
                                aria-describedby={
                                    errors.cpfCnpj
                                        ? "erro-cpfCnpj"
                                        : "ajuda-cpfCnpj"
                                }
                                {...register("cpfCnpj", {
                                    onChange: handleChangeDocumento,
                                })}
                            />
                            <Form.Text
                                id="ajuda-cpfCnpj"
                                className="text-secondary d-block"
                            >
                                {pessoaJuridica
                                    ? "CNPJ identificado (14 dígitos)."
                                    : "Informe 11 dígitos para CPF ou 14 para CNPJ."}
                            </Form.Text>
                            {errors.cpfCnpj && (
                                <Form.Control.Feedback
                                    id="erro-cpfCnpj"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.cpfCnpj.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* RG (opcional) */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-rg">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                RG
                            </Form.Label>
                            <Form.Control
                                type="text"
                                autoComplete="off"
                                placeholder="Opcional"
                                isInvalid={Boolean(errors.rg)}
                                aria-invalid={Boolean(errors.rg)}
                                aria-describedby={
                                    errors.rg ? "erro-rg" : undefined
                                }
                                {...register("rg")}
                            />
                            {errors.rg && (
                                <Form.Control.Feedback
                                    id="erro-rg"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.rg.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Data de nascimento / Data de abertura */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-data-nascimento">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                {pessoaJuridica
                                    ? "Data de abertura"
                                    : "Data de nascimento"}{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                inputMode="numeric"
                                autoComplete="bday"
                                maxLength={10}
                                placeholder="dd/mm/aaaa"
                                required
                                isInvalid={Boolean(errors.dataNascimento)}
                                aria-invalid={Boolean(errors.dataNascimento)}
                                aria-describedby={
                                    errors.dataNascimento
                                        ? "erro-dataNascimento"
                                        : undefined
                                }
                                {...register("dataNascimento", {
                                    onChange: handleChangeData,
                                })}
                            />
                            {errors.dataNascimento && (
                                <Form.Control.Feedback
                                    id="erro-dataNascimento"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.dataNascimento.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* E-mail */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-email">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                E-mail{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                autoComplete="email"
                                placeholder="Ex.: cliente@dominio.com"
                                required
                                isInvalid={Boolean(errors.email)}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email ? "erro-email" : undefined
                                }
                                {...register("email")}
                            />
                            {errors.email && (
                                <Form.Control.Feedback
                                    id="erro-email"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.email.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Renda anual */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-renda-anual">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                Renda anual (R$){" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                placeholder="Ex.: 72000,00"
                                required
                                isInvalid={Boolean(errors.rendaAnual)}
                                aria-invalid={Boolean(errors.rendaAnual)}
                                aria-describedby={
                                    errors.rendaAnual
                                        ? "erro-rendaAnual"
                                        : undefined
                                }
                                {...register("rendaAnual")}
                            />
                            {errors.rendaAnual && (
                                <Form.Control.Feedback
                                    id="erro-rendaAnual"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.rendaAnual.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Patrimônio */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-patrimonio">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                Patrimônio (R$){" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                placeholder="Ex.: 150000,00"
                                required
                                isInvalid={Boolean(errors.patrimonio)}
                                aria-invalid={Boolean(errors.patrimonio)}
                                aria-describedby={
                                    errors.patrimonio
                                        ? "erro-patrimonio"
                                        : undefined
                                }
                                {...register("patrimonio")}
                            />
                            {errors.patrimonio && (
                                <Form.Control.Feedback
                                    id="erro-patrimonio"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.patrimonio.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Estado civil */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-estado-civil">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                Estado civil{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Select
                                required
                                className={
                                    pessoaJuridica ? "bg-light" : undefined
                                }
                                isInvalid={Boolean(errors.estadoCivil)}
                                aria-invalid={Boolean(errors.estadoCivil)}
                                aria-describedby={
                                    errors.estadoCivil
                                        ? "erro-estadoCivil"
                                        : pessoaJuridica
                                          ? "ajuda-estadoCivil"
                                          : undefined
                                }
                                {...register("estadoCivil")}
                            >
                                {pessoaJuridica ? (
                                    <option value="Não Possui">
                                        Não Possui
                                    </option>
                                ) : (
                                    <>
                                        <option value="">Selecione...</option>
                                        {ESTADOS_CIVIS_PF.map((estadoCivil) => (
                                            <option
                                                key={estadoCivil}
                                                value={estadoCivil}
                                            >
                                                {estadoCivil}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </Form.Select>
                            {pessoaJuridica && (
                                <Form.Text
                                    id="ajuda-estadoCivil"
                                    className="text-secondary d-block"
                                >
                                    Fixado em “Não Possui” para Pessoa Jurídica.
                                </Form.Text>
                            )}
                            {errors.estadoCivil && (
                                <Form.Control.Feedback
                                    id="erro-estadoCivil"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.estadoCivil.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Agência */}
                    <Col xs={12} md={6}>
                        <Form.Group controlId="campo-agencia">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                Agência{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Select
                                required
                                isInvalid={Boolean(errors.codigoAgencia)}
                                aria-invalid={Boolean(errors.codigoAgencia)}
                                aria-describedby={
                                    errors.codigoAgencia
                                        ? "erro-codigoAgencia"
                                        : undefined
                                }
                                {...register("codigoAgencia")}
                            >
                                <option value="">
                                    Selecione uma agência...
                                </option>
                                {agencias.map((agencia) => (
                                    <option
                                        key={agencia.id}
                                        value={String(agencia.codigo)}
                                    >
                                        {agencia.codigo} — {agencia.nome}
                                    </option>
                                ))}
                            </Form.Select>
                            {errors.codigoAgencia && (
                                <Form.Control.Feedback
                                    id="erro-codigoAgencia"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.codigoAgencia.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Endereço */}
                    <Col xs={12}>
                        <Form.Group controlId="campo-endereco">
                            <Form.Label
                                className="small text-uppercase fw-semibold"
                                style={{ color: "var(--cor-primaria)" }}
                            >
                                Endereço completo{" "}
                                <span
                                    className="text-danger"
                                    aria-hidden="true"
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                autoComplete="street-address"
                                placeholder="Ex.: Av. Vitória, 1000 - Centro, Vitória/ES"
                                required
                                isInvalid={Boolean(errors.endereco)}
                                aria-invalid={Boolean(errors.endereco)}
                                aria-describedby={
                                    errors.endereco
                                        ? "erro-endereco"
                                        : undefined
                                }
                                {...register("endereco")}
                            />
                            {errors.endereco && (
                                <Form.Control.Feedback
                                    id="erro-endereco"
                                    type="invalid"
                                    className="d-block"
                                >
                                    {errors.endereco.message}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <div
                    className="rounded-2 border bg-light px-3 py-2 mt-4 small"
                    style={{ color: "var(--cor-texto-secundario)" }}
                >
                    O cadastro fica salvo apenas em memória na sessão atual até
                    que a página seja recarregada.
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top">
                    <Button
                        type="submit"
                        variant="primary"
                        className="fw-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Cadastrando..." : "Cadastrar cliente"}
                    </Button>

                    <Link
                        to="/"
                        className="btn btn-outline-secondary fw-semibold"
                    >
                        Cancelar
                    </Link>
                </div>
            </Form>
        </section>
    );
}
