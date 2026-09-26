// Gerado a partir dos CSVs (dim_movies, dim_genres, dim_people, bridge_movie_genre,
// bridge_movie_person, movies_reviews): os 48 filmes mais populares com pôster, com gêneros e
// diretores. As curtidas NÃO existem no CSV; os valores aqui são inventados (determinísticos)
// só para os dados de exemplo.
import type { MovieRow, ReviewRow } from './db'

export const movieRows: MovieRow[] = [
  {
    "sk_movie_id": "2db072c832df9fcb29f6550fff1899d1b71a1c330ac112d914469a6f53325835",
    "titulo": "Gran Turismo",
    "data_lancamento": "2023-08-09",
    "ano_lancamento": 2023,
    "duracao_minutos": 135,
    "status_filme": "Lançado",
    "sinopse": "The ultimate wish-fulfillment tale of a teenage Gran Turismo player whose gaming skills won him a series of Nissan competitions to become an actual professional racecar driver.",
    "url_poster": "https://image.tmdb.org/t/p/w500/51tqzRtKMMZEYUpSYkrUE7v9ehm.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/xFYpUmB01nswPgbzi8EOCT1ZYFu.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Drama"
    ],
    "diretores": [
      "Neill Blomkamp"
    ]
  },
  {
    "sk_movie_id": "c8a25452509bcfbb44f72237007b1b22331f86a3fb74d2659030c31f18963b8a",
    "titulo": "Meg 2: The Trench",
    "data_lancamento": "2023-08-02",
    "ano_lancamento": 2023,
    "duracao_minutos": 116,
    "status_filme": "Lançado",
    "sinopse": "An exploratory dive into the deepest depths of the ocean of a daring research team spirals into chaos when a malevolent mining operation threatens their mission and forces them into a high-stakes battle for survival.",
    "url_poster": "https://image.tmdb.org/t/p/w500/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg",
    "generos": [
      "Action",
      "Horror",
      "Science Fiction"
    ],
    "diretores": [
      "Ben Wheatley"
    ]
  },
  {
    "sk_movie_id": "8b8039e202fd1de2a49f18c987442a48c84ee5958f6ab5485176bd81475a64ba",
    "titulo": "Retribution",
    "data_lancamento": "2023-08-23",
    "ano_lancamento": 2023,
    "duracao_minutos": 91,
    "status_filme": "Lançado",
    "sinopse": "When a mysterious caller puts a bomb under his car seat, Matt Turner begins a high-speed chase across the city to complete a specific series of tasks. With his kids trapped in the back seat and a bomb that will explode if they get out of the car, a normal commute becomes a twisted game of life or death as Matt follows the stranger's increasingly dangerous instructions in a race against time to save his family.",
    "url_poster": "https://image.tmdb.org/t/p/w500/oUmmY7QWWn7OhKlcPOnirHJpP1F.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/iiXliCeykkzmJ0Eg9RYJ7F2CWSz.jpg",
    "generos": [
      "Action",
      "Crime",
      "Mystery",
      "Thriller"
    ],
    "diretores": [
      "Nimród Antal"
    ]
  },
  {
    "sk_movie_id": "2a033b9ef4f73c4edfd22226590995ef3772638df4fd5ba53a0458f0c0e771dd",
    "titulo": "Talk To Me",
    "data_lancamento": "2023-07-26",
    "ano_lancamento": 2023,
    "duracao_minutos": 95,
    "status_filme": "Lançado",
    "sinopse": "When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill, until one of them goes too far and unleashes terrifying supernatural forces.",
    "url_poster": "https://image.tmdb.org/t/p/w500/kdPMUMJzyYAc4roD52qavX0nLIC.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/iIvQnZyzgx9TkbrOgcXx0p7aLiq.jpg",
    "generos": [
      "Horror",
      "Thriller"
    ],
    "diretores": [
      "Danny Philippou",
      "Michael Philippou"
    ]
  },
  {
    "sk_movie_id": "7fc7a211d14b069b2aeb35c584e43ea713136175f83e87eee36a27c834985af8",
    "titulo": "Elemental",
    "data_lancamento": "2023-06-14",
    "ano_lancamento": 2023,
    "duracao_minutos": 102,
    "status_filme": "Lançado",
    "sinopse": "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy will discover something elemental: how much they have in common.",
    "url_poster": "https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/4fLZUr1e65hKPPVw0R3PmKFKxj1.jpg",
    "generos": [
      "Animation",
      "Comedy",
      "Family",
      "Fantasy",
      "Romance"
    ],
    "diretores": [
      "Peter Sohn"
    ]
  },
  {
    "sk_movie_id": "6676c104eb3a2ae694113b27dc777711f84d1bb6c2737cc5c20408fe8868d84c",
    "titulo": "Operation Napoleon",
    "data_lancamento": "2023-01-26",
    "ano_lancamento": 2023,
    "duracao_minutos": 112,
    "status_filme": "Lançado",
    "sinopse": "A modern-day lawyer is sucked into an international conspiracy after being accused of a murder she didn't commit. Her only chance of freedom lies in uncovering the secret of an old German WWII aeroplane, long buried deep beneath the ice, before the CIA.",
    "url_poster": "https://image.tmdb.org/t/p/w500/j2Or0w69bpPXrmkE0hpTzw6hzsr.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/oghHR3X0hIcvs7xqyoFjA0GAZWn.jpg",
    "generos": [
      "Thriller"
    ],
    "diretores": [
      "Óskar Thór Axelsson"
    ]
  },
  {
    "sk_movie_id": "cfcdbf275b01e4f22fac359bcb6d36ed34f2f66d6be9fa58942aeb5d74bb9928",
    "titulo": "No One Will Save You",
    "data_lancamento": "2023-09-22",
    "ano_lancamento": 2023,
    "duracao_minutos": 93,
    "status_filme": "Lançado",
    "sinopse": "An exiled anxiety-ridden homebody must battle an alien who's found its way into her home.",
    "url_poster": "https://image.tmdb.org/t/p/w500/ehGIDAMaYy6Eg0o8ga0oqflDjqW.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/zYlgqIpqJ1VAbvFhRhktAzIybVs.jpg",
    "generos": [
      "Horror",
      "Science Fiction",
      "Thriller"
    ],
    "diretores": [
      "Brian Duffield"
    ]
  },
  {
    "sk_movie_id": "c37f4c048f32301cea41998e2c1cc8639bfaa13faa700438fa6a516c2d2eddf8",
    "titulo": "Saw X",
    "data_lancamento": "2023-09-26",
    "ano_lancamento": 2023,
    "duracao_minutos": 118,
    "status_filme": "Lançado",
    "sinopse": "Between the events of 'Saw' and 'Saw II', a sick and desperate John Kramer travels to Mexico for a risky and experimental medical procedure in hopes of a miracle cure for his cancer, only to discover the entire operation is a scam to defraud the most vulnerable. Armed with a newfound purpose, the infamous serial killer returns to his work, turning the tables on the con artists in his signature visceral way through devious, deranged, and ingenious traps.",
    "url_poster": "https://image.tmdb.org/t/p/w500/aQPeznSu7XDTrrdCtT5eLiu52Yu.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/9b3uxqcjkmay20EBZZj1KVow0r5.jpg",
    "generos": [
      "Crime",
      "Horror",
      "Thriller"
    ],
    "diretores": [
      "Kevin Greutert"
    ]
  },
  {
    "sk_movie_id": "ca2ec36c7dccdb482495272399292c388fcd2930dd430c1834cdbb8eefc46cfa",
    "titulo": "Teenage Mutant Ninja Turtles: Mutant Mayhem",
    "data_lancamento": "2023-07-31",
    "ano_lancamento": 2023,
    "duracao_minutos": 100,
    "status_filme": "Lançado",
    "sinopse": "After years of being sheltered from the human world, the Turtle brothers set out to win the hearts of New Yorkers and be accepted as normal teenagers through heroic acts. Their new friend April O'Neil helps them take on a mysterious crime syndicate, but they soon get in over their heads when an army of mutants is unleashed upon them.",
    "url_poster": "https://image.tmdb.org/t/p/w500/ueO9MYIOHO7M1PiMUeX74uf8fB9.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/w2nFc2Rsm93PDkvjY4LTn17ePO0.jpg",
    "generos": [
      "Action",
      "Animation",
      "Comedy"
    ],
    "diretores": [
      "Jeff Rowe",
      "Kyler Spears"
    ]
  },
  {
    "sk_movie_id": "1718cc85c038a1c627f754832f209853abb8c16d5b21b26d81c14e868433dc6c",
    "titulo": "Expend4bles",
    "data_lancamento": "2023-09-15",
    "ano_lancamento": 2023,
    "duracao_minutos": 103,
    "status_filme": "Lançado",
    "sinopse": "Sem descrição",
    "url_poster": "https://image.tmdb.org/t/p/w500/nbrqj9q8WubD3QkYm7n3GhjN7kE.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/rMvPXy8PUjj1o8o1pzgQbdNCsvj.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Thriller"
    ],
    "diretores": [
      "Scott Waugh"
    ]
  },
  {
    "sk_movie_id": "b34a3e9668e28dfb073718397f0b098ee336b9ee86bb59c25be3b6afe4b00ff3",
    "titulo": "The Flash",
    "data_lancamento": "2023-06-13",
    "ano_lancamento": 2023,
    "duracao_minutos": 144,
    "status_filme": "Lançado",
    "sinopse": "When his attempt to save his family inadvertently alters the future, Barry Allen becomes trapped in a reality in which General Zod has returned and there are no Super Heroes to turn to. In order to save the world that he is in and return to the future that he knows, Barry's only hope is to race for his life. But will making the ultimate sacrifice be enough to reset the universe?",
    "url_poster": "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/yF1eOkaYvwiORauRCPWznV9xVvi.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Science Fiction"
    ],
    "diretores": [
      "Andy Muschietti"
    ]
  },
  {
    "sk_movie_id": "dce1d60c460b4f87622c365aa4c278097567961529c4c176d152b908a8e8372d",
    "titulo": "Freestyle",
    "data_lancamento": "2023-09-13",
    "ano_lancamento": 2023,
    "duracao_minutos": 88,
    "status_filme": "Lançado",
    "sinopse": "Trying to check out a recording from his debut album, a street rapper and his friend run into trouble when a major drug deal turns into a total disaster for them.",
    "url_poster": "https://image.tmdb.org/t/p/w500/hNPJzlPlIVgTAjb2Mgqwl1QqydK.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/xsnpgM2Si1hG7daLP1XE7uAfKKH.jpg",
    "generos": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "diretores": []
  },
  {
    "sk_movie_id": "45e4b17aa16e19ce8ccb5263bccea9f0fdff94b650b6da583ffa2991d93ab27c",
    "titulo": "The Nun",
    "data_lancamento": "2018-09-05",
    "ano_lancamento": 2018,
    "duracao_minutos": 96,
    "status_filme": "Lançado",
    "sinopse": "Sem descrição",
    "url_poster": "https://image.tmdb.org/t/p/w500/sFC1ElvoKGdHJIWRpNB3xWJ9lJA.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/fgsHxz21B27hOOqQBiw9L6yWcM7.jpg",
    "generos": [
      "Horror",
      "Mystery",
      "Thriller"
    ],
    "diretores": [
      "Corin Hardy"
    ]
  },
  {
    "sk_movie_id": "ec9ce84c5bb073e5dfd49022ae5d7d7712ad269553cdf68816243b13742dff3b",
    "titulo": "The Little Mermaid",
    "data_lancamento": "2023-05-18",
    "ano_lancamento": 2023,
    "duracao_minutos": 135,
    "status_filme": "Lançado",
    "sinopse": "The youngest of King Triton’s daughters, and the most defiant, Ariel longs to find out more about the world beyond the sea, and while visiting the surface, falls for the dashing Prince Eric. With mermaids forbidden to interact with humans, Ariel makes a deal with the evil sea witch, Ursula, which gives her a chance to experience life on land, but ultimately places her life – and her father’s crown – in jeopardy.",
    "url_poster": "https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/7VEUOEfRzzrQfWddlIyLUKvh6Nf.jpg",
    "generos": [
      "Adventure",
      "Family",
      "Fantasy",
      "Romance"
    ],
    "diretores": [
      "Rob Marshall"
    ]
  },
  {
    "sk_movie_id": "d3a54ba9fac409e622441e01278dd8c212dffd47551845d217e1c82c838cf0f1",
    "titulo": "Viking: Bloodlust",
    "data_lancamento": "2023-04-21",
    "ano_lancamento": 2023,
    "duracao_minutos": 82,
    "status_filme": "Lançado",
    "sinopse": "A band of vikings are on the run from a blood thirsty group of Berserkers who want to fight to the death.",
    "url_poster": "https://image.tmdb.org/t/p/w500/xveBJmViwHdgjH3UQQmImkHOW7B.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/vMJb1D40wQNbTveNVFpNbo12faA.jpg",
    "generos": [
      "Action",
      "History"
    ],
    "diretores": [
      "Greg Keith"
    ]
  },
  {
    "sk_movie_id": "bcaeaf475cc88f1c84c694c2aad489353044fa8dd91b8e0b0e4e3c3a0da5f161",
    "titulo": "Ruby Gillman, Teenage Kraken",
    "data_lancamento": "2023-06-28",
    "ano_lancamento": 2023,
    "duracao_minutos": 91,
    "status_filme": "Lançado",
    "sinopse": "Ruby Gillman, a sweet and awkward high school student, discovers she's a direct descendant of the warrior kraken queens. The kraken are sworn to protect the oceans of the world against the vain, power-hungry mermaids. Destined to inherit the throne from her commanding grandmother, Ruby must use her newfound powers to protect those she loves most.",
    "url_poster": "https://image.tmdb.org/t/p/w500/kgrLpJcLBbyhWIkK7fx1fM4iSvf.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/f7UI3dYpr7ZUHGo0iIr1Qvy1VPe.jpg",
    "generos": [
      "Animation",
      "Comedy",
      "Family",
      "Fantasy"
    ],
    "diretores": [
      "Faryn Pearl",
      "Kirk Demicco"
    ]
  },
  {
    "sk_movie_id": "38bc108d301a55d3ed52366abc758ed57bd60164de61d1fbb8c13e5c05991c36",
    "titulo": "The Last Voyage Of The Demeter",
    "data_lancamento": "2023-08-09",
    "ano_lancamento": 2023,
    "duracao_minutos": 119,
    "status_filme": "Lançado",
    "sinopse": "The crew of the merchant ship Demeter attempts to survive the ocean voyage from Carpathia to London as they are stalked each night by a merciless presence onboard the ship.",
    "url_poster": "https://image.tmdb.org/t/p/w500/nrtbv6Cew7qC7k9GsYSf5uSmuKh.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/qEm4FrkGh7kGoEiBOyGYNielYVc.jpg",
    "generos": [
      "Horror",
      "Thriller"
    ],
    "diretores": [
      "André Øvredal"
    ]
  },
  {
    "sk_movie_id": "89a2e69f0c25bf0fb529cecae786a5391c9cd5827d98e81e63c6565bfb8a4dae",
    "titulo": "Amigos",
    "data_lancamento": "2023-02-10",
    "ano_lancamento": 2023,
    "duracao_minutos": 137,
    "status_filme": "Lançado",
    "sinopse": "Siddharth, a youngman who runs a family business is astonished to find his doppelgängers Manjunath and Michael on getdopple.com. After meeting up in Goa, they come down to Hyderabad to help Siddarth win over Ishika, a girl looking for superman to be her husband. But things take a drastic turn when NIA swings into action to nab Michael, aka Bipin Roy.",
    "url_poster": "https://image.tmdb.org/t/p/w500/mhPhEvh2ffBdbgiSIjrlkqAGwNH.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/2wUJGxE43jhTKpNMVbWEC2WNJjH.jpg",
    "generos": [
      "Action",
      "Thriller"
    ],
    "diretores": [
      "Rajendra Reddy"
    ]
  },
  {
    "sk_movie_id": "474a6236ce029cead1f3e2e2c01fcce6252081211d03cd0b9903002c304a4d28",
    "titulo": "Special Delivery",
    "data_lancamento": "2022-01-12",
    "ano_lancamento": 2022,
    "duracao_minutos": 109,
    "status_filme": "Lançado",
    "sinopse": "A black-market cabbie drives criminals at breakneck speeds until she is left in charge of a fugitive's son.",
    "url_poster": "https://image.tmdb.org/t/p/w500/iFUBAfMDlFOck29BEwS1awH5TB3.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/3mYCjwll5RG342Dz1f8HcnT8tV.jpg",
    "generos": [
      "Action",
      "Crime"
    ],
    "diretores": [
      "Dae-min Park"
    ]
  },
  {
    "sk_movie_id": "08933266212af9c00d9c86ac7f1ae459387cc3724ccc4805595005b57ba07d80",
    "titulo": "Resident Evil: Death Island",
    "data_lancamento": "2023-06-22",
    "ano_lancamento": 2023,
    "duracao_minutos": 91,
    "status_filme": "Lançado",
    "sinopse": "In San Francisco, Jill Valentine is dealing with a zombie outbreak and a new T-Virus, Leon Kennedy is on the trail of a kidnapped DARPA scientist, and Claire Redfield is investigating a monstrous fish that is killing whales in the bay. Joined by Chris Redfield and Rebecca Chambers, they discover the trail of clues from their separate cases all converge on the same location, Alcatraz Island, where a new evil has taken residence and awaits their arrival.",
    "url_poster": "https://image.tmdb.org/t/p/w500/qayga07ICNDswm0cMJ8P3VwklFZ.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/7drO1kYgQ0PnnU87sAnBEphYrSM.jpg",
    "generos": [
      "Action",
      "Animation",
      "Horror"
    ],
    "diretores": []
  },
  {
    "sk_movie_id": "075ecd341cec10fdee945bc0ebc139dab8e5084935634db2268800b98e147354",
    "titulo": "Murder City",
    "data_lancamento": "2023-06-29",
    "ano_lancamento": 2023,
    "duracao_minutos": 85,
    "status_filme": "Lançado",
    "sinopse": "A disgraced former cop finds himself working for a ruthless female kingpin to pay off his estranged father’s debt and protect his family.",
    "url_poster": "https://image.tmdb.org/t/p/w500/gZ1YbdkwyTCmVxZxh1otFnMEnOs.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/j7FwgVFjpsToIJ5Lt5y2K4N5pKm.jpg",
    "generos": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "diretores": [
      "Michael D. Olmos"
    ]
  },
  {
    "sk_movie_id": "b0756ef444af34f47eccf7368f97b0dade5dfa03d39153b515b8834e3f5c2e7d",
    "titulo": "Mob Land",
    "data_lancamento": "2023-08-04",
    "ano_lancamento": 2023,
    "duracao_minutos": 111,
    "status_filme": "Lançado",
    "sinopse": "A sheriff tries to keep the peace when a desperate family man violently robs a pill mill with his brother-in-law, alerting an enforcer for the New Orleans mafia.",
    "url_poster": "https://image.tmdb.org/t/p/w500/mcz8oi9oCgq1wkA3Wz2kluE94pE.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/3mrli3xsGrAieQks7KsBUm2LpCg.jpg",
    "generos": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "diretores": [
      "Nicholas Maggio"
    ]
  },
  {
    "sk_movie_id": "e599d61c7253f59876cae297e77125f32fe800961e2e6c99dfcff902b7faf5f5",
    "titulo": "Scream Vi",
    "data_lancamento": "2023-03-08",
    "ano_lancamento": 2023,
    "duracao_minutos": 123,
    "status_filme": "Lançado",
    "sinopse": "Following the latest Ghostface killings, the four survivors leave Woodsboro behind and start a fresh chapter.",
    "url_poster": "https://image.tmdb.org/t/p/w500/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    "generos": [
      "Crime",
      "Horror",
      "Thriller"
    ],
    "diretores": [
      "Matt Bettinelli-olpin",
      "Tyler Gillett"
    ]
  },
  {
    "sk_movie_id": "548c1314f00c65613828ab8591826c531942145cbb6ba6096e65be74ae22847b",
    "titulo": "Paydirt",
    "data_lancamento": "2020-08-07",
    "ano_lancamento": 2020,
    "duracao_minutos": 81,
    "status_filme": "Lançado",
    "sinopse": "A parolee teams up with his old crew determined to find a buried bag of cash stolen a decade ago from a DEA bust gone bad, while being tracked by a retired Sheriff.",
    "url_poster": "https://image.tmdb.org/t/p/w500/jAGGV80ZO10YcmUJXK7YSBh1yvK.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/cStOy6KckiZjxZJStHiCCHNRW9t.jpg",
    "generos": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "diretores": [
      "Christian Sesma"
    ]
  },
  {
    "sk_movie_id": "3fa1ac70ce14b1015d8ccf54b90ca702a727fe2888c524483d364b3c5a223aed",
    "titulo": "Puss In Boots: The Last Wish",
    "data_lancamento": "2022-12-07",
    "ano_lancamento": 2022,
    "duracao_minutos": 103,
    "status_filme": "Lançado",
    "sinopse": "Puss in Boots discovers that his passion for adventure has taken its toll: He has burned through eight of his nine lives, leaving him with only one life left. Puss sets out on an epic journey to find the mythical Last Wish and restore his nine lives.",
    "url_poster": "https://image.tmdb.org/t/p/w500/kuf6dutpsT0vSVehic3EZIqkOBt.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/b1Y8SUb12gPHCSSSNlbX4nB3IKy.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Family",
      "Fantasy"
    ],
    "diretores": [
      "Januel Mercado",
      "Joel Crawford"
    ]
  },
  {
    "sk_movie_id": "a9215aa5900d333f4bf3f4ecebdc01e3714d476e1b5db131245e724f1ee1c722",
    "titulo": "Paw Patrol: The Movie",
    "data_lancamento": "2021-08-09",
    "ano_lancamento": 2021,
    "duracao_minutos": 86,
    "status_filme": "Lançado",
    "sinopse": "Ryder and the pups are called to Adventure City to stop Mayor Humdinger from turning the bustling metropolis into a state of chaos.",
    "url_poster": "https://image.tmdb.org/t/p/w500/ic0intvXZSfBlYPIvWXpU1ivUCO.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/a17F3zXnmuwqxfiDa46mtlosjrv.jpg",
    "generos": [
      "Adventure",
      "Animation",
      "Comedy",
      "Family"
    ],
    "diretores": [
      "Cal Brunker"
    ]
  },
  {
    "sk_movie_id": "c5e04894b4437cb67d5c34b704ee9ff4134216f1571ac73805e88b84bb7231de",
    "titulo": "Miraculous: Ladybug & Cat Noir, The Movie",
    "data_lancamento": "2023-07-05",
    "ano_lancamento": 2023,
    "duracao_minutos": 107,
    "status_filme": "Lançado",
    "sinopse": "A life of an ordinary Parisian teenager Marinette goes superhuman when she becomes Ladybug. Bestowed with magical powers of creation, Ladybug must unite with her opposite, Cat Noir, to save Paris as a new villain unleashes chaos unto the city.",
    "url_poster": "https://image.tmdb.org/t/p/w500/dQNJ8SdCMn3zWwHzzQD2xrphR1X.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/iEFuHjqrE059SmflBva1JzDJutE.jpg",
    "generos": [
      "Action",
      "Animation",
      "Comedy",
      "Family",
      "Fantasy",
      "Music",
      "Romance"
    ],
    "diretores": [
      "Jeremy Zag"
    ]
  },
  {
    "sk_movie_id": "469967e593a14497ab87380a7fb0a010ed92c93c06ccbe63934fe0216341a965",
    "titulo": "Cobweb",
    "data_lancamento": "2023-07-19",
    "ano_lancamento": 2023,
    "duracao_minutos": 88,
    "status_filme": "Lançado",
    "sinopse": "Sem descrição",
    "url_poster": "https://image.tmdb.org/t/p/w500/cGXFosYUHYjjdKrOmA0bbjvzhKz.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/nYDPmxvl0if5vHBBp7pDYGkTFc7.jpg",
    "generos": [
      "Horror"
    ],
    "diretores": [
      "Samuel Bodin"
    ]
  },
  {
    "sk_movie_id": "acf6aa0dd4d1ad01ac45de07980fa327df24849b3b2c65cd61e8e99ac45e76b2",
    "titulo": "Bjj: Woman On Top",
    "data_lancamento": "2023-09-29",
    "ano_lancamento": 2023,
    "duracao_minutos": 105,
    "status_filme": "Lançado",
    "sinopse": "Elise learns the martial art and combat sport Brazilian Jiu Jitsu to learn to defend herself, but she soon realizes that BJJ moves can also be used in passionate lovemaking.",
    "url_poster": "https://image.tmdb.org/t/p/w500/ucul7rTMnsMy9lOOf3I9dWnJt08.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/r9S8NeS9iTQalegyHiYmkA1byQX.jpg",
    "generos": [
      "Romance"
    ],
    "diretores": [
      "Linnet Zurbano"
    ]
  },
  {
    "sk_movie_id": "87590e8c82258be0adcf904ed3c7d8bd139adb54dbf26e1a66b2b1a632ee73d6",
    "titulo": "Spiral: From The Book Of Saw",
    "data_lancamento": "2021-05-12",
    "ano_lancamento": 2021,
    "duracao_minutos": 93,
    "status_filme": "Lançado",
    "sinopse": "Working in the shadow of an esteemed police veteran, brash Detective Ezekiel “Zeke” Banks and his rookie partner take charge of a grisly investigation into murders that are eerily reminiscent of the city’s gruesome past.  Unwittingly entrapped in a deepening mystery, Zeke finds himself at the center of the killer’s morbid game.",
    "url_poster": "https://image.tmdb.org/t/p/w500/qkl6mRoFexK2FGWCbAsvrRxjWaF.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/g15PR8eQV9DehSWlagvdnJZqoRq.jpg",
    "generos": [
      "Crime",
      "Horror",
      "Mystery"
    ],
    "diretores": [
      "Darren Lynn Bousman"
    ]
  },
  {
    "sk_movie_id": "5a246bc3bcacbfc050bc8c3964fb7a6eae304bce6c37a287bc2e012aa9e3102a",
    "titulo": "Goatman",
    "data_lancamento": "2023-04-17",
    "ano_lancamento": 2023,
    "duracao_minutos": 87,
    "status_filme": "Lançado",
    "sinopse": "A series of grisly murders point to the terrifying cryptid.",
    "url_poster": "https://image.tmdb.org/t/p/w500/85N39Re3qw8o52BcmnVlacVPyni.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/holtzVB17aoqCJlOiAXhKkCRhqj.jpg",
    "generos": [
      "Horror"
    ],
    "diretores": [
      "Trey Murphy"
    ]
  },
  {
    "sk_movie_id": "e0a37a8dba3fcfdc7f13db7488073a03c734d8a26babd1a2692f498ddcb48f45",
    "titulo": "El Conde",
    "data_lancamento": "2023-09-08",
    "ano_lancamento": 2023,
    "duracao_minutos": 112,
    "status_filme": "Lançado",
    "sinopse": "After living for over two centuries, Augusto Pinochet is a vampire ready to die… but the vultures around him won't let him go without one last bite.",
    "url_poster": "https://image.tmdb.org/t/p/w500/rxBe0Js4dCvp1ZGgHHnBxjtbGPw.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/n47trh6SChgncx2GUmwsvry6DLb.jpg",
    "generos": [
      "Comedy",
      "Fantasy",
      "Horror"
    ],
    "diretores": [
      "Pablo Larraín"
    ]
  },
  {
    "sk_movie_id": "87b77e112b47e75f6cd8e0e4d68fb6ad9641317524376247bee53123e3f31ea4",
    "titulo": "Knights Of The Zodiac",
    "data_lancamento": "2023-04-27",
    "ano_lancamento": 2023,
    "duracao_minutos": 113,
    "status_filme": "Lançado",
    "sinopse": "When a headstrong street orphan, Seiya, in search of his abducted sister unwittingly taps into hidden powers, he discovers he might be the only person alive who can protect a reincarnated goddess, sent to watch over humanity. Can he let his past go and embrace his destiny to become a Knight of the Zodiac?",
    "url_poster": "https://image.tmdb.org/t/p/w500/qW4crfED8mpNDadSmMdi7ZDzhXF.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/oqP1qEZccq5AD9TVTIaO6IGUj7o.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Fantasy"
    ],
    "diretores": [
      "Tomasz Bagiński"
    ]
  },
  {
    "sk_movie_id": "9feeb6211355c64d507ba546734870e7ca328dacaccf01f3ad685426dfa12361",
    "titulo": "Feed",
    "data_lancamento": "2022-10-28",
    "ano_lancamento": 2022,
    "duracao_minutos": 100,
    "status_filme": "Lançado",
    "sinopse": "A group of social media experts are hired to help an old family business to strive. But they soon find themselves stuck on a tiny island in a lake in which an ancient Swedish witch is said to live.",
    "url_poster": "https://image.tmdb.org/t/p/w500/4U7lZe2BcuWgUKSJih97XFOWjr5.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/1omLO5cfU8sYjm9xs9EwkyZkZ8l.jpg",
    "generos": [
      "Horror"
    ],
    "diretores": [
      "Johannes Persson"
    ]
  },
  {
    "sk_movie_id": "dbec1ced5d46027370ac9cf2fa9e35d3e02bbd46e892a8ba6963b42e5dd9b947",
    "titulo": "Evil Dead Rise",
    "data_lancamento": "2023-04-12",
    "ano_lancamento": 2023,
    "duracao_minutos": 96,
    "status_filme": "Lançado",
    "sinopse": "A reunion between two estranged sisters gets cut short by the rise of flesh-possessing demons, thrusting them into a primal battle for survival as they face the most nightmarish version of family imaginable.",
    "url_poster": "https://image.tmdb.org/t/p/w500/5ik4ATKmNtmJU6AYD0bLm56BCVM.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/7bWxAsNPv9CXHOhZbJVlj2KxgfP.jpg",
    "generos": [
      "Horror",
      "Thriller"
    ],
    "diretores": [
      "Lee Cronin"
    ]
  },
  {
    "sk_movie_id": "319d83deaf478e0d4d968057b258aad02146391dac1468e9f7a29346449f1360",
    "titulo": "The Squad: Home Run",
    "data_lancamento": "2023-08-25",
    "ano_lancamento": 2023,
    "duracao_minutos": 93,
    "status_filme": "Lançado",
    "sinopse": "Former Antigang legend Niels Cartier, known for his muscular and unconventional methods, left the force following an intervention that went wrong and led to the death of his wife. When the gang of bank robbers responsible for her death reappears eight years later, Niels won't let anyone stand in his way to seek revenge. Even if it means forming an explosive duo with his temperamental 14-year-old daughter.",
    "url_poster": "https://image.tmdb.org/t/p/w500/kGclAzPJobEy7qg7LNuFI9grNoh.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/dLLqS7Yr5Ie37iN845fdhdZRwgF.jpg",
    "generos": [
      "Action",
      "Drama"
    ],
    "diretores": [
      "Benjamin Rocher"
    ]
  },
  {
    "sk_movie_id": "e75a40f8fd71cae4157694fdea8e78af0a108ca3d14805cc6a6bc571b42d40e7",
    "titulo": "Mojave Diamonds",
    "data_lancamento": "2023-08-24",
    "ano_lancamento": 2023,
    "duracao_minutos": 100,
    "status_filme": "Lançado",
    "sinopse": "A former MMA fighter and his brothers must rescue their kidnapped family from a dangerous crime syndicate after $50M of illegal diamonds gets stolen.",
    "url_poster": "https://image.tmdb.org/t/p/w500/eauJLqzFy53KR86VNXnzz3wsD6w.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/dPagCvFuFWKEoEcjTGwwrdpdTPp.jpg",
    "generos": [
      "Action",
      "Crime",
      "Thriller"
    ],
    "diretores": [
      "Asif Akbar"
    ]
  },
  {
    "sk_movie_id": "de3297dbc63a88e339e878fccaae8eda825b7e20b0dbd4a1dba8eeb927ae3094",
    "titulo": "Justice League: Warworld",
    "data_lancamento": "2023-07-25",
    "ano_lancamento": 2023,
    "duracao_minutos": 90,
    "status_filme": "Lançado",
    "sinopse": "Until now, the Justice League has been a loose association of superpowered individuals. But when they are swept away to Warworld, a place of unending brutal gladiatorial combat, Batman, Superman, Wonder Woman and the others must somehow unite to form an unbeatable resistance able to lead an entire planet to freedom.",
    "url_poster": "https://image.tmdb.org/t/p/w500/pHdSS5G3wDwJp6jWgMpbSjNiTbr.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/kIMYSzp1fH1H9adKplekLD9BuNi.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Animation",
      "Science Fiction"
    ],
    "diretores": [
      "Jeff Wamester"
    ]
  },
  {
    "sk_movie_id": "28240e7baa1c8d2eb4e7270fb85cdb4067faff6b52f10db395452ae90bb644d5",
    "titulo": "Spider-man: No Way Home",
    "data_lancamento": "2021-12-15",
    "ano_lancamento": 2021,
    "duracao_minutos": 148,
    "status_filme": "Lançado",
    "sinopse": "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.",
    "url_poster": "https://image.tmdb.org/t/p/w500/5weKu49pzJCt06OPpjvT80efnQj.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    "generos": [
      "Action",
      "Adventure",
      "Science Fiction"
    ],
    "diretores": [
      "Jon Watts"
    ]
  },
  {
    "sk_movie_id": "f5135c8de4e6dfc3d9b9edd7e8257b1a6010b9a7a864b25031e42d6abea63ffc",
    "titulo": "Extraction 2",
    "data_lancamento": "2023-06-09",
    "ano_lancamento": 2023,
    "duracao_minutos": 123,
    "status_filme": "Lançado",
    "sinopse": "Tasked with extracting a family who is at the mercy of a Georgian gangster, Tyler Rake infiltrates one of the world's deadliest prisons in order to save them. But when the extraction gets hot, and the gangster dies in the heat of battle, his equally ruthless brother tracks down Rake and his team to Vienna, in order to get revenge.",
    "url_poster": "https://image.tmdb.org/t/p/w500/7gKI9hpEMcZUQpNgKrkDzJpbnNS.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/wRxLAw4l17LqiFcPLkobriPTZAw.jpg",
    "generos": [
      "Action",
      "Thriller"
    ],
    "diretores": [
      "Sam Hargrave"
    ]
  },
  {
    "sk_movie_id": "fc0777df4cc02f7e78f042b6746ff0c3572fcb773fbd199627bcbbbd59bf23c7",
    "titulo": "After Ever Happy",
    "data_lancamento": "2022-08-24",
    "ano_lancamento": 2022,
    "duracao_minutos": 95,
    "status_filme": "Lançado",
    "sinopse": "As a shocking truth about a couple's families emerges, the two lovers discover they are not so different from each other. Tessa is no longer the sweet, simple, good girl she was when she met Hardin — any more than he is the cruel, moody boy she fell so hard for.",
    "url_poster": "https://image.tmdb.org/t/p/w500/moogpu8rNkEjTgFyLXwhPghft5w.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/rwgmDkIEv8VjAsWx25ottJrFvpO.jpg",
    "generos": [
      "Drama",
      "Romance"
    ],
    "diretores": [
      "Castille Landon"
    ]
  },
  {
    "sk_movie_id": "c7ca3c542d7dd65217e792c7eda34e241e9f0ac965e8d68ebb2d1dd3078b4db1",
    "titulo": "Creed Iii",
    "data_lancamento": "2023-03-01",
    "ano_lancamento": 2023,
    "duracao_minutos": 116,
    "status_filme": "Lançado",
    "sinopse": "After dominating the boxing world, Adonis Creed has thrived in his career and family life. When a childhood friend and former boxing prodigy, Damian Anderson, resurfaces after serving a long sentence in prison, he is eager to prove that he deserves his shot in the ring. The face-off between former friends is more than just a fight. To settle the score, Adonis must put his future on the line to battle Damian — a fighter with nothing to lose.",
    "url_poster": "https://image.tmdb.org/t/p/w500/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/8QsVX5C82mT7bB5sVsjsLcerWQK.jpg",
    "generos": [
      "Action",
      "Drama"
    ],
    "diretores": []
  },
  {
    "sk_movie_id": "7a3431079560938fe6314f960d2ce9157225bddf9b92cb012b36d9d569eb2e59",
    "titulo": "Project Legion",
    "data_lancamento": "2022-10-07",
    "ano_lancamento": 2022,
    "duracao_minutos": 89,
    "status_filme": "Lançado",
    "sinopse": "A former marine awakens to an apocalyptic sight outside of his window and barricades himself from evil creatures that surround his apartment door and terrorize the city.",
    "url_poster": "https://image.tmdb.org/t/p/w500/vEfbuchWvISRpqwEUHoxwuxdF0O.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/rpMmmKi9M89DhX9F5QeEZBwHKFL.jpg",
    "generos": [
      "Horror",
      "Science Fiction",
      "Thriller"
    ],
    "diretores": []
  },
  {
    "sk_movie_id": "2e4fa7bd8acc7de44b294b2fcce1718ca43fc6aef1bede8d03adf11df68b871d",
    "titulo": "Shin Kamen Rider",
    "data_lancamento": "2023-03-17",
    "ano_lancamento": 2023,
    "duracao_minutos": 121,
    "status_filme": "Lançado",
    "sinopse": "A man forced to bear power and stripped of humanity. A woman skeptical of happiness. Takeshi Hongo, an Augmentation made by SHOCKER, and Ruriko Midorikawa, a rebel of the organization, escape while fighting off assassins. What’s justice? What’s evil? Will this violence end? Despite his power, Hongo tries to remain human. Along with freedom, Ruriko has regained a heart. What paths will they choose?",
    "url_poster": "https://image.tmdb.org/t/p/w500/9dTO2RygcDT0cQkawABw4QkDegN.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/ccFavvHGfhA5yI32K0bzDjlyKSN.jpg",
    "generos": [
      "Action",
      "Drama",
      "Science Fiction"
    ],
    "diretores": [
      "Hideaki Anno"
    ]
  },
  {
    "sk_movie_id": "26fc85d1526691e15e80642dd49aa9c68b4fa0be2ef1fac2604145e9ec7fd077",
    "titulo": "Killer Book Club",
    "data_lancamento": "2023-08-25",
    "ano_lancamento": 2023,
    "duracao_minutos": 89,
    "status_filme": "Lançado",
    "sinopse": "Eight horror-loving friends fight for their lives when a killer clown who seems to know the grim secret they share begins to pick them off, one by one.",
    "url_poster": "https://image.tmdb.org/t/p/w500/zZH0sAUV0nfEEDBUdWBMLjs2XnN.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/lEMO9pVODhiWLgJzuCaYlfJkdNz.jpg",
    "generos": [
      "Horror",
      "Thriller"
    ],
    "diretores": []
  },
  {
    "sk_movie_id": "94ac464ea33f7c9ce13b568a6bf1395ec904b7674bd02fc62d7bedf5190a4cb6",
    "titulo": "Bernie The Dolphin 2",
    "data_lancamento": "2019-12-17",
    "ano_lancamento": 2019,
    "duracao_minutos": 99,
    "status_filme": "Lançado",
    "sinopse": "The kids are thrilled that Bernie has come back. But so has their old enemy Winston, who's about to kidnap the talented dolphin. Kevin and Holly must rescue their splashy friend before it's too late.",
    "url_poster": "https://image.tmdb.org/t/p/w500/kuLyLn0bLCieQabdvGwFj0wV1Cz.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/5LDWmyVkxyNXOANFnbbrXJv4677.jpg",
    "generos": [
      "Adventure",
      "Comedy",
      "Family"
    ],
    "diretores": []
  },
  {
    "sk_movie_id": "90b2630391e03cb7b5aa6f9eecbd06348eceb91031c94af54ecc131f133b742d",
    "titulo": "Prey",
    "data_lancamento": "2022-08-02",
    "ano_lancamento": 2022,
    "duracao_minutos": 100,
    "status_filme": "Lançado",
    "sinopse": "When danger threatens her camp, the fierce and highly skilled Comanche warrior Naru sets out to protect her people. But the prey she stalks turns out to be a highly evolved alien predator with a technically advanced arsenal.",
    "url_poster": "https://image.tmdb.org/t/p/w500/ujr5pztc1oitbe7ViMUOilFaJ7s.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/7ZO9yoEU2fAHKhmJWfAc2QIPWJg.jpg",
    "generos": [
      "Action",
      "Science Fiction",
      "Thriller"
    ],
    "diretores": [
      "Dan Trachtenberg"
    ]
  },
  {
    "sk_movie_id": "274697cb2d2800354641dc2e3ba56b261f7a4d467c918e32152627eb3f231006",
    "titulo": "La Leyenda De Los Chaneques",
    "data_lancamento": "2023-07-14",
    "ano_lancamento": 2023,
    "duracao_minutos": 89,
    "status_filme": "Lançado",
    "sinopse": "Five years after giving up his powers and separating from his friends, Leo San Juan has started a new life trying to focus on his family and their bakery, staying away from danger and adventures. However, Leo knows that his plans are rarely fulfilled and this time is no exception: while traveling with Nando to Veracruz, things start to get weird, and from the depths of the Tuxtlas jungle, an ancient curse has returned and only Leo can face it.",
    "url_poster": "https://image.tmdb.org/t/p/w500/4f9ghI3utknpeBZSAzNuIKKATOA.jpg",
    "url_backdrop": "https://image.tmdb.org/t/p/w1280/A9vrM4JXuIWPDf7KJan9D3WfMIQ.jpg",
    "generos": [
      "Animation",
      "Comedy",
      "Family",
      "Horror"
    ],
    "diretores": [
      "Marvick Eduardo Núñez Aguilera"
    ]
  }
]

