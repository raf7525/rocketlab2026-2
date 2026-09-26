# language: pt
Funcionalidade: Catálogo paginado
  Eu gostaria de poder navegar em um catálogo paginado com todos os filmes cadastrados.

  Cenário: Navegar entre as páginas do catálogo
    Dado que estou no catálogo
    Então o catálogo informa "28 filmes"
    E o catálogo informa "Página 1 de 2"
    E a página tem 24 filmes, começando por "The Matrix"
    Quando vou para a próxima página
    Então o catálogo informa "Página 2 de 2"
    E a página tem 4 filmes, terminando em "Filme de Arquivo 01"
