import { z } from "zod";
import type {
    Agencia,
    Cliente,
    EstadoCivilPessoaFisica,
    NovoClienteInput,
} from "../types/banking";
import {
    ehPessoaJuridica,
    extrairDigitos,
    isEstadoCivilPfValido,
    normalizarData,
    normalizarNumero,
    normalizarTextoVazio,
} from "./normalizadores";

export interface ParametrosEsquemaCliente {
    clientesExistentes: readonly Cliente[];
    agenciasDisponiveis: readonly Agencia[];
}

// Verifica se a data informada é posterior ao dia atual no horário local
function ehDataFutura(data: Date): boolean {
    const hoje = new Date();
    const limiteHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        23,
        59,
        59,
        999,
    );
    return data.getTime() > limiteHoje.getTime();
}

// Constrói o esquema Zod de cadastro validando regras de domínio e transformando para NovoClienteInput
export function criarEsquemaNovoCliente({
    clientesExistentes,
    agenciasDisponiveis,
}: ParametrosEsquemaCliente) {
    return z
        .object({
            nome: z
                .string()
                .trim()
                .min(1, "Informe o nome completo ou razão social."),
            nomeSocial: z.string().optional(),
            cpfCnpj: z.string().trim().min(1, "Informe o CPF ou CNPJ."),
            rg: z.string().optional(),
            dataNascimento: z
                .string()
                .trim()
                .min(1, "Informe a data de nascimento ou abertura."),
            email: z
                .string()
                .trim()
                .min(1, "Informe o e-mail.")
                .email("Informe um endereço de e-mail válido."),
            endereco: z.string().trim().min(1, "Informe o endereço completo."),
            rendaAnual: z.string().trim().min(1, "Informe a renda anual."),
            patrimonio: z.string().trim().min(1, "Informe o patrimônio."),
            estadoCivil: z.string().trim(),
            codigoAgencia: z.string().trim().min(1, "Selecione uma agência."),
        })
        .superRefine((dados, ctx) => {
            const digitosDocumento = extrairDigitos(dados.cpfCnpj);
            const tamanhoDocumentoValido =
                digitosDocumento.length === 11 ||
                digitosDocumento.length === 14;

            if (!tamanhoDocumentoValido) {
                ctx.addIssue({
                    code: "custom",
                    path: ["cpfCnpj"],
                    message:
                        "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.",
                });
            } else {
                const documentoDuplicado = clientesExistentes.some(
                    (cliente) =>
                        extrairDigitos(cliente.cpfCnpj) === digitosDocumento,
                );

                if (documentoDuplicado) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["cpfCnpj"],
                        message:
                            "Já existe um cliente cadastrado com este CPF/CNPJ.",
                    });
                }
            }

            const dataConvertida = normalizarData(dados.dataNascimento);
            if (!dataConvertida) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dataNascimento"],
                    message: "Informe uma data válida no formato dd/mm/aaaa.",
                });
            } else if (ehDataFutura(dataConvertida)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["dataNascimento"],
                    message: "A data não pode ser futura.",
                });
            }

            const rendaConvertida = normalizarNumero(dados.rendaAnual);
            if (rendaConvertida === undefined) {
                ctx.addIssue({
                    code: "custom",
                    path: ["rendaAnual"],
                    message:
                        "Informe um valor numérico válido para a renda anual.",
                });
            } else if (rendaConvertida < 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["rendaAnual"],
                    message: "A renda anual não pode ser negativa.",
                });
            }

            const patrimonioConvertido = normalizarNumero(dados.patrimonio);
            if (patrimonioConvertido === undefined) {
                ctx.addIssue({
                    code: "custom",
                    path: ["patrimonio"],
                    message:
                        "Informe um valor numérico válido para o patrimônio.",
                });
            } else if (patrimonioConvertido < 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["patrimonio"],
                    message: "O patrimônio não pode ser negativo.",
                });
            }

            if (ehPessoaJuridica(digitosDocumento)) {
                if (dados.estadoCivil !== "Não Possui") {
                    ctx.addIssue({
                        code: "custom",
                        path: ["estadoCivil"],
                        message:
                            "Para Pessoa Jurídica (CNPJ), o estado civil deve ser 'Não Possui'.",
                    });
                }
            } else if (!isEstadoCivilPfValido(dados.estadoCivil)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["estadoCivil"],
                    message:
                        "Selecione um estado civil válido para Pessoa Física.",
                });
            }

            const codigoAgenciaConvertido = normalizarNumero(
                dados.codigoAgencia,
            );
            const agenciaExiste =
                codigoAgenciaConvertido !== undefined &&
                agenciasDisponiveis.some(
                    (agencia) => agencia.codigo === codigoAgenciaConvertido,
                );

            if (!agenciaExiste) {
                ctx.addIssue({
                    code: "custom",
                    path: ["codigoAgencia"],
                    message: "Selecione uma agência existente.",
                });
            }
        })
        .transform((dados): NovoClienteInput => {
            const cpfCnpj = extrairDigitos(dados.cpfCnpj);
            const rg = normalizarTextoVazio(dados.rg);
            const nomeSocial = normalizarTextoVazio(dados.nomeSocial);
            const dataNascimento = normalizarData(dados.dataNascimento);
            const rendaAnual = normalizarNumero(dados.rendaAnual);
            const patrimonio = normalizarNumero(dados.patrimonio);
            const codigoAgencia = normalizarNumero(dados.codigoAgencia);

            const estadoCivil: EstadoCivilPessoaFisica | "Não Possui" =
                ehPessoaJuridica(cpfCnpj)
                    ? "Não Possui"
                    : isEstadoCivilPfValido(dados.estadoCivil)
                      ? dados.estadoCivil
                      : "Solteiro";

            return {
                cpfCnpj,
                ...(rg !== undefined ? { rg } : {}),
                ...(dataNascimento !== undefined ? { dataNascimento } : {}),
                nome: dados.nome,
                ...(nomeSocial !== undefined ? { nomeSocial } : {}),
                email: dados.email,
                endereco: dados.endereco,
                ...(rendaAnual !== undefined ? { rendaAnual } : {}),
                ...(patrimonio !== undefined ? { patrimonio } : {}),
                estadoCivil,
                ...(codigoAgencia !== undefined ? { codigoAgencia } : {}),
            };
        });
}

export type EsquemaNovoCliente = ReturnType<typeof criarEsquemaNovoCliente>;
export type NovoClienteFormInput = z.input<EsquemaNovoCliente>;
export type NovoClienteFormOutput = z.output<EsquemaNovoCliente>;
