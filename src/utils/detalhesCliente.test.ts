import { describe, expect, it } from "vitest";
import type { Agencia, Cliente, Conta } from "../types/banking";
import {
    buscarAgenciaDoCliente,
    buscarClientePorId,
    filtrarContasDoCliente,
} from "./detalhesCliente";
import { formatarData, formatarMoeda, formatarTipoConta } from "./formatadores";

const CLIENTES_MOCK: readonly Cliente[] = [
    {
        id: "CLI-001",
        cpfCnpj: "11122233344",
        nome: "Ana Souza",
        email: "ana@email.com",
        endereco: "Rua das Flores, 123",
        estadoCivil: "Solteiro",
        codigoAgencia: 1001,
    },
    {
        id: "CLI-002",
        cpfCnpj: "12345678000199",
        nome: "Padaria Estrela Ltda",
        email: "contato@padaria.com",
        endereco: "Rua do Comércio, 50",
        estadoCivil: "Não Possui",
    },
];

const CONTAS_MOCK: readonly Conta[] = [
    {
        id: "CNT-001",
        cpfCnpjCliente: "11122233344",
        tipo: "corrente",
        saldo: 4250.75,
        limiteCredito: 5000,
        creditoDisponivel: 3200,
    },
    {
        id: "CNT-002",
        cpfCnpjCliente: "111.222.333-44",
        tipo: "poupanca",
        saldo: 18500,
    },
    {
        id: "CNT-003",
        cpfCnpjCliente: "99988877766",
        tipo: "Não Informado",
    },
];

const AGENCIAS_MOCK: readonly Agencia[] = [
    {
        id: "AG-01",
        codigo: 1001,
        nome: "Agência Central",
        endereco: "Av. Paulista, 1000",
    },
];

describe("detalhesCliente e formatadores de exibição", () => {
    it("localiza cliente pelo ID exato ignorando espaços extras e retorna undefined quando inexistente", () => {
        expect(buscarClientePorId(CLIENTES_MOCK, " CLI-001 ")?.nome).toBe(
            "Ana Souza",
        );
        expect(buscarClientePorId(CLIENTES_MOCK, "CLI-999")).toBeUndefined();
        expect(buscarClientePorId(CLIENTES_MOCK, undefined)).toBeUndefined();
    });

    it("filtra todas as contas vinculadas ao CPF/CNPJ comparando apenas dígitos sem mutar o array original", () => {
        const contasAna = filtrarContasDoCliente(CONTAS_MOCK, "111.222.333-44");

        expect(contasAna).toHaveLength(2);
        expect(contasAna.map((conta) => conta.id)).toEqual([
            "CNT-001",
            "CNT-002",
        ]);
        expect(CONTAS_MOCK).toHaveLength(3);
    });

    it("retorna lista vazia quando o cliente não possui contas cadastradas", () => {
        expect(
            filtrarContasDoCliente(CONTAS_MOCK, "12345678000199"),
        ).toHaveLength(0);
    });

    it("localiza a agência pelo código e retorna undefined quando ausente ou inexistente", () => {
        expect(buscarAgenciaDoCliente(AGENCIAS_MOCK, 1001)?.nome).toBe(
            "Agência Central",
        );
        expect(buscarAgenciaDoCliente(AGENCIAS_MOCK, 9999)).toBeUndefined();
        expect(
            buscarAgenciaDoCliente(AGENCIAS_MOCK, undefined),
        ).toBeUndefined();
    });

    it("formata moeda BRL, data local e rótulos de tipo de conta com fallback 'Não informado'", () => {
        expect(formatarMoeda(4250.75)).toContain("4.250,75");
        expect(formatarMoeda(undefined)).toBe("Não informado");

        expect(formatarData(new Date(1990, 4, 14))).toBe("14/05/1990");
        expect(formatarData(undefined)).toBe("Não informado");
        expect(formatarData(new Date(NaN))).toBe("Não informado");

        expect(formatarTipoConta("corrente")).toBe("Corrente");
        expect(formatarTipoConta("poupanca")).toBe("Poupança");
        expect(formatarTipoConta("Não Informado")).toBe("Não informado");
    });
});
