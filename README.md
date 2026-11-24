# Sistema Web — Gestão de Clientes

Aplicação web desenvolvida em **React**, **TypeScript (modo estrito)** e **Vite** para consulta de clientes, contas bancárias, agências e cadastro em memória a partir de dados consumidos em tempo de execução via Google Sheets (CSV).

## Arquitetura e Organização de Pastas

```text
src/
├── components/   # Componentes reutilizáveis de interface e resiliência (ex.: ErrorBoundary)
├── config/       # Constantes imutáveis de configuração (URLs das abas CSV)
├── context/      # Estado global em memória para clientes, contas e agências
├── pages/        # Telas principais (Listagem, Detalhes do Cliente, Novo Cliente, Agências)
├── services/     # Comunicação HTTP (Fetch API) e leitura tipada das abas CSV
├── types/        # Contratos TypeScript estritos do domínio bancário
└── utils/        # Funções puras de normalização, máscaras, formatadores e validações

```

## Camada de Dados CSV e Matriz de Anomalias

Os dados são consumidos em tempo de execução via `fetch()` + `Response.text()` e processados com **PapaParse** (`header: true`, `skipEmptyLines: 'greedy'`) combinado com funções puras em `src/utils/normalizadores.ts`.

### Matriz de Anomalias Identificadas (`Anomalia → Decisão`)

| Aba                                | Anomalia Observada no CSV Real                                                                                                 | Decisão Técnica Adotada                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientes`                         | 14 colunas vazias extras sem cabeçalho ao final de todas as linhas (`""`)                                                      | Uso do PapaParse com cabeçalho nomeado e mapeamento explícito apenas das propriedades esperadas em `normalizarCliente`, descartando colunas excedentes.                     |
| `clientes`                         | Datas no formato ISO `YYYY-MM-DD` (ex.: `1990-05-14`) que recuam 1 dia em `new Date(str)` no fuso `UTC-3`                      | Extração explícita de ano, mês e dia via regex e instanciação local `new Date(ano, mes - 1, dia)` em `normalizarData`.                                                      |
| `clientes`                         | Registro de Pessoa Jurídica (`CLI-004`, CNPJ de 14 dígitos) preenchido com `estadoCivil: "Casado"` e `rg: "ISENTO"`            | Inclusão de `"Não Possui"` no tipo `EstadoCivil` e detecção automática de CNPJ (14 dígitos) via `ehPessoaJuridica()` para atribuir `"Não Possui"`.                          |
| `clientes`                         | Campos opcionais (`nomeSocial`, `rg`) retornados como string vazia `""`                                                        | Higienização via `normalizarTextoVazio()`, convertendo strings vazias ou só com espaços em `undefined`.                                                                     |
| `clientes` / `contas` / `agencias` | Valores monetários e códigos numéricos vindos como texto (`"4250.75"`, `"1001"`) e chaves de CPF/CNPJ podendo conter pontuação | Conversão segura via `normalizarNumero()` (suportando ponto ou vírgula decimal com fallback `0`) e comparação relacional sempre pelos dígitos puros via `extrairDigitos()`. |
| Todas                              | Possibilidade de linhas em branco ou registros corrompidos sem identificadores obrigatórios (`id`, `nome`, `cpfCnpj`/`codigo`) | Descarte defensivo (`return null` + filtro tipado) antes de expor as listas à interface.                                                                                    |

## Fluxo de Versionamento (Git Flow)

- **`main`**: Branch de produção estável (base do deploy).
- **`develop`**: Branch de integração contínua das funcionalidades.
- **`feature/*`**: Branches isoladas por entrega, integradas à `develop` sequencialmente via Pull Request sem avanço rápido (`--no-ff`) para rastreabilidade completa do histórico.

## Como Executar Localmente

```bash
npm install
npm run dev

```

Para validar tipagem e análise estática de código:

```bash
npm run lint
npm run build

```
