# language: pt
Funcionalidade: Média das avaliações
  Eu gostaria de poder ver a média geral das avaliações de cada filme.

  Cenário: A média é recalculada com uma avaliação nova
    Dado que estou no catálogo
    Então o card de "Heat" mostra a nota média "3,5"
    Quando abro o filme "Heat"
    E publico a avaliação de "Fábio" com 5 estrelas e a resenha "Obra-prima."
    Então o card de "Heat" mostra a nota média "4,0"
    Quando abro o filme "Heat"
    Então a página do filme mostra a nota média "4,0" com "3 avaliações"
