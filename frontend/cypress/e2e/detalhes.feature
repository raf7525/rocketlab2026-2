# language: pt
Funcionalidade: Detalhes do filme
  Eu gostaria de poder acessar mais detalhes de cada filme, vendo as informações completas
  e a lista de avaliações (resenhas e notas) já feitas pelos usuários.

  Cenário: Ver as informações completas e as avaliações de um filme
    Dado que estou no catálogo
    Quando abro o filme "The Matrix"
    Então a página do filme mostra:
      | The Matrix                                          |
      | 1999                                                |
      | 2h 16min                                            |
      | Lana Wachowski                                      |
      | Lilly Wachowski                                     |
      | Science Fiction                                     |
      | Um hacker descobre que a realidade é uma simulação. |
    E o elenco do filme é:
      | Carrie-Anne Moss   |
      | Keanu Reeves       |
      | Laurence Fishburne |
    E as avaliações do filme são:
      | Ana   | 5 de 5 estrelas | Revolucionário.    |
      | Bruno | 4 de 5 estrelas | Efeitos incríveis. |
