import type { Cliente } from "../types/banking";

/**
 * Remove marcas diacríticas (acentos), espaços nas extremidades e converte
 * para minúsculas para permitir comparação textual insensível a caixa e acentuação.
 */
export function normalizarTextoBusca(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/**
 * Extrai apenas os caracteres numéricos (0-9) de uma string de documento ou busca.
 */
export function extrairDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}

/**
 * Filtra a lista de clientes de forma pura (sem mutar o array original):
 * - Retorna todos os registros quando o termo está vazio.
 * - Compara o nome ignorando maiúsculas/minúsculas e acentos.
 * - Compara o CPF/CNPJ apenas pelos dígitos, somente quando o termo possui ao menos um dígito.
 */
export function filtrarClientes(
    clientes: readonly Cliente[],
    termoBusca: string,
): readonly Cliente[] {
    const termoNormalizado = normalizarTextoBusca(termoBusca);

    if (termoNormalizado === "") {
        return clientes;
    }

    const termoDigitos = extrairDigitos(termoBusca);

    return clientes.filter((cliente) => {
        const nomeNormalizado = normalizarTextoBusca(cliente.nome);
        const correspondeNome = nomeNormalizado.includes(termoNormalizado);

        const documentoDigitos = extrairDigitos(cliente.cpfCnpj);
        const correspondeDocumento =
            termoDigitos.length > 0 && documentoDigitos.includes(termoDigitos);

        return correspondeNome || correspondeDocumento;
    });
}
