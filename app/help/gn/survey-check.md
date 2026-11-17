---
title: Ohechakuaa relevamiento plano importación-pe
summary: Ojehai niveles texto-pe térã bloque atributo-pe relevamiento puntos rehe, ha DWG térã DXF ohechakuaa unidades ojeikeʼỹva, sistema de coordenadas ndaipóriva, origen hetã-pe, curvas plano-pe, niveles raro ha puntos doble, terreno ojapo mboyve.
keywords: revisión de relevamiento, revisión de importación, niveles de relevamiento, cotas puntuales, niveles en texto, niveles como texto, atributos, unidades, sistema de coordenadas, lejos del origen, curvas en cero, valores atípicos, puntos duplicados, problemas, arquitecto paisajista, plano de relevamiento
from: d46acd24
---

Relevamiento plano oĩ porã ha oĩ mbaʼeporã terreno-pe ndaha'éi: unidades oñemboguatáva, curvas plano 0 altura-pe, térã niveles texto ha'e ndaha'éi geometría. **Survey levels and check** sección de {{ui:Linework}} diálogo-pe (ver [Abrir DWG térã DXF líneas-pe](topic:open-dwg-dxf)) ohecha niveles ha ohechauka mba'e ojeikeʼỹ oñemoĩ mboyve.

## Niveles texto térã atributo-pe

Ojeporeka plano relevamiento-pe spot level peteĩ texto michĩ cruz rehe, upéicha `104.37` térã `EL 104.37`, térã bloque punto atributo-pe. Ndaha'éi líneas, upévare linework lector ndojekuaáiva. Sección ohechauka cuánto ojuhu ha eheja **puntos de relevamiento**-pe:

1. Eapreta **Tomar … niveles como puntos de relevamiento**. Ndaipóri ojapo oñeiporavo, ndaha'éi peteĩteĩ número altura.
2. Texto ojuhu nivel ojeupe jave: número decimal ndive (`104.37`, `+104,37`, `-3.50`), térã número `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` térã `LEVEL` mboyve, `m`, `ft` térã `'` opcional. Peteĩ número entero (`12`) lote térã hoja número ojeikeʼỹ, nivel ndaha'éi; `GATE 3` térã fecha ndojejuhúi. Texto formato código ojekárape.
3. Bloque atributo-pe, eheja **Atributo de bloque que contiene el nivel**. CivilCraft ojuhu ELEV, Z, LEVEL, RL térã similar mba'e; ambue ojeporeka lista-gui plano-pe ojeporeka. Eleción ojeporomandu archivo réra-pe ko computadora-pe, upévare oñepyrũ mismo etiqueta-pe. Etiqueta eheja entero numero nivel-pe.
4. Eapreta {{ui:Add}}. Puntos oñumera proyecto mayor número mboyve, peteĩteĩ punto capa (térã bloque) ndive oñemoĩ, altura proyecto unidades-pe oñemoambue. Ko'ã peteĩ paso: {{key:Mod+Z}} oñeʼẽ puntos.

Texto oĩ iinserción punto-pe (térã alineación punto). Bloque ryepýpe texto ndojekuaáiva, plano ndojejoavýi.

## Revisión

Revisión oñeʼẽ oikéva importación-pe ha ohechauka peteĩteĩ tipo problema línea-pe:

| Ohechauka | Mba'e ha'e |
|---|---|
| **Unidades no indicadas** | Plano ndohechauka unidades, upévare números proyecto unidades-pe ojeikuaa. Eheka peteĩ distancia ohekákuaa. |
| **Unidades convertidas** | Plano unidades proyecto ndive ojeikeʼỹ, escala oñemoambue (nota, ndaha'éi falla). |
| **Los datos abarcan … km** térã **… m** | Extensión 200 km mboyve térã medio metro mboyve, usualmente unidad iporãva (milímetro metro-pe térã metro milímetro-pe). |
| **Sin sistema de coordenadas** | Proyecto ndoguerekói. Advertencia cero ndive mboyve datos, estado plano térã red nacional coordenadas. Ver [Sistemas de coordenadas](topic:coordinate-systems). |
| **Lejos del origen** | Datos 100 km mboyve cero-gui. Cero-gui 3D vista ha exportación precisión oñeʼẽ ha tembla. |
| **Capa de curvas … sin altura** | Capa réra curvas ojeupe (TOPO, CONT, CNTR, CONTOUR) altura 0 líneas, upévare terreno ojapo ha'e plano. |
| **Niveles exactamente 0** | Algunos niveles 0 ha tipo nivel ndaipóri cero: probable altura faltante. |
| **Niveles lejos del resto** | Peteĩ niveles hasy'ỹ ambue-gui (medio niveles ndive ojuhu, upévare sitio empinado amplio rango ndojehechauka), térã 9.000 m mboyve térã -11.000 m mboyve. |
| **Puntos encima de otro punto** | Dos puntos mismo lugar mismo nivel térã nivel ojeikeʼỹva. |

Eapreta {{ui:Add}} rire, mismo líneas **Problemas**-pe oúva, peteĩteĩ tipo-pe, archivo réra ndive, upévare jey ohecha. Revisión plano ohecha, ndojemoambuéi; ndoñemboguejýi plano importación.

:::tip
Revisión ohechauka curvas plano 0-pe ha niveles texto-pe, eheja niveles puntos de relevamiento-pe: ojuhu altura real curva líneas ndoguerekóva.
:::

## Mba'e ndohechaukáiva

Revisión ndohechaukái ambue relevamiento ndive, ndaikuaaiva plano mba'e sistema coordenadas oĩ: ohechauka chupe ndaipóri ojeporeka.
