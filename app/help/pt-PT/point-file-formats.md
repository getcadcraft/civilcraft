---
title: Formatos de ficheiro de pontos
summary: As ordens de colunas que o CivilCraft lê, como encontra o delimitador e a linha de cabeçalho, que nomes de cabeçalho reconhece e como as linhas são verificadas.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formato de ficheiro de pontos, colunas, cabeçalho, delimitador
from: 84fab42e
---

Um ficheiro de pontos é texto simples, com um ponto por linha. O CivilCraft lê-o no navegador; nada é carregado.

## Ordens de colunas

As letras nomeiam as colunas da esquerda para a direita: **P** número ou nome do ponto, **N** norte, **E** este, **Z** cota, **D** descrição.

| Ordem | Colunas | Exemplo de linha |
|---|---|---|
| PNEZD | ponto, norte, este, cota, descrição | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | ponto, este, norte, cota, descrição | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | ponto, norte, este, cota | `101,2080000.00,6150000.00,250.00` |
| PENZ | ponto, este, norte, cota | `101,6150000.00,2080000.00,250.00` |
| NEZD | norte, este, cota, descrição | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | este, norte, cota, descrição | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | norte, este, cota | `2080000.00 6150000.00 250.00` |
| ENZ | este, norte, cota | `6150000.00 2080000.00 250.00` |

As ordens sem P numeram os pontos 1, 2, 3 … pela ordem do ficheiro. X é o este e Y é o norte.

## Delimitadores

O CivilCraft olha para as primeiras 20 linhas e escolhe o primeiro destes que aparece em pelo menos 60% delas: vírgula, tabulação, ponto e vírgula. Caso contrário, separa por sequências de espaços.

- Em ficheiros com vírgula, tabulação e ponto e vírgula, um campo entre aspas pode conter o delimitador (`"FL, NORTH"`), e `""` dentro de aspas é uma aspa.
- Em ficheiros separados por espaços, a descrição no fim da linha pode conter espaços: tudo o que vem depois da última coluna de coordenadas é a descrição.
- As linhas que começam com `#`, `;` ou `//`, e as linhas em branco, são ignoradas.
- Uma marca de ordem de bytes (BOM) no início do ficheiro é ignorada.

## Linha de cabeçalho

A primeira linha é tratada como cabeçalho quando menos de dois dos seus campos são números. Se cada campo do cabeçalho for um nome que o CivilCraft reconhece, a ordem das colunas vem dele («a partir da linha de cabeçalho»). Os nomes são comparados sem distinguir maiúsculas, espaços, pontos, sublinhados, hífenes e parênteses retos.

| Coluna | Nomes reconhecidos |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Se algum nome do cabeçalho não for reconhecido, ou se os nomes não formarem uma das oito ordens, o cabeçalho é ignorado e a ordem é deduzida do número de colunas.

:::warning
Um cabeçalho que nomeie uma coluna de latitude (`lat`, `latitude`) e uma coluna de longitude (`lon`, `long`, `longitude`) é lido como graus, e não como norte e este. Em {{ui:Importar}} os pontos são convertidos através do sistema de coordenadas do projeto, e um projeto sem um pede que o escolha primeiro. As linhas fora de ±90° de latitude ou ±180° de longitude são recusadas. Veja [Importar dados SIG](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Deduzir a partir do número de colunas

Sem um cabeçalho utilizável e com **Colunas** deixado em {{ui:Detetar}}:

- 5 ou mais colunas: PNEZD.
- 4 colunas: PNEZ quando a primeira coluna é um número inteiro em todas as linhas amostradas e a quarta é um número; NEZD caso contrário.
- 3 colunas: NEZ.

PNEZD e PENZD não se distinguem pelos números. A dedução segue **Linhas de pontos** nas [definições do CivilCraft](topic:settings): P, N, E, Z, D no início, ou P, E, N, Z, D (então quatro colunas são lidas como PENZ e três como ENZ). O diálogo diz «deduzido a partir do número de colunas — verifique se o norte e o este não estão trocados». Escolha a ordem certa em **Colunas** se a pré-visualização parecer errada.

## Como as linhas são verificadas

- Uma linha pode omitir a descrição.
- O norte e o este têm de ser números. A cota pode estar vazia (o ponto é mantido, mas não é usado na superfície).
- O número do ponto pode ser qualquer texto (também letras, como `CP1`), mas não pode estar vazio.
- Se um número de ponto se repetir, a primeira linha é mantida e as outras são listadas como não lidas.
- As descrições são mantidas até 200 caracteres; os caracteres de controlo tornam-se espaços.
- Até 200 linhas não lidas são mantidas para o diálogo (25 mostradas), e todas são contadas.

## Grupos de pontos

O grupo de um ponto é a primeira palavra da sua descrição em maiúsculas. «GRD», «grd shot» e «Grd» pertencem todos ao grupo GRD. Um ponto sem descrição fica em «(sem descrição)». Veja [Importar pontos de levantamento](topic:import-points).

## Escrever pontos

O CivilCraft ainda não exporta um ficheiro de texto de pontos. Os pontos saem em LandXML (como CgPoints), no ficheiro do projeto e, através da {{ui:Exportar}} para SIG, como shapefile, GeoPackage ou GeoJSON com os campos P, N, E, Z e D ([Exportar dados como construídos para SIG](topic:gis-export)). Veja [Ainda não implementado](topic:not-built-yet).
