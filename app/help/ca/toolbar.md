---
title: Referència de la barra d'eines
summary: Cada botó de la barra d'eines de CivilCraft, què fa, la seva tecla, i quan està atenuat o es nega.
keywords: barra d'eines, botons, ordres, eines, fitxer, exporta, superfície, disseny, edita, vista, menú
from: 4c4352bc
---

La barra d'eines recorre la part superior de l'aplicació en set grups. Cada botó mostra la seva descripció i la seva tecla quan hi passeu el punter.

## Fitxer

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:Nou}} | cap | Inicia un projecte buit. Pregunta primer si hi ha canvis sense desar. |
| {{ui:Obre}} | {{key:Mod+O}} | Obre un fitxer de punts (CSV, TXT), LandXML o un projecte de CivilCraft. |
| {{ui:Desa}} | {{key:Mod+S}} | Baixa el projecte com a `<name>.civilcraft.json`. |

## Exporta

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:LandXML}} | cap | Baixa `<name>.xml`: punts, superfícies, traçats, perfils i la xarxa de canonades com a LandXML 1.2. "Encara no hi ha res per exportar." quan el projecte està buit. |
| {{ui:DXF}} | cap | Baixa `<name>.dxf`: les línies del plànol com a DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Obre **Traça el plànol a PDF**. "Encara no hi ha res per traçar." quan el projecte està buit. |

## Superfície

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:Línia de ruptura}} | {{key:B}} | Feu clic als punts topogràfics en ordre, {{key:Enter}} per acabar. La línia de ruptura pren les cotes dels punts. |
| {{ui:Contorn}} | {{key:O}} | Feu clic als vèrtexs del contorn exterior, {{key:Enter}} per acabar. Substitueix qualsevol contorn. |

Totes dues diuen "Encara no hi ha superfície: obriu primer els punts topogràfics." quan no hi ha superfície.

## Disseny

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:Traçat}} | {{key:A}} | Feu clic als PI en ordre, {{key:Enter}} per acabar. |
| {{ui:Plataforma}} | {{key:G}} | Feu clic als vèrtexs de la plataforma, {{key:Enter}} per acabar. Com les eines de superfície, avisa quan no hi ha superfície; una plataforma només es perfila sobre una. |
| {{ui:Canonades}} | {{key:P}} | Feu clic a les estructures des de la part de dalt cap avall (feu clic a una d'existent per unir-s'hi), {{key:Enter}} per acabar. |
| {{ui:Perfil}} | {{key:R}} | Mostra o amaga la vista del perfil sota el plànol. |

## Edita

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:Desfés}} | {{key:Mod+Z}} | Desfà l'últim canvi (fins a 200). Atenuat quan no hi ha res per desfer. |
| {{ui:Refés}} | {{key:Mod+Y}} | Refà el que s'ha desfet. Atenuat quan no hi ha res per refer. |
| {{ui:Copia}} | {{key:Mod+C}} | Copia els punts topogràfics seleccionats, i els posa al porta-retalls com a files de punts que un full de càlcul pot llegir. Atenuat fins que se seleccionen punts. |
| {{ui:Enganxa}} | {{key:Mod+V}} | Enganxa punts: segueixen el punter, i un clic els posa amb números que cap altre punt no té. Les files de punts copiades en un full de càlcul també s'enganxen. |
| {{ui:Més}} | cap | Obre el menú de sota. |

El menú {{ui:Més}}:

| Element | Tecla | Què fa |
|---|---|---|
| {{ui:Retalla}} | {{key:Mod+X}} | Copia els punts seleccionats i els suprimeix (un pas per desfer). |
| {{ui:Copia}} | {{key:Mod+C}} | Com el botó {{ui:Copia}}. |
| {{ui:Enganxa}} | {{key:Mod+V}} | Com el botó {{ui:Enganxa}}. |
| {{ui:Enganxa al mateix lloc}} | {{key:Mod+Shift+V}} | Enganxa els punts a les seves pròpies coordenades, amb números que cap altre punt no té. |
| {{ui:Duplica}} | {{key:Mod+D}} | Una còpia dels punts seleccionats segueix el punter; feu clic on ha d'anar. El porta-retalls no es toca. |
| {{ui:Suprimeix}} | {{key:Delete}} | Suprimeix els punts topogràfics seleccionats, o el traçat, la plataforma, l'estructura seleccionada (amb les seves canonades), la canonada o el PVI seleccionat. |
| {{ui:Selecciona-ho tot}} | {{key:Mod+A}} | Selecciona tots els punts topogràfics. |
| {{ui:Neteja la selecció}} | {{key:Esc}} | Esborra la selecció. |

