// Valores válidos de estado civil para Pessoa Física conforme especificação do domínio
export type EstadoCivilPessoaFisica =
    | "Solteiro"
    | "Casado"
    | "Viúvo"
    | "Divorciado";

// Extensão para leitura da planilha: diferencia CNPJ ("Não Possui") e valores ausentes ou inválidos ("Não Informado")
export type EstadoCivil =
    | EstadoCivilPessoaFisica
    | "Não Possui"
    | "Não Informado";

// Tipos válidos de conta bancária conforme especificação do domínio
export type TipoConta = "corrente" | "poupanca";

// Extensão para leitura da planilha quando o tipo vier vazio ou fora do domínio esperado
export type TipoContaNormalizado = TipoConta | "Não Informado";

// Contrato principal da entidade Cliente após normalização dos dados externos
export interface Cliente {
    id: string;
    cpfCnpj: string;
    rg?: string;
    dataNascimento?: Date;
    nome: string;
    nomeSocial?: string;
    email: string;
    endereco: string;
    rendaAnual?: number;
    patrimonio?: number;
    estadoCivil: EstadoCivil;
    codigoAgencia?: number;
}

// Contrato principal da entidade Conta Bancária vinculada ao cliente via cpfCnpjCliente
export interface Conta {
    id: string;
    cpfCnpjCliente: string;
    tipo: TipoContaNormalizado;
    saldo?: number;
    limiteCredito?: number;
    creditoDisponivel?: number;
}

// Contrato principal da entidade Agência Bancária
export interface Agencia {
    id: string;
    codigo: number;
    nome: string;
    endereco: string;
}

// Contrato derivado para cadastro em memória de novo cliente
export type NovoClienteInput = Omit<Cliente, "id">;

// União discriminada para controle de estados de requisições assíncronas
export type EstadoRequisicao<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; dados: T }
    | { status: "error"; mensagem: string };
