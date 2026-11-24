const SPREADSHEET_BASE_URL =
    "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=";

export const SHEETS_CSV_URLS = {
    clientes: `${SPREADSHEET_BASE_URL}clientes`,
    contas: `${SPREADSHEET_BASE_URL}contas`,
    agencias: `${SPREADSHEET_BASE_URL}agencias`,
} as const;

export type NomeAbaPlanilha = keyof typeof SHEETS_CSV_URLS;
