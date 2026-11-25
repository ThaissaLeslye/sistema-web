import { describe, expect, it } from "vitest";
import {
    ehPessoaJuridica,
    extrairDigitos,
    normalizarAgencia,
    normalizarCliente,
    normalizarConta,
    normalizarData,
    normalizarEstadoCivil,
    normalizarNumero,
    normalizarTipoConta,
} from "./normalizadores";

describe("normalizadores de domínio bancário", () => {
    it("converte datas ISO e brasileiras no horário local sem recuo de fuso", () => {
        const dataIso = normalizarData("1990-05-14");
        const dataBr = normalizarData("14/05/1990");

        expect(dataIso).toBeInstanceOf(Date);
        expect(dataIso?.getFullYear()).toBe(1990);
        expect(dataIso?.getMonth()).toBe(4);
        expect(dataIso?.getDate()).toBe(14);

        expect(dataBr).toBeInstanceOf(Date);
        expect(dataBr?.getFullYear()).toBe(1990);
        expect(dataBr?.getMonth()).toBe(4);
        expect(dataBr?.getDate()).toBe(14);
    });

    it("rejeita datas vazias, malformadas ou inexistentes no calendário", () => {
        expect(normalizarData(undefined)).toBeUndefined();
        expect(normalizarData("   ")).toBeUndefined();
        expect(normalizarData("data-invalida")).toBeUndefined();
        expect(normalizarData("31/02/2024")).toBeUndefined();
        expect(normalizarData("2023-02-29")).toBeUndefined();
    });

    it("converte números decimais (ponto ou vírgula) e retorna undefined para vazio ou ilegível", () => {
        expect(normalizarNumero("4250.75")).toBe(4250.75);
        expect(normalizarNumero("1.250,50")).toBe(1250.5);
        expect(normalizarNumero("0.00")).toBe(0);
        expect(normalizarNumero("")).toBeUndefined();
        expect(normalizarNumero("   ")).toBeUndefined();
        expect(normalizarNumero("valor-invalido")).toBeUndefined();
    });

    it("extrai apenas dígitos e identifica Pessoa Jurídica pelo CNPJ de 14 dígitos", () => {
        expect(extrairDigitos("123.456.789-01")).toBe("12345678901");
        expect(ehPessoaJuridica("123.456.789-01")).toBe(false);
        expect(ehPessoaJuridica("12.345.678/0001-99")).toBe(true);
    });

    it("atribui Não Possui para CNPJ e Não Informado para PF com estado civil ausente ou inválido", () => {
        expect(normalizarEstadoCivil("Casado", "12.345.678/0001-99")).toBe(
            "Não Possui",
        );
        expect(normalizarEstadoCivil("Casado", "111.222.333-44")).toBe(
            "Casado",
        );
        expect(normalizarEstadoCivil("", "111.222.333-44")).toBe(
            "Não Informado",
        );
        expect(normalizarEstadoCivil("União Estável", "111.222.333-44")).toBe(
            "Não Informado",
        );
    });

    it("normaliza tipo de conta válido e marca Não Informado quando desconhecido ou vazio", () => {
        expect(normalizarTipoConta("corrente")).toBe("corrente");
        expect(normalizarTipoConta("  POUPANCA ")).toBe("poupanca");
        expect(normalizarTipoConta("")).toBe("Não Informado");
        expect(normalizarTipoConta("investimento")).toBe("Não Informado");
    });

    it("normaliza cliente válido omitindo opcionais vazios e descarta cliente sem chaves obrigatórias", () => {
        const clienteValido = normalizarCliente({
            id: " CLI-001 ",
            cpfCnpj: "111.222.333-44",
            rg: "   ",
            dataNascimento: "1990-05-14",
            nome: " Marina Silva ",
            nomeSocial: "",
            email: "marina@exemplo.com",
            endereco: "Rua A, 10",
            rendaAnual: "85000.00",
            patrimonio: "",
            estadoCivil: "Solteiro",
            codigoAgencia: "1001",
        });

        expect(clienteValido).not.toBeNull();
        expect(clienteValido?.id).toBe("CLI-001");
        expect(clienteValido?.cpfCnpj).toBe("11122233344");
        expect(clienteValido?.estadoCivil).toBe("Solteiro");
        expect(clienteValido?.rendaAnual).toBe(85000);
        expect("rg" in (clienteValido ?? {})).toBe(false);
        expect("nomeSocial" in (clienteValido ?? {})).toBe(false);
        expect("patrimonio" in (clienteValido ?? {})).toBe(false);

        expect(
            normalizarCliente({
                id: "",
                nome: "Sem ID",
                cpfCnpj: "11122233344",
            }),
        ).toBeNull();
        expect(
            normalizarCliente({ id: "CLI-002", nome: "Sem Doc", cpfCnpj: "" }),
        ).toBeNull();
    });

    it("normaliza conta bancária vinculando dígitos do cliente e preservando saldos ausentes", () => {
        const conta = normalizarConta({
            id: "CTA-01",
            cpfCnpjCliente: "12.345.678/0001-99",
            tipo: "poupanca",
            saldo: "1500,25",
            limiteCredito: "",
            creditoDisponivel: "invalido",
        });

        expect(conta).toEqual({
            id: "CTA-01",
            cpfCnpjCliente: "12345678000199",
            tipo: "poupanca",
            saldo: 1500.25,
        });

        expect(
            normalizarConta({ id: "CTA-02", cpfCnpjCliente: "   " }),
        ).toBeNull();
    });

    it("normaliza agência com código positivo e descarta agência sem código válido", () => {
        expect(
            normalizarAgencia({
                id: "AG-01",
                codigo: "1001",
                nome: "Agência Centro",
                endereco: "Av. Vitória, 100",
            }),
        ).toEqual({
            id: "AG-01",
            codigo: 1001,
            nome: "Agência Centro",
            endereco: "Av. Vitória, 100",
        });

        expect(
            normalizarAgencia({ id: "AG-02", codigo: "0", nome: "Inválida" }),
        ).toBeNull();
        expect(
            normalizarAgencia({
                id: "AG-03",
                codigo: "abc",
                nome: "Sem Código",
            }),
        ).toBeNull();
    });
});
