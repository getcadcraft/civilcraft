---
title: Deseñar un xardín, de principio a fin
summary: Os dez pasos do arquitecto paisaxista, desde o levantamento ata o conxunto publicado, con que fai hoxe o espazo de traballo de Paisaxismo en cada un e o que aínda non fai.
keywords: titorial, percorrido, como facer, deseño de paisaxismo, deseño de xardíns, primeiros pasos, exemplo, mostra, paso a paso, levantamento, liñas, terreo, plantación, cadro, follas, publicar, un proxecto
from: 87900bf5
---

Un deseño de paisaxismo dá voltas: levantamento, esbozo, liñas, terreo, áreas, niveis, plantación, cadros, follas, e de novo. Estes son os dez pasos, con indicación do que existe para cada un. Onde un paso ten un oco, se indica en **Aínda sen construír** ao final, e non se oculta dentro do paso.

Pode seguir o sitio de exemplo, ou o seu propio debuxo de levantamento. Co seu, comece no paso 1.

## 1. Importar o levantamento

{{ui:Surface}} › {{ui:Linework from a drawing…}}, escolla o debuxo de levantamento (DWG 2000–2018 ou DXF). Comprobe as unidades, tome as curvas de nivel, as polilíneas 3D e o límite para a superficie, e os bloques de puntos como puntos de levantamento. A sección **Niveis do levantamento e comprobación** le os niveis escritos como texto ou como atributo e lista o que parece mal (unidades, sistema de coordenadas, distancia ao cero, curvas planas, niveis raros, puntos duplicados) antes de engadir nada. Vexa [Comprobar un debuxo de levantamento ao importar](topic:survey-check) e [Abrir un DWG ou DXF como liñas](topic:open-dwg-dxf). Estableza o sistema de coordenadas con {{ui:Coordinate system…}}.

## 2. Esbozos a man

Unha folla en papel, como un levantamento antigo ou unha copia marcada, entra con {{ui:Scan…}} (Comezar desde unha dixitalización): colócase á escala ou en coordenadas coñecidas baixo o plano, e pode calcarse en liñas. ModelCraft le unha foto dun esbozo a man (Ficheiro › Importar unha foto de esbozo…). O propio CivilCraft non ten unha ferramenta para un esbozo a man: coloque a folla baixo o plano e debuxe sobre ela.

## 3. Do esbozo ás liñas

Debuxe liñas de elemento e contornos sobre o levantamento en CivilCraft, ou debúxeos no debuxo 2D. Paisaxismo › Máis › {{ui:From a line}} convirte unha liña en pavimento, unha área plantada, un muro, escaleiras, unha liña de elemento e máis, con ligazón mantida: mova a liña e o obxecto segue. Vexa [Obxectos desde liñas](topic:objects-from-lines). En SuperCad Studio, abra o lugar, o debuxo e o modelo do edificio nun mesmo proxecto: o espazo de traballo **Paisaxismo** ten as ferramentas de todos eles, e unha liña escollida no debuxo 2D pode converterse nun obxecto de paisaxismo que a segue (Ctrl+K, {{ui:Landscape object from the picked drawing line}}).

## 4. O terreo proposto

Abra {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Constrúa o terreo proposto con {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} e áreas de movemento de terras con cotas puntuais e curvas de nivel; o pavimento, os sendeiros, os muros, as rampas e as escaleiras que engada entran na mesma superficie proposta. O terreo existente nunca cambia. {{ui:Levels}} › {{ui:Ground modifiers…}} lista todo o que dá forma ao terreo nunha soa orde, con desmonte e recheo para cada un. Vexa [Movemento de terras](topic:landscape-grading) e [Modificadores do terreo e niveis en vivo](topic:ground-modifiers).

## 5. Pavimentos e áreas plantadas

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} e {{ui:Steps}}. {{ui:Areas}} debuxa un céspede, un canteiro, un prado ou unha cuberta vexetal coa súa capa de formación; recórtase só ao redor do pavimento, dos muros e das escaleiras. {{ui:Bed}} enche unha área co espazamento das plantas, a partir dunha mestura de plantas. Vexa [Obra dura](topic:hardscape), [Áreas plantadas](topic:planted-areas) e [Plantación](topic:planting).

## 6. Niveis, pendentes e unións

