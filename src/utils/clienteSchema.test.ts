import { describe, expect, it } from "vitest";
import type { Agencia, Cliente } from "../types/banking";
import { criarEsquemaNovoCliente } from "./clienteSchema";

const CLIENTES_EXISTENTES_MOCK: readonly Cliente[] = [
    {
        id: "CLI-001",
        cpfCnpj: "11122233344",
        nome: "Ana Souza",
        email: "ana@email.com",
        endereco: "Rua das Flores, 123",
        estadoCivil: "Solteiro",
        codigoAgencia: 1001,
    },
];

const AGENCIAS_MOCK: readonly Agencia[] = [
    {
        id: "AG-01",
        codigo: 1001,
        nome: "Agência Central",
        endereco: "Av. Paulista, 1000",
    },
    {
        id: "AG-02",
        codigo: 1002,
        nome: "Agência Faria Lima",
        endereco: "Av. Brigadeiro Faria Lima, 2200",
    },
];

describe("criarEsquemaNovoCliente", () => {
    const esquema = criarEsquemaNovoCliente({
        clientesExistentes: CLIENTES_EXISTENTES_MOCK,
        agenciasDisponiveis: AGENCIAS_MOCK,
    });

    it("valida cliente de CPF normalizando documento, números com vírgula e omitindo opcionais vazios", () => {
        const resultado = esquema.safeParse({
            nome: "  Marina Silva  ",
            nomeSocial: "   ",
            cpfCnpj: "555.666.777-88",
            rg: "",
            dataNascimento: "14/05/1990",
            email: "marina@exemplo.com",
            endereco: "Rua Vitória, 200",
            rendaAnual: "85.000,50",
            patrimonio: "250000,00",
            estadoCivil: "Casado",
            codigoAgencia: "1001",
        });

        expect(resultado.success).toBe(true);
        if (!resultado.success) return;

        expect(resultado.data.cpfCnpj).toBe("55566677788");
        expect(resultado.data.nome).toBe("Marina Silva");
        expect(resultado.data.rendaAnual).toBe(85000.5);
        expect(resultado.data.patrimonio).toBe(250000);
        expect(resultado.data.estadoCivil).toBe("Casado");
        expect(resultado.data.codigoAgencia).toBe(1001);
        expect(resultado.data.dataNascimento).toBeInstanceOf(Date);
        expect("rg" in resultado.data).toBe(false);
        expect("nomeSocial" in resultado.data).toBe(false);
    });

    it("valida cliente de CNPJ exigindo estadoCivil 'Não Possui' e preservando opcionais preenchidos", () => {
        const resultado = esquema.safeParse({
            nome: "Padaria Horizonte Ltda",
            nomeSocial: "Horizonte Pães",
            cpfCnpj: "98.765.432/0001-10",
            rg: "",
            dataNascimento: "01/08/2015",
            email: "contato@horizonte.com.br",
            endereco: "Av. Central, 500",
            rendaAnual: "420000,00",
            patrimonio: "900000",
            estadoCivil: "Não Possui",
            codigoAgencia: "1002",
        });

        expect(resultado.success).toBe(true);
        if (!resultado.success) return;

        expect(resultado.data.cpfCnpj).toBe("98765432000110");
        expect(resultado.data.estadoCivil).toBe("Não Possui");
        expect(resultado.data.nomeSocial).toBe("Horizonte Pães");
        expect("rg" in resultado.data).toBe(false);
    });

    it("rejeita documento que não tenha 11 ou 14 dígitos", () => {
        const resultado = esquema.safeParse({
            nome: "Carlos Mendes",
            cpfCnpj: "123.456.789",
            dataNascimento: "10/03/1988",
            email: "carlos@email.com",
            endereco: "Rua B, 45",
            rendaAnual: "50000",
            patrimonio: "100000",
            estadoCivil: "Solteiro",
            codigoAgencia: "1001",
        });

        expect(resultado.success).toBe(false);
        if (resultado.success) return;

        const errosDocumento = resultado.error.flatten().fieldErrors.cpfCnpj;
        expect(errosDocumento).toBeDefined();
        expect(errosDocumento?.length).toBeGreaterThan(0);
    });

    it("rejeita CPF/CNPJ já cadastrado mesmo quando enviado com pontuação diferente", () => {
        const resultado = esquema.safeParse({
            nome: "Ana Souza Duplicada",
            cpfCnpj: "111.222.333-44",
            dataNascimento: "14/05/1990",
            email: "outra.ana@email.com",
            endereco: "Rua das Flores, 123",
            rendaAnual: "85000",
            patrimonio: "250000",
            estadoCivil: "Solteiro",
            codigoAgencia: "1001",
        });

        expect(resultado.success).toBe(false);
        if (resultado.success) return;

        const errosDocumento = resultado.error.flatten().fieldErrors.cpfCnpj;
        expect(errosDocumento?.[0]).toContain("Já existe um cliente");
    });

    it("rejeita renda anual ou patrimônio negativos", () => {
        const resultado = esquema.safeParse({
            nome: "Lucas Pereira",
            cpfCnpj: "99988877766",
            dataNascimento: "20/07/1992",
            email: "lucas@email.com",
            endereco: "Rua C, 80",
            rendaAnual: "-1500,00",
            patrimonio: "-10",
            estadoCivil: "Divorciado",
            codigoAgencia: "1001",
        });

        expect(resultado.success).toBe(false);
        if (resultado.success) return;

        const errosCampos = resultado.error.flatten().fieldErrors;
        expect(errosCampos.rendaAnual?.[0]).toContain("negativa");
        expect(errosCampos.patrimonio?.[0]).toContain("negativo");
    });
});