Un element que no pot actuar en aquest moment està atenuat, i la seva descripció diu per què. Detalls: [Selecciona, copia i enganxa punts topogràfics](topic:copy-paste-points).

Desfés cobreix les edicions del disseny, la configuració de la superfície i els punts topogràfics (enganxar, retallar, duplicar, suprimir). No cobreix la configuració de visualització, i obrir o importar qualsevol fitxer buida la llista.

## GIS

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:Coordenades}} | cap | Obre el diàleg **Sistema de coordenades**: digueu en quin sistema és el projecte, o useu coordenades de terreny o locals. Vegeu [Estableix el sistema de coordenades del projecte](topic:coordinate-systems) i [Coordenades de terreny i locals](topic:ground-and-local-coordinates). |
| {{ui:Importa}} | cap | Importa dades GIS: shapefiles, GeoJSON, GeoPackage, graelles d'elevació i LiDAR. Vegeu [Importa dades GIS](topic:gis-import). |
| {{ui:Exporta}} | cap | Exporta les dades com a construïdes per a un departament GIS. Vegeu [Exporta dades com a construïdes per a GIS](topic:gis-export). |
| {{ui:Analitza}} | cap | Obre el panell d'anàlisi GIS: zona d'influència, superposició, unió espacial, selecció per atribut, mesura. Vegeu [Analitza capes GIS](topic:gis-analysis). |
| {{ui:Taula d'atributs}} | cap | A Superfície › Més. Obre la taula d'atributs d'una capa GIS: ordena, filtra, selecciona, edita, afegeix camps, calcula, desa com a CSV. Vegeu [Treballa amb la taula d'atributs d'una capa](topic:gis-table). |
| {{ui:Mapa}} | cap | Obre el diàleg **Capes del mapa**: una imatge georeferenciada, o servidors de mapes que afegiu, dibuixats sota el plànol. Vegeu [Mostra capes de mapa sota el plànol](topic:map-layers). |

Les eines GIS es carreguen la primera vegada que useu un d'aquests botons, obriu un fitxer GIS, o obriu un projecte que té un sistema de coordenades o capes GIS.

## Vista

| Botó | Tecla | Què fa |
|---|---|---|
| {{ui:Selecciona}} | {{key:V}} o {{key:Esc}} | Feu clic per seleccionar traçats, plataformes, estructures, canonades i punts ({{key:Shift}} i un clic o un arrossegament n'afegeixen punts); arrossegueu les nanses per moure els PI, els vèrtexs de les plataformes i les estructures. |
| {{ui:Ajusta}} | {{key:F}} | Fa zoom al plànol per mostrar la superfície, els punts, els traçats i les plataformes (a la vista 3D: mostra-ho tot). |
| {{ui:3D}} | {{key:D}} | Mostra el lloc en 3D sobre el plànol, o torna al plànol. La barra sobre la vista 3D estableix la vista, l'exageració, els colors i què es mostra, i exporta GLB o OBJ. Vegeu [Mostra el lloc en 3D](topic:site-3d). |

## Botons als tauler

| Botó | On | Què fa |
|---|---|---|
| {{ui:Obre el lloc de mostra}} | La caixa d'un plànol buit | Carrega el plànol topogràfic de mostra (cal una connexió, tret que CivilCraft estigui desat per usar-lo sense connexió) |
| {{ui:Elimina el límit}} | Tauler esquerre, Superfície | Treu el contorn exterior |
| {{ui:Elimina les línies de ruptura dibuixades}} | Tauler esquerre, Superfície | Elimina totes les línies de ruptura dibuixades amb l'eina (no els grups de línies de ruptura) |
| {{ui:Reconstrueix la superfície a partir dels punts}} | Tauler esquerre, Superfície (només superfície LandXML) | Elimina la TIN del LandXML i construeix a partir dels punts; no es pot desfer |
| {{ui:Comença des del terreny}} | Tauler dret, Traçat | Comença un perfil de projecte amb un PVI sobre el terreny a cada extrem |
| {{ui:Vista del perfil}} | Tauler dret, Traçat | Obre la vista del perfil d'aquest traçat |
| {{ui:Afegeix PVI}} | Barra del perfil | Mentre està premut, un clic al perfil afegeix un PVI |
| {{ui:Estableix totes les cotes de solera segons les regles}} | Tauler dret, Xarxa de canonades | Estableix les cotes de solera de totes les canonades segons les regles |
| {{ui:Estableix-ne les cotes de solera segons les regles}} | Tauler dret, Canonada | Estableix les cotes de solera d'aquesta canonada segons les regles |
