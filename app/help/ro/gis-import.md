---
title: Importul datelor GIS
summary: Aduceți shapefile, GeoJSON și GeoPackage într-un proiect ca straturi GIS, plasați-le prin sistemul de coordonate potrivit, consultați-le atributele și folosiți-le pentru modelul de teren.
keywords: gis, etichete, etichetarea elementelor, atribute pe plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, straturi, atribute, sistem de coordonate, epsg, latitudine, longitudine, curbe de nivel, parcele, linii de rupere, limită
from: f6b235cc
---

Departamentele GIS ale orașelor și județelor oferă contextul amplasamentului sub formă de fișiere GIS: parcele, servituți, curbe de nivel, utilități, puncte de sprijin ale măsurătorilor. CivilCraft deschide trei tipuri ca **straturi GIS**, care stau sub proiectare pe plan.

| Fișier | Ce se deschide |
|---|---|
| Shapefile | `.shp` împreună cu `.shx`, `.dbf`, `.prj` și `.cpg` (selectați-le pe toate) sau `.zip`-ul în care au venit. Un zip cu mai multe shapefile dă mai multe straturi. |
| GeoJSON | Fișierul `.geojson` (un fișier `.json` ale cărui primele rânduri spun `FeatureCollection` sau `Feature` funcționează și el). |
| GeoPackage | Fișierul `.gpkg`. Fiecare tabel de elemente din el este listat. |
| KML sau KMZ | Fișierul `.kml` (din Google Earth sau o hartă web) sau `.kmz`-ul arhivat. Fiecare dosar devine un strat (împărțit în puncte, linii și poligoane când conține mai multe tipuri); numele, descrierea și datele extinse ale unui marcaj devin atributele sale. Înălțimile sunt în metri, iar coordonatele în latitudine și longitudine, ca la GeoJSON. |

Punctele, multipunctele, liniile, poligoanele cu găuri și formele din mai multe părți sunt citite, cu cotele lor (z) când fișierul le are. Valorile de măsurare (M) sunt lăsate afară. Grilele de cote și datele LiDAR se deschid la fel: vezi [Grilele de cote și LiDAR](topic:elevation-grids-and-lidar).

## Deschiderea fișierelor

1. Faceți clic pe {{ui:Import}} în grupul **GIS** (sau pe {{ui:Deschidere}}), alegeți fișierele sau trageți-le pe plan. Fișierele sunt citite pe acest calculator; nimic nu este încărcat.
2. Caseta de dialog **Importul datelor GIS** listează fiecare strat găsit: tipul său, câte elemente are (și câte nu au geometrie), câte câmpuri de atribute și sistemul de coordonate pe care îl numește fișierul. Debifați straturile pe care nu le doriți.
3. Citiți partea **Sistem de coordonate** (mai jos) și linia **Ce se va întâmpla**, apoi faceți clic pe {{ui:Import}}.
4. Straturile apar pe plan și sub **Straturi GIS** din panoul din stânga. Importul este un singur pas: {{key:Mod+Z}} îl anulează.

Un fișier mare afișează o linie de progres peste plan, cu un buton {{ui:Anulare}}.

## Sistemul de coordonate

Fișierele GIS spun unde se află printr-un sistem de coordonate (`.prj`-ul unui shapefile, tabelul de referință spațială al unui GeoPackage; GeoJSON este întotdeauna latitudine și longitudine). CivilCraft convertește fiecare strat din sistemul său propriu în cel al proiectului. Nu ghicește niciodată:

- **Proiectul are un sistem de coordonate** (setat în {{ui:Coordonate}}): fiecare strat cu un sistem propriu este convertit în el, inclusiv o ajustare de teren sau locală. Un fișier fără `.prj` primește două opțiuni: **Același ca al proiectului** (numerele sale sunt încărcate ca atare) sau **Alegeți sistemul fișierului**.
- **Proiectul nu are niciunul, iar fișierul este într-un sistem proiectat în unitățile proiectului** (o zonă State Plane în picioare US survey pentru un proiect în picioare, de exemplu): caseta de dialog oferă **Folosiți acest sistem ca sistem de coordonate al proiectului**. Se setează în același pas de anulare ca importul. Nimic din proiect nu se mută; sistemul spune doar ce înseamnă numerele. Puteți alege în schimb un alt sistem pentru proiect, iar straturile sunt convertite în el.
- **Proiectul nu are niciunul, iar fișierul este în latitudine și longitudine** (orice GeoJSON) **sau în alte unități**: {{ui:Import}} rămâne estompat până când alegeți sistemul de coordonate al proiectului. Selectorul pornește în apropierea datelor.
- **Nici proiectul, nici fișierele nu numesc un sistem**: numerele sunt încărcate ca atare, iar caseta de dialog spune asta.

Cotele sunt convertite și ele: înălțimile GeoJSON sunt în metri (standardul GeoJSON spune asta); înălțimile celorlalte fișiere sunt luate în unitatea sistemului lor.

:::warning
Pozițiile dintr-un fișier GeoJSON aflate în afara longitudinii ±180° sau a latitudinii ±90° nu sunt latitudine și longitudine. Acele elemente sunt lăsate afară, iar caseta de dialog spune câte sunt. Un astfel de fișier este de obicei un fișier proiectat salvat fără sistemul său; cereți-l din nou, sau cereți shapefile-ul cu `.prj`-ul său.
:::

