---
title: Deixar que un assistent d'IA treballi amb l'emplaçament
summary: Activar els assistents a Configuració perquè un assistent del vostre ordinador pugui llegir l'emplaçament obert (punts, superfícies, volums, perfils, parcel·les), afegir punts de topografia, desar i exportar LandXML o DWG, a través de CadCraft Studio. Desactivat fins que l'activeu.
keywords: ia, assistent, mcp, script, automatització, studio, punts, elevació, PK, desplaçament, traçat, volum, desmunt, terraplè, perfil, parcel·la, landxml, dwg, usd, carpetes, permisos, desconnecta, activitat
from: d0356582
---

## Què aprendreu

Com deixar que un assistent d'IA (qualsevol assistent que parli MCP) treballi amb l'emplaçament que teniu obert, què pot i què no pot fer, i com aturar-lo.

## Què pot fer un assistent a CivilCraft

| Ho demana | Què obté | Necessita |
|---|---|---|
| L'emplaçament | Nom, unitats, sistema de coordenades, grups de punts, traçats, superfícies, plataformes, parcel·les i canonades | Lectura |
| Punts de topografia | Número, X (est), Y (nord), elevació i descripció, per grup, per descripció o dins d'un rectangle | Lectura |
| Elevacions de la superfície | El terreny existent (o la superfície explanada) en els punts que indiqui | Lectura |
| PK i desplaçaments | El PK i el desplaçament de punts al llarg d'un traçat, o les coordenades i l'elevació del terreny dels PK | Lectura |
| Un perfil | Elevacions del terreny, del perfil de disseny i de la superfície explanada al llarg d'un traçat, cada tants ft o m | Lectura |
| Desmunt i terraplè | Volums entre el terreny existent i la superfície explanada (també cada plataforma i corredor), o entre el terreny i un nivell | Lectura |
| Parcel·les | Vèrtexs, àrea (en acres o hectàrees), perímetre i la descripció legal | Lectura |
| Una selecció | Els punts que indica se seleccionen al plànol, com si els haguéssiu triat | Edició |
| Nous punts de topografia | Punts afegits amb els números que dona, o els següents de lliures. Cada crida és un pas que podeu desfer | Edició |
| Desar | El propi {{ui:Desa}} de CivilCraft | Desa |
| LandXML o DWG | Els mateixos fitxers que els botons {{ui:LandXML}} i {{ui:DWG}} | Exporta |
| L'emplaçament en 3D | OpenUSD (.usdz, .usda o .usdc) del terreny, la superfície explanada, les plataformes i les canonades, tal com l'exporta la vista 3D | Exporta |
| Plantes i el quadre de plantes | Plantes trobades a la llista de plantes per qualsevol nom, i els recomptes del quadre de plantes | Lectura |
| Plantació i explanació | Plantes, un parterre o una tanca vegetal col·locats, o una plataforma, una berma, una rigola o una zona d'explanació afegits; cada un és un pas que podeu desfer, amb el seu desmunt i terraplè | Edició |
| Una comprovació de reg | El cabal de cada zona, la pressió necessària a la seva vàlvula i a l'alimentació, l'altura del pitjor cas, els temps de funcionament, els problemes i la llista de materials, com a ajuda al càlcul que un dissenyador de reg revisa | Lectura |

Funciona amb l'emplaçament que hi ha obert. A Studio també pot desar i exportar en carpetes que trieu (més avall); sense carpeta, els seus fitxers es baixen com ho fan els botons.

## Activeu-ho

Els assistents arriben a CivilCraft a través de CadCraft Studio al vostre ordinador; el navegador simple no hi té accés.

1. Obriu {{ui:Configuració}} i trieu la pestanya **CivilCraft**.
2. Sota **Assistents**, marqueu **Permet que els assistents d'IA i els scripts utilitzin CivilCraft**.
3. **Lectura** ja està marcada per a vosaltres. Marqueu **Edició**, **Desa** o **Exporta** només quan l'assistent les necessiti.
4. Per deixar-lo desar i exportar en una carpeta, trieu {{ui:Afegeix una carpeta…}} sota **Carpetes que pot utilitzar** i trieu la carpeta al diàleg de Studio. {{ui:Elimina}} la retira a l'instant; qualsevol altra ruta es rebutja.
5. Connecteu l'assistent a Studio (Studio mostra l'adreça i la configuració per enganxar-hi).

## Mentre hi ha un assistent connectat

Una nota a la part superior del panell dret indica quin assistent està connectat i què pot fer. Feu clic a {{ui:Desconnecta}} per acabar la seva sessió a l'instant; haurà de tornar a connectar-se per continuar.

**Activitat**, sota **Assistents** a Configuració, llista cada crida que ha fet l'assistent, la més recent primer, amb indicació de si ha funcionat.

:::tip
Demaneu-ho amb paraules senzilles, per exemple "quina és l'elevació del terreny cada 50 ft al llarg del carrer Major?", "quant desmunt i terraplè necessiten les plataformes?" o "afegeix un punt de control en aquestes coordenades". L'assistent llegeix l'emplaçament i respon, o fa el canvi com un pas que podeu desfer.
:::

## Sense obrir CivilCraft

El servidor de fitxers de CadCraft per a assistents (`npx @getcadcraft/mcp`) i la línia d'ordres `cadcraft` obren projectes de CivilCraft desats (`.civilcraft.json`) i fitxers de punts amb el propi codi de CivilCraft, sense finestra: les mateixes eines de lectura, l'addició de punts, el desament del projecte, LandXML i l'emplaçament en 3D com a OpenUSD. `cadcraft convert site.civilcraft.json site.xml` escriu LandXML des de la línia d'ordres. Obrir LandXML, l'exportació DWG i les eines de l'espai de treball Paisatge encara necessiten la finestra de CivilCraft.

## Desactiveu-ho

Desmarqueu **Permet que els assistents d'IA i els scripts utilitzin CivilCraft**. Tots els assistents es desconnecten de seguida, i la configuració es guarda per a la propera vegada.

## Vegeu també

- [Receptes per a assistents d'IA](common:assistants-recipes): exemples treballats, cadascun amb les eines que crida.
- [Dissenyar un traçat horitzontal](topic:alignment)
- [Construir i refinar la superfície](topic:build-surface)
- [Selecciona, copia i enganxa punts de topografia](topic:copy-paste-points)
- [Configuració de CivilCraft](topic:settings)
