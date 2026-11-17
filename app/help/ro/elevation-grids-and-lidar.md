---
title: Grile de altitudini și LiDAR
summary: Construiți terenul existent dintr-un DEM (GeoTIFF sau grilă ASCII) sau din puncte LiDAR (LAS, LAZ): alegeți zona, rărați datele, alegeți clasele și verificați unitățile de altitudine, apoi returnați un model de teren ca grilă de altitudini GeoTIFF.
keywords: dem, dtm, grilă de altitudini, geotiff, tif, grilă ASCII, asc, lidar, las, laz, nor de puncte, clase, teren, rărire, nodata, raster, export geotiff, gis
from: c8b2d18a
---

Datele publice de altitudine vin pe două căi: **grile de altitudini** (un DEM: o altitudine pe fiecare celulă pătrată, de obicei un GeoTIFF `.tif` sau o grilă ASCII `.asc`) și **puncte LiDAR** (milioane de ecouri laser într-un fișier `.las`, sau `.laz` când este comprimat). CivilCraft transformă oricare dintre ele în puncte topografice sau într-un model de teren, direct în browser: nimic nu este încărcat pe server.

## Deschiderea fișierului

1. Faceți clic pe {{ui:Deschidere}} (sau pe {{ui:Import}} din grupul GIS) și alegeți fișierul ori trageți-l pe plan. Pentru o grilă ASCII, alegeți și fișierul său `.prj`, ca CivilCraft să-i cunoască sistemul de coordonate.
2. Dialogul de import arată ce declară fișierul despre sine: dimensiunea, celulele sau punctele, sistemul de coordonate, poziția în latitudine și longitudine și intervalul de altitudini. Pentru LiDAR, citește mai întâi fiecare punct o dată, ca să numere **clasele** (o bară de progres arată cât a parcurs; {{ui:Anulare}} o oprește).

Un GeoTIFF cu trei sau patru benzi (roșu, verde, albastru) este o imagine, nu altitudini: merge în straturile de hartă.

## Alegerea datelor de importat

- **Zonă**: {{ui:Extinderile proiectului și o margine}} (tastați marginea), {{ui:Ce arată acum planul}} sau {{ui:Tot fișierul}}. Doar această parte a fișierului este citită.
- **Rărire până la**: distanța dintre punctele obținute, în unitățile proiectului. Linia de sub setări arată câte puncte rezultă pe măsură ce tastați. Pentru o grilă, CivilCraft păstrează fiecare a doua, a treia … celulă, astfel încât altitudinile rămân exact cele din fișier; nu mediază niciodată celulele între ele. Pentru LiDAR, zona este împărțită în pătrate de această dimensiune și se păstrează un punct pe pătrat: {{ui:Punctul cel mai apropiat de centrul fiecărei celule}} (implicit), {{ui:Cel mai jos punct din fiecare celulă}} (bun când fișierul nu are clasă de teren: terenul este sub copaci) sau {{ui:Media punctelor fiecărei celule}}.
- **Clase** (LiDAR): terenul (clasa 2) este bifat când fișierul îl are; clădirile, copacii și zgomotul sunt lăsate afară. Când nu există clasă de teren, sunt bifate toate clasele, iar caseta de dialog o spune.
- **Teren** (LiDAR, 0.8): un nor de dronă nu are clasă de teren. Când fișierul nu are niciuna, caseta de dialog pornește pe {{ui:Găsirea terenului de către mine (nori de dronă, fără clasă de teren)}}: sunt citite toate clasele, în afară de zgomot, se păstrează punctul cel mai jos din fiecare celulă, apoi CivilCraft scoate clădirile, copacii și punctele joase rătăcite cu un filtru morfologic progresiv (Zhang și alții, 2003) pe care îl puteți regla: **Cel mai mare obiect de scos** (lățimea celei mai mari clădiri; ferestrele cresc până o acoperă; 0 înseamnă 20 de celule) și **Panta cea mai abruptă a terenului**. Lucrul se face pe grila punctelor cele mai joase, deci un nor de zeci de milioane de puncte nu costă mai mult decât numărul său de celule (rărirea este o singură trecere în flux). Pasul este dimensiunea celulei: una mai mare este mai rapidă și omite obiectele mici mai puțin decât s-ar crede, una mai fină păstrează mai multe detalii ale terenului. Raportul spune câte puncte au fost păstrate ca teren, câte celule au fost scoase ca obiecte și câte puncte joase rătăcite au fost eliminate. Pe un studiu de dronă inventat de 300 m, cu cinci clădiri, 70 de copaci și 200 de valori aberante joase, punctele păstrate erau în limita a 3 cm față de terenul real, iar niciun acoperiș sau coronament nu a fost păstrat.
- **Altitudini în fișier**: metri, feet sau US survey feet. Când fișierul o spune, unitatea este deja aleasă. Când nu o spune, trebuie s-o alegeți: caseta de dialog arată intervalul de altitudini în ambele sensuri, ca să vedeți care are sens pentru amplasament.
- **Import ca** (doar grile): {{ui:Puncte topografice (descriere DEM)}} sau {{ui:Modelul de teren însuși (o grilă de triunghiuri)}}.

