# language: pt
Funcionalidade: Cadastrar filmes
  Eu gostaria de poder cadastrar filmes com informações básicas
  (ex: título, diretor, ano de lançamento, gênero, sinopse).

  Contexto:
    Dado que estou no catálogo
    Quando abro o cadastro de filme

  Cenário: Cadastrar um filme com as informações básicas
    Quando preencho o formulário do filme:
      | Título            | Alien                                                  |
      | Ano de lançamento | 1979                                                   |
      | Direção           | Ridley Scott                                           |
      | Sinopse           | A tripulação de uma nave encontra uma criatura mortal. |
    E escolho o gênero "Science Fiction"
    E respondo que ainda não assisti ao filme
    E cadastro o filme
    Então estou no catálogo
    Quando abro o filme "Alien" pela busca
    Então a página do filme mostra:
      | Alien                                                  |
      | 1979                                                   |
      | Ridley Scott                                           |
      | Science Fiction                                        |
      | A tripulação de uma nave encontra uma criatura mortal. |

  Cenário: Cadastrar um filme com elenco, duração, status e pôster
    Quando preencho o formulário do filme:
      | Título            | Project Hail Mary             |
      | Ano de lançamento | 2026                          |
      | Direção           | Phil Lord, Christopher Miller |
      | Duração           | 156                           |
      | Elenco            | Ryan Gosling, Sandra Hüller   |
    E escolho o gênero "Science Fiction"
    E escolho o status "Planejado"
    E escolho a imagem "poster.png" como pôster
    E respondo que ainda não assisti ao filme
    E cadastro o filme
    Então estou no catálogo
    Quando abro o filme "Project Hail Mary" pela busca
    Então a página do filme mostra:
      | 2h 36min  |
      | Planejado |
    E o elenco do filme é:
      | Ryan Gosling  |
      | Sandra Hüller |
    E o pôster do filme aparece
