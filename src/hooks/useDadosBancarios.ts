import { useContext } from "react";
import {
    DadosBancariosContext,
    type DadosBancariosContextValue,
} from "../context/DadosBancariosContext";

export function useDadosBancarios(): DadosBancariosContextValue {
    const contexto = useContext(DadosBancariosContext);

    if (contexto === null) {
        throw new Error(
            "useDadosBancarios deve ser utilizado dentro de um DadosBancariosProvider.",
        );
    }

    return contexto;
}
