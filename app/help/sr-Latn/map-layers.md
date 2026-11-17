---
title: Prikaz slojeva karte ispod plana
summary: Stavite georeferenciranu sliku, pločice karte, WMS ili WMTS server ili servis karte ispod plana kao kontekst lokaliteta, sa podešavanjem interneta, providnošću, redom i navodom izvora.
keywords: slojevi karte, podloga, osnovna karta, pozadina, aerofoto, ortofoto, snimak, satelit, rasterski, world datoteka, pgw, jgw, tfw, wld, geotiff, georeferencirana slika, xyz, pločice, slippy karta, wms, wmts, getcapabilities, servis karte, rest, mapserver, imageserver, usgs, national map, navod izvora, providnost
from: 32d7718e
---

Slojevi karte su slike nacrtane ispod vašeg projekta: aerofoto sa svojom world datotekom, ili karte sa servera na internetu. Oni su kontekst lokaliteta samo na ekranu: **nisu** u PDF izlazima, DXF ili DWG izvozima, ni u 3D prikazu.

Izaberite {{ui:Mapa}} u grupi {{ui:GIS}}. Prozor **Slojevi karte** navodi slojeve projekta i dodaje nove. Slojevima karte je potreban koordinatni sistem projekta ([Postavljanje koordinatnog sistema projekta](topic:coordinate-systems)), osim slike čija world datoteka koristi koordinate samog projekta.

## Podešavanje interneta

CivilCraft nikad ne traži ništa od servera karte dok to ne dozvolite: {{ui:Podešavanja}}, {{ui:CivilCraft}}, **Slojevi karte sa interneta**: **Isključeno** (na početku) ili **Uključeno**.

:::note
Kad je uključeno, CivilCraft traži od servera karte koje dodate slike područja na ekranu. Vaš crtež ostaje na ovom računaru; server vidi područje i vašu internet adresu.
:::

Dok je isključeno, slojevi sa interneta su navedeni u prozoru, ali zasivljeni, uz razlog, i ništa se ne crta niti traži. Otvaranje projekta koji imenuje servere karte ih takođe ne kontaktira. Slika iz datoteke radi u oba slučaja. Dugme {{ui:Otvori Podešavanja}} u prozoru vas tamo vodi.

## Georeferencirana slika (radi van mreže)

1. U **Dodaj sloj** ostavite **Georeferencirana slika** i izaberite datoteke: sliku (PNG ili JPEG) **zajedno sa** njenom world datotekom (`.pgw` za PNG, `.jgw` za JPEG, ili `.wld`) i, ako postoji, njenim `.prj`. Možete ih i prevući na plan zajedno.
2. Bez `.prj`, CivilCraft pita koji sistem world datoteka koristi: {{ui:Sistem projekta}} (najčešće), {{ui:Izaberi sistem…}} ili, u projektu bez sistema, **Koordinate projekta**.
3. Slika se pojavljuje ispod plana, i {{ui:Uklopi}} je uključuje.

RGB GeoTIFF (aerofoto sačuvan kao GeoTIFF) nosi sopstveno postavljanje i sistem: otvorite ga samostalno. Slika se čuva **unutar datoteke projekta** (do 25 MB); veća se odbija uz svoju veličinu, pa sačuvajte manju kopiju (manje piksela, ili JPEG).

## Pločice, WMS, WMTS i servisi karte

Prvo uključite **Slojevi karte sa interneta**. Zatim, u **Dodaj sloj**:

| Iz | Šta nalepiti | Šta CivilCraft radi |
|---|---|---|
| URL pločica | Šablon sa `{z}`, `{x}` i `{y}` (ili `{-y}`), i `{s}` za slovo servera, na primer `https://tile.example.org/{z}/{x}/{y}.png`. Dajte mu ime i navod izvora. | Pločice u web Mercator za područje i zum na ekranu. |
| WMS server | Adresa servera, ili njegov GetCapabilities link. Izaberite {{ui:Preuzmi slojeve}}, zatim sloj. | Jedna slika područja na ekranu, traži se u EPSG kodu projekta kad ga server nudi, inače u web Mercator ili WGS 84. |
| WMTS server | Adresa servera, ili njegov `WMTSCapabilities.xml`. Izaberite {{ui:Preuzmi slojeve}}, zatim sloj i skup matrica pločica. | Pločice iz skupa u sistemu projekta kad postoji, inače web Mercator. |
| ArcGIS servis karte (REST) | URL koji se završava sa `/MapServer` ili `/ImageServer`. Izaberite {{ui:Pročitaj servis}}. | Keširani servisi u web Mercator crtaju se iz svojih pločica; ostali se traže kao jedna slika područja na ekranu. |

