import { useCallback, useEffect, useState } from "react";
import {
    carregarDadosBancarios,
    type DadosPlanilhaBancaria,
} from "../services/planilhaService";
import type { EstadoRequisicao } from "../types/banking";

export interface RetornoUseDadosBancarios {
    estado: EstadoRequisicao<DadosPlanilhaBancaria>;
    recarregar: () => void;
}

export function useDadosBancarios(): RetornoUseDadosBancarios {
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

    return { estado, recarregar };
}
