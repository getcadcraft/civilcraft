---
title: Exporta el plànol a DXF
summary: Escriu les línies del plànol com a DXF R12 en capes amb nom, amb les corbes de nivell a la seva cota i les línies de ruptura en 3D, per a qualsevol programa CAD.
keywords: dxf, dwg, cad, exporta, línies, r12, 2000, 2004, 2007, 2010, 2013, 2018, capes, corbes de nivell, intercanvi de dibuixos, mapa base, fons
from: f2d8ede9
---

{{ui:DXF}} escriu el que mostra el plànol com a fitxer DXF en format R12, la versió que obre qualsevol programa CAD. Si heu usat AutoCAD o Civil 3D, obriu-lo o inseriu-lo igual que qualsevol altre DXF.

## Exporta

1. Prepareu el plànol com voleu el dibuix: a **Visualització**, trieu la superfície (existent o projectada), l'interval de les corbes de nivell i què està activat (corbes de nivell, etiquetes, punts, etiquetes de punts, triangles, línies de ruptura, vora de la superfície, canonades, fletxes de pendent).
2. Feu clic a {{ui:DWG/DXF}} al grup **Exporta** i trieu {{ui:DXF (R12, text): el fitxer d'intercanvi simple}}, i després {{ui:Baixa}}.
3. El navegador baixa `<name>.dxf`. La barra d'estat diu, per exemple, "Exportat DXF R12: 2,140 objectes; etiquetes dimensionades per a 1" = 40'. Les bandes d'elevació no s'exporten."

Les coordenades s'escriuen en les unitats del projecte, amb els seus valors reals (les coordenades State Plane es mantenen tal com són). No s'escala ni es mou res.

## Què hi ha al fitxer

| Cosa | Entitat DXF | Capa |
|---|---|---|
| Corbes de nivell menors i majors | Polilínies 2D a la seva cota | C-TOPO-MINR, C-TOPO-MAJR |
| Etiquetes de corbes de nivell | Text | C-TOPO-TEXT |
| Triangles | Polilínies | C-TOPO-TINN |
| Línies de ruptura i límit | Polilínies 3D | C-TOPO-BRKL |
| Vora de la superfície | Polilínies | C-TOPO-BNDY |
| Fletxes de pendent | Polilínies | C-TOPO-SLOP |
| Punts topogràfics i les seves etiquetes | Punts (amb cota), text | V-NODE, V-NODE-TEXT |
| Línies dels codis de línia | Polilínies 3D | V-NODE-LINE |
| Eixos d'alineació | Línies i arcs | C-ROAD-CNTR |
| Marques i etiquetes de quilometratge | Polilínies, text | C-ROAD-STAN |
| Vores del corredor | Polilínies | C-ROAD-CORR |
| Línies de mostra | Polilínies | C-ROAD-SCTN |
| Plataformes, línies de talús, línies de pendent | Polilínies | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Línies característiques | Polilínies 3D (arcs en trossos dins de 0.01; vegeu [Línies característiques](topic:feature-lines)) | C-GRAD-FEAT |
| Trajectòries de gir | Polilínies, text | C-ROAD-SWPT |
| Canonades, estructures, etiquetes | Polilínies, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Canonades i estructures amb problemes | Polilínies | C-STRM-PROB |

Cada capa té un color. La llista completa és a [Capes del plànol](topic:plan-layers).

## Mida de l'etiqueta

El text ha de tenir una mida en unitats de dibuix. CivilCraft dimensiona les etiquetes per a l'escala a la qual tot el plànol cap en un full Tabloid (peus) o en un full A3 (metres), i diu quina escala ha usat al missatge d'estat. Si traceu a una altra escala al vostre programa CAD, escaleu el text allà.

## Què no s'exporta

- Les bandes d'elevació (només a la pantalla).
- La vista de perfil. Els perfils s'exporten com a LandXML, no com a dibuix.
- La superfície en si com a objecte 3D. Useu LandXML per al TIN, o activeu {{ui:Triangles}} per obtenir-ne les arestes com a línies.
- Qualsevol cosa que hàgiu desactivat a **Visualització**.

## DWG

{{ui:DWG/DXF}} escriu les mateixes línies també com a dibuix DWG. El seu diàleg demana el format: DXF, o un DWG de 2000, 2004, 2007, 2010, 2013 o 2018. El 2000 s'obre en gairebé tots els programes CAD, antics i nous; trieu un de més nou quan qui rebi el dibuix ho demani. La vostra elecció es recorda en aquest navegador.

1. Feu clic a {{ui:DWG}} al grup **Exporta**.
2. Trieu el **Format** i feu clic a **Baixa el DWG**.
3. El navegador baixa `<name>.dwg`. La barra d'estat diu què s'hi ha inclòs, per exemple "Exportat DWG (format 2018): 12 polilínies, 40 etiquetes a 9 capes".

El DWG té les mateixes capes, colors, corbes de nivell (com a polilínies a la seva cota), línies de ruptura 3D, etiquetes i punts que el DXF, en les mateixes coordenades. Els noms de capa que un DWG no pot contenir es canvien, i el missatge d'estat ho indica. CivilCraft escriu el DWG amb el seu propi codi, de manera que res no surt del vostre ordinador.

### Capes de mapa al DWG

Un dibuix DWG no pot contenir una imatge a dins: els programes CAD mostren una imatge que es troba al costat del dibuix. Quan les capes de mapa són visibles, el diàleg ofereix **Capes de mapa com una imatge al costat del dibuix**. Amb aquesta casella marcada, la baixada és un `.zip` que conté `<name>.dwg`, `<name>-map.png` (les capes de mapa sobre tot el dibuix, fins a 4,096 píxels d'amplada) i `<name>-map.pgw` (el seu fitxer de món, per als programes GIS). El dibuix mostra la imatge com a imatge a la capa G-MAP-IMAG, al seu lloc. Descomprimiu els fitxers en una mateixa carpeta i mantenIu-los junts.
