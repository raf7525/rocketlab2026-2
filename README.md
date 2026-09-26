# RocketLab 2026.2 — repositório base

Base inicial para evoluir a atividade do RocketLab 2026.2. Ela preserva a organização do backend,
o modelo relacional do catálogo de filmes em SQLAlchemy 2.0 e o histórico de
migrações com Alembic. Os dados CSV não fazem parte do repositório; o script
`backend/scripts/load_data.py` os carrega no banco.

> **Nota:** `RocketLab` é apenas o nome de referência desta base. O diretório,
> nome do pacote, título da API e arquivo do banco podem ser renomeados para o
> que preferirem; eles não representam uma exigência da
> estrutura-base.

## Estrutura

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/        # ponto de composição dos futuros routers
│   │   ├── core/          # configurações e logging
│   │   ├── db/            # Base ORM, engine e sessões
│   │   └── movies/        # modelos SQLAlchemy do domínio de filmes
│   ├── migrations/        # ambiente e revisões Alembic
│   ├── scripts/           # carga dos CSVs no banco
│   └── tests/
└── README.md
```

## Execução

Requer Python 3.11 ou superior.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/python -m scripts.load_data --csv-dir /pasta/dos/csvs   # ver "Carga dos CSVs"
.venv/bin/uvicorn app.main:app --reload
```

A API mínima ficará disponível em `http://localhost:8000`; use
`http://localhost:8000/docs` para a documentação automática. O endpoint
`GET /health` permite conferir se a aplicação iniciou corretamente.

## Banco de dados e migrações

O modelo usa um esquema estrela para o catálogo de filmes:

- dimensões de filmes, gêneros, pessoas, produtoras e resumo de avaliações;
- fato de desempenho financeiro e de engajamento;
- tabelas de associação N:N entre filmes, gêneros, produtoras e pessoas;

O schema corresponde aos nove arquivos CSV atuais da camada Diamond, com a
adição de `movie_reviews`: uma avaliação individual por linha, na escala 0–10.
A tabela aceita diretamente as colunas `sk_movie_review_id`, `sk_movie_id`,
`nome`, `nota` e `comentario` do CSV enviado separadamente. `created_at` é
gerado pelo banco. O contexto generativo não faz parte desta base.

### Carga dos CSVs

Os CSVs não vão para o repositório (são grandes demais). Coloque-os em
`backend/data/`, soltos ou nas pastas originais `bases_atv_dev1/` e
`bases_atv_dev_2/`, ou indique outra pasta com `--csv-dir`. Com as migrações
aplicadas:

```bash
cd backend
.venv/bin/python -m scripts.load_data                    # CSVs em backend/data/
.venv/bin/python -m scripts.load_data --csv-dir ~/csvs   # CSVs em outra pasta
```

- A carga leva menos de um minuto e gera um banco de cerca de 580 MB.
- Ela não roda sobre um banco que já tem dados. `--reset` apaga tudo, inclusive
  os filmes e as avaliações cadastrados pela aplicação, e carrega de novo.
- `dim_reviews.csv` não é importado: ele não bate com as avaliações
  individuais. O resumo de cada filme (quantidade e média) é calculado a partir
  de `movies_reviews.csv`, como a API faz a cada nova avaliação.
- Títulos e sinopses que vieram com uma camada extra de aspas do CSV
  (`"Julia sees a ""movie""..."`) são corrigidos na carga.

As tabelas são criadas exclusivamente pelo Alembic. Para evoluir os modelos,
crie uma revisão e aplique-a:

```bash
cd backend
.venv/bin/alembic revision --autogenerate -m "descreva a alteração"
.venv/bin/alembic upgrade head
```

O banco padrão é SQLite local em `backend/rocketlab.db`. Ajuste
`DATABASE_URL` no arquivo `.env` para usar outro banco compatível.
