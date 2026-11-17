---
title: Referencia da barra de ferramentas
summary: Cada botón da barra de ferramentas de CivilCraft, o que fai, a súa tecla, e cando aparece en gris ou se nega.
keywords: barra de ferramentas, botóns, comandos, ferramentas, ficheiro, exportar, superficie, deseño, editar, vista, menú
from: 4c4352bc
---

A barra de ferramentas atravesa a parte superior da aplicación en sete grupos. Cada botón mostra a súa información emerxente e a súa tecla cando pasa o cursor por riba.

## Ficheiro

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:New}} | ningunha | Inicia un proxecto baleiro. Pregunta antes se hai cambios sen gardar. |
| {{ui:Open}} | {{key:Mod+O}} | Abre un ficheiro de puntos (CSV, TXT), LandXML ou un proxecto de CivilCraft. |
| {{ui:Save}} | {{key:Mod+S}} | Descarga o proxecto como `<name>.civilcraft.json`. |

## Exportar

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:LandXML}} | ningunha | Descarga `<name>.xml`: puntos, superficies, trazados, perfís e a rede de tubaxes como LandXML 1.2. «Aínda non hai nada que exportar.» cando o proxecto está baleiro. |
| {{ui:DXF}} | ningunha | Descarga `<name>.dxf`: as liñas de debuxo do plano como DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Abre **Trazar o plano a PDF**. «Aínda non hai nada que trazar.» cando o proxecto está baleiro. |

## Superficie

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Prema puntos de levantamento en orde, {{key:Enter}} para rematar. A liña de rotura toma as cotas dos puntos. |
| {{ui:Boundary}} | {{key:O}} | Prema os vértices do límite exterior, {{key:Enter}} para rematar. Substitúe calquera límite. |

Ambos indican «Aínda non hai superficie: abra primeiro os puntos de levantamento.» cando non hai superficie.

## Deseño

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Prema os PI en orde, {{key:Enter}} para rematar. |
| {{ui:Pad}} | {{key:G}} | Prema os vértices da plataforma, {{key:Enter}} para rematar. Como as ferramentas de superficie, avisa cando non hai superficie; unha plataforma só se nivela sobre unha. |
| {{ui:Pipes}} | {{key:P}} | Prema as estruturas de augas arriba cara abaixo (prema unha existente para unirse a ela), {{key:Enter}} para rematar. |
| {{ui:Profile}} | {{key:R}} | Mostra ou oculta a vista de perfil baixo o plano. |

## Editar

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Desfai o último cambio (ata 200). En gris cando non hai nada que desfacer. |
| {{ui:Redo}} | {{key:Mod+Y}} | Refai o que se desfixo. En gris cando non hai nada que refacer. |
| {{ui:Copy}} | {{key:Mod+C}} | Copia os puntos de levantamento seleccionados e os pon no portapapeis como filas de puntos que unha folla de cálculo pode aceptar. En gris ata que se seleccionen puntos. |
| {{ui:Paste}} | {{key:Mod+V}} | Pega puntos: seguen o punteiro, e un clic os deixa cos números que ningún outro punto ten. As filas de puntos copiadas nunha folla de cálculo tamén se pegan. |
| {{ui:More}} | ningunha | Abre o menú de abaixo. |

O menú {{ui:More}}:

| Elemento | Tecla | Que fai |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Copia os puntos seleccionados e os elimina (un paso de desfacer). |
| {{ui:Copy}} | {{key:Mod+C}} | Igual que o botón {{ui:Copy}}. |
| {{ui:Paste}} | {{key:Mod+V}} | Igual que o botón {{ui:Paste}}. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Pega os puntos nas súas propias coordenadas, con números que ningún outro punto ten. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Unha copia dos puntos seleccionados segue o punteiro; prema onde debe ir. O portapapeis non se modifica. |
| {{ui:Delete}} | {{key:Delete}} | Elimina os puntos de levantamento seleccionados, ou o trazado, a plataforma, a estrutura (coas súas tubaxes), a tubaxe ou o PVI seleccionados. |
| {{ui:Select all points}} | {{key:Mod+A}} | Selecciona todos os puntos de levantamento. |
| {{ui:Select none}} | {{key:Esc}} | Borra a selección. |

Un elemento que non pode actuar agora aparece en gris, e a súa información emerxente di o motivo. Detalles: [Seleccionar, copiar e pegar puntos de levantamento](topic:copy-paste-points).

