---
title: Representació de plantes per escala, símbols propis i plantes en 3D
summary: Com es dibuixen les plantes en planta a cada escala de dibuix i nivell de detall, i com un registre de planta rep el seu propi símbol (SVG, o un bloc DXF/DWG) i el seu propi model 3D (OBJ, STL o GLB).
keywords: representació de plantes, símbol de planta, símbol per escala, nivell de detall, cercle simple, contorn, símbol detallat, símbol propi, bloc, svg, dxf, dwg, planta en 3D, model 3D propi, obj, stl, glb, gltf, model d'arbre, plantes en 3D
from: 875837d9
---

## Símbols en planta per escala

Paisatgisme › {{ui:Més}} › {{ui:Representació de plantes}} defineix com es dibuixen les plantes en planta. **Automàtica, per escala** tria un de tres nivells segons l'escala de dibuix:

- **Cercle simple** (més gran que 1:500): un cercle de l'amplada de la planta.
- **Contorn amb centre** (de 1:500 a 1:200): el cercle i una petita creu al centre.
- **Símbol detallat** (més fi que 1:200): el símbol propi del registre si en té, si no, el símbol incorporat.

Canvieu les dues escales amb **Simple des de 1:** i **Contorn des de 1:**, o trieu un sol nivell per a totes les escales. Cada joc de fulls del diàleg de fulls té la seva pròpia **Detall de les plantes en planta**, de manera que un plànol de situació 1:500 i un plànol de plantació 1:100 poden ser diferents. La configuració es desa amb el projecte.

## El vostre símbol propi

Trieu una planta a la secció Plantes i premeu {{ui:Símbol propi…}}. Llegeix un SVG, o un bloc d'un dibuix DXF o DWG (si el dibuix té diversos blocs, n'escolliu un). El símbol s'ajusta a l'amplada de la planta i es dibuixa al nivell detallat. Es guarda al projecte, de manera que el fitxer hi viatja amb ell.

- Del SVG es llegeixen les línies, polilínies, polígons, rectangles, cercles, el·lipses i camins. Els scripts, els estils, els enllaços i les imatges que hi hagi no es miren mai. Les transformacions no s'apliquen: se us avisa quan el fitxer en té, de manera que les heu d'aplanar primer al vostre programa de dibuix.
- Límits: 512 KB de SVG i 2000 formes. Un fitxer més gran es rebutja indicant-ne el motiu.

## La vostra planta en 3D

{{ui:Model 3D propi…}} del mateix registre llegeix un fitxer **OBJ**, **STL** o **GLB**. Després, a Representació de plantes, poseu **Plantes en 3D** a **El model propi de cada registre**: cada planta d'aquell registre mostra el vostre model, escalat a la seva alçada i amplada. Els registres sense model propi conserven les formes incorporades. Trieu **Masses simples** per a vistes ràpides de llocs grans.

Un GLB només es llegeix per la forma:

- Tot el que el model necessita ha d'estar dins del fitxer .glb. Un model que apunta a altres fitxers (un .bin separat, o imatges per adreça) es rebutja: no es descarrega res.
- La geometria comprimida o empaquetada (Draco, meshopt, posicions quantificades) no es llegeix. Exporteu-la sense compressió.
- Les textures i els colors del fitxer no s'usen: el model es dibuixa amb el color de la planta. Les textures igualment es comproven, i una textura de més de 4096 píxels per costat es rebutja.
- Límits: un fitxer de 32 MB, 50 000 triangles (comptant cada còpia d'una peça col·locada més d'una vegada), 64 imatges i 16 MB d'imatges.

Cada límit rebutja el fitxer indicant-ne el motiu; no es guarda res a mitges. Un pas de desfer dona al registre el seu símbol o model, i {{ui:Elimina el símbol propi}} o {{ui:Elimina el model 3D propi}} els retiren de nou.

Vegeu [Registres de plantes](topic:plant-records) per al registre en si, i [Visualitza l'emplaçament en 3D](topic:site-3d).
