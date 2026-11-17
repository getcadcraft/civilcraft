---
title: Afișarea straturilor de hartă sub plan
summary: Puneți o imagine georeferențiată, dale de hartă, un server WMS sau WMTS ori un serviciu de hartă sub plan, ca context al amplasamentului, cu setarea de internet, opacitatea, ordinea și atribuirea.
keywords: straturi de hartă, hartă de bază, fundal, aerian, ortofotoplan, imagini, satelit, raster, fișier de lume, pgw, jgw, tfw, wld, geotiff, imagine georeferențiată, xyz, dale, hartă slippy, wms, wmts, getcapabilities, serviciu de hartă, rest, mapserver, imageserver, usgs, national map, atribuire, opacitate
from: 32d7718e
---

Straturile de hartă sunt imagini desenate sub proiect: o fotografie aeriană cu fișierul ei de lume sau hărți de la servere de pe internet. Sunt doar context al amplasamentului pe ecran: **nu** sunt în trasările PDF, în exporturile DXF sau DWG și nici în vizualizarea 3D.

Alegeți {{ui:Map}} din grupul {{ui:GIS}}. Caseta de dialog **Straturi de hartă** listează straturile proiectului și adaugă altele noi. Straturile de hartă au nevoie de sistemul de coordonate al proiectului ([Stabilirea sistemului de coordonate al proiectului](topic:coordinate-systems)), cu excepția unei imagini al cărei fișier de lume folosește coordonatele proprii ale proiectului.

## Setarea de internet

CivilCraft nu cere nimic unui server de hărți până nu permiteți: {{ui:Settings}}, {{ui:CivilCraft}}, **Straturi de hartă de pe internet**: **Oprit** (la pornire) sau **Pornit**.

:::note
Când este pornit, CivilCraft cere serverelor de hărți pe care le adăugați imagini ale zonei de pe ecran. Desenul rămâne pe acest calculator; serverul vede zona și adresa de internet.
:::

Cât timp este oprită, straturile de pe internet sunt listate în caseta de dialog, estompate, cu motivul, iar nimic nu se desenează și nimic nu se cere. Deschiderea unui proiect care numește servere de hărți nu le contactează nici ea. O imagine dintr-un fișier funcționează în orice caz. Butonul {{ui:Open Settings}} din caseta de dialog duce direct acolo.

## O imagine georeferențiată (funcționează offline)

1. În **Adăugare strat**, păstrați **Imagine georeferențiată** și alegeți fișierele: imaginea (PNG sau JPEG) **împreună cu** fișierul ei de lume (`.pgw` pentru PNG, `.jgw` pentru JPEG sau `.wld`) și, dacă există, `.prj`-ul ei. Le puteți trage și pe plan împreună.
2. Fără un `.prj`, CivilCraft întreabă ce sistem folosește fișierul de lume: {{ui:The project’s system}} (cel mai frecvent), {{ui:Pick a system…}} sau, într-un proiect fără sistem, **Coordonatele proiectului**.
3. Imaginea apare sub plan, iar {{ui:Fit}} o include.

Un GeoTIFF RGB (o fotografie aeriană salvată ca GeoTIFF) își are propria plasare și sistem: deschideți-l separat. Imaginea este păstrată **în fișierul proiectului** (până la 25 MB); una mai mare este refuzată cu dimensiunea ei, deci salvați o copie mai mică (mai puțini pixeli sau JPEG).

## Dale, WMS, WMTS și servicii de hărți

Activați mai întâi **Straturi de hartă de pe internet**. Apoi, în **Adăugare strat**:

| De la | Ce lipiți | Ce face CivilCraft |
|---|---|---|
| Adresă de dale | Un șablon cu `{z}`, `{x}` și `{y}` (sau `{-y}`), și `{s}` pentru o literă de server, de exemplu `https://tile.example.org/{z}/{x}/{y}.png`. Dați-i un nume și atribuirea sa. | Dale în proiecția web Mercator, pentru zona și zoomul de pe ecran. |
| Server WMS | Adresa serverului sau legătura sa GetCapabilities. Alegeți {{ui:Get the layers}}, apoi stratul. | O imagine a zonei de pe ecran, cerută în codul EPSG al proiectului când serverul îl oferă, altfel în web Mercator sau WGS 84. |
| Server WMTS | Adresa serverului sau `WMTSCapabilities.xml`-ul său. Alegeți {{ui:Get the layers}}, apoi stratul și setul de matrice de dale. | Dale din set, în sistemul proiectului când există unul, altfel web Mercator. |
| Serviciu de hartă ArcGIS (REST) | O adresă care se termină în `/MapServer` sau `/ImageServer`. Alegeți {{ui:Read the service}}. | Serviciile web Mercator cu cache sunt desenate din dalele lor; celelalte sunt cerute ca o imagine a zonei de pe ecran. |

