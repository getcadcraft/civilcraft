---
title: LandXML: o que é lido e gravado
summary: Os elementos e atributos do LandXML 1.2 que o CivilCraft lê e grava, elemento por elemento, e tudo o que ele ignora.
keywords: landxml, xml, cgpoints, superfície, tin, linhas de quebra, contorno, alinhamento, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, tubo, planfeatures, planfeature, linha de feição, esquema
from: ca3cf359
---

CivilCraft grava LandXML 1.2 com o namespace oficial e a localização do esquema. Ele lê qualquer arquivo cujo elemento raiz seja `LandXML` e pega os elementos abaixo pelo nome (os prefixos de namespace são ignorados; a versão não é verificada). O leitor de XML aceita apenas as cinco entidades padrão e as referências numéricas de caractere; nunca carrega um DTD nem um arquivo externo. Para os passos, veja [Trocar LandXML](topic:landxml).

O LandXML grava as coordenadas com o Norte primeiro: um ponto é "N E" ou "N E Z".

## Gravado

| Elemento | O que o CivilCraft grava |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, áreas em pés quadrados, volumes em jardas cúbicas, diâmetros em polegadas) ou `Metric` (meter, metro quadrado, metro cúbico, milímetro) |
| `Project` | `name` = o nome do projeto |
| `Application` | nome CivilCraft, fabricante CadCraft |
| `CgPoints` / `CgPoint` | `name` = número do ponto, `desc` = descrição, `code` = grupo; texto "N E Z" (ou "N E" sem cota) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ou ccw, `radius`, `length`, `staStart`, `chord`, `delta` (graus), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | o terreno natural ao longo do alinhamento, como pares de estaca e cota (`PntList2D`), dividido onde sai da superfície |
| `Profile` / `ProfAlign` | o perfil de projeto (chamado "<alinhamento> projeto"): `PVI` para extremidades e pontos de ângulo, `ParaCurve` com `length` para curvas verticais |
| `Surfaces` / `Surface` | `name` e `desc`; primeiro o terreno natural, depois "Proposed" quando plataformas ou corredores são terraplenados |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (somente terreno natural) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (somente terreno natural, quando houver) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` com `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ou sanitary |
| `Struct` | `name`, `elevRim` (a cota da tampa usada, definida ou tirada da superfície), `elevSump` (cota do fundo); `Center`; `CircStruct` com `diameter`; `Invert` com `elev`, `flowDir` in ou out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` com `diameter` |
| `PlanFeatures` / `PlanFeature` | uma por linha de feição: `name`; `CoordGeom` com `Line` (`length`, `Start`, `End`) e `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` e `End` como "N E Z", `Center` como "N E"); `Feature` `code="CivilCraft"` com `Property` use e closed |

Não gravados: plataformas e corredores como objetos (o resultado deles é a superfície "Proposed"), alinhamentos com erros, tubos sem as duas geratrizes, regras da rede.

## Lido

| Elemento | O que o CivilCraft aproveita |
|---|---|
| `Units` | `Imperial` ou `Metric` e o seu `linearUnit` decidem entre pés ou metros. Uma unidade desconhecida é anotada. |
| `Project` | `name` vira o nome do projeto. |
| `CgPoints` / `CgPoint` (também aninhados) | nome (ou `oID`), "N E" ou "N E Z", `desc` (ou `code`) como descrição |
| `Surface` com `Definition surfType="TIN"` | `Pnts` e `Faces` como terreno natural (somente a primeira superfície); faces invisíveis (`i="1"`) ficam de fora |
| `SourceData` / `Breaklines` | linhas de quebra 3D, mantidas com a superfície |
| `SourceData` / `Boundaries` | o contorno externo |
| `Alignment` / `CoordGeom` | elementos `Line` e `Curve`; PIs reconstruídos a partir do `PI` de cada curva, ou a partir do seu `Center` e das tangentes; `staStart` |
| `Profile` / `ProfAlign` | `PVI` e `ParaCurve` (com `length`); o primeiro perfil de projeto com pelo menos dois PVIs |
| `PlanFeatures` / `PlanFeature` | cada um como linha de feição: `Line`, `Curve` (seus `Start`, `Center`, `End` e `rot`) e `IrregularLine` (`PntList3D` ou `PntList2D`) unidos ponta a ponta (uma falha é unida com um segmento reto e anotada); fechado quando termina onde começou; uso e fechamento a partir do `Feature` próprio do CivilCraft, senão **Somente desenhada**. Pontos sem cota recebem 0 (anotado). |
| `Spiral` | espirais clotoides ao lado de um `Curve` (entrada e saída; lidas como PI com raio e comprimentos de espiral, gravadas de volta com `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | a primeira rede que tem tubos: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` com diâmetro, `Invert` por tubo) e `Pipe` (`refStart`, `refEnd`, `CircPipe` com diâmetro) |

## Ignorado, e indicado nas notas

- Superfícies depois da primeira, superfícies de grade e outras superfícies que não são TIN
- Alinhamentos que contêm elementos `IrregularLine` ou `Chain`, espirais que não são clotoides, uma espiral entre duas curvas, ou alinhamentos sem geometria
- Perfis de projeto depois do primeiro; curvas verticais `CircCurve` e `UnsymParaCurve` (os seus PVIs são mantidos sem curva)
- Pontos que apenas se referem a outros pontos (`pntRef`) e pontos sem coordenadas legíveis
- Nomes de pontos repetidos (o primeiro é mantido)
- Limites ocultos, mostrados ou com recorte de dados; linhas de quebra sem pontos 3D
- Redes de tubos depois da primeira; tipos de rede que não são storm nem sanitary (lidos como storm)
- Estruturas retangulares, de boca de lobo e de saída (lidas como redondas); tubos e canais ovais, elípticos e em caixa (lidos como tubos redondos sem tamanho)
- Elementos `Spiral` em linhas de feição
- `Parcels`, `Roadways`, `GradeModel` e `Survey`

Perfis do terreno (`ProfSurf`) de um arquivo não são usados: o CivilCraft amostra o terreno da própria superfície.

## Mensagens quando um arquivo não abre

| Mensagem | Significado |
|---|---|
| "Isto é XML, mas não LandXML (o elemento raiz é <…>)." | O arquivo é outro tipo de XML. |
| "… não tem pontos, superfícies TIN nem alinhamentos que o CivilCraft consiga ler." | Tudo no arquivo está na lista de ignorados. As notas depois dela dizem o que havia. |
| "Tag de fechamento incompatível …", "Tag não fechada …", "O arquivo termina dentro de …" | O arquivo está danificado ou foi cortado. |