Baixo **Comprobacións do terreo**, marque **Análise de pendentes** e **Frechas de fluxo e encharcamento**. Se a auga se acumula contra unha terraza, engada unha {{ui:Swale}} ao seu redor. As propiedades indícanlle cantas contrahuellas precisan as escaleiras e se encaixan, e onde un sendeiro é máis empinado que o seu límite. O panel Problemas lista onde os obxectos se xuntan mal: un muro demasiado alto, un canteiro por riba do pavimento, escaleiras que non chegan ao seu descanso. {{ui:Spot level}} e {{ui:Gradient arrow}} rotulan o terreo e actualízanse sós.

## 7. Plantación

En **Plantas**, busque na lista de plantas (algúns centenares de especies, ou a súa propia lista), escolla unha e {{ui:Plant}}, {{ui:Bed}} ou {{ui:Hedge}}. Estableza o tamaño e as etiquetas da planta desde Máis. Máis › {{ui:Plant table}} edita os seus propios rexistros: cultivares, tamaños subministrados, densidade e notas de especificación. Cada rexistro pode levar o seu propio símbolo e o seu modelo 3D (OBJ, STL ou GLB), e Máis › {{ui:Plant graphics}} debuxa as plantas máis simples a escalas máis grosas. Vexa [A lista de plantas](topic:plant-list), [Rexistros de plantas](topic:plant-records) e [Gráficos de plantas](topic:plant-graphics).

## 8. Cantidades e cadros

Máis › {{ui:Worksheets}}: os cadros de plantas e de obra dura, e os seus propios, quedan ligados aos obxectos; gárdeos como CSV ou XLSX ou póñaos nas follas (vexa [Follas de cálculo](topic:worksheets)). Máis › {{ui:Plant schedule…}} envía as cantidades a TakeoffCraft. As cantidades de obra dura están nas propiedades do pavimento, do muro e das escaleiras. O rego ten a súa propia lista de materiais: {{ui:Irrigation}} › **Comprobar o sistema…**. Vexa [Rego](topic:irrigation).

## 9. Debuxos e follas

Máis › {{ui:Landscape sheets…}}: planos de plantación, de movemento de terras e de rego, cos detalles. {{ui:Levels}} › {{ui:Section line}} debuxa seccións polo terreo, os muros, as capas, as escaleiras e as plantas. Vexa [Follas de paisaxismo](topic:landscape-sheets) e [Seccións e conxunto de publicación](topic:landscape-sections).

## 10. Publicar

{{ui:Publish set (.zip)}} no diálogo de follas fai un PDF cunha lista de follas e un DWG por folla. Máis › {{ui:Export landscape IFC}} entrega a BimCraft as plantas e a obra dura. Garde o proxecto: todo está no mesmo ficheiro.

## Cambiar unha cousa: a escaleira

O sentido de manter todo nun mesmo proxecto é que un cambio se propaga. Probe con un tramo de escaleiras entre dúas terrazas:

1. Debuxe a liña do tramo como liña de elemento (ou como liña no debuxo), e logo Paisaxismo › Máis › {{ui:From a line}} › {{ui:Steps}}. Nas propiedades das escaleiras marque **Modela o terreo**, e estableza os niveis inferior e superior nas dúas terrazas.
2. Debuxe un canteiro plantado ao lado e por debaixo do tramo con {{ui:Areas}}, e pavimento nas terrazas. O canteiro recórtase ao redor das escaleiras e do pavimento, e o cadro de plantas conta só o que está plantado.
3. Suba o nivel superior do tramo nas propiedades. O terreo proposto, as cotas puntuais, as frechas de pendente e o desmonte e recheo cambian ao momento. Se o tramo xa non chega á terraza superior, o panel Problemas indica en canto.
4. Mova a liña do tramo. As escaleiras seguen a súa liña no mesmo paso de desfacer; o canteiro recórtase de novo e vólvese contar, e as follas de cálculo e os cadros mostran os novos números.
5. Prema Ctrl+Z unha vez: a liña, as escaleiras, o terreo e o canteiro volven xuntos.

Vexa [Modificadores do terreo e niveis en vivo](topic:ground-modifiers), [Áreas plantadas](topic:planted-areas) e [Follas de cálculo](topic:worksheets).

## Aínda sen construír

Estas cousas pídense, pero non están nesta versión:

- Muros que modelen o terreo (informan de onde o atopan, e a súa coroa pode seguilo).
- Edición da súa propia lista de plantas da Biblioteca na aplicación (edite a lista do proxecto e gárdea como ficheiro de plantas).
- Texturas e cores dos seus propios modelos GLB de plantas (lese a forma; úsase a cor da planta).

Vexa [O espazo de traballo de Paisaxismo](topic:landscape) para todas as ferramentas.
