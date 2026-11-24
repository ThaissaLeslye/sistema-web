import type {
    Agencia,
    Cliente,
    Conta,
    EstadoCivil,
    TipoConta,
} from "../types/banking";

const ESTADOS_CIVIS_PF: readonly EstadoCivil[] = [
    "Solteiro",
    "Casado",
    "Viúvo",
    "Divorciado",
];

function isEstadoCivilPfValido(valor: string): valor is EstadoCivil {
    return ESTADOS_CIVIS_PF.some((estado) => estado === valor);
}

export function extrairDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}

export function ehPessoaJuridica(cpfCnpj: string): boolean {
    return extrairDigitos(cpfCnpj).length === 14;
}

export function normalizarTextoVazio(
    valor: string | undefined,
): string | undefined {
    if (!valor) return undefined;
    const limpo = valor.trim();
    return limpo.length > 0 ? limpo : undefined;
}

export function normalizarNumero(valor: string | undefined): number {
    if (!valor) return 0;
    const limpo = valor.trim();
    if (limpo.length === 0) return 0;

    // Trata formato brasileiro (1.250,50)
    const normalizado = limpo.includes(",")
        ? limpo.replace(/\./g, "").replace(",", ".")
        : limpo;

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
}

// Converte data ISO (YYYY-MM-DD) ou BR (DD/MM/YYYY) para Date local — evita o recuo de 1 dia causado pelo fuso UTC-3
export function normalizarData(valor: string | undefined): Date {
    if (!valor) return new Date(NaN);
    const limpo = valor.trim();

    const matchIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(limpo);
    if (matchIso) {
        const ano = Number(matchIso[1]);
        const mes = Number(matchIso[2]);
        const dia = Number(matchIso[3]);
        return new Date(ano, mes - 1, dia);
    }

    const matchBr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(limpo);
    if (matchBr) {
        const dia = Number(matchBr[1]);
        const mes = Number(matchBr[2]);
        const ano = Number(matchBr[3]);
        return new Date(ano, mes - 1, dia);
    }

    return new Date(limpo);
}

// Atribui 'Não Possui' para Pessoa Jurídica (CNPJ) e aplica fallback 'Solteiro' para Pessoa Física com valor ausente ou inválido
function normalizarEstadoCivil(
    valor: string | undefined,
    cpfCnpj: string,
): EstadoCivil {
    if (ehPessoaJuridica(cpfCnpj)) {
        return "Não Possui";
    }

    const limpo = valor?.trim() ?? "";
    return isEstadoCivilPfValido(limpo) ? limpo : "Solteiro";
}

function normalizarTipoConta(valor: string | undefined): TipoConta {
    const limpo = valor?.trim().toLowerCase() ?? "";
    return limpo === "poupanca" ? "poupanca" : "corrente";
}

// Mapeia uma linha bruta da aba 'clientes' para a interface Cliente — descarta registros sem id, nome ou cpfCnpj
export function normalizarCliente(
    linha: Record<string, string | undefined>,
): Cliente | null {
    const id = linha.id?.trim() ?? "";
    const nome = linha.nome?.trim() ?? "";
    const cpfCnpj = extrairDigitos(linha.cpfCnpj ?? "");

    if (!id || !nome || !cpfCnpj) {
        return null;
    }

    const rg = normalizarTextoVazio(linha.rg);
    const nomeSocial = normalizarTextoVazio(linha.nomeSocial);

    return {
        id,
        cpfCnpj,
        ...(rg !== undefined ? { rg } : {}),
        dataNascimento: normalizarData(linha.dataNascimento),
        nome,
        ...(nomeSocial !== undefined ? { nomeSocial } : {}),
        email: linha.email?.trim() ?? "",
        endereco: linha.endereco?.trim() ?? "",
        rendaAnual: normalizarNumero(linha.rendaAnual),
        patrimonio: normalizarNumero(linha.patrimonio),
        estadoCivil: normalizarEstadoCivil(linha.estadoCivil, cpfCnpj),
        codigoAgencia: normalizarNumero(linha.codigoAgencia),
    };
}

export function normalizarConta(
    linha: Record<string, string | undefined>,
): Conta | null {
    const id = linha.id?.trim() ?? "";
    const cpfCnpjCliente = extrairDigitos(linha.cpfCnpjCliente ?? "");

    if (!id || !cpfCnpjCliente) {
        return null;
    }

    return {
        id,
        cpfCnpjCliente,
        tipo: normalizarTipoConta(linha.tipo),
        saldo: normalizarNumero(linha.saldo),
        limiteCredito: normalizarNumero(linha.limiteCredito),
        creditoDisponivel: normalizarNumero(linha.creditoDisponivel),
    };
}

export function normalizarAgencia(
    linha: Record<string, string | undefined>,
): Agencia | null {
    const id = linha.id?.trim() ?? "";
    const nome = linha.nome?.trim() ?? "";
    const codigo = normalizarNumero(linha.codigo);

    if (!id || !nome || codigo <= 0) {
        return null;
    }

    return {
        id,
        codigo,
        nome,
        endereco: linha.endereco?.trim() ?? "",
    };
}
