# RocketLab Filmes

Sistema de avaliação de filmes inspirado no Letterboxd, feito para a Atividade DEV do
Rocket Lab 2026 (Visagio). O administrador navega pelo catálogo de cerca de 95 mil filmes,
busca e filtra, vê os detalhes e as avaliações de cada filme, cadastra, edita e remove filmes
e publica notas com resenha.

- **Frontend:** Vite, React 19 e TypeScript
- **Backend:** FastAPI, SQLAlchemy 2.0 e Alembic
- **Banco de dados:** SQLite

## Funcionalidades

| Requisito | Onde está |
|---|---|
| Cadastrar filmes (título, direção, ano, gênero, sinopse) | Botão **+ Adicionar filme** no catálogo. O formulário também aceita duração, status, elenco e uma imagem de pôster enviada do computador. No fim, ele pergunta se você já assistiu ao filme: se sim, abre a avaliação dele. |
| Catálogo paginado com todos os filmes | Página inicial, com 24 filmes por página, dos mais populares para os menos. |
| Detalhes do filme e lista de avaliações | Clique num filme: sinopse, direção, gêneros, elenco, média e avaliações. |
| Buscar filmes por uma barra de pesquisa | Barra no topo do catálogo, que busca por parte do título. |
| Remover e atualizar filmes | Botão **Edição** na página do filme. O formulário de edição toma o lugar do de avaliação. A remoção pede confirmação. |
| Adicionar uma avaliação (nota em estrelas e resenha) | Formulário **Avaliar este filme**, com nota de ½ a 5 estrelas. |
| Ver a média geral das avaliações | Abaixo do pôster, no catálogo e na página do filme. |

Além do que foi pedido:

- **Filtros:** por gênero, status, direção e ator ou atriz, combináveis com a busca. Os nomes da
  direção e do elenco na página do filme levam ao catálogo filtrado por aquela pessoa.
- **Watchlist:** o ícone de salvar (como o do Instagram), nos cards e na página do filme, guarda
  o filme para assistir depois. O botão **Watchlist**, ao lado de "Adicionar filme", abre a lista.
- **Reviews populares e curtidas:** as resenhas mais curtidas aparecem abaixo do catálogo.
- **Responsivo:** o layout funciona do celular ao desktop.
- **Cache de consultas:** o front usa o TanStack Query, que evita buscar de novo o que já foi
  carregado.
