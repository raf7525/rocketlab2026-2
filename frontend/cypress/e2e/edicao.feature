# language: pt
Funcionalidade: Atualizar e remover filmes
  Eu gostaria de poder remover e atualizar os filmes individualmente.

  Contexto:
    Dado que estou no catálogo
    Quando abro o filme "Oppenheimer"
    E abro a edição do filme

  Cenário: Atualizar o resumo de um filme
    Quando troco a sinopse por "Um físico lidera a criação da bomba atômica."
    E salvo as alterações
    E recarrego a página
    Então a página do filme mostra:
      | Um físico lidera a criação da bomba atômica. |

  Cenário: Remover um filme
    Quando removo o filme, confirmando a remoção
    Então estou no catálogo
    E o catálogo informa "27 filmes"
    Quando busco por "oppenheimer"
    Então vejo a mensagem "Nenhum filme encontrado."
