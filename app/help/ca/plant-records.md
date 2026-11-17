---
title: Registres de plantes, cultivars i mides subministrades
summary: La llista de plantes pròpia del projecte com a taula: cultivars, mides subministrades (contenidor, cep, perímetre, tronc lliure), densitat, notes d'especificació, CSV d'entrada i sortida; cada planta col·locada indica una mida; símbols de planta per escala i símbols propis i models 3D.
keywords: taula de plantes, base de dades de plantes, cultivar, varietat, mida subministrada, contenidor, cep, arrel nua, perímetre, tronc lliure, densitat, plantes per metre quadrat, especificació, notes d'especificació, símbol de planta, bloc, símbol propi, planta en 3D, nivell de detall, escala
from: 12251beb
---

Obriu {{ui:Taula de plantes}} des del menú {{ui:Més}} del grup Paisatgisme, o des de la secció Plantes. Cada fila és un registre de planta a la llista pròpia d'aquest projecte (un registre de la llista de plantes es copia quan l'afegiu). Cada edició es comprova com un fitxer importat, i és un sol pas de desfer.

## Les columnes

- **Nom botànic**, **Nom comú**, **Tipus**, **Alçada** i **Amplada** a la maduresa (metres).
- **Separació** (de centre a centre) o **Densitat** (plantes per m²). Un bancal d'un registre amb densitat i sense separació s'omple a aquesta densitat, segons el seu propi patró (triangular o quadrat).
- **Mides subministrades**: una entrada per mida, separades per `;`. Cada entrada és un identificador, un tipus (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) i després qualsevol de: un volum `10L`, una alçada `h0.6`, una amplada `s0.4`, un perímetre `g14-16` (cm), un tronc lliure `st1.8`. Exemple: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivars**: noms separats per `;`. Un cultivar conserva les seves pròpies mides i notes quan el fitxer importat les tenia.
- **Notes d'especificació**.

{{ui:Duplica}} copia una fila amb una clau nova; {{ui:Desa com a CSV}} i {{ui:Desa com a fitxer de plantes}} escriuen la llista (les files CSV dels cultivars se situen sota la seva espècie, amb `cultivar_of`). Importar un CSV o un fitxer de plantes el fusiona amb la llista.

## La vostra llista de plantes de la Biblioteca

Inicieu la sessió al vostre compte de CadCraft (Configuració, Els vostres complements, Inicia la sessió) i la taula de plantes pot fer servir la llista que guardeu a la Biblioteca:

- {{ui:Des de la meva llista de la biblioteca}} porta els vostres propis elements de planta de la Biblioteca (també els que encara esperen revisió). Una planta que ja teniu aquí s'actualitza des de la Biblioteca; els cultivars, les mides subministrades, la densitat i l'especificació que hi heu afegit es conserven.
- {{ui:Desa com a llista de plantes}} desa cada fila com a element de planta propi de la Biblioteca, un element per espècie: una planta nova és un element nou, una planta canviada és una versió nova, i una que no ha canviat es deixa estar. Marqueu primer la casella: desar-ho dona les plantes al públic sota CC0. Una primera pujada pública d'una persona que encara no és de confiança la revisa una persona abans que aparegui, com es fa amb cada pujada.

La Biblioteca guarda el registre bàsic de la planta. Els cultivars, les mides subministrades, la densitat i les notes d'especificació es queden al projecte i al fitxer de plantes ({{ui:Desa com a fitxer de plantes}}); el diàleg indica quantes files hi afecta cada vegada que desa.

## Una planta col·locada indica una mida

Seleccioneu una planta, un seto o una fila de mescla d'un bancal o d'una àrea plantada: quan el registre té cultivars o mides subministrades, {{ui:Cultivar i mida}} en tria una. El quadre de plantes llavors compta per espècie, cultivar i mida, i una etiqueta les pot mostrar: `{botanical} '{cultivar}' {size}` o `{full}`.

## Símbols de planta per escala

{{ui:Representació de plantes}} (Paisatgisme › Més) defineix com es dibuixen les plantes en planta: **automàtica** (més gran que 1:500, un cercle de l'amplada de la planta; entre 1:200 i 1:500, un contorn amb el seu centre; més fi, el símbol detallat; es poden canviar les dues escales) o un sol nivell per a totes les escales. El diàleg de fulls té la seva pròpia **Detall de les plantes en planta** per a aquest joc.

A un registre de la secció Plantes, {{ui:Símbol propi…}} llegeix un SVG, o un bloc d'un dibuix DXF/DWG, i el dibuixa a l'amplada de la planta al nivell detallat. {{ui:Model 3D propi…}} llegeix un OBJ, STL o GLB; a Representació de plantes trieu **El model propi de cada registre** per veure'l en 3D. Els fitxers tenen límits (512 KB de SVG, 2000 formes, 50 000 triangles) i es guarden al projecte. No s'apliquen les transformacions de l'SVG (se us avisa quan un fitxer en té). Vegeu [Representació de plantes, símbols propis i plantes en 3D](topic:plant-graphics) per als nivells, els límits i el que pot contenir un GLB.
