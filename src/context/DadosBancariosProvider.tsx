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
import type { EstadoRequisicao } from "../types/banking";
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

    const [tentativa, setTentativa] = useState<number>(0);

    const recarregar = useCallback((): void => {
        setEstado({ status: "loading" });
        setTentativa((atual) => atual + 1);
    }, []);

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
        const clientes =
            estado.status === "success" ? estado.dados.clientes : [];
        const contas = estado.status === "success" ? estado.dados.contas : [];
        const agencias =
            estado.status === "success" ? estado.dados.agencias : [];

        return {
            estado,
            clientes,
            contas,
            agencias,
            recarregar,
        };
    }, [estado, recarregar]);

    return (
        <DadosBancariosContext.Provider value={valorContexto}>
            {children}
        </DadosBancariosContext.Provider>
    );
}
