---
title: Rețele de utilități și OpenStreetMap
summary: Tronsoane de apă, canalizare, pluvial, gaz, energie și telecomunicații, cu material, dimensiune, adâncime de îngropare și proprietar; date OpenStreetMap dintr-un fișier JSON Overpass; intersecții, secțiuni de șanț și volume; straturi de servicii în DWG, DXF și PDF; segmente de conductă și de cablu IFC.
keywords: utilitate, utilități, rețea, osm, openstreetmap, overpass, conductă, cablu, gaz, canalizare, pluvial, telecomunicații, energie, apă, hidrant, cămin, șanț, intersecție, distanță liberă, adâncime de îngropare, adâncime, dwg, ifc, georeferențiat, straturi
from: 8a85dace
---

Desenați serviciile îngropate ale unui amplasament, câte o rețea pentru fiecare serviciu, verificați unde se intersectează și trimiteți-le ca straturi de desen și ca IFC.

## Creare tronsoane

Deschideți **Model de teren, Mai multe, Rețele de utilități...**

- **Creare tronson din selecție** transformă axul traseului, linia caracteristică sau conducta selectată într-un tronson al serviciului ales. Apoi completați în tabel materialul, dimensiunea (mm), adâncimea de îngropare (distanța până la partea de sus a conductei sau a cablului) și proprietarul.
- **Citire date OpenStreetMap** citește un fișier JSON Overpass salvat (o interogare cu `out geom;`). Proiectul are nevoie mai întâi de un sistem de coordonate, deoarece pozițiile OpenStreetMap sunt latitudine și longitudine. Sunt citite conductele (după substanță), cablurile electrice și de telecomunicații subterane, hidranții, căminele și canalele pluviale; orice altceva se numără ca exclus și se precizează în mesaj. Liniile aeriene sunt excluse.
- **Adăugare hartă OpenStreetMap** adaugă harta OpenStreetMap sub plan. Se desenează doar dacă straturile de hartă de pe internet sunt active în Setări.

## Verificări și ieșiri

- **Intersecții**: tronsoanele unor servicii diferite care se intersectează în plan sunt listate cu înălțimea liberă dintre ele, acolo unde există o suprafață a terenului; minimul este un substituent pe care îl setați, nu cifra unui standard.
- **Șanț**: fiecare tronson primește un șanț (dimensiunea conductei plus distanța liberă de fiecare parte, panta laterală, patul) cu un volum. Totalul apare în fereastră și în CSV.
- **Desen**: tronsoanele și punctele se află pe straturi de servicii (de exemplu U-WATR-RUN, U-POWR-RUN), astfel încât ajung în PDF, DXF și DWG.
- **IFC**: tronsoanele intră în exportul IFC ca segmente de conductă și segmente de cablu, împreună cu hidranți, robinete (vane) și cămine, câte un sistem pentru fiecare serviciu, în sistemul de coordonate al proiectului.

## Date OpenStreetMap

Datele OpenStreetMap sunt protejate prin drepturi de autor ale contribuitorilor OpenStreetMap și sunt licențiate sub ODbL. Atribuirea este adăugată în desen, în CSV și în IFC. Dacă partajați un fișier care conține date OpenStreetMap, păstrați atribuirea și citiți condițiile licenței privind partajarea în aceleași condiții.

## Ce nu este încă realizat

Tronsoanele nu se desenează încă punct cu punct pe plan cu o unealtă, iar intersecțiile nu se desenează încă în vizualizarea profilului (calculul este realizat). Adâncimile, dimensiunile și distanțele libere pornesc ca substituenți: folosiți cifrele din standardul propriu.
