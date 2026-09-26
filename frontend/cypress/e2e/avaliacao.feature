# language: pt
Funcionalidade: Avaliar filmes
  Eu gostaria de poder adicionar uma nova avaliação a um filme
  (ex: nota de 1 a 5 estrelas e uma resenha em texto).

  Cenário: Publicar uma avaliação com nota e resenha
    Dado que estou no catálogo
    Quando abro o filme "John Wick"
    E publico a avaliação de "Eva" com 4 estrelas e a resenha "Ação do começo ao fim."
    Então estou no catálogo
    Quando abro o filme "John Wick"
    Então as avaliações do filme são:
      | Eva | 4 de 5 estrelas | Ação do começo ao fim. |
