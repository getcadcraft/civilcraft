---
title: Ficheiros de estudo para outro programa de linhas (.DON)
summary: Guarde uma linha aérea como ficheiro de estudo .DON, ou leia para uma nova linha os apoios de um. Não testado com o programa que os lê.
keywords: don, .don, ficheiro de estudo, xml, exportar, importar, programa de linhas aéreas, regulação, canton
from: 1abc4d07
---

Alguns programas de linhas aéreas guardam um estudo num ficheiro `.DON` (texto XML). O CivilCraft pode escrever uma linha nesse formato e ler os apoios de um.

:::warning
**Não testado.** Criámos isto a partir de uma lista de nomes de campos do formato que um utilizador partilhou, não a partir de um ficheiro real, e ainda não abrimos os nossos ficheiros no programa que os lê. Abra o ficheiro lá e verifique cada valor antes de confiar nele. Se conseguir partilhar um ficheiro `.DON` (sem os dados do cliente), ajuda-nos a corrigir isto.
:::

## Guardar um ficheiro de estudo

1. Atribua à linha um condutor e confirme que tem resultados (sem «não calculado» nas Propriedades da linha).
2. {{ui:Mais}} › {{ui:Guardar um ficheiro de estudo (.DON)…}}, escolha a linha, acrescente uma descrição e um número de obra.
3. {{ui:Guardar o ficheiro de estudo}}.

O ficheiro contém os apoios da linha (coordenadas, solo, alturas, funções, cruzeta, o apoio mantido ou sugerido, cargas por hipótese de carga, fundação), uma secção por troço entre amarrações (condutor, tensão, vão regulador, vãos, tração e parâmetro da catenária, a maior tração por hipótese de carga) e as tabelas de regulação. Os comprimentos estão em metros e as forças em daN; o texto é escrito em Latin-1, por isso um carácter fora dele torna-se `?`.

## Ler um ficheiro de estudo

{{ui:Mais}} › {{ui:Abrir um ficheiro de estudo (.DON)…}} lê os apoios para uma nova linha. O condutor, os apoios e as cruzetas são associados à biblioteca pelo nome; o que não for encontrado fica para escolher nas Propriedades.
