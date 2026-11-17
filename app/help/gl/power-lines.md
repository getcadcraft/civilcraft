---
title: O espazo de traballo Liñas eléctricas
summary: Liñas aéreas e cables subterráneos na súa parcela, coas súas bibliotecas, frecha e tensión baixo as súas hipóteses de carga, comprobacións de franquía e resistencia, táboas de tendido, cantidades, follas e exportación GIS.
keywords: liña eléctrica, liña aérea, eléctrico, distribución, postes, apoios, condutor, frecha, tensión, tendido, franquía, cable subterráneo, zanxa, espazo de traballo, subministrador
from: 638dd856
---

O espazo de traballo Liñas eléctricas sitúa as liñas aéreas e os cables subterráneos na parcela de CivilCraft que xa ten: os mesmos puntos de levantamento, o mesmo terreo, o mesmo ficheiro de proxecto.

:::warning
Un axudante de deseño. O espazo de traballo calcula a frecha, a tensión, as franquías e as cargas a partir **das súas** hipóteses de carga e límites; non se incorpora a norma de ningún país. Un enxeñeiro comproba cada resultado coa norma aplicable antes de construír nada.
:::

## Abrilo

Escolla {{ui:Superficie}} › {{ui:Máis}} › {{ui:Espazo de traballo de liñas eléctricas}}, ou **Liñas eléctricas** en Espazo de traballo. A barra de ferramentas amosa entón un grupo **Liñas eléctricas**; os grupos Deseño e GIS apártanse. Escolla **Civil** en Espazo de traballo para volver. CivilCraft lembra o espazo de traballo que usou por última vez neste ordenador.

O panel esquerdo gaña dúas seccións na parte superior:

- **Liñas eléctricas**: as súas hipóteses de carga e límites, as liñas e cables do proxecto, e **Comprobacións**, sempre ao día. Prema unha comprobación para seleccionar aquilo ao que se refire.
- **Biblioteca**: os seus propios condutores, cables, apoios, equipos e tipos de zanxa. Vexa [A súa biblioteca de liñas eléctricas](topic:power-line-library).

## Que hai no grupo Liñas eléctricas

| Ferramenta | Que fai | Tema |
|---|---|---|
| **Liña** | Unha liña aérea: prema en cada apoio | [Debuxar unha liña aérea](topic:overhead-line) |
| **Apoio** | Engade un apoio nun vano | [Debuxar unha liña aérea](topic:overhead-line) |
| **Cable** | Unha ruta de cable subterráneo nunha zanxa | [Cables subterráneos](topic:underground-cables) |
| **Equipo** | Un armario, un transformador, unha xunta, ou a fonte da que se alimenta a rede | [Cables subterráneos](topic:underground-cables) |
| **Obstáculo** | Algo que unha liña cruza: unha estrada, un edificio, outra liña | [Comprobacións](topic:power-line-checks) |
| **Perfil** | O perfil da liña: terreo, apoios e condutor en cada hipótese de carga | [Debuxar unha liña aérea](topic:overhead-line#the-line-profile) |
| **Máis** | Hipóteses de carga e límites, táboas de tendido, cantidades, follas e informe, GIS, ficheiros de estudo | [Frecha e tensión](topic:sag-and-tension), [Saídas](topic:power-line-outputs), [Ficheiros de estudo](topic:power-line-study-file) |

Todo o que engade é un paso de desfacer, gárdase no ficheiro do proxecto e debúxase no plano en capas chamadas `C-POWR-…`, así que as exportacións DXF, DWG e PDF tamén o levan.
