# language: pt
Funcionalidade: Buscar filmes
  Eu gostaria de poder buscar um ou mais filmes específicos através de uma barra de pesquisa.

  Contexto:
    Dado que estou no catálogo

  Cenário: Buscar filmes pelo título
    Quando busco por "matrix"
    Então o catálogo mostra só os filmes:
      | The Matrix          |
      | The Matrix Reloaded |

  Cenário: Filtrar por gênero e ator
    Quando filtro pelo gênero "Action"
    E filtro pelo ator "keanu"
    Então o catálogo mostra só os filmes:
      | The Matrix          |
      | The Matrix Reloaded |
      | John Wick           |

  Cenário: Filtrar por diretor e status
    Quando filtro pelo diretor "nolan"
    E filtro pelo status "Planejado"
    Então o catálogo mostra só os filmes:
      | The Odyssey |
