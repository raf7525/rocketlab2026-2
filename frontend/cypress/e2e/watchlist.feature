# language: pt
Funcionalidade: Watchlist
  Além das histórias do desafio: guardar filmes para assistir depois.

  Cenário: Guardar e tirar um filme da watchlist
    Dado que estou no catálogo
    Quando salvo o filme "Heat" na watchlist
    E abro a watchlist
    E recarrego a página
    Então a watchlist mostra só os filmes:
      | Heat |
    Quando tiro o filme "Heat" da watchlist
    E recarrego a página
    Então vejo a mensagem "Nenhum filme na watchlist ainda."