NAD83 este tratat ca identic cu WGS 84 (sistemul folosit de GeoJSON); cele două diferă cu câțiva metri în America de Nord, deci datele GeoJSON pot fi decalate cu atât. Acolo unde cea mai bună deplasare are nevoie de un fișier de grilă (NADCON pentru NAD27, de exemplu), CivilCraft folosește o deplasare mai grosieră publicată, iar caseta de dialog pentru sistemul de coordonate arată cât de grosieră este (pentru NAD27, cam 20 m), până când adăugați grila: vezi [Fișiere de deplasare pe grilă](topic:coordinate-systems).

## Straturile GIS

Fiecare rând de sub **Straturi GIS** are:

- o casetă de bifare pentru a afișa sau ascunde stratul (straturile ascunse nu sunt nici ele selectate);
- culoarea sa, aleasă din listă;
- un meniu (cele trei puncte) cu {{ui:Zoom pe}}, {{ui:Utilizare pentru modelul de teren…}}, {{ui:Redenumire…}} și {{ui:Eliminare}}.

Afișarea, ascunderea, schimbarea culorii, redenumirea și eliminarea sunt pași de anulare. Straturile GIS sunt salvate în fișierul de proiect și revin când îl deschideți. Ele merg și în exportul PDF al planului și în exporturile sale DXF și DWG, fiecare pe un strat numit `GIS-` și numărul său.

## Etichetarea elementelor după un atribut

În meniul {{ui:Mai multe}} al stratului (cele trei puncte din **Straturi GIS**), alegeți un câmp sub **Etichetare cu**: fiecare element își afișează valoarea pe plan, în culoarea stratului. Punctele sunt etichetate lângă punct, liniile de-a lungul mijlocului celei mai lungi părți (rotite ca să se citească de la stânga la dreapta), poligoanele în centrul lor. Numerele apar cu până la trei zecimale. Etichetele au înălțimea de 1.8 mm pe hârtie la orice scară și intră în PDF, DXF și DWG. Alegeți **Fără etichete** pentru a le scoate; fiecare schimbare este un pas ({{key:Mod+Z}} o anulează). Un strat etichetează cel mult 5,000 de elemente.

## Priviți un element

Cu {{ui:Selectare}} activ, faceți clic pe un element. **Proprietăți** arată stratul său, care element este, forma sa (părți, găuri, vârfuri), cotele sale, fișierul din care provine și sistemul de coordonate al acelui fișier, apoi fiecare atribut într-un tabel. Atributele sunt doar pentru citire: CivilCraft afișează datele GIS așa cum au venit, nu le editează.

Punctele au prioritate față de linii când amândouă sunt sub cursor; în interiorul unui poligon este ales cel mai mic poligon.

## Utilizare pentru modelul de teren

Deschideți meniul unui strat și alegeți {{ui:Utilizare pentru modelul de teren…}} (sau butonul din **Proprietăți**). Ce se oferă depinde de strat:

| Strat | Poate deveni |
|---|---|
| Linii cu cote (linii 3D) | Linii de rupere la propriile cote |
| Linii fără cote, dar cu un câmp numeric (curbe de nivel) | Linii de rupere la cota din câmpul ales |
| Poligoane | Limita suprafeței (poligonul selectat, altfel cel mai mare), sau linii de rupere de-a lungul marginilor lor |
| Puncte cu cote sau cu un câmp de cotă | Puncte de măsurătoare, descrise cu numele stratului, ca să formeze un grup de puncte |

Fiecare utilizare este un pas de anulare care copiază geometria în proiect; stratul în sine rămâne neschimbat. Cotele sunt luate în unitățile proiectului.

## Fișiere de puncte cu latitudine și longitudine

Un fișier de puncte al cărui antet numește coloanele **latitude** și **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) este citit ca grade, nu ca nord și est. Caseta de dialog de import spune asta. La {{ui:Import}}, punctele sunt convertite în sistemul de coordonate al proiectului; un proiect fără unul cere să îl alegeți mai întâi. Gradele nu sunt niciodată încărcate ca picioare. Rândurile aflate în afara latitudinii ±90° sau a longitudinii ±180° sunt refuzate, cu motivul. Coloana de cotă este luată ca atare, în unitățile proiectului.

## Fișiere LandXML care numesc un sistem de coordonate

Când un fișier LandXML pe care îl deschideți are un element `CoordinateSystem` (un cod EPSG, o descriere WKT sau un nume de sistem), CivilCraft îl oferă ca sistem de coordonate al proiectului. Nimic nu se mută dacă acceptați; sistemul spune doar ce înseamnă numerele.

## Ce a fost verificat

- Fiecare cititor a fost comparat cu GDAL, biblioteca pe care o folosesc majoritatea programelor GIS pentru a citi aceste fișiere, pe fișiere scrise de GDAL: shapefile de fiecare tip, cu și fără cote, linii din mai multe părți, poligoane cu găuri, geometrii goale, atribute text, numerice, de dată și adevărat/fals, text UTF-8 și Windows-1252 cu și fără `.cpg`, un zip cu mai multe shapefile, GeoJSON cu fiecare tip de geometrie și un GeoPackage cu patru tabele. Fiecare geometrie, cotă și atribut s-a potrivit.
- Pozițiile convertite din latitudine și longitudine și din UTM s-au potrivit cu PROJ (biblioteca de proiecție din spatele GDAL) până la 3 mm.
- Fișierele deteriorate (tăiate, care mint despre dimensiunile lor, zip-uri defecte, GeoPackage-uri defecte) dau un singur mesaj simplu; nimic nu se blochează.
- Nimic de aici nu a fost deschis încă în alte programe GIS, iar geodatabase-urile de fișiere, KML și KMZ nu sunt citite încă (vezi [Încă nerealizat](topic:not-built-yet)).
