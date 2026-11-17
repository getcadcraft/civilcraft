---
title: O espazo de traballo de Paisaxismo
summary: Planos de plantación, movemento de terras, pavimento, muros, escaleiras, rego e follas de paisaxismo no mesmo lugar, coas mesmas superficies e o mesmo ficheiro que a obra civil.
keywords: paisaxismo, arquitectura paisaxística, xardín, plantación, plantas, árbores, movemento de terras, obra dura, pavimento, rego, aspersores, espazo de traballo, deseño de lugares, plano de paisaxismo
from: eea929d1
---

O espazo de traballo de Paisaxismo pon as ferramentas de deseño de paisaxismo no lugar de CivilCraft que xa ten: os mesmos puntos de levantamento, o mesmo terreo existente, a mesma superficie proposta e o mesmo ficheiro de proxecto.

## Abrilo

Escolla {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. A barra de ferramentas mostra entón unha opción **Espazo de traballo** e un grupo **Paisaxismo**, e os grupos Superficie, Deseño e GIS deixan sitio. Escolla **Civil** en Espazo de traballo para volver. CivilCraft recorda o espazo que usou por última vez neste computador.

O panel esquerdo gaña tres seccións na parte superior:

- **Plantas**: a lista de plantas, para buscar e escoller o que coloca. Vexa [A lista de plantas](topic:plant-list).
- **Comprobacións do terreo**: análise de pendentes, frechas de fluxo e encharcamento. Vexa [Movemento de terras](topic:landscape-grading).
- **Rego**: os aspersores e tubaxes que coloca a seguir, e os axustes da subministración de auga. Vexa [Rego](topic:irrigation).

## Que hai no grupo Paisaxismo

| Ferramenta | Que fai | Tema |
|---|---|---|
| **Vexetal**, **Canteiro**, **Seto** | Plantas individuais, canteiros de plantación cheos ao espazamento das plantas, setos ao longo dunha liña | [Plantación](topic:planting) |
| **Movemento de terras** | Plataformas, bermas, cunetas, áreas de movemento de terras con cotas puntuais e curvas, comprobacións de pendente e de fluxo | [Movemento de terras](topic:landscape-grading) |
| **Obra dura** | Pavimentos, sendeiros, muros, bordillos, rampas e escaleiras que seguen o terreo | [Obra dura](topic:hardscape) |
| **Áreas** | Áreas plantadas: céspedes, canteiros, prados e cubertas vexetais con capa de formación, recortadas ao redor da obra dura | [Áreas plantadas](topic:planted-areas) |
| **Niveis** | Modificadores do terreo en orde, con desmonte e recheo, cotas puntuais, frechas de pendente e liñas de sección | [Modificadores do terreo](topic:ground-modifiers), [Seccións](topic:landscape-sections) |
| **Rego** | Aspersores, tubaxes, válvulas, liñas de goteo, a subministración, a cobertura e unha comprobación hidráulica | [Rego](topic:irrigation) |
| **Máis** | Desde unha liña (obxectos ligados á liña), o cadro de plantas, a táboa de plantas, as follas de cálculo, os gráficos de plantas, os obxectos de forma libre, as follas de paisaxismo e o conxunto de publicación, a exportación IFC, o tamaño e as etiquetas das plantas | [Obxectos desde liñas](topic:objects-from-lines), [Rexistros de plantas](topic:plant-records), [Follas de cálculo](topic:worksheets), [Follas de paisaxismo](topic:landscape-sheets), [Obxectos de forma libre](topic:freeform-objects) |

Todo o que engade é un paso de desfacer, gárdase no ficheiro do proxecto e debuxa no plano en capas chamadas `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` e `L-IRRG-…`, así que as exportacións DXF, DWG e PDF tamén o levan.

## Unha superficie para todo

As plataformas, bermas, cunetas, áreas de movemento de terras, pavimentos e sendeiros nivélanse na **superficie proposta**, a mesma que usan os corredores e as plataformas de edificación. O **terreo existente** nunca cambia. As plantas asentan sobre o terreo que hai debaixo, así que se moven cando cambia o movemento de terras. O cálculo de movementos de terra conta o movemento de terras de paisaxismo xunto con todo o demais.

:::tip
Primeira vez? [Deseñar un xardín, de principio a fin](topic:landscape-walkthrough) percorre todo o espazo de traballo no sitio de exemplo.
:::
