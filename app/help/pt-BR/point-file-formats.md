---
title: Formatos de arquivo de pontos
summary: As ordens de colunas que o CivilCraft lê, como ele encontra o separador e a linha de cabeçalho, quais nomes de cabeçalho reconhece e como as linhas são verificadas.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formato de arquivo de pontos, colunas, cabeçalho, delimitador
from: 84fab42e
---

Um arquivo de pontos é texto simples, um ponto por linha. O CivilCraft o lê no navegador; nada é enviado.

## Ordem das colunas

As letras nomeiam as colunas da esquerda para a direita: **P** número ou nome do ponto, **N** norte, **E** leste, **Z** cota, **D** descrição.

| Ordem | Colunas | Exemplo de linha |
|---|---|---|
| PNEZD | ponto, norte, leste, cota, descrição | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | ponto, leste, norte, cota, descrição | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | ponto, norte, leste, cota | `101,2080000.00,6150000.00,250.00` |
| PENZ | ponto, leste, norte, cota | `101,6150000.00,2080000.00,250.00` |
| NEZD | norte, leste, cota, descrição | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | leste, norte, cota, descrição | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | norte, leste, cota | `2080000.00 6150000.00 250.00` |
| ENZ | leste, norte, cota | `6150000.00 2080000.00 250.00` |

Ordens sem P numeram os pontos 1, 2, 3 … na ordem do arquivo. X é leste e Y é norte.

## Separadores

O CivilCraft examina as 20 primeiras linhas e escolhe o primeiro destes separadores que aparece em pelo menos 60% delas: vírgula, tabulação, ponto e vírgula. Caso contrário, separa por sequências de espaços.

- Em arquivos com vírgula, tabulação e ponto e vírgula, um campo entre aspas duplas pode conter o separador (`"FL, NORTH"`), e `""` dentro das aspas é uma aspa.
- Em arquivos separados por espaços, uma descrição no fim da linha pode conter espaços: tudo depois da última coluna de coordenada é a descrição.
- Linhas que começam com `#`, `;` ou `//`, e linhas em branco, são ignoradas.
- Uma marca de ordem de bytes no início do arquivo é ignorada.

## Linha de cabeçalho

A primeira linha é tratada como cabeçalho quando menos de dois de seus campos são números. Se todos os campos do cabeçalho forem nomes que o CivilCraft reconhece, a ordem das colunas vem deles ("pela linha de cabeçalho"). Os nomes são comparados sem considerar maiúsculas, espaços, pontos, sublinhados, hífens e colchetes:

| Coluna | Nomes reconhecidos |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Se algum nome do cabeçalho não for reconhecido, ou se os nomes não formarem uma das oito ordens, o cabeçalho é ignorado e a ordem é adivinhada pelo número de colunas.

:::warning
Um cabeçalho que nomeia uma coluna de latitude (`lat`, `latitude`) e uma coluna de longitude (`lon`, `long`, `longitude`) é lido como graus, e não como norte e leste. Em {{ui:Importar}}, os pontos são convertidos pelo sistema de coordenadas do projeto, e um projeto sem um pede que você o escolha primeiro. Linhas fora de ±90° de latitude ou ±180° de longitude são recusadas. Veja [Importar dados de GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Adivinhação pelo número de colunas

Sem cabeçalho utilizável e com **Colunas** em {{ui:Detectar}}:

- 5 ou mais colunas: PNEZD.
- 4 colunas: PNEZ quando a primeira coluna é um número inteiro em todas as linhas amostradas e a quarta é um número; caso contrário, NEZD.
- 3 colunas: NEZ.

PNEZD e PENZD não podem ser distinguidos pelos números. A adivinhação segue **Linhas de pontos** em [Configurações do CivilCraft](topic:settings): P, N, E, Z, D no início, ou P, E, N, Z, D (então quatro colunas são lidas como PENZ e três como ENZ). A caixa de diálogo diz "adivinhado pelo número de colunas — verifique se norte e leste não estão trocados". Escolha a ordem certa em **Colunas** se a prévia parecer errada.

## Como as linhas são verificadas

- Uma linha pode omitir a descrição.
- Norte e leste devem ser números. A cota pode ficar vazia (o ponto é mantido, mas não usado na superfície).
- O número do ponto pode ser qualquer texto (com letras também, como `CP1`), mas não pode ser vazio.
- Se um número de ponto se repetir, a primeira linha é mantida e as outras são listadas como não lidas.
- Descrições são mantidas até 200 caracteres; caracteres de controle viram espaços.
- Até 200 linhas não lidas são mantidas para a caixa de diálogo (25 mostradas), e todas são contadas.

## Grupos de pontos

O grupo de um ponto é a primeira palavra da sua descrição em maiúsculas. "GRD", "grd shot" e "Grd" pertencem todos ao grupo GRD. Um ponto sem descrição fica em "(sem descrição)". Veja [Importar pontos de levantamento](topic:import-points).

## Exportando pontos

O CivilCraft ainda não exporta um arquivo de texto de pontos. Os pontos saem em LandXML (como CgPoints), no arquivo do projeto e, pela {{ui:Exportar}} do GIS, como shapefile, GeoPackage ou GeoJSON com os campos P, N, E, Z e D ([Exportar dados como construídos para GIS](topic:gis-export)). Veja [Ainda não implementado](topic:not-built-yet).
