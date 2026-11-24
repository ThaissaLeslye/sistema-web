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
└── utils/        # Funções puras de normalização, máscaras, formatadores e validações

```

### Camada de Dados CSV e Matriz de Anomalias

Os dados são consumidos em tempo de execução via `fetch()` + `Response.text()` e processados com **PapaParse** (`header: true`, `skipEmptyLines: 'greedy'`) combinado com funções puras em `src/utils/normalizadores.ts`.

#### Escolha do PapaParse + Funções Puras

- **PapaParse (`header: true`, `skipEmptyLines: 'greedy'`):** Adotado para lidar com campos entre aspas, vírgulas internas em endereços e descarte automático de linhas vazias sem acoplar lógica de parsing aos componentes React.
- **Funções Puras (`src/utils/normalizadores.ts`):** Cada linha bruta passa por transformações determinísticas e sem efeitos colaterais antes de entrar no estado da aplicação.
- **Separação entre Dado Normalizado e Exibição (`src/utils/formatadores.ts`):** Documentos (`cpfCnpj`) são mantidos apenas com dígitos no estado para preservar integridade relacional e buscas, recebendo máscara visual apenas na renderização.

#### Matriz de Anomalias e Decisões Técnicas

| Aba / Campo                  | Anomalia Identificada na Inspeção                                                           | Decisão de Normalização                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `clientes` (colunas finais)  | Presença de 14 colunas vazias sem título ao final de todas as linhas                        | `Papa.parse` com `header: true` mapeia apenas cabeçalhos nomeados; colunas sem chave são ignoradas            |
| `clientes.dataNascimento`    | Datas entregues como string ISO (`"1990-05-14"`); `new Date(iso)` recua 1 dia no fuso UTC-3 | `normalizarData()` extrai ano, mês e dia via regex e instancia `new Date(ano, mes - 1, dia)` no horário local |
| `clientes.nomeSocial` / `rg` | Campos opcionais ausentes vêm como string vazia `""` (ou `"ISENTO"` no RG de PJ)            | `normalizarTextoVazio()` converte strings vazias ou só com espaços em `undefined`                             |
| `clientes.estadoCivil` (PJ)  | Registro PJ (`CLI-004`, CNPJ `12345678000199`) veio preenchido como `"Casado"` na planilha  | `ehPessoaJuridica()` detecta 14 dígitos e atribui `"Não Possui"`; para PF, valida com fallback `"Solteiro"`   |
| `cpfCnpj` e `cpfCnpjCliente` | Chaves de vínculo sem máscara (`"11122233344"`), mas buscas podem conter `.`, `-` e `/`     | `extrairDigitos()` remove caracteres não numéricos (`\D`) para comparação consistente                         |
| Campos numéricos e códigos   | Valores financeiros (`"4250.75"`) e `codigoAgencia` (`"1001"`) chegam como texto            | `normalizarNumero()` suporta ponto ou vírgula decimal e converte para `number` seguro (`Number.isFinite`)     |
| Registros incompletos        | Eventuais linhas em branco ou sem identificadores essenciais                                | Registros sem `id`, `nome` ou `cpfCnpj` (ou `codigo <= 0` em agências) são descartados (`null`)               |

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
npm run lint
npm run build

```