Un import ia cel mult 500,000 de puncte. Când o alegere ar da mai multe, caseta de dialog spune cu cât și ce pas ar încăpea, iar {{ui:Import}} rămâne dezactivat.

Faceți clic pe {{ui:Import}}. O bară de progres arată citirea; {{ui:Anulare}} o oprește, iar nimic nu se schimbă.

:::warning
Unitățile verticale sunt o capcană frecventă. Multe DEM-uri state plane au Y (est) și X (nord) în feet, dar altitudinile în metri. Verificați intervalul arătat de caseta de dialog față de ce cunoașteți despre amplasament.
:::

## Ce obțineți

- **Puncte topografice**: numerotate după cel mai mare număr de punct al dvs., cu descrierea `DEM` (grile) sau `LIDAR`, astfel încât formează un grup de puncte sub **Puncte** și construiesc modelul de teren ca orice alte puncte. Importul lor este un singur pas: {{key:Mod+Z}} le scoate din nou.
- **Modelul de teren în sine**: un TIN de tip grilă, două triunghiuri pe celulă, împărțite pe diagonala sud-vest – nord-est. Un triunghi cu un colț fără date este lăsat afară, astfel încât golurile din date rămân goluri. Modelul este egal cu grila în fiecare punct al grilei și este un plan plat în interiorul fiecărui triunghi dintre ele. Înlocuiește modelul de teren al proiectului (caseta de dialog întreabă mai întâi); {{key:Mod+Z}} readuce modelul anterior. Titlul panoului din stânga este **Model de teren (dintr-o grilă de altitudini)**.

## Sisteme de coordonate

- Dacă proiectul are un sistem de coordonate, iar fișierul numește altul, fiecare punct este convertit în sistemul proiectului (și în coordonatele sale de teren sau locale, când le are).
- Dacă proiectul nu are niciunul, iar sistemul fișierului este în unitățile proiectului (feet sau metri), caseta de dialog oferă să-l facă sistemul de coordonate al proiectului, în același pas de anulare ca punctele.
- Dacă fișierul este în latitudine și longitudine sau în metri pentru un proiect în feet, caseta de dialog vă cere să alegeți mai întâi sistemul de coordonate al proiectului.
- Dacă fișierul nu spune, numerele sale sunt luate ca fiind coordonatele proiectului. Puteți alege în schimb sistemul fișierului.

## Exportarea unui model de teren ca GeoTIFF

1. Faceți clic pe {{ui:Export}} din grupul GIS.
2. În partea GeoTIFF alegeți modelul de teren (terenul existent sau modelul proiectat) și dimensiunea celulei. Valoarea implicită vine din latura medie a triunghiurilor modelului. Caseta de dialog arată dimensiunea grilei pe care o va scrie.
3. Faceți clic pe {{ui:Descărcare GeoTIFF}}.

Fișierul este o singură bandă de altitudini în virgulă mobilă pe 32 de biți, în unitățile proiectului, pe extinderea modelului; celulele din afara modelului sunt „fără date” (−3.4028235e38). Valoarea fiecărei celule este altitudinea modelului în centrul celulei. Coordonatele sunt **de grilă**: un proiect în coordonate de teren sau locale este convertit înapoi în grilă. Fișierul numește sistemul de coordonate al proiectului prin codul său EPSG; un sistem fără cod EPSG nu este scris, iar caseta de dialog vă avertizează să comunicați departamentului GIS ce sistem este.

## Ce a fost verificat

- Cititoarele GeoTIFF și ale grilelor ASCII au fost verificate față de GDAL (prin rasterio), biblioteca pe care o folosesc majoritatea programelor GIS pentru a citi aceste fișiere: grile float pe 32 de biți și întregi pe 16 biți, în dale și în benzi, DEFLATE și LZW, nodata, scară și decalaj, pixel-is-point, o grilă UTM, o grilă state plane în US survey feet și o grilă latitudine/longitudine — fiecare valoare egală.
- Cititoarele LAS și LAZ au fost verificate față de laspy: LAS 1.2 și 1.4, formatele de punct 0, 1, 3, 6, 7 și 8, cu și fără sistem de coordonate, și LAZ scris de backend-ul compatibil LASzip — fiecare punct egal.
- Coordonatele convertite au fost verificate față de PROJ, cu precizie de 1 mm.
- GeoTIFF-urile exportate au fost recitite de GDAL: sistemul de coordonate, pozițiile celulelor, nodata, unitățile și valorile egale cu modelul, cu precizie de 0.0001.
- Nimic din acestea nu a fost deschis în alte programe GIS sau CAD.

## Încă nerealizat

- Schimbări de datum vertical (modele de geoid): altitudinile sunt folosite așa cum le are fișierul.
- Date de formă de undă, ecouri LiDAR altfel decât pe clase, culori și intensități.
- Mai multe benzi, piramide de previzualizare sau fișiere peste 200 MB.
- Scrierea LAS sau LAZ dintr-un model de teren sau din acest instrument (suplimentul [Nori de puncte](topic:point-clouds) scrie un nor curățat ca LAS 1.4 sau LAZ).