Desfacer cubre as edicións do deseño, a configuración da superficie e os puntos de levantamento (pegar, cortar, duplicar, eliminar). Non cubre a configuración de visualización, e abrir ou importar calquera ficheiro borra o historial.

## SIG

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:Coordinates}} | ningunha | Abre o diálogo **Sistema de coordenadas**: indique en que sistema está o proxecto, ou use coordenadas do terreo ou locais. Vexa [Fixar o sistema de coordenadas do proxecto](topic:coordinate-systems) e [Coordenadas do terreo e locais](topic:ground-and-local-coordinates). |
| {{ui:Import}} | ningunha | Importa datos SIG: shapefiles, GeoJSON, GeoPackage, rexillas de altitudes e LiDAR. Vexa [Importar datos SIG](topic:gis-import). |
| {{ui:Export}} | ningunha | Exporta datos como construídos para un departamento SIG. Vexa [Exportar datos como construídos para SIG](topic:gis-export). |
| {{ui:Analyze}} | ningunha | Abre o panel de análise SIG: zona de influencia, superposición, unión espacial, selección por atributo, medición. Vexa [Analizar capas SIG](topic:gis-analysis). |
| {{ui:Attribute table}} | ningunha | En Superficie › Máis. Abre a táboa de atributos dunha capa SIG: ordenar, filtrar, seleccionar, editar, engadir campos, calcular, gardar como CSV. Vexa [Traballar coa táboa de atributos dunha capa](topic:gis-table). |
| {{ui:Map}} | ningunha | Abre o diálogo **Capas de mapa**: unha imaxe xeorreferenciada, ou servidores de mapas que engada, debuxados baixo o plano. Vexa [Mostrar capas de mapa baixo o plano](topic:map-layers). |

As ferramentas SIG se cargan a primeira vez que usa un destes botóns, abre un ficheiro SIG ou abre un proxecto que ten sistema de coordenadas ou capas SIG.

## Vista

| Botón | Tecla | Que fai |
|---|---|---|
| {{ui:Select}} | {{key:V}} ou {{key:Esc}} | Prema para seleccionar trazados, plataformas, estruturas, tubaxes e puntos ({{key:Shift}} e un clic ou un arrastre engade puntos); arrastre os controis para mover os PI, os vértices das plataformas e as estruturas. |
| {{ui:Fit}} | {{key:F}} | Axusta o zoom do plano para mostrar a superficie, os puntos, os trazados e as plataformas (na vista 3D: mostra todo). |
| {{ui:3D}} | {{key:D}} | Mostra o lugar en 3D sobre o plano, ou volve ao plano. A barra sobre a vista 3D fixa a vista, a exaxeración, as cores e o que se mostra, e exporta GLB ou OBJ. Vexa [Ver o lugar en 3D](topic:site-3d). |

## Botóns dos paneis

| Botón | Onde | Que fai |
|---|---|---|
| {{ui:Open the sample site}} | A caixa dun plano baleiro | Carga o levantamento de mostra (necesita conexión, salvo que CivilCraft estea gardado para uso sen conexión) |
| {{ui:Remove the boundary}} | Panel esquerdo, Superficie | Elimina o límite exterior |
| {{ui:Remove drawn breaklines}} | Panel esquerdo, Superficie | Elimina todas as liñas de rotura debuxadas coa ferramenta (non os grupos de liñas de rotura) |
| {{ui:Rebuild the surface from the points}} | Panel esquerdo, Superficie (só superficie LandXML) | Descarta a TIN do LandXML e constrúe a partir dos puntos; non se pode desfacer |
| {{ui:Start from the ground}} | Panel dereito, Trazado | Comeza un perfil de proxecto cun PVI sobre o terreo en cada extremo |
| {{ui:Profile view}} | Panel dereito, Trazado | Abre a vista de perfil deste trazado |
| {{ui:Add PVIs}} | Barra do perfil | Mentres está premido, un clic no perfil engade un PVI |
| {{ui:Set every invert from the rules}} | Panel dereito, Rede de tubaxes | Fixa todas as cotas de fondo de todas as tubaxes segundo as regras |
| {{ui:Set its inverts from the rules}} | Panel dereito, Tubaxe | Fixa as cotas de fondo desta tubaxe segundo as regras |
