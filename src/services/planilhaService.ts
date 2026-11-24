import Papa from "papaparse";
import { SHEETS_CSV_URLS, type NomeAbaPlanilha } from "../config/sheets";
import type { Agencia, Cliente, Conta } from "../types/banking";
import {
    normalizarAgencia,
    normalizarCliente,
    normalizarConta,
} from "../utils/normalizadores";

export interface DadosPlanilhaBancaria {
    clientes: Cliente[];
    contas: Conta[];
    agencias: Agencia[];
}

async function buscarEParsearAba(
    aba: NomeAbaPlanilha,
): Promise<Array<Record<string, string | undefined>>> {
    const url = SHEETS_CSV_URLS[aba];
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(
            `Falha ao carregar a aba "${aba}" (HTTP ${resposta.status}).`,
        );
    }

    const textoCsv = await resposta.text();

    const resultado = Papa.parse<Record<string, string | undefined>>(textoCsv, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (cabecalho: string) => cabecalho.trim(),
    });

    return resultado.data;
}

export async function carregarDadosBancarios(): Promise<DadosPlanilhaBancaria> {
    const [linhasClientes, linhasContas, linhasAgencias] = await Promise.all([
        buscarEParsearAba("clientes"),
        buscarEParsearAba("contas"),
        buscarEParsearAba("agencias"),
    ]);

    const clientes = linhasClientes
        .map(normalizarCliente)
        .filter((item): item is Cliente => item !== null);

    const contas = linhasContas
        .map(normalizarConta)
        .filter((item): item is Conta => item !== null);

    const agencias = linhasAgencias
        .map(normalizarAgencia)
        .filter((item): item is Agencia => item !== null);

    return {
        clientes,
        contas,
        agencias,
    };
}
