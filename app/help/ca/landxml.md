---
title: Intercanviar LandXML
summary: Obriu LandXML d'un altre programari civil com a projecte nou, exporteu punts, superfícies, traçats, perfils i la xarxa de tubs com a LandXML 1.2, i sabeu què no fa el viatge.
keywords: landxml, xml, importar, exportar, intercanvi, tin, superfície, traçat, perfil, xarxa de tubs, interoperabilitat, intercanvi de dades
from: 870d5ece
---

LandXML és el format d'intercanvi obert que la majoria de programes civils llegeixen i escriuen. CivilCraft llegeix i escriu LandXML 1.2. Si heu usat Civil 3D, els seus diàlegs d'importació i exportació de LandXML són el més semblant; aquí no hi ha opcions per triar, i les notes us diuen què s'ha deixat fora.

## Obrir un fitxer LandXML

1. Feu clic a {{ui:Obre}} (o premeu {{key:Mod+O}}) i trieu el fitxer `.xml` o `.landxml`, o deixeu-lo anar sobre el plànol.
2. Si el projecte actual té canvis sense desar, CivilCraft ho pregunta primer. Trieu {{ui:Desa una còpia}}, {{ui:No desis}} o {{ui:Cancel·la}}.
3. Es crea un **projecte nou**. La barra d'estat diu què s'ha llegit, per exemple "S'ha obert site.xml: 412 punts, 2 superfícies, 3 traçats."
4. Mireu el quadre sota la secció **Superfície**. Enumera tot el que s'ha omès o canviat, per exemple:
   - "Només s'ha obert la primera superfície ("EG"); el fitxer en té 1 més."
   - "El traçat "Ramp A" té elements que CivilCraft encara no pot dibuixar (no són línies, arcs ni clotoides); s'ha omès."
   - "Les regles de la xarxa de tubs no eren al fitxer; s'usen els marcadors de posició: definiu les vostres a Projecte."

Què esdevé què:

| Al fitxer | A CivilCraft |
|---|---|
| Units (Imperial o Metric) | Les **Unitats** del projecte (peus o metres) |
| Project name | El **Nom** del projecte |
| CgPoints | Els punts del projecte; la descripció (o el codi) n'indica el grup |
| La primera superfície TIN | El terreny existent, usat tal com és ("Superfície (de LandXML)") |
| Cada traçat de línies, arcs i clotoides | Un traçat amb els seus PI, radis i longituds d'espiral reconstruïts a partir de les corbes |
| El primer perfil de projecte de cada traçat | El seu perfil de projecte, amb acords verticals parabòlics |
| La primera xarxa de tubs | La xarxa de tubs, amb les seves vores, pous de recollida i cotes de solera |
| Plan features de línies i arcs | Línies característiques, amb els arcs mantinguts; des d'un altre programa comencen com a **Només dibuixada** |

La llista completa d'elements i atributs és a [LandXML: què es llegeix i què s'escriu](topic:landxml-reference).

:::note
Una superfície llegida de LandXML no es reconstrueix quan canvieu els grups de punts o dibuixeu línies de ruptura. Feu clic a {{ui:Reconstrueix la superfície a partir dels punts}} a la secció **Superfície** per construir-la a partir dels punts ({{key:Mod+Z}} torna a posar la superfície de LandXML).
:::

## Exportar LandXML

1. Feu clic a {{ui:LandXML}} al grup **Exporta**.
2. El navegador baixa `<nom>.xml`. La barra d'estat diu què hi ha entrat, per exemple "S'ha exportat LandXML 1.2: 276 punts, 2 superfícies, 1 traçat, la xarxa de tubs. Les plataformes no formen part de LandXML aquí; sí que ho és la superfície projectada."

El fitxer conté:

- **Unitats**: peus d'enquesta dels EUA o metres.
- **CgPoints**: cada punt amb el seu número com a nom, la seva descripció i el seu grup com a codi.
- **Surfaces**: el terreny existent com a TIN, amb les seves línies de ruptura i el contorn exterior com a dades d'origen; i, quan les plataformes o els corredors s'explanen, una segona superfície TIN anomenada "Proposed".
- **Alignments**: línies, arcs i clotoides amb les seves abscisses, cadascun amb un perfil que conté el terreny existent mostrejat al llarg seu i el perfil de projecte (PVI i corbes parabòliques) quan té almenys dos PVI.
- **PipeNetworks**: estructures amb les seves vores, pous de recollida i cota de solera per tub, i els tubs amb diàmetre, longitud i pendent.
- **PlanFeatures**: cada línia característica com a línies i arcs, amb la cota a cada extrem, i per a què s'usa.

## Què no fa el viatge

- Plataformes i corredors com a objectes. El seu resultat és a la superfície "Proposed".
- Traçats amb errors (per exemple, corbes que se superposen): s'exclouen i es compten al missatge d'estat.
- Tubs sense les dues cotes de solera, i xarxes amb menys de dues estructures.
- Una vora presa de la superfície s'escriu com a vora fixa. En tornar-lo a obrir, l'estructura conserva aquest número encara que la superfície canviï.
- Regles de la xarxa (pendent mínim, recobriment, desnivell): LandXML no hi té lloc.
- La configuració de visualització i les opcions de superfície dels grups de punts: deseu un projecte de CivilCraft per a això.

En obrir, CivilCraft no llegeix espirals que no siguin clotoides, superfícies de graella, punts que només es refereixen a altres punts, parcel·les, espirals en línies característiques, carreteres ni dades topogràfiques. Cadascun es fa constar a les notes, mai no s'endevina.

## Anada i tornada

Per lliurar la feina a algú que usa altre programari civil i recuperar-la, exporteu LandXML, deixeu que la editi i obriu el seu LandXML com a projecte nou. Guardeu també el vostre propi `.civilcraft.json`: és l'únic fitxer que conserva tot el que CivilCraft sap.
