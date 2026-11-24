import { extrairDigitos } from "./normalizadores";

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
