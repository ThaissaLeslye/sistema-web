import type { TipoContaNormalizado } from "../types/banking";
import { extrairDigitos } from "./normalizadores";

const FORMATADOR_BRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const FORMATADOR_DATA_BR = new Intl.DateTimeFormat("pt-BR");

export function formatarCpfCnpj(valor: string): string {
    const digitos = extrairDigitos(valor);

    if (digitos.length === 11) {
        return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }

    if (digitos.length === 14) {
        return digitos.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5",
        );
    }

    return valor;
}

// Formata valores monetários em Real (BRL) e explicita "Não informado" quando ausentes
export function formatarMoeda(valor: number | undefined): string {
    if (valor === undefined || !Number.isFinite(valor)) {
        return "Não informado";
    }

    return FORMATADOR_BRL.format(valor);
}

// Formata datas válidas no padrão brasileiro (dd/mm/aaaa) sem recuo de fuso horário
export function formatarData(data: Date | undefined): string {
    if (!data || Number.isNaN(data.getTime())) {
        return "Não informado";
    }

    return FORMATADOR_DATA_BR.format(data);
}

// Traduz o identificador interno do tipo de conta para o rótulo de exibição
export function formatarTipoConta(tipo: TipoContaNormalizado): string {
    if (tipo === "corrente") return "Corrente";
    if (tipo === "poupanca") return "Poupança";
    return "Não informado";
}
