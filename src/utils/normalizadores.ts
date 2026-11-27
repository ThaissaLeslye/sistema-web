import type {
    Agencia,
    Cliente,
    Conta,
    EstadoCivil,
    EstadoCivilPessoaFisica,
    TipoContaNormalizado,
} from "../types/banking";

// Lista imutável dos estados civis aplicáveis exclusivamente a Pessoa Física
export const ESTADOS_CIVIS_PF: readonly EstadoCivilPessoaFisica[] = [
    "Solteiro",
    "Casado",
    "Viúvo",
    "Divorciado",
];

// Type Guard para validar estado civil de Pessoa Física sem asserções de tipo inseguras
export function isEstadoCivilPfValido(
    valor: string,
): valor is EstadoCivilPessoaFisica {
    return ESTADOS_CIVIS_PF.some((estado) => estado === valor);
}

// Remove caracteres não numéricos para comparação e armazenamento consistente de documentos
export function extrairDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}

// Identifica Pessoa Jurídica pelo comprimento padrão de 14 dígitos do CNPJ
export function ehPessoaJuridica(cpfCnpj: string): boolean {
    return extrairDigitos(cpfCnpj).length === 14;
}

// Converte textos vazios ou compostos apenas por espaços em undefined
export function normalizarTextoVazio(
    valor: string | undefined,
): string | undefined {
    if (!valor) return undefined;
    const limpo = valor.trim();
    return limpo.length > 0 ? limpo : undefined;
}

// Converte texto numérico (ponto ou vírgula decimal) em number; retorna undefined se ausente ou ilegível
export function normalizarNumero(
    valor: string | undefined,
): number | undefined {
    if (!valor) return undefined;
    const limpo = valor.trim();
    if (limpo.length === 0) return undefined;

    const normalizado = limpo.includes(",")
        ? limpo.replace(/\./g, "").replace(",", ".")
        : limpo;

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : undefined;
}

// Instancia Date no horário local e verifica se ano, mês e dia não sofreram rollover de calendário
function criarDataLocalValida(
    ano: number,
    mes: number,
    dia: number,
): Date | undefined {
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
        return undefined;
    }

    const data = new Date(ano, mes - 1, dia);
    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) {
        return undefined;
    }

    return data;
}

// Converte data ISO (YYYY-MM-DD) ou brasileira (DD/MM/YYYY) para Date local; retorna undefined se inválida
export function normalizarData(valor: string | undefined): Date | undefined {
    if (!valor) return undefined;
    const limpo = valor.trim();
    if (limpo.length === 0) return undefined;

    const matchIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(limpo);
    if (matchIso) {
        const ano = Number(matchIso[1]);
        const mes = Number(matchIso[2]);
        const dia = Number(matchIso[3]);
        return criarDataLocalValida(ano, mes, dia);
    }

    const matchBr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(limpo);
    if (matchBr) {
        const dia = Number(matchBr[1]);
        const mes = Number(matchBr[2]);
        const ano = Number(matchBr[3]);
        return criarDataLocalValida(ano, mes, dia);
    }

    return undefined;
}

// Atribui "Não Possui" para CNPJ e valida estados civis de PF sem inventar valor padrão
export function normalizarEstadoCivil(
    valor: string | undefined,
    cpfCnpj: string,
): EstadoCivil {
    if (ehPessoaJuridica(cpfCnpj)) {
        return "Não Possui";
    }

    const limpo = valor?.trim() ?? "";
    return isEstadoCivilPfValido(limpo) ? limpo : "Não Informado";
}

// Valida o tipo de conta sem assumir "corrente" quando o dado estiver ausente ou corrompido
export function normalizarTipoConta(
    valor: string | undefined,
): TipoContaNormalizado {
    const limpo = valor?.trim().toLowerCase() ?? "";
    if (limpo === "corrente" || limpo === "poupanca") {
        return limpo;
    }
    return "Não Informado";
}

// Mapeia uma linha bruta da aba "clientes" descartando registros sem identificadores essenciais
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
    const dataNascimento = normalizarData(linha.dataNascimento);
    const rendaAnual = normalizarNumero(linha.rendaAnual);
    const patrimonio = normalizarNumero(linha.patrimonio);
    const codigoAgencia = normalizarNumero(linha.codigoAgencia);

    return {
        id,
        cpfCnpj,
        ...(rg !== undefined ? { rg } : {}),
        ...(dataNascimento !== undefined ? { dataNascimento } : {}),
        nome,
        ...(nomeSocial !== undefined ? { nomeSocial } : {}),
        email: linha.email?.trim() ?? "",
        endereco: linha.endereco?.trim() ?? "",
        ...(rendaAnual !== undefined ? { rendaAnual } : {}),
        ...(patrimonio !== undefined ? { patrimonio } : {}),
        estadoCivil: normalizarEstadoCivil(linha.estadoCivil, cpfCnpj),
        ...(codigoAgencia !== undefined ? { codigoAgencia } : {}),
    };
}

// Mapeia uma linha bruta da aba "contas" preservando valores ausentes como undefined ou "Não Informado"
export function normalizarConta(
    linha: Record<string, string | undefined>,
): Conta | null {
    const id = linha.id?.trim() ?? "";
    const cpfCnpjCliente = extrairDigitos(linha.cpfCnpjCliente ?? "");

    if (!id || !cpfCnpjCliente) {
        return null;
    }

    const saldo = normalizarNumero(linha.saldo);
    const limiteCredito = normalizarNumero(linha.limiteCredito);
    const creditoDisponivel = normalizarNumero(linha.creditoDisponivel);

    return {
        id,
        cpfCnpjCliente,
        tipo: normalizarTipoConta(linha.tipo),
        ...(saldo !== undefined ? { saldo } : {}),
        ...(limiteCredito !== undefined ? { limiteCredito } : {}),
        ...(creditoDisponivel !== undefined ? { creditoDisponivel } : {}),
    };
}

// Mapeia uma linha bruta da aba "agencias" descartando registros sem código numérico positivo válido
export function normalizarAgencia(
    linha: Record<string, string | undefined>,
): Agencia | null {
    const id = linha.id?.trim() ?? "";
    const nome = linha.nome?.trim() ?? "";
    const codigo = normalizarNumero(linha.codigo);

    if (!id || !nome || codigo === undefined || codigo <= 0) {
        return null;
    }

    return {
        id,
        codigo,
        nome,
        endereco: linha.endereco?.trim() ?? "",
    };
}