Nijedan server nije unapred podešen. Javni primeri, svi iz USGS National Map (javni domen):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servis karte: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (takođe `USGSImageryOnly` za aerofoto snimke)

Mnoge gradske i okružne GIS službe objavljuju sopstvene WMS ili servise karte; njihove GIS stranice daju adresu. Server koji traži prijavu ili ključ ne radi: CivilCraft ne šalje korisnička imena, lozinke ni ključeve.

## Kako se slojevi crtaju

- Slike u drugom sistemu nego što je sistem projekta se preslikavaju u njega: slika se seče na delove, svaki postavljen tako da bude unutar četvrtine piksela ekrana od mesta gde ga tačna konverzija stavlja.
- Pločice se biraju za područje na ekranu i zum: nikad više od 64 po prikazu, 6 istovremeno. Kad pomerate ili zumirate, zahtevi za stari prikaz se otkazuju. Oko 200 pločica se čuva u memoriji (ništa se ne čuva na disku).
- Slika WMS ili servisa karte se traži kad prikaz prestane da se pomera; dok ne stigne, poslednja ostaje na mestu.
- Navod izvora svakog sloja na ekranu prikazuje se sitno u donjem desnom uglu plana.

## Promena, redosled i uklanjanje slojeva

U prozoru svaki sloj ima polje za štiklirati da ga prikaže ili sakrije, klizač **Providnost**, strelice da ga nacrtate ranije (niže) ili kasnije (na vrhu), dugme za zum (za slike) i dugme za uklanjanje. Prvi sloj na spisku se crta na dnu. Svaka promena je jedan korak opozivanja.

## Kad sloj ne prikazuje ništa

Razlog se pojavi jednom u statusnoj liniji i ostaje ispod imena sloja u prozoru:

| Poruka | Šta da radite |
|---|---|
| Isključeno: slojevi karte sa interneta su isključeni u Podešavanjima. | Uključite **Slojevi karte sa interneta**. |
| Potreban je koordinatni sistem projekta | Postavite ga pod {{ui:Koordinate}}. |
| Server nije dozvolio ovoj stranici da koristi njegove slike (CORS), ili nije mogao da se dohvati. | Server ne dozvoljava web stranicama da koriste njegove slike, ili je pao. Posle četiri odbijanja CivilCraft prestaje da traži; sakrijte pa prikažite sloj da pokušate ponovo. |
| Server je odgovorio 404 … / Server je poslao text/xml, a ne sliku: … | URL, sloj ili stil je pogrešan, ili poruka servera kaže šta želi. |
| Ovaj sloj nije ponuđen u sistemu projekta, web Mercator ili WGS 84 | Server ne može da crta tamo gde CivilCraft može da ga postavi. |

## Šta je provereno

- Brojevi pločica su proveravani prema standardnom web Mercator popločavanju; odgovori WMS 1.1.1 i 1.3.0, WMTS i servisa karte čitani su iz ručno pisanih datoteka i iz pravih odgovora sačuvanih sa USGS National Map i terrestris OpenStreetMap servera. WMS 1.3.0 zahtevi stavljaju geografsku širinu prvu za EPSG:4326, kako standard kaže.
- Preslikavanje je upoređeno sa tačnom konverzijom po pikselu preko PROJ-ovih brojeva: unutar 0,13 px za pločice, WMS slike i sliku veličine okruga, u razmeri lokaliteta i pri udaljenom zumu.
- Slika sa svojom world datotekom i RGB GeoTIFF koji je napisao GDAL (preko rasterio) crtani su tamo gde njihovo postavljanje kaže, proveravano piksel po piksel u pregledaču.
- U pregledaču, sa zamenskim serverom na test računaru: pločice padaju u pločicu koju PROJ dodeljuje svakoj tački, WMS slika pada unutar 2 px, najviše 6 zahteva ide istovremeno, a sa isključenim podešavanjem nijedan zahtev ne napušta stranicu. Servis karte USGS National Map iz gornjeg primera je takođe jednom pročitan i nacrtan uživo u pregledaču (pločice su stigle i nacrtane su, uz njegov tekst autorskih prava); ostali javni serveri su čitani samo iz sačuvanih odgovora.