export const reviewRows: ReviewRow[] = [
  {
    "sk_movie_review_id": "de7681e33075a7c8eee238f65559ae1673f8e7596004f103e0c581a828c0c6d5",
    "sk_movie_id": "7a3431079560938fe6314f960d2ce9157225bddf9b92cb012b36d9d569eb2e59",
    "nome": "Beatriz Oliveira Freitas",
    "nota": 5.15,
    "comentario": "Foi razoável. Gostei de algumas partes mas outras não funcionaram.",
    "created_at": "2026-09-24T15:09:00.000000",
    "curtidas": 345
  },
  {
    "sk_movie_review_id": "2e3ee5d7c95089a49f8e3387d9ddb6f9fa18e74812409589a87d36ecff3a1ece",
    "sk_movie_id": "28240e7baa1c8d2eb4e7270fb85cdb4067faff6b52f10db395452ae90bb644d5",
    "nome": "Alice Martins Vieira",
    "nota": 2.1,
    "comentario": "Achei irregular e pouco envolvente.",
    "created_at": "2026-09-24T02:33:00.000000",
    "curtidas": 70
  },
  {
    "sk_movie_review_id": "b4d8dbaf994f0c0409a4cde4c97c73bf0c412c720d9686e6358bdee18fc142d4",
    "sk_movie_id": "e599d61c7253f59876cae297e77125f32fe800961e2e6c99dfcff902b7faf5f5",
    "nome": "Gabriela Moreira Vieira",
    "nota": 4.6,
    "comentario": "Tem qualidades e defeitos na mesma medida.",
    "created_at": "2026-09-24T01:05:00.000000",
    "curtidas": 4810
  },
  {
    "sk_movie_review_id": "50d10c8b950eef93beaad51b3f31df6dfeac2423455c38b269280733a63cce6d",
    "sk_movie_id": "469967e593a14497ab87380a7fb0a010ed92c93c06ccbe63934fe0216341a965",
    "nome": "Fábio Rodrigues",
    "nota": 6.5,
    "comentario": "Poderia ser melhor, mas não é ruim.",
    "created_at": "2026-09-23T21:25:00.000000",
    "curtidas": 6279
  },
  {
    "sk_movie_review_id": "e4c6d6e5678383ac38420538ab1566749050771dbe98194ee71e935b6625dd1b",
    "sk_movie_id": "cfcdbf275b01e4f22fac359bcb6d36ed34f2f66d6be9fa58942aeb5d74bb9928",
    "nome": "Rafael Rocha",
    "nota": 3.4,
    "comentario": "Decepcionante, esperava muito mais.",
    "created_at": "2026-09-23T13:31:00.000000",
    "curtidas": 60
  },
  {
    "sk_movie_review_id": "c0ed262919b4eb25b0f496560c7f3ce6bd49e72bc1ab81753db8c505faee4aa6",
    "sk_movie_id": "e75a40f8fd71cae4157694fdea8e78af0a108ca3d14805cc6a6bc571b42d40e7",
    "nome": "Juliana Gomes",
    "nota": 7.7,
    "comentario": "Legal! Uma boa opção para o fim de semana.",
    "created_at": "2026-09-20T10:47:00.000000",
    "curtidas": 450
  },
  {
    "sk_movie_review_id": "af2435614a6d4726a1be625ec2522f8d0820ea72a2bd6bb66b32c9d77abcdd7f",
    "sk_movie_id": "b0756ef444af34f47eccf7368f97b0dade5dfa03d39153b515b8834e3f5c2e7d",
    "nome": "Eduardo Alves",
    "nota": 0.6,
    "comentario": "Que filme ruim, não assistam.",
    "created_at": "2026-09-19T19:59:00.000000",
    "curtidas": 276
  },
  {
    "sk_movie_review_id": "c8bbcc3edaacc8582c5a8116f6c75b11051efbe37363f455318ae4584a5200b0",
    "sk_movie_id": "2a033b9ef4f73c4edfd22226590995ef3772638df4fd5ba53a0458f0c0e771dd",
    "nome": "Vanessa Carvalho",
    "nota": 7.5,
    "comentario": "Muito bom! Vale a pena assistir.",
    "created_at": "2026-09-19T17:22:00.000000",
    "curtidas": 220
  },
  {
    "sk_movie_review_id": "c09ac6d858f7ac92b52df5f8e31a5d6e096515b82cbc1ee2c52598ae4aaf337c",
    "sk_movie_id": "dce1d60c460b4f87622c365aa4c278097567961529c4c176d152b908a8e8372d",
    "nome": "Letícia Ferreira",
    "nota": 4.2,
    "comentario": "Fraco, não recomendo.",
    "created_at": "2026-09-19T07:20:00.000000",
    "curtidas": 3276
  },
  {
    "sk_movie_review_id": "4599c3b1541a6a80c8f3fed6fa8abf87c9b5393c6cab75d820284e7f183555b6",
    "sk_movie_id": "c5e04894b4437cb67d5c34b704ee9ff4134216f1571ac73805e88b84bb7231de",
    "nome": "Natália Fernandes",
    "nota": 0.6,
    "comentario": "Péssimo em todos os sentidos.",
    "created_at": "2026-09-19T05:51:00.000000",
    "curtidas": 282
  },
  {
    "sk_movie_review_id": "9e93bbe19ab914f37398516ac0f0412d97dff048a867500185d63bfa77d8dc41",
    "sk_movie_id": "c37f4c048f32301cea41998e2c1cc8639bfaa13faa700438fa6a516c2d2eddf8",
    "nome": "Pedro Ferreira",
    "nota": 3.8,
    "comentario": "Ruim, não vale o tempo investido.",
    "created_at": "2026-09-18T13:03:00.000000",
    "curtidas": 320
  },
  {
    "sk_movie_review_id": "7a3a240ce016559c90f52aa427b5dd40f9126d85195024cad79b3959f12c98bd",
    "sk_movie_id": "6676c104eb3a2ae694113b27dc777711f84d1bb6c2737cc5c20408fe8868d84c",
    "nome": "Ana Monteiro Xavier",
    "nota": 1.6,
    "comentario": "Quase nada funcionou para mim neste filme.",
    "created_at": "2026-09-16T10:12:00.000000",
    "curtidas": 102
  },
  {
    "sk_movie_review_id": "552d384bd248d00998522f907cf5b423505148fdbd50890879c349402ecad3b7",
    "sk_movie_id": "c7ca3c542d7dd65217e792c7eda34e241e9f0ac965e8d68ebb2d1dd3078b4db1",
    "nome": "Vanessa Alves",
    "nota": 1.9,
    "comentario": "Horrível! Perda de tempo.",
    "created_at": "2026-09-15T17:09:00.000000",
    "curtidas": 576
  },
  {
    "sk_movie_review_id": "f3483277f9a37f8f2ba74b5bcf18b78b468c143c2f39711da261dbdc70630f11",
    "sk_movie_id": "474a6236ce029cead1f3e2e2c01fcce6252081211d03cd0b9903002c304a4d28",
    "nome": "Fábio Ferreira Farias",
    "nota": 3.6,
    "comentario": "Há pontos positivos mas eles não compensam os problemas.",
    "created_at": "2026-09-14T12:41:00.000000",
    "curtidas": 651
  },
  {
    "sk_movie_review_id": "9019479469addea72e485041cffeae11ea96dfa4387bf23a8a3a6ce26ca899a0",
    "sk_movie_id": "bcaeaf475cc88f1c84c694c2aad489353044fa8dd91b8e0b0e4e3c3a0da5f161",
    "nome": "Marta Barbosa Duarte",
    "nota": 8.5,
    "comentario": "Gostei muito da sessão e o filme superou minhas expectativas.",
    "created_at": "2026-09-13T09:32:00.000000",
    "curtidas": 56
  },
  {
    "sk_movie_review_id": "e226138917dcdec4e389198809f9270c32fcadb0e0ddb5520db891e2ca7fa692",
    "sk_movie_id": "fc0777df4cc02f7e78f042b6746ff0c3572fcb773fbd199627bcbbbd59bf23c7",
    "nome": "Marcelo Costa Vieira",
    "nota": 4.0,
    "comentario": "Um filme mediano que entretém em certos momentos.",
    "created_at": "2026-09-11T18:15:00.000000",
    "curtidas": 780
  },
  {
    "sk_movie_review_id": "6243eb9e358d7f2862ec75fe419253db0342072724c463b0523022e81a62caae",
    "sk_movie_id": "ca2ec36c7dccdb482495272399292c388fcd2930dd430c1834cdbb8eefc46cfa",
    "nome": "Renata Gomes",
    "nota": 6.2,
    "comentario": "Mediano, tem seus momentos mas nada demais.",
    "created_at": "2026-09-11T14:42:00.000000",
    "curtidas": 93
  },
  {
    "sk_movie_review_id": "96a4f84ce1eaade58f6fac492978688913299ab7ff8fe27908f57c3f31eefb8a",
    "sk_movie_id": "b34a3e9668e28dfb073718397f0b098ee336b9ee86bb59c25be3b6afe4b00ff3",
    "nome": "Paulo Oliveira Carvalho",
    "nota": 3.1,
    "comentario": "Há pontos positivos mas eles não compensam os problemas.",
    "created_at": "2026-09-10T20:52:00.000000",
    "curtidas": 602
  },
  {
    "sk_movie_review_id": "385532df3ee8c7c52129e698f80a876452adf286034901b750382f751c1b739e",
    "sk_movie_id": "d3a54ba9fac409e622441e01278dd8c212dffd47551845d217e1c82c838cf0f1",
    "nome": "Marcelo Monteiro",
    "nota": 9.1,
    "comentario": "Obra-prima do cinema, simplesmente espetacular.",
    "created_at": "2026-09-10T17:21:00.000000",
    "curtidas": 78
  },
  {
    "sk_movie_review_id": "d611e3ce4d49c00ebc9e04836e3d9cd1027c20281958a3ed5ac605567bc4e0f0",
    "sk_movie_id": "2e4fa7bd8acc7de44b294b2fcce1718ca43fc6aef1bede8d03adf11df68b871d",
    "nome": "Tatiana Nascimento",
    "nota": 5.4,
    "comentario": "Mediano, tem seus momentos mas nada demais.",
    "created_at": "2026-09-10T14:26:00.000000",
    "curtidas": 340
  },
  {
    "sk_movie_review_id": "df150727321ad98bd22144f3c631f57ee8ad664e5eced09dfe1208189221e589",
    "sk_movie_id": "26fc85d1526691e15e80642dd49aa9c68b4fa0be2ef1fac2604145e9ec7fd077",
    "nome": "Ana Rocha Castro",
    "nota": 6.9,
    "comentario": "Uma boa experiência que me manteve interessado.",
    "created_at": "2026-09-10T04:25:00.000000",
    "curtidas": 3952
  },
  {
    "sk_movie_review_id": "2f8b6f75edb3bea5cb59b6fc145b1e56c1fa04e06866554ca99f729a22388c47",
    "sk_movie_id": "548c1314f00c65613828ab8591826c531942145cbb6ba6096e65be74ae22847b",
    "nome": "Pedro Alves",
    "nota": 9.1,
    "comentario": "Adorei cada minuto, uma experiência inesquecível.",
    "created_at": "2026-09-09T22:51:00.000000",
    "curtidas": 40
  },
  {
    "sk_movie_review_id": "cc1250bc4d3816db261faa41c0595c9de1e342e9f3cba6b94a1df3691941f140",
    "sk_movie_id": "2a033b9ef4f73c4edfd22226590995ef3772638df4fd5ba53a0458f0c0e771dd",
    "nome": "Rodrigo Rocha",
    "nota": 1.1,
    "comentario": "Não recomendo de jeito nenhum.",
    "created_at": "2026-09-09T16:20:00.000000",
    "curtidas": 2548
  },
  {
    "sk_movie_review_id": "442ad5ccaae7d5980e7ac236355be4aef99a96b42bf4d9d08fb2f969d6747480",
    "sk_movie_id": "de3297dbc63a88e339e878fccaae8eda825b7e20b0dbd4a1dba8eeb927ae3094",
    "nome": "Ana Correia",
    "nota": 2.5,
    "comentario": "Terrível, um dos piores que já vi.",
    "created_at": "2026-09-08T14:28:00.000000",
    "curtidas": 465
  },
  {
    "sk_movie_review_id": "5eb7a6e729b7c01b1911740cd210c0c5253a3daba501077d285080b544603695",
    "sk_movie_id": "9feeb6211355c64d507ba546734870e7ca328dacaccf01f3ad685426dfa12361",
    "nome": "Henrique Lopes",
    "nota": 2.7,
    "comentario": "Que filme ruim, não assistam.",
    "created_at": "2026-09-07T22:01:00.000000",
    "curtidas": 290
  },
  {
    "sk_movie_review_id": "40a6693d9277afa7ff143affaff92c016019b91a024008aa22e5368bd5a0b107",
    "sk_movie_id": "274697cb2d2800354641dc2e3ba56b261f7a4d467c918e32152627eb3f231006",
    "nome": "Daniel Pereira Teixeira",
    "nota": 8.1,
    "comentario": "Excelente filme. Aproveitei cada momento.",
    "created_at": "2026-09-07T21:39:00.000000",
    "curtidas": 138
  },
  {
    "sk_movie_review_id": "5ec584dfd872b657e428ed751ec6998061d0a2c55f88824e76cf69e1cee10894",
    "sk_movie_id": "c8a25452509bcfbb44f72237007b1b22331f86a3fb74d2659030c31f18963b8a",
    "nome": "Ana Gomes",
    "nota": 9.0,
    "comentario": "Perfeito! Um dos melhores filmes que já vi.",
    "created_at": "2026-09-06T19:29:00.000000",
    "curtidas": 57
  },
  {
    "sk_movie_review_id": "78358e4e7c2d9872b33a2fe03a8fb106206a564a8f157b5b112066242fae5169",
    "sk_movie_id": "87b77e112b47e75f6cd8e0e4d68fb6ad9641317524376247bee53123e3f31ea4",
    "nome": "Camila Moreira Lopes",
    "nota": 0.2,
    "comentario": "Achei muito fraco e não consegui me envolver com a história.",
    "created_at": "2026-09-06T18:42:00.000000",
    "curtidas": 320
  },
  {
    "sk_movie_review_id": "6ec6fc9a004afb50a3c0b2fc83dc33cf8fdefff33f008632658f1c45915f9700",
    "sk_movie_id": "8b8039e202fd1de2a49f18c987442a48c84ee5958f6ab5485176bd81475a64ba",
    "nome": "Bianca Oliveira",
    "nota": 4.1,
    "comentario": "Fraco, não recomendo.",
    "created_at": "2026-09-06T12:06:00.000000",
    "curtidas": 12
  },
  {
    "sk_movie_review_id": "7ee61ff001e3e05df7bfdbec04ddd24004c21c8dfdfc3c057ae124327aaa786a",
    "sk_movie_id": "45e4b17aa16e19ce8ccb5263bccea9f0fdff94b650b6da583ffa2991d93ab27c",
    "nome": "Gabriel Araújo",
    "nota": 8.7,
    "comentario": "Obra-prima do cinema, simplesmente espetacular.",
    "created_at": "2026-09-05T20:48:00.000000",
    "curtidas": 366
  },
  {
    "sk_movie_review_id": "a06175367855087249cca576dfd042e7bbfbc111569f1af36c7d694412f3ad7c",
    "sk_movie_id": "a9215aa5900d333f4bf3f4ecebdc01e3714d476e1b5db131245e724f1ee1c722",
    "nome": "Juliana Martins Batista",
    "nota": 4.0,
    "comentario": "Foi razoável. Gostei de algumas partes mas outras não funcionaram.",
    "created_at": "2026-09-04T23:22:00.000000",
    "curtidas": 134
  },
  {
    "sk_movie_review_id": "68bde77bb375f56ac529a0eef4a104cbcbffa2d76467de94aaae940f403cf7ab",
    "sk_movie_id": "1718cc85c038a1c627f754832f209853abb8c16d5b21b26d81c14e868433dc6c",
    "nome": "Natália Nascimento",
    "nota": 6.4,
    "comentario": "Mediano, tem seus momentos mas nada demais.",
    "created_at": "2026-09-04T22:13:00.000000",
    "curtidas": 272
  },
  {
    "sk_movie_review_id": "401abbd5e38249e9bd5a1955ee76a1a511f3bd46f075a90469b0805ff88e09f6",
    "sk_movie_id": "dbec1ced5d46027370ac9cf2fa9e35d3e02bbd46e892a8ba6963b42e5dd9b947",
    "nome": "Eduardo Rodrigues Moura",
    "nota": 5.1,
    "comentario": "Valeu pela curiosidade mas não me empolgou.",
    "created_at": "2026-09-04T18:35:00.000000",
    "curtidas": 3640
  },
  {
    "sk_movie_review_id": "2f6b427de77ab2f53f412038963a2588619496c78d0afe166633d1e50e6f02b6",
    "sk_movie_id": "90b2630391e03cb7b5aa6f9eecbd06348eceb91031c94af54ecc131f133b742d",
    "nome": "Natália Lima Vieira",
    "nota": 8.0,
    "comentario": "Saí impressionado e quero assistir novamente.",
    "created_at": "2026-09-04T07:15:00.000000",
    "curtidas": 2457
  },
  {
    "sk_movie_review_id": "9b8ed5752920fe63deccad48fddc338ce926166c717852636ab494c0842511a2",
    "sk_movie_id": "3fa1ac70ce14b1015d8ccf54b90ca702a727fe2888c524483d364b3c5a223aed",
    "nome": "Daniel Lopes",
    "nota": 6.6,
    "comentario": "Filme ok, nada de especial.",
    "created_at": "2026-09-04T02:03:00.000000",
    "curtidas": 10
  },
  {
    "sk_movie_review_id": "eec8d84c7840ae99848ff4ce8b918328ed33f9db7e8c5094d7315f4549fb4daa",
    "sk_movie_id": "e0a37a8dba3fcfdc7f13db7488073a03c734d8a26babd1a2692f498ddcb48f45",
    "nome": "Leandro Barbosa Ramos",
    "nota": 2.1,
    "comentario": "Há pontos positivos mas eles não compensam os problemas.",
    "created_at": "2026-09-03T20:20:00.000000",
    "curtidas": 832
  },
  {
    "sk_movie_review_id": "b7ceb8fe72905fa30fe63e26a7a4a568bf2614cdcd277bbcc5be3f1b80c8c4d7",
    "sk_movie_id": "075ecd341cec10fdee945bc0ebc139dab8e5084935634db2268800b98e147354",
    "nome": "Diego Almeida Sampaio",
    "nota": 8.6,
    "comentario": "Adorei o filme e recomendaria sem hesitar.",
    "created_at": "2026-09-02T18:58:00.000000",
    "curtidas": 344
  },
  {
    "sk_movie_review_id": "deecfd00156e5d2365a82eb739d3f18eaa0b2076dbc7aad9d4215e4b39404bbb",
    "sk_movie_id": "acf6aa0dd4d1ad01ac45de07980fa327df24849b3b2c65cd61e8e99ac45e76b2",
    "nome": "Pedro Almeida Cunha",
    "nota": 7.2,
    "comentario": "Gostei do filme e achei a sessão divertida.",
    "created_at": "2026-09-02T10:24:00.000000",
    "curtidas": 486
  },
  {
    "sk_movie_review_id": "6557dd7f00d327104fe0fa4e2b060a855c7c1bb660aef9a74dc7cdd63ef1f61b",
    "sk_movie_id": "c37f4c048f32301cea41998e2c1cc8639bfaa13faa700438fa6a516c2d2eddf8",
    "nome": "Sandra Oliveira",
    "nota": 6.6,
    "comentario": "Assisti até o final mas não me marcou.",
    "created_at": "2026-09-01T08:49:00.000000",
    "curtidas": 138
  },
  {
    "sk_movie_review_id": "6111a308b47151efbfbd8ba1a82506cd676c7d302fa40ac0408e9aef391ed763",
    "sk_movie_id": "89a2e69f0c25bf0fb529cecae786a5391c9cd5827d98e81e63c6565bfb8a4dae",
    "nome": "Elisa Costa Campos",
    "nota": 3.2,
    "comentario": "Não me prendeu e terminou abaixo das minhas expectativas.",
    "created_at": "2026-08-31T22:00:00.000000",
    "curtidas": 1209
  },
  {
    "sk_movie_review_id": "88f109b4179354712090d74816fd3bee386825e2bda095620f4fd5440977543a",
    "sk_movie_id": "ec9ce84c5bb073e5dfd49022ae5d7d7712ad269553cdf68816243b13742dff3b",
    "nome": "Helena Rocha Azevedo",
    "nota": 2.0,
    "comentario": "Foi uma sessão frustrante que não recomendo.",
    "created_at": "2026-08-31T18:04:00.000000",
    "curtidas": 148
  },
  {
    "sk_movie_review_id": "60868ff60f6fb8ca024c23d7b181dc20a53d6da9ac6f98e64bb7911400fa6cd0",
    "sk_movie_id": "87590e8c82258be0adcf904ed3c7d8bd139adb54dbf26e1a66b2b1a632ee73d6",
    "nome": "Lucas Alves",
    "nota": 0.7,
    "comentario": "Não recomendo de jeito nenhum.",
    "created_at": "2026-08-31T08:26:00.000000",
    "curtidas": 147
  },
  {
    "sk_movie_review_id": "f26e529201b3cfe9f8951d8dcb9e5c56c51b07b88fc56b0e6208b6a25019fafc",
    "sk_movie_id": "319d83deaf478e0d4d968057b258aad02146391dac1468e9f7a29346449f1360",
    "nome": "Felipe Nascimento Moura",
    "nota": 0.5,
    "comentario": "Saí decepcionado e não assistiria de novo.",
    "created_at": "2026-08-31T05:50:00.000000",
    "curtidas": 4524
  },
  {
    "sk_movie_review_id": "fc0a64930551232bccd369c30d57c8c26abc59b960a4eea078badac8d19e089a",
    "sk_movie_id": "08933266212af9c00d9c86ac7f1ae459387cc3724ccc4805595005b57ba07d80",
    "nome": "Natália Martins",
    "nota": 5.9,
    "comentario": "Aceitável, mas esperava mais.",
    "created_at": "2026-08-30T17:01:00.000000",
    "curtidas": 12
  },
  {
    "sk_movie_review_id": "84970daddc3b34ee8ad2c9b96f49d60ee54d60e79db2f52972bd4522160b6687",
    "sk_movie_id": "94ac464ea33f7c9ce13b568a6bf1395ec904b7674bd02fc62d7bedf5190a4cb6",
    "nome": "Ana Barbosa Castro",
    "nota": 1.9,
    "comentario": "Achei muito fraco e não consegui me envolver com a história.",
    "created_at": "2026-08-30T10:11:00.000000",
    "curtidas": 134
  },
  {
    "sk_movie_review_id": "728a3802ae6a337364a8203b649703674c47bda22c92606c7ada64524e8f35bc",
    "sk_movie_id": "f5135c8de4e6dfc3d9b9edd7e8257b1a6010b9a7a864b25031e42d6abea63ffc",
    "nome": "Henrique Carvalho",
    "nota": 0.6,
    "comentario": "Péssimo em todos os sentidos.",
    "created_at": "2026-08-29T17:50:00.000000",
    "curtidas": 533
  },
  {
    "sk_movie_review_id": "771658aba006bcc00ea6734a429057c40816440a84dcf32cd74ececb83a48ac6",
    "sk_movie_id": "5a246bc3bcacbfc050bc8c3964fb7a6eae304bce6c37a287bc2e012aa9e3102a",
    "nome": "Isabela Costa Castro",
    "nota": 7.3,
    "comentario": "Achei envolvente e aproveitei a maior parte da sessão.",
    "created_at": "2026-08-29T00:05:00.000000",
    "curtidas": 780
  },
  {
    "sk_movie_review_id": "0005e0d49a89988375634e43b2d20ed693c1e5965e02f49b32799f56b388838d",
    "sk_movie_id": "38bc108d301a55d3ed52366abc758ed57bd60164de61d1fbb8c13e5c05991c36",
    "nome": "Hugo Moreira Azevedo",
    "nota": 4.4,
    "comentario": "Foi razoável. Gostei de algumas partes mas outras não funcionaram.",
    "created_at": "2026-08-28T23:24:00.000000",
    "curtidas": 294
  }
]

export const genreNames: string[] = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "Tv Movie",
  "War",
  "Western"
]
