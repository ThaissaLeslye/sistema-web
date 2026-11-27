import type { Agencia, Cliente, Conta } from "../types/banking";
import { extrairDigitos } from "./normalizadores";

// Localiza um cliente pelo identificador da rota sem mutar a lista original
export function buscarClientePorId(
    clientes: readonly Cliente[],
    id: string | undefined,
): Cliente | undefined {
    if (!id) return undefined;
    const idLimpo = id.trim();
    if (idLimpo.length === 0) return undefined;

    return clientes.find((cliente) => cliente.id === idLimpo);
}

// Filtra todas as contas vinculadas ao CPF/CNPJ do cliente comparando apenas dígitos puros
export function filtrarContasDoCliente(
    contas: readonly Conta[],
    cpfCnpjCliente: string,
): readonly Conta[] {
    const digitosCliente = extrairDigitos(cpfCnpjCliente);
    if (digitosCliente.length === 0) return [];

    return contas.filter(
        (conta) => extrairDigitos(conta.cpfCnpjCliente) === digitosCliente,
    );
}

// Localiza a agência correspondente ao código numérico do cliente
export function buscarAgenciaDoCliente(
    agencias: readonly Agencia[],
    codigoAgencia: number | undefined,
): Agencia | undefined {
    if (codigoAgencia === undefined || !Number.isFinite(codigoAgencia)) {
        return undefined;
    }

    return agencias.find((agencia) => agencia.codigo === codigoAgencia);
}
