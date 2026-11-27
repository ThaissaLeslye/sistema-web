# Sistema Web — Gestão de Clientes

Aplicação web desenvolvida em **React**, **TypeScript (modo estrito)**, **Vite**, **Bootstrap 5 (React-Bootstrap)** e **React Router** para consulta de clientes, contas bancárias, agências e cadastro em memória a partir de dados consumidos em tempo de execução via Google Sheets (CSV).

[**Acesse aqui a aplicação publicada!**](https://sistema-web-teste-pratico.vercel.app)

## Arquitetura e Organização de Pastas

```text
src/
├── components/   # Componentes reutilizáveis de layout, listagem e resiliência (ErrorBoundary, LayoutPrincipal, TabelaClientes)
├── config/       # Constantes imutáveis de configuração (URLs das abas CSV)
├── context/      # Estado global em memória acima das rotas (DadosBancariosContext e DadosBancariosProvider)
├── hooks/        # Custom hooks para consumo seguro do contexto de dados (useDadosBancarios)
├── pages/        # Telas roteadas da aplicação (ClientesPage, ClienteDetalhePage com ficha/agência/contas, NovoClientePage, PaginaNaoEncontrada)
├── services/     # Comunicação HTTP (Fetch API) e leitura tipada das abas CSV
├── types/        # Contratos TypeScript estritos do domínio bancário
└── utils/        # Funções puras de normalização, filtragem de busca, vínculos relacionais, formatadores e testes unitários (Vitest)
```

## Interface, Tema e Roteamento SPA

- **Bootstrap 5 + React-Bootstrap:** Utilizado para estruturação de grid responsivo, barra de navegação colapsável (`Navbar`), tabela responsiva (`Table`) e paginação (`Pagination`) sem depender do bundle JavaScript imperativo do Bootstrap (`bootstrap.bundle.min.js`), mantendo o controle de estado 100% declarativo no React.
- **Customização de Tema via Cascata CSS (`src/index.css`):** O CSS base do Bootstrap é importado antes de `src/index.css` em `src/main.tsx`, permitindo sobrescrever variáveis nativas (`--bs-primary`, `--bs-body-bg`, `--bs-border-color`, `--bs-btn-*`) com os tokens institucionais do projeto sem editar arquivos da biblioteca nem recorrer a `!important`.
- **Estado Global e Vínculos Relacionais (`src/context/` e `src/utils/detalhesCliente.ts`):** O carregamento das três planilhas ocorre uma única vez no `DadosBancariosProvider` posicionado acima de `<Routes>`, evitando requisições repetidas durante a navegação. Na tela de detalhes, funções puras realizam o cruzamento entre cliente, contas (comparando apenas dígitos puros do CPF/CNPJ) e agência (pelo código numérico), aplicando formatação monetária (`BRL`), datas locais e fallbacks explícitos (`"Não informado"`).
- **Busca e Paginação Derivadas (`src/utils/filtrosClientes.ts` e `src/pages/ClientesPage.tsx`):**
- **Filtragem Imutável:** A busca é calculada como estado derivado durante a renderização sem mutar a lista original carregada da planilha. Nomes são comparados via normalização Unicode (`NFD`) ignorando acentos e maiúsculas/minúsculas; documentos são comparados apenas pelos dígitos (`\D`), exigindo ao menos um dígito no termo (`termoDigitos.length > 0`) para evitar falsos positivos.
- **Paginação e Acessibilidade:** Os resultados filtrados são paginados em blocos de até 10 clientes (`ITENS_POR_PAGINA = 10`) com redefinição automática para a página `1` ao alterar a busca, tratamento explícito de busca sem correspondência (`Limpar busca` com retorno de foco ao campo), anúncio dinâmico de contagem (`role="status"` e `aria-live="polite"`) e links de ação individualizados (`aria-label`) para acesso aos detalhes de cada cliente.

- **Roteamento no Cliente e Fallback SPA (`vercel.json`):** A navegação entre telas ocorre sem recarregamento de página via `react-router-dom`, apoiada pela regra de _rewrite_ (`/(.*) -> /index.html`) na hospedagem para evitar erros HTTP 404 ao acessar ou recarregar rotas internas diretamente.

| Rota             | Página                | Responsabilidade                                                                                  |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| `/`              | `ClientesPage`        | Listagem paginada (10 por página), busca em tempo real por nome ou CPF/CNPJ e acesso aos detalhes |
| `/clientes/novo` | `NovoClientePage`     | Tela dedicada ao cadastro de novos clientes em memória                                            |
| `/clientes/:id`  | `ClienteDetalhePage`  | Ficha cadastral completa, dados da agência vinculada e tabela de contas bancárias do cliente      |
| `*`              | `PaginaNaoEncontrada` | Tela de fallback (404) para rotas inexistentes                                                    |

## Camada de Dados CSV e Matriz de Anomalias

Os dados são consumidos em tempo de execução via `fetch()` + `Response.text()` e processados com **PapaParse** (`header: true`, `skipEmptyLines: 'greedy'`) combinado com funções puras em `src/utils/normalizadores.ts`:

- **Separação entre Armazenamento e Exibição (`src/utils/formatadores.ts`):** Identificadores (`cpfCnpj`) são mantidos apenas com dígitos puros nos objetos de domínio para garantir integridade relacional entre clientes e contas; a formatação visual é aplicada exclusivamente na camada de interface.
- **Recusa a Dados Fabricados (`src/types/banking.ts` e `src/utils/normalizadores.ts`):** Em domínio bancário, células ausentes ou corrompidas não devem ser mascaradas por valores válidos fictícios (como assumir `"Solteiro"`, `"corrente"` ou `0`). Valores inválidos são explicitamente marcados como `"Não Informado"` ou `undefined` e cobertos por testes unitários em `src/utils/normalizadores.test.ts`, `src/utils/filtrosClientes.test.ts` e `src/utils/detalhesCliente.test.ts`.

### Matriz de Anomalias e Decisões Técnicas

| Aba / Campo                      | Anomalia Identificada na Inspeção                                                                                                                | Decisão de Normalização                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clientes` (colunas finais)      | Presença de 14 colunas vazias sem título ao final de todas as linhas (`"",""`...)                                                                | `Papa.parse` com `header: true` mapeia apenas cabeçalhos nomeados; colunas sem chave são ignoradas na normalização                                                     |
| `clientes.dataNascimento`        | Datas entregues como string ISO (`"1990-05-14"`); `new Date(iso)` recua 1 dia no fuso UTC-3 e datas impossíveis (ex.: `31/02`) sofrem _rollover_ | `normalizarData()` extrai ano, mês e dia via regex, instancia `new Date(ano, mes - 1, dia)` localmente e valida o calendário, retornando `undefined` se inválida       |
| `clientes.nomeSocial` / `rg`     | Campos opcionais ausentes vêm como string vazia `""` (ou `"ISENTO"` no RG de PJ)                                                                 | `normalizarTextoVazio()` converte strings vazias ou só com espaços em `undefined`                                                                                      |
| `clientes.estadoCivil` (PJ e PF) | Registro PJ (`CLI-004`, CNPJ `12345678000199`) veio como `"Casado"` e células de PF podem vir vazias ou fora do domínio                          | `ehPessoaJuridica()` detecta 14 dígitos e atribui `"Não Possui"`; para PF, valida contra `EstadoCivilPessoaFisica` e marca `"Não Informado"` sem inventar estado civil |
| `contas.tipo`                    | Eventuais valores vazios ou fora de `"corrente"` / `"poupanca"` na planilha                                                                      | `normalizarTipoConta()` aceita apenas os literais válidos e marca `"Não Informado"` para entradas desconhecidas                                                        |
| `cpfCnpj` e `cpfCnpjCliente`     | Chaves de vínculo sem máscara (`"11122233344"`), mas buscas do usuário podem conter `.`, `-` e `/`                                               | `extrairDigitos()` remove caracteres não numéricos (`\D`) para garantir comparação e relacionamento consistentes                                                       |
| Campos numéricos e códigos       | Valores financeiros (`"4250.75"`) e `codigoAgencia` (`"1001"`) chegam como texto e podem vir vazios ou ilegíveis                                 | `normalizarNumero()` suporta ponto ou vírgula decimal e retorna `undefined` quando vazio ou não numérico (`Number.isFinite`), evitando confundir ausência com `0`      |
| Registros incompletos            | Eventuais linhas em branco ou sem identificadores essenciais                                                                                     | Registros sem `id`, `nome` ou `cpfCnpj` (ou `codigo <= 0` em agências) são descartados (`null`) antes de chegar à UI                                                   |

## Fluxo de Versionamento (Git Flow)

- **`main`:** Branch de produção estável (base do deploy contínuo).
- **`develop`:** Branch de integração contínua das funcionalidades.
- **`feature/*`:** Branches isoladas por entrega, integradas à `develop` sequencialmente via Pull Request sem avanço rápido (`--no-ff`) para rastreabilidade completa do histórico.

## Como Executar Localmente

```bash
npm install
npm run dev

```

Para executar a suíte de testes unitários, validação de tipagem e build de produção:

```bash
npm test
npm run lint
npm run build

```
