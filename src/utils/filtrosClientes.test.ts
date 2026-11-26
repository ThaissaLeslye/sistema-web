import { describe, expect, it } from "vitest";
import type { Cliente } from "../types/banking";
import {
    extrairDigitos,
    filtrarClientes,
    normalizarTextoBusca,
} from "./filtrosClientes";

const CLIENTES_MOCK: readonly Cliente[] = [
    {
        id: "CLI-001",
        cpfCnpj: "11122233344",
        rg: "1234567",
        dataNascimento: new Date(1990, 4, 14),
        nome: "João da Conceição",
        email: "joao@email.com",
        endereco: "Rua das Flores, 100 - Vitória/ES",
        rendaAnual: 72000,
        patrimonio: 150000,
        estadoCivil: "Casado",
        codigoAgencia: 1001,
    },
    {
        id: "CLI-002",
        cpfCnpj: "98765432100",
        dataNascimento: new Date(1985, 9, 22),
        nome: "Mariana Oliveira",
        email: "mariana@email.com",
        endereco: "Av. Beira Mar, 450 - Vila Velha/ES",
        rendaAnual: 95000,
        patrimonio: 310000,
        estadoCivil: "Solteiro",
        codigoAgencia: 1002,
    },
    {
        id: "CLI-003",
        cpfCnpj: "12345678000199",
        dataNascimento: new Date(2015, 2, 10),
        nome: "Padaria Estrela Ltda",
        email: "contato@padariaestrela.com.br",
        endereco: "Av. Central, 890 - Serra/ES",
        rendaAnual: 480000,
        patrimonio: 920000,
        estadoCivil: "Não Possui",
        codigoAgencia: 1001,
    },
];

describe("filtrosClientes", () => {
    it("retorna toda a lista quando o termo de busca está vazio ou contém apenas espaços", () => {
        expect(filtrarClientes(CLIENTES_MOCK, "")).toHaveLength(3);
        expect(filtrarClientes(CLIENTES_MOCK, "   ")).toHaveLength(3);
    });

    it("filtra por nome ignorando diferenças de maiúsculas/minúsculas e acentos", () => {
        const resultado = filtrarClientes(CLIENTES_MOCK, "joao da conceicao");

        expect(resultado).toHaveLength(1);
        expect(resultado[0]?.id).toBe("CLI-001");
        expect(normalizarTextoBusca("Conceição")).toBe("conceicao");
    });

    it("não casa registros por documento quando o termo contém apenas letras (sem dígitos)", () => {
        const resultado = filtrarClientes(CLIENTES_MOCK, "xyz");

        expect(resultado).toHaveLength(0);
        expect(extrairDigitos("xyz")).toBe("");
    });

    it("filtra por CPF ou CNPJ comparando apenas os dígitos, com ou sem pontuação", () => {
        const porCpfFormatado = filtrarClientes(
            CLIENTES_MOCK,
            "111.222.333-44",
        );
        const porCnpjParcial = filtrarClientes(
            CLIENTES_MOCK,
            "12.345.678/0001",
        );

        expect(porCpfFormatado).toHaveLength(1);
        expect(porCpfFormatado[0]?.id).toBe("CLI-001");

        expect(porCnpjParcial).toHaveLength(1);
        expect(porCnpjParcial[0]?.id).toBe("CLI-003");
    });

    it("mantém a lista original intacta sem sofrer mutação após a filtragem", () => {
        const copiaAntes = [...CLIENTES_MOCK];
        const resultado = filtrarClientes(CLIENTES_MOCK, "Mariana");

        expect(resultado).toHaveLength(1);
        expect(CLIENTES_MOCK).toEqual(copiaAntes);
        expect(CLIENTES_MOCK).toHaveLength(3);
    });
});
