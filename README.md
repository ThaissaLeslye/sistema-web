# Sistema Web — Gestão de Clientes

Aplicação web desenvolvida em **React**, **TypeScript (modo estrito)** e **Vite** para consulta de clientes, contas bancárias, agências e cadastro em memória a partir de dados consumidos em tempo de execução via Google Sheets (CSV).

## Arquitetura e Organização de Pastas

```text
src/
├── components/   # Componentes reutilizáveis de interface e resiliência (ErrorBoundary, TabelaClientes)
├── config/       # Constantes imutáveis de configuração (URLs das abas CSV)
├── context/      # Estado global em memória para clientes, contas e agências
├── hooks/        # Custom hooks para encapsular ciclo de vida e requisições assíncronas (useDadosBancarios)
├── pages/        # Telas principais (Listagem, Detalhes do Cliente, Novo Cliente, Agências)
├── services/     # Comunicação HTTP (Fetch API) e leitura tipada das abas CSV
├── types/        # Contratos TypeScript estritos do domínio bancário
└── utils/        # Funções puras de normalização, máscaras, formatadores, validações e testes unitários (Vitest)

```

### Camada de Dados CSV e Matriz de Anomalias

Os dados são consumidos em tempo de execução via `fetch()` + `Response.text()` e processados com **PapaParse** (`header: true`, `skipEmptyLines: 'greedy'`) combinado com funções puras em `src/utils/normalizadores.ts`.

#### Escolha do PapaParse + Funções Puras

- **PapaParse (`header: true`, `skipEmptyLines: 'greedy'`):** Adotado para lidar com campos entre aspas, vírgulas internas em endereços e descarte automático de linhas vazias sem acoplar lógica de parsing aos componentes React.
- **Funções Puras (`src/utils/normalizadores.ts`):** Cada linha bruta passa por transformações determinísticas e sem efeitos colaterais antes de entrar no estado da aplicação.
- **Separação entre Dado Normalizado e Exibição (`src/utils/formatadores.ts`):** Documentos (`cpfCnpj`) são mantidos apenas com dígitos no estado para preservar integridade relacional e buscas, recebendo máscara visual apenas na renderização.
- **Recusa a Dados Fabricados (`src/types/banking.ts` e `src/utils/normalizadores.ts`):** Em domínio bancário, células ausentes ou corrompidas não devem ser mascaradas por valores válidos fictícios (como assumir `"Solteiro"`, `"corrente"` ou `0`). Valores inválidos são explicitamente marcados como `"Não Informado"` ou `undefined` e cobertos por testes unitários em `src/utils/normalizadores.test.ts`.

#### Matriz de Anomalias e Decisões Técnicas

| Aba / Campo                    | Anomalia Identificada na Inspeção                                                                                                          | Decisão de Normalização                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| clientes.dataNascimento        | Datas entregues como string ISO ("1990-05-14"); `new Date(iso)` recua 1 dia no fuso UTC-3 e datas impossíveis (ex.: 31/02) sofrem rollover | `normalizarData()` extrai ano, mês e dia via regex, instancia `new Date(ano, mes - 1, dia)` localmente e valida o calendário, retornando `undefined` se inválida       |
| clientes.estadoCivil (PJ e PF) | Registro PJ (CLI-004, CNPJ 12345678000199) veio como "Casado" e células de PF podem vir vazias ou fora do domínio                          | `ehPessoaJuridica()` detecta 14 dígitos e atribui `"Não Possui"`; para PF, valida contra `EstadoCivilPessoaFisica` e marca `"Não Informado"` sem inventar estado civil |
| contas.tipo                    | Eventuais valores vazios ou fora de `"corrente"` / `"poupanca"` na planilha                                                                | `normalizarTipoConta()` aceita apenas os literais válidos e marca `"Não Informado"` para entradas desconhecidas                                                        |
| Campos numéricos e códigos     | Valores financeiros ("4250.75") e `codigoAgencia` ("1001") chegam como texto e podem vir vazios ou ilegíveis                               | `normalizarNumero()` suporta ponto ou vírgula decimal e retorna `undefined` quando vazio ou não numérico (`Number.isFinite`), evitando confundir ausência com `0`      |
| Registros incompletos          | Eventuais linhas em branco ou sem identificadores essenciais                                                                               | Registros sem `id`, `nome` ou `cpfCnpj` (ou `codigo <= 0` em agências) são descartados (`null`)                                                                        |

### Fluxo de Versionamento (Git Flow)

- **`main`**: Branch de produção estável (base do deploy).
- **`develop`**: Branch de integração contínua das funcionalidades.
- **`feature/*`**: Branches isoladas por entrega, integradas à `develop` sequencialmente via Pull Request sem avanço rápido (`--no-ff`) para rastreabilidade completa do histórico.

### Como Executar Localmente

```bash
npm install
npm run dev

```

Para validar tipagem e análise estática de código:

```bash
npm test
npm run lint
npm run build

```
