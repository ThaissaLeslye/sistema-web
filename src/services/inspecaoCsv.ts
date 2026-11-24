import { SHEETS_CSV_URLS, type NomeAbaPlanilha } from "../config/sheets";

export interface RelatorioInspecaoAba {
    aba: NomeAbaPlanilha;
    url: string;
    ok: boolean;
    statusHttp: number;
    contentType: string | null;
    totalCaracteres: number;
    totalLinhas: number;
    cabecalhoBruto: string;
    amostraLinhas: string[];
}

export async function inspecionarAbasPlanilha(): Promise<
    RelatorioInspecaoAba[]
> {
    const entradas = Object.entries(SHEETS_CSV_URLS) as Array<
        [NomeAbaPlanilha, string]
    >;

    const resultados = await Promise.all(
        entradas.map(async ([aba, url]): Promise<RelatorioInspecaoAba> => {
            const resposta = await fetch(url);
            const textoBruto = await resposta.text();
            const linhas = textoBruto
                .split(/\r?\n/)
                .filter((linha) => linha.trim().length > 0);

            return {
                aba,
                url,
                ok: resposta.ok,
                statusHttp: resposta.status,
                contentType: resposta.headers.get("content-type"),
                totalCaracteres: textoBruto.length,
                totalLinhas: linhas.length,
                cabecalhoBruto: linhas[0] ?? "(vazio)",
                amostraLinhas: linhas.slice(1, 6),
            };
        }),
    );

    return resultados;
}
