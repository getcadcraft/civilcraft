---
title: LandXML: o que é lido e escrito
summary: Os elementos e atributos LandXML 1.2 que o CivilCraft lê e escreve, elemento a elemento, e tudo o que ignora.
keywords: landxml, xml, cgpoints, superfície, tin, linhas de quebra, limite, diretriz, coordgeom, perfil, profalign, pvi, paracurve, pipenetworks, struct, tubo, planfeatures, planfeature, linha característica, esquema
from: ca3cf359
---

O CivilCraft escreve LandXML 1.2 com o espaço de nomes oficial e a localização do esquema. Lê qualquer ficheiro cujo elemento raiz seja `LandXML` e recolhe os elementos abaixo pelo nome (os prefixos de espaço de nomes são ignorados; a versão não é verificada). O seu leitor XML aceita apenas as cinco entidades padrão e referências numéricas a caracteres; nunca carrega uma DTD nem um ficheiro externo. Para os passos, veja [Intercâmbio de LandXML](topic:landxml).

O LandXML escreve as coordenadas primeiro em norte: um ponto é "N E" ou "N E Z".

## Escritos

| Elemento | O que o CivilCraft escreve |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, áreas em pés quadrados, volumes em jardas cúbicas, diâmetros em polegadas) ou `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = o nome do projeto |
| `Application` | nome CivilCraft, fabricante CadCraft |
| `CgPoints` / `CgPoint` | `name` = número do ponto, `desc` = descrição, `code` = grupo; texto "N E Z" (ou "N E" sem cota) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ou ccw, `radius`, `length`, `staStart`, `chord`, `delta` (graus), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | o terreno existente ao longo da diretriz, como pares de PK e cota (`PntList2D`), dividido onde sai da superfície |
| `Profile` / `ProfAlign` | o perfil de projeto (chamado "<alignment> design"): `PVI` para as extremidades e pontos de ângulo, `ParaCurve` com `length` para as curvas verticais |
| `Surfaces` / `Surface` | `name` e `desc`; primeiro o terreno existente, depois "Proposed" quando as plataformas ou os corredores modelam o terreno |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (só terreno existente) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (só terreno existente, quando existe) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` com `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ou sanitary |
| `Struct` | `name`, `elevRim` (a tampa usada, fixa ou tirada da superfície), `elevSump`; `Center`; `CircStruct` com `diameter`; `Invert` com `elev`, `flowDir` in ou out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` com `diameter` |
| `PlanFeatures` / `PlanFeature` | uma por linha característica: `name`; `CoordGeom` com `Line` (`length`, `Start`, `End`) e `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` e `End` como "N E Z", `Center` como "N E"); `Feature` `code="CivilCraft"` com `Property` de utilização e fechada |

Não são escritos: plataformas de implantação e corredores como objetos (o resultado é a superfície "Proposed"), diretrizes com erros, tubos sem as duas soleiras, regras de rede.

## Lidos

| Elemento | O que o CivilCraft lê |
|---|---|
| `Units` | `Imperial` ou `Metric` e o seu `linearUnit` decidem entre pés ou metros. Uma unidade desconhecida fica registada. |
| `Project` | `name` passa a ser o nome do projeto. |
| `CgPoints` / `CgPoint` (também aninhados) | nome (ou `oID`), "N E" ou "N E Z", `desc` (ou `code`) como descrição |
| `Surface` com `Definition surfType="TIN"` | `Pnts` e `Faces` como terreno existente (só a primeira superfície); faces invisíveis (`i="1"`) ficam de fora |
| `SourceData` / `Breaklines` | linhas de quebra 3D, mantidas com a superfície |
| `SourceData` / `Boundaries` | o limite exterior |
| `Alignment` / `CoordGeom` | elementos `Line` e `Curve`; PI reconstruídos a partir do `PI` de cada curva, ou do seu `Center` e das tangentes; `staStart` |
| `Profile` / `ProfAlign` | `PVI` e `ParaCurve` (com `length`); o primeiro perfil de projeto com pelo menos dois PVI |
| `PlanFeatures` / `PlanFeature` | cada um como linha característica: `Line`, `Curve` (os seus `Start`, `Center`, `End` e `rot`) e `IrregularLine` (`PntList3D` ou `PntList2D`) unidos ponta a ponta (uma falha é unida com um segmento reto e registada); fechada quando termina onde começou; utilização e fechada a partir do `Feature` próprio do CivilCraft, senão **Só desenhada**. Os pontos sem cota recebem 0 (registado). |
| `Spiral` | espirais de clotoide junto a um `Curve` (de entrada e de saída; lidas como um PI com um raio e comprimentos de espiral, e escritas de novo com `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | a primeira rede que tenha tubos: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` por tubo) e `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Ignorados, e indicados nas notas

- Superfícies depois da primeira, superfícies de grelha e outras superfícies não TIN
- Diretrizes que contenham elementos `IrregularLine` ou `Chain`, espirais que não sejam de clotoide, uma espiral entre duas curvas, ou sem geometria
- Perfis de projeto depois do primeiro; curvas verticais `CircCurve` e `UnsymParaCurve` (os seus PVI são mantidos sem curva)
- Pontos que apenas referenciam outros pontos (`pntRef`), e pontos sem coordenadas legíveis
- Nomes de pontos repetidos (mantém-se o primeiro)
- Limites de ocultar, mostrar e recorte de dados; linhas de quebra sem pontos 3D
- Redes de tubos depois da primeira; tipos de rede diferentes de storm e sanitary (lidos como storm)
- Estruturas retangulares, de entrada e de saída (lidas como redondas); tubos e canais ovais, elípticos e em caixa (lidos como tubos redondos sem dimensão)
- Elementos `Spiral` em elementos de planta
- `Parcels`, `Roadways`, `GradeModel` e `Survey`

Os perfis do terreno (`ProfSurf`) num ficheiro não são usados: o CivilCraft amostra o terreno a partir da própria superfície.

## Mensagens quando um ficheiro não abre

| Mensagem | Significado |
|---|---|
| "Isto é XML mas não LandXML (o seu elemento raiz é <…>)." | O ficheiro é outro tipo de XML. |
| "… não tem pontos, superfícies TIN nem diretrizes que o CivilCraft consiga ler." | Tudo o que está no ficheiro consta da lista de ignorados. As notas que se seguem dizem o que lá estava. |
| "Etiqueta de fecho não correspondente …", "Etiqueta por fechar …", "O ficheiro termina dentro de …" | O ficheiro está danificado ou incompleto. |
