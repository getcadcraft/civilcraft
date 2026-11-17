---
title: Capes del plànol
summary: Els noms de capa fixos, els colors i els gruixos de línia que CivilCraft fa servir a la pantalla, al DXF i al PDF, i quin paràmetre de visualització controla cadascun.
keywords: capes, noms de capa, ncs, colors, aci, gruixos de línia, capes dxf, pdf, paràmetres de visualització, línies
from: c2aa8475
---

Tot el que hi ha al plànol pertany a una capa. Els noms segueixen el patró habitual de capes civils (disciplina, grup principal, grup secundari). Les capes són fixes en aquesta versió: no les podeu canviar de nom, ni canviar-ne els colors, ni afegir-ne de pròpies. Al DXF, cada capa té el número de color que es mostra; al PDF amb {{ui:Colors de capa}}, s'usen els mateixos colors, i amb {{ui:Negre}} tot s'imprimeix en negre.

| Capa | Conté | Color (número DXF) | Es mostra quan |
|---|---|---|---|
| C-TOPO-MINR | Corbes secundàries | Gris (8) | {{ui:Corbes de nivell}} |
| C-TOPO-MAJR | Corbes principals | Blanc o negre (7) | {{ui:Corbes de nivell}} |
| C-TOPO-TEXT | Etiquetes de corbes | Blanc o negre (7) | {{ui:Corbes de nivell}} i {{ui:Etiquetes de corbes}} |
| C-TOPO-TINN | Arestes dels triangles | Gris (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Línies de ruptura i el límit | Taronja (30) | {{ui:Línies de ruptura}} |
| C-TOPO-BNDY | Vora de la superfície | Blanc o negre (7) | {{ui:Vora de la superfície}} |
| C-TOPO-SLOP | Fletxes de talús | Cian (4) | {{ui:Fletxes de talús}} |
| V-NODE | Punts topogràfics | Verd (3) | {{ui:Punts}} |
| V-NODE-TEXT | Etiquetes de punts: número, cota, descripció | Verd (3) | {{ui:Punts}} i {{ui:Etiquetes de punts}} |
| V-NODE-LINE | Línies dels codis de línia (grups que no són línies de ruptura) | Verd (3) | {{ui:Punts}} |
| C-ROAD-CNTR | Eixos del traçat | Vermell (1) | Sempre |
| C-ROAD-STAN | Marques i etiquetes de PK, PC i PT | Vermell (1) | Sempre |
| C-ROAD-CORR | Vores del corredor | Groc (2) | Sempre |
| C-ROAD-SCTN | Línies de mostra (on es tallen les seccions) | Gris (8) | Quan el traçat té línies de mostra |
| C-GRAD-PADS | Contorns de plataformes | Blau (5) | Sempre |
| C-GRAD-DAYL | Línies de tall | Magenta (6) | Sempre |
| C-GRAD-SLOP | Línies de talús d'explanació | Magenta (6) | Sempre |
| C-GRAD-FEAT | Línies característiques (3D) | Verd (3) | Sempre |
| C-ROAD-SWPT | Trajectòries d'escombrat: contorn, rodes exteriors, nom | Taronja (30) | Sempre |
| C-STRM-PIPE | Canonades | Blau (5) | {{ui:Canonades}} |
| C-STRM-STRC | Estructures | Blau (5) | {{ui:Canonades}} |
| C-STRM-TEXT | Etiquetes de canonades i estructures | Blau (5) | {{ui:Canonades}} |
| C-STRM-PROB | Canonades i estructures amb problemes | Vermell (1) | {{ui:Canonades}} |

Les línies de ruptura només es dibuixen mentre **Superfície** de **Visualització** sigui {{ui:Terreny actual}}; el límit es dibuixa amb qualsevol de les dues superfícies.

## Gruixos de línia al PDF

| Gruix | Capes |
|---|---|
| 0.50 mm | Eixos del traçat, plataformes, canonades, canonades amb problemes |
| 0.35 mm | Corbes principals, línies de tall, estructures |
| 0.25 mm | Línies de ruptura |
| 0.13 mm | Corbes secundàries |
| 0.09 mm | Arestes dels triangles, línies de talús d'explanació |
| 0.18 mm | La resta |

Els fitxers DXF no porten gruixos de línia; definiu-los per capa al vostre programa CAD.

## Mides de les etiquetes

Les etiquetes es dimensionen sobre el paper: les etiquetes de corbes 2.0 mm, les de PK 1.8 mm, les de PC i PT i les de canonades i estructures 1.6 mm, i les de punts 1.5 mm. Les etiquetes de canonades indiquen el nom, el diàmetre i el pendent; les d'estructures, el nom i la coronació. A la pantalla mantenen la mateixa mida en fer zoom. Al DXF s'escalen segons l'escala indicada al missatge d'exportació; vegeu [Exporta el plànol a DXF](topic:dxf-export).

## No apareix en cap capa

Les bandes d'elevació es dibuixen sota les línies només a la pantalla. La vista de perfil no forma part del plànol.
