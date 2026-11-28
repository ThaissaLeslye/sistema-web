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

// Aplica máscara progressiva de CPF (11 dígitos) ou CNPJ (14 dígitos) durante a digitação
export function aplicarMascaraCpfCnpj(valor: string): string {
    const digitos = extrairDigitos(valor).slice(0, 14);

    if (digitos.length <= 11) {
        if (digitos.length <= 3) return digitos;
        if (digitos.length <= 6) {
            return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
        }
        if (digitos.length <= 9) {
            return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
        }
        return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
    }

    if (digitos.length <= 12) {
        return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
    }
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

// Aplica máscara progressiva de data brasileira (dd/mm/aaaa) durante a digitação
export function aplicarMascaraData(valor: string): string {
    const digitos = extrairDigitos(valor).slice(0, 8);

    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 4) {
        return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }
    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}
