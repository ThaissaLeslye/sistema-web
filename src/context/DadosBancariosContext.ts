import { createContext } from "react";
import type { DadosPlanilhaBancaria } from "../services/planilhaService";
import type {
    Agencia,
    Cliente,
    Conta,
    EstadoRequisicao,
    NovoClienteInput,
} from "../types/banking";

export interface DadosBancariosContextValue {
    estado: EstadoRequisicao<DadosPlanilhaBancaria>;
    clientes: readonly Cliente[];
    contas: readonly Conta[];
    agencias: readonly Agencia[];
    adicionarCliente: (novoCliente: NovoClienteInput) => Cliente;
    recarregar: () => void;
}

export const DadosBancariosContext =
    createContext<DadosBancariosContextValue | null>(null);