- **Testes automatizados:** em três camadas: pytest no backend, Vitest nas telas e Cypress com
  Cucumber de ponta a ponta (veja [Testes e qualidade](#testes-e-qualidade)).
- **Modo de demonstração sem backend:** `npm run dev:mock` (veja
  [Só o frontend, com dados de exemplo](#só-o-frontend-com-dados-de-exemplo)).

## Pré-requisitos

- Python 3.11 ou superior
- Node.js 20.19 ou superior (ou 22.12 ou superior)
- Os arquivos CSV do desafio. Eles não estão no repositório porque são grandes demais.

## Como executar

Os comandos abaixo usam o caminho do ambiente virtual no Linux e no macOS (`.venv/bin/...`).
No Windows, troque por `.venv\Scripts\...`.

### 1. Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/alembic upgrade head          # cria as tabelas em backend/rocketlab.db
```

Coloque os CSVs em `backend/data/`. Eles podem ficar soltos ou nas pastas originais,
`bases_atv_dev1/` e `bases_atv_dev_2/`. Depois, carregue os dados:

```bash
.venv/bin/python -m scripts.load_data                    # CSVs em backend/data/
.venv/bin/python -m scripts.load_data --csv-dir ~/csvs   # ou indique outra pasta
```

A carga leva menos de um minuto e gera um banco de cerca de 580 MB. Por fim, suba a API:

```bash
.venv/bin/uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Documentação interativa (Swagger): http://localhost:8000/docs
- Verificação rápida: http://localhost:8000/health

> Rode os comandos de dentro de `backend/`. O caminho do banco no `.env`
> (`./rocketlab.db`) é relativo à pasta atual: rodando de outro lugar, o SQLite cria um
> banco novo e vazio.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173. O Vite encaminha as chamadas `/api` para o backend em
`localhost:8000`, então a API precisa estar rodando.

### Só o frontend, com dados de exemplo

```bash
cd frontend
npm install
npm run dev:mock
```

Esse modo não precisa do backend nem dos CSVs. A API é simulada no navegador pelo
[MSW](https://mswjs.io/), com os 48 filmes mais populares do CSV que têm pôster (as curtidas
desses dados são inventadas), e o cabeçalho mostra o selo **dados de exemplo**. Cadastros, edições e avaliações ficam só na memória do navegador:
recarregar a página desfaz tudo.

## Testes e qualidade

Os testes ficam em três camadas, e cada uma cuida de uma coisa, sem repetir as outras:

| Camada | Ferramenta | O que garante | Onde fica |
|---|---|---|---|
| Backend | pytest | As regras da API e do banco: validações, filtros, médias, códigos de erro, migrações. | `backend/tests/` |
| Frontend | Vitest, Testing Library e MSW | O comportamento das telas com uma API simulada: formulários, mensagens de erro, navegação, foco. | `frontend/src/**/*.test.tsx` |
| Ponta a ponta | Cypress com Cucumber | Que as partes funcionam juntas: navegador, front, API e banco de verdade, nas histórias do desafio. | `frontend/cypress/` |

Os testes ponta a ponta cobrem só o caminho principal de cada história (um ou dois cenários cada)
e terminam conferindo o resultado depois de recarregar a página, ou seja, que ficou gravado no
banco. Os detalhes (cada validação, cada erro) ficam nas camadas de baixo, que são rápidas.

```bash
# backend, dentro de backend/
.venv/bin/pytest                 # testes de unidade e de integração da API
.venv/bin/ruff check .           # lint
.venv/bin/ruff format --check .  # formatação

# frontend, dentro de frontend/
npm run test:run                 # testes das telas (Vitest)
npm run lint                     # lint (oxlint)
npm run build                    # checagem de tipos e build de produção
npm run e2e                      # testes ponta a ponta (Cypress), sem abrir janela
npm run e2e:open                 # os mesmos, na interface do Cypress
```

Nenhum teste toca no banco de verdade. Os do backend criam um SQLite em memória para cada
teste, e os do frontend usam a API simulada pelo MSW.

### Testes ponta a ponta

Os cenários estão em português, um arquivo `.feature` por história do desafio, em
`frontend/cypress/e2e/`. Por exemplo:

```gherkin
Cenário: Buscar filmes pelo título
  Quando busco por "matrix"
  Então o catálogo mostra só os filmes:
    | The Matrix          |
    | The Matrix Reloaded |
```

O `npm run e2e` faz tudo sozinho:

1. cria um banco SQLite temporário com dados fixos (`backend/scripts/seed_e2e.py`: 28 filmes,
   entre eles The Matrix, Heat e Oppenheimer);
2. sobe uma API (porta 8001) e um front (porta 5175) só para os testes, então dá para rodar com
   a aplicação aberta;
3. roda os cenários, recriando o banco antes de cada um, para que nenhum dependa de outro;
4. desliga tudo e apaga o banco temporário.

Requisitos:

- O backend instalado (`backend/.venv`), como em [Como executar](#como-executar).
- No Linux e no WSL, as bibliotecas do navegador do Cypress:
  `sudo apt install -y libnss3 libasound2t64 libxss1 xvfb` (em versões mais antigas do Ubuntu,
  `libasound2` no lugar de `libasound2t64`).
- Se o `npm install` avisar que bloqueou scripts de instalação, baixe o navegador do Cypress com
  `npx cypress install`.

## API

Todas as rotas ficam sob `/api/v1`. Os detalhes de cada uma estão em `/docs`.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/movies` | Catálogo paginado (`page`, `page_size`), com busca e filtros opcionais: `busca` (parte do título), `genero` (nome inteiro), `status`, `diretor` e `ator` (parte do nome). |
| `POST` | `/movies` | Cadastra um filme. Responde `201` com o detalhe. |
| `GET` | `/movies/{id}` | Detalhe do filme, com direção, elenco e média das avaliações. |
| `PUT` | `/movies/{id}` | Atualiza o filme. Os campos opcionais que não vierem (`elenco`, `duracao_minutos`, `status_filme`, `url_poster`) ficam como estão. |
| `DELETE` | `/movies/{id}` | Remove o filme e as avaliações dele. Responde `204`. |
| `GET` | `/genres` | Gêneros disponíveis, em ordem alfabética. |
| `GET` | `/watchlist` | Filmes da watchlist, paginados, do guardado por último para o primeiro. |
| `PUT` / `DELETE` | `/watchlist/{id}` | Guarda ou tira o filme da watchlist. Responde `204`; repetir não muda nada. |
| `POST` | `/posters` | Recebe uma imagem JPG, PNG ou WebP de até 5 MB como corpo da requisição (com o `Content-Type` da imagem) e devolve `{"url": ...}`, que vai no `url_poster` do filme. |
| `GET` | `/posters/{nome}` | Devolve uma imagem enviada. |
| `GET` | `/movies/{id}/reviews` | Avaliações do filme, da mais recente para a mais antiga. |
| `POST` | `/movies/{id}/reviews` | Publica uma avaliação (nome, nota e resenha). |
| `GET` | `/movies/{id}/reviews/summary` | Quantidade e média das avaliações. |
| `POST` / `DELETE` | `/movies/{id}/reviews/{review_id}/likes` | Curte ou descurte uma avaliação. |
| `GET` | `/reviews/popular` | Avaliações mais curtidas (`limit`, padrão 6). |

Os erros seguem o padrão do FastAPI: `404` com `{"detail": "Filme não encontrado."}` e
`422` para dados inválidos, como um gênero que não existe.

## Estrutura

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/       # junta os routers de cada domínio
│   │   ├── core/         # configurações (.env) e logging
│   │   ├── db/           # Base ORM, engine e sessões
│   │   ├── movies/       # catálogo: models, schemas, router, service, repository
│   │   ├── posters/      # envio e leitura das imagens de pôster
│   │   ├── reviews/      # avaliações e curtidas, com a mesma divisão
│   │   ├── watchlist/    # filmes guardados para assistir depois
│   │   └── shared/       # paginação, escala de notas e erros de negócio
│   ├── migrations/       # revisões do Alembic
│   ├── scripts/          # carga dos CSVs (load_data.py) e dados dos testes E2E (seed_e2e.py)
│   └── tests/            # unit/ e integration/
└── frontend/
    ├── cypress/          # testes ponta a ponta: cenários (.feature) e passos
    ├── scripts/          # e2e.mjs: sobe API, front e banco de teste e roda o Cypress
    └── src/
        ├── app/          # rotas, layout e tema
        ├── features/
        │   ├── movies/   # catálogo, busca, detalhe, cadastro e edição
        │   ├── reviews/  # formulário, lista, reviews populares e curtidas
        │   └── watchlist/ # ícone de salvar e página da watchlist
        ├── shared/       # componentes e utilitários comuns (estrelas, paginação, API)
        └── test/         # API simulada (MSW), dados de exemplo e fábricas
```

Cada domínio do backend separa as responsabilidades em camadas:

- `router.py` recebe a requisição HTTP;
- `schemas.py` valida a entrada e formata a saída;
- `service.py` aplica as regras de negócio e grava no banco;
- `repository.py` faz as consultas.

## Banco de dados

O SQLite guarda tudo num único arquivo, `backend/rocketlab.db`. Cada alteração feita pela
aplicação (cadastrar, editar, remover, avaliar, curtir) é gravada nesse arquivo e continua lá
depois que a aplicação é fechada. O arquivo não vai para o git.

- **Recomeçar do zero:** `.venv/bin/python -m scripts.load_data --reset` apaga todos os dados,
  inclusive os criados pela aplicação, e carrega os CSVs de novo.
- **Guardar uma cópia:** com a API parada, copie o arquivo:
  `cp rocketlab.db rocketlab.backup.db`.
- **Usar outro banco:** ajuste `DATABASE_URL` no `.env`.
- **Imagens enviadas:** os pôsteres enviados pelo formulário não ficam no banco, e sim em
  `backend/media/posters/`, que também não vai para o git. O banco guarda só o endereço de cada
  imagem. Trocar a imagem de um filme, ou remover o filme, apaga o arquivo antigo. A pasta pode
  ser mudada com `MEDIA_DIR` no `.env`.

O modelo é um esquema estrela:

- **Dimensões:** filmes, gêneros, pessoas (ator, diretor e roteirista), produtoras e resumo
  das avaliações.
- **Fato:** desempenho financeiro e popularidade de cada filme.
- **Associações N:N:** ligam filmes a gêneros, produtoras e pessoas.
- **`movie_reviews`:** as avaliações individuais.
- **`watchlist`:** os filmes guardados para assistir depois.

As tabelas são criadas só pelo Alembic. Para mudar os modelos:

```bash
cd backend
.venv/bin/alembic revision --autogenerate -m "descreva a alteração"
.venv/bin/alembic upgrade head
```

## Decisões de projeto

- **Escala das notas:** vai de 0 a 10, e cada ponto vale meia estrela (1 = ½ estrela,
  10 = 5 estrelas). Novas avaliações têm notas inteiras. As notas decimais do CSV (como 9,8)
  são arredondadas para a meia estrela mais próxima na exibição.
- **Média recalculada:** o `dim_reviews.csv` não bate com as avaliações individuais de
  `movies_reviews.csv`. Por isso ele não é importado: a carga calcula a quantidade e a média
  de cada filme a partir das avaliações, e a API refaz esse cálculo a cada nova avaliação.
- **Elenco em ordem alfabética:** os CSVs não trazem a ordem dos créditos.
- **Busca:** título, direção e elenco aceitam parte do nome, sem diferenciar maiúsculas. O
  gênero precisa ser o nome inteiro. Todos os filtros se combinam, e a busca fica no endereço
  da página (`/?busca=matrix&genero=Action`), então dá para compartilhar o link ou voltar a ela.
- **Direção e elenco no cadastro e na edição:** uma pessoa que já existe no banco é
  reaproveitada, sem diferenciar maiúsculas. Assim, o filme novo entra na lista de filmes dessa
  pessoa.
- **Edição:** substitui só o que o formulário mostra. Pôster, duração, roteiristas, métricas e
  avaliações ficam como estavam.
- **Status do filme:** só os quatro valores que aparecem nos CSVs (Lançado, Pós-Produção, Em
  Produção e Planejado). O cadastro já começa em "Lançado".
- **Duração:** em minutos, de 1 a 20.000; o filme mais longo do CSV tem 13.319 minutos. No
  CSV, 0 significa "desconhecida", e a interface não mostra a duração nesse caso.
- **Pôster enviado:** o tipo da imagem é conferido pelos primeiros bytes do arquivo, não pelo
  nome. Cada arquivo recebe um nome aleatório, e a API só serve nomes nesse formato. O
  `url_poster` aceita o endereço devolvido pelo envio ou um link `http(s)`, como os do TMDB.
- **Títulos do CSV:** a carga corrige títulos e sinopses que vieram com uma camada extra de
  aspas (`"Julia sees a ""movie""..."`).
- **Watchlist única:** como o sistema tem um só usuário (o administrador), há uma watchlist só,
  guardada no banco. Os filmes do catálogo e do detalhe trazem `na_watchlist`, para o ícone
  saber se está preenchido.
- **Curtidas sem login:** a contagem fica no backend. Como não há login, o navegador (via
  `localStorage`) lembra quais avaliações você curtiu, para o botão saber se o clique curte
  ou descurte.
