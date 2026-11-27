import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    carregarDadosBancarios,
    type DadosPlanilhaBancaria,
} from "../services/planilhaService";
import type {
    Cliente,
    EstadoRequisicao,
    NovoClienteInput,
} from "../types/banking";
import {
    DadosBancariosContext,
    type DadosBancariosContextValue,
} from "./DadosBancariosContext";

interface DadosBancariosProviderProps {
    children: ReactNode;
}

export function DadosBancariosProvider({
    children,
}: DadosBancariosProviderProps) {
    const [estado, setEstado] = useState<
        EstadoRequisicao<DadosPlanilhaBancaria>
    >({ status: "loading" });

    // Mantém os clientes cadastrados na sessão atual isolados dos dados externos da planilha
    const [clientesCadastrados, setClientesCadastrados] = useState<
        readonly Cliente[]
    >([]);

    const [tentativa, setTentativa] = useState<number>(0);

    const recarregar = useCallback((): void => {
        setEstado({ status: "loading" });
        setTentativa((atual) => atual + 1);
    }, []);

    // Gera identificador único no navegador e insere o novo cliente no topo da lista em memória
    const adicionarCliente = useCallback(
        (novoCliente: NovoClienteInput): Cliente => {
            const clienteComId: Cliente = {
                id: crypto.randomUUID(),
                ...novoCliente,
            };

            setClientesCadastrados((anteriores) => [
                clienteComId,
                ...anteriores,
            ]);

            return clienteComId;
        },
        [],
    );

    useEffect(() => {
        let ativo = true;

        async function executarBusca(): Promise<void> {
            try {
                const dados = await carregarDadosBancarios();
                if (!ativo) return;
                setEstado({ status: "success", dados });
            } catch (erro: unknown) {
                if (!ativo) return;
                const mensagem =
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível carregar os dados da planilha.";
                setEstado({ status: "error", mensagem });
            }
        }

        void executarBusca();

        return () => {
            ativo = false;
        };
    }, [tentativa]);

    const valorContexto = useMemo<DadosBancariosContextValue>(() => {
        const clientesPlanilha =
            estado.status === "success" ? estado.dados.clientes : [];
        const clientes = [...clientesCadastrados, ...clientesPlanilha];
        const contas = estado.status === "success" ? estado.dados.contas : [];
        const agencias =
            estado.status === "success" ? estado.dados.agencias : [];

        return {
            estado,
            clientes,
            contas,
            agencias,
            adicionarCliente,
            recarregar,
        };
    }, [estado, clientesCadastrados, adicionarCliente, recarregar]);

    return (
        <DadosBancariosContext.Provider value={valorContexto}>
            {children}
        </DadosBancariosContext.Provider>
    );
}
