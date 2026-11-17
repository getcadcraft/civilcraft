---
title: Dibuixar volums d'edificació en un emplaçament
summary: Dibuixar un volum d'edificació sobre una parcel·la, donar-li plantes i alçada de planta, veure'n la superfície bruta de planta, triar com s'assenta en terreny inclinat, empènyer i estirar la seva alçada en 3D, i enviar-lo a BimCraft o desar-lo com a fitxer IFC.
keywords: volum, massing, volum d'edificació, volum, petjada, plantes, alçada de planta, superfície bruta de planta, GFA, pendent, podi, desmunt i terraplè, empènyer i estirar, 3D, estudi d'emplaçament, disseny inicial, IFC, desenvolupar, BimCraft, A-MASS
from: e5a67c16
---

Un volum d'edificació és una petjada, un nombre de plantes i una alçada de planta: la pregunta inicial "quant d'edifici hi cap aquí, i què fa al terreny". Els volums es posen sobre el plànol amb el seu nom, el nombre de plantes i la superfície bruta de planta; passen a l'exportació PDF i a les exportacions DWG i DXF a les capes `A-MASS` i `A-MASS-TEXT`, i es desen al fitxer del projecte.

## Dibuixa un volum

1. A **Propietats**, sota **Volums d'edificació**, feu clic a **Dibuixa un volum**. (També és al menú **Més** de la barra d'eines, al costat de **Superfície**.)
2. Feu clic als racons de la petjada. Un clic a prop d'un racó de parcel·la o d'un punt de topografia pren el lloc exacte d'aquest punt.
3. Torneu a fer clic al primer racó, o premeu {{key:Enter}}, per acabar. {{key:Backspace}} desfà l'últim racó; {{key:Esc}} atura.

Un volum nou té tres plantes i una alçada de planta de 12 ft (3.6 m), i pertany a la parcel·la on cau el seu centre.

## Plantes, alçada i superfície

Feu clic a un volum per canviar-ne el **Nom**, l'**Ús**, les **Plantes**, l'**Alçada de planta** i la **Parcel·la**. L'**Alçada** és les plantes per l'alçada de planta: escriviu una alçada i el nombre de plantes passa al nombre sencer més proper (mai menys d'una). La **Petjada** i la **Superfície bruta de planta** (petjada per plantes) es calculen per vosaltres.

## En terreny inclinat

El terreny sota un volum es llegeix de la superfície: el terreny existent, o el terreny explanat quan heu triat **Terreny projectat (explanat)**. **En terreny inclinat** indica on va la planta baixa:

- **Escalonat**: a l'elevació mitjana del terreny sota la petjada. La part baixa s'omple fins a aquesta i la part alta es talla, i les dues quantitats s'acosten a compensar-se.
- **Podi**: al terreny més alt. Una base sòlida omple la part baixa.
- **Desmunt**: al terreny més baix. La part alta es talla fins al turó.

Propietats mostra el rang del terreny sota el volum, el **Nivell de la planta baixa**, i el volum de terraplè i de desmunt entre el terreny i aquest nivell. Un punt de la petjada que és fora de la superfície queda exclòs, i Propietats diu quants n'hi ha.

## A la vista 3D

Els volums es dibuixen a la vista 3D de l'emplaçament, amb una línia a cada planta i els seus noms sobre la coberta. **Mostra** té una casella per als **Volums d'edificació**. Feu clic a un per seleccionar-lo. Amb un volum seleccionat:

- arrossegueu la seva coberta amunt o avall per empènyer o estirar una planta cada vegada, o premeu {{key:PageUp}} i {{key:PageDown}};
- tot el moviment és un sol pas per desfer.

La vista de carrer de **Conducció** també els veu, i **Sol** projecta les seves ombres sobre el terreny.

## Envia-ho més enllà

- **Volums com a IFC** desa cada volum com a fitxer IFC4: un emplaçament, un edifici amb les seves plantes, i el volum com a element de l'edifici amb els seus números al conjunt de propietats `CadCraft_SiteMass`. Amb un sistema de coordenades definit al projecte, el fitxer es col·loca al mapa i porta la latitud i la longitud de l'emplaçament; sense, no diu res sobre on és.
- **Desenvolupa a BimCraft** obre BimCraft en una pestanya nova amb els volums. Allà, en triar un volum es mostren els seus números i **Desenvolupa aquest volum**, que construeix parets a cada nivell i un forjat sota l'edifici a partir de la petjada, en un sol pas per desfer. No es puja res: el fitxer passa entre les dues pestanyes d'aquest navegador.

Vegeu també **Límits de zonificació** i **Hores de sol**.
