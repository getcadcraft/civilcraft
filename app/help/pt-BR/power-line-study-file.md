---
title: Arquivos de estudo para outro programa de linhas (.DON)
summary: Salve uma linha aérea como arquivo de estudo .DON, ou leia as estruturas de um desses arquivos para uma nova linha. Não testado com o programa que os lê.
keywords: don, .don, arquivo de estudo, xml, exportar, importar, programa de linhas aéreas, lançamento, canton
from: 1abc4d07
---

Alguns programas de linhas aéreas guardam um estudo em um arquivo `.DON` (texto XML). O CivilCraft pode gravar uma linha como esse arquivo e ler as estruturas de um deles.

:::warning
**Não testado.** Construímos isto a partir de uma lista de nomes de campos do formato, compartilhada por um usuário, e não a partir de um arquivo real; ainda não abrimos nossos arquivos no programa que os lê. Abra o arquivo ali e confira cada valor antes de confiar nele. Se você puder compartilhar um arquivo `.DON` (sem os dados do cliente), isso nos ajuda a acertar.
:::

## Salvar um arquivo de estudo

1. Dê à linha um condutor e confirme que ela tem resultados (sem "não calculado" nas suas Propriedades).
2. {{ui:Mais}} › {{ui:Salvar um arquivo de estudo (.DON)…}}, escolha a linha e adicione uma descrição e um número de obra.
3. {{ui:Salvar o arquivo de estudo}}.

O arquivo contém as estruturas da linha (coordenadas, terreno, alturas, funções, travessa, a estrutura mantida ou sugerida, cargas por hipótese de carga, fundação), uma seção por trecho entre ancoragens terminais (condutor, tensão, vão regulador, vãos, tração e parâmetro da catenária, a maior tração por hipótese de carga) e as tabelas de lançamento. Os comprimentos estão em metros e as forças em daN; o texto é gravado em Latin-1, então um caractere fora dele vira `?`.

## Ler um arquivo de estudo

{{ui:Mais}} › {{ui:Abrir um arquivo de estudo (.DON)…}} lê as estruturas para uma nova linha. O condutor, as estruturas e as travessas são associados à sua biblioteca pelo nome; o que não for encontrado fica para você escolher nas Propriedades.