Niciun server nu este preconfigurat. Exemple publice, toate din USGS National Map (domeniu public):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Serviciu de hartă: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (și `USGSImageryOnly` pentru fotografii aeriene)

Multe departamente GIS ale orașelor și județelor publică propriile servicii WMS sau de hartă; paginile lor GIS dau adresa. Un server care cere autentificare sau o cheie nu funcționează: CivilCraft nu trimite nume de utilizator, parole sau chei.

## Cum se desenează straturile

- Imaginile dintr-un alt sistem decât cel al proiectului sunt deformate în el: imaginea este tăiată în bucăți, fiecare așezată astfel încât să fie la cel mult un sfert de pixel de ecran de locul unde o conversie exactă o pune.
- Dalele sunt alese pentru zona de pe ecran și zoom: niciodată mai mult de 64 pentru o vizualizare, câte 6 odată. Când panoramați sau faceți zoom, cererile pentru vechea vizualizare sunt anulate. Circa 200 de dale sunt păstrate în memorie (nimic nu se stochează pe disc).
- O imagine WMS sau de serviciu de hartă este cerută după ce vizualizarea s-a oprit din mișcare; până sosește, ultima rămâne la locul ei.
- Atribuirea fiecărui strat apare mică, în colțul din dreapta jos al planului.

## Schimbarea, ordinea și eliminarea straturilor

În caseta de dialog, fiecare strat are o casetă de bifare pentru a-l arăta sau ascunde, un glisor **Opacitate**, săgeți pentru a-l desena mai devreme (mai jos) sau mai târziu (deasupra), un buton de zoom (pentru imagini) și un buton de eliminare. Primul strat din listă este desenat jos. Fiecare modificare este un pas de anulare.

## Când un strat nu arată nimic

Motivul apare o dată în bara de stare și rămâne sub numele stratului din caseta de dialog:

| Mesaj | Ce de făcut |
|---|---|
| Oprit: straturile de hartă de pe internet sunt oprite în Setări. | Porniți **Straturi de hartă de pe internet**. |
| Are nevoie de sistemul de coordonate al proiectului | Setați-l sub {{ui:Coordinates}}. |
| Serverul nu a permis acestei pagini să-i folosească imaginile (CORS) sau nu a putut fi contactat. | Serverul nu lasă paginile web să-i folosească imaginile, sau este oprit. După patru refuzuri, CivilCraft nu mai cere; ascundeți și arătați stratul ca să reîncercați. |
| Serverul a răspuns 404 … / Serverul a trimis text/xml, nu o imagine: … | Adresa, stratul sau stilul sunt greșite, ori mesajul serverului spune ce cere. |
| Acest strat nu este oferit în sistemul proiectului, în web Mercator sau în WGS 84 | Serverul nu poate desena acolo unde CivilCraft îl poate așeza. |

## Ce s-a verificat

- Numerele dalelor au fost verificate față de tilingul standard web Mercator; răspunsurile WMS 1.1.1 și 1.3.0, WMTS și de serviciu de hartă au fost citite din fișiere scrise de mână și din răspunsuri reale salvate de la USGS National Map și de la serverele OpenStreetMap terrestris; cererile WMS 1.3.0 pun latitudinea primă pentru EPSG:4326, cum cere standardul.
- Deformarea a fost comparată cu o conversie exactă pixel cu pixel prin cifrele PROJ: în 0.13 px pentru dale, imagini WMS și o imagine de dimensiunea unui județ, la scara amplasamentului și depărtat.
- O imagine cu fișierul ei de lume și un GeoTIFF RGB scris de GDAL (prin rasterio) au fost desenate acolo unde spune plasarea lor, verificate pixel cu pixel în browser.
- În browser, față de un server de probă de pe calculatorul de test: dalele ajung în dala în care PROJ pune fiecare punct, o imagine WMS ajunge în 2 px, cel mult 6 cereri rulează odată, iar cu setarea oprită nicio cerere nu iese din pagină. Serviciul de hartă USGS National Map de mai sus a fost citit și desenat live în browser o dată (dalele au sosit și au fost desenate, cu textul de drepturi de autor); celelalte servere publice au fost citite doar din răspunsuri salvate.
