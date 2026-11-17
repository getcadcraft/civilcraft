---
title: Prikaz slojeva karte ispod plana
summary: Stavite georeferenciranu sliku, pločice karte, WMS ili WMTS poslužitelj ili kartografsku uslugu ispod plana kao kontekst lokaliteta, s postavkom interneta, prozirnošću, redoslijedom i navođenjem autora.
keywords: slojevi karte, podloga, osnovna karta, pozadina, aerofoto, ortofoto, snimka, satelit, raster, world file, pgw, jgw, tfw, wld, geotiff, georeferencirana slika, xyz, pločice, slippy karta, wms, wmts, getcapabilities, kartografska usluga, rest, mapserver, imageserver, usgs, national map, navođenje autora, prozirnost
from: 32d7718e
---

Slojevi karte su slike nacrtane ispod vašeg projekta: aerofoto sa svojom world file datotekom ili karte s poslužitelja na internetu. Oni su kontekst lokaliteta samo na zaslonu: **nisu** u PDF ispisima, DXF ili DWG izvozima ni u 3D prikazu.

Odaberite {{ui:Karta}} u grupi {{ui:GIS}}. Dijaloški okvir **Slojevi karte** navodi slojeve projekta i dodaje nove. Slojevi karte trebaju koordinatni sustav projekta ([Postavljanje koordinatnog sustava projekta](topic:coordinate-systems)), osim slike čija world file koristi koordinate samog projekta.

## Postavka interneta

CivilCraft nikad ne traži ništa od poslužitelja karata dok to ne dopustite: {{ui:Postavke}}, {{ui:CivilCraft}}, **Slojevi karte s interneta**: **Isključeno** (početno) ili **Uključeno**.

:::note
Kad je uključeno, CivilCraft pita poslužitelje karata koje dodate za slike područja na zaslonu. Vaš crtež ostaje na ovom računalu; poslužitelj vidi područje i vašu internetsku adresu.
:::

Dok je isključeno, slojevi s interneta su navedeni u dijaloškom okviru, ali zasivljeni, s razlogom, a ništa se ne crta niti zahtijeva. Otvaranje projekta koji navodi poslužitelje karata ih također ne kontaktira. Slika iz datoteke radi na oba načina. Gumb {{ui:Otvori Postavke}} u dijaloškom okviru vodi vas tamo.

## Georeferencirana slika (radi bez interneta)

1. U **Dodaj sloj** ostavite **Georeferencirana slika** i odaberite datoteke: sliku (PNG ili JPEG) **zajedno** s njezinom world file datotekom (`.pgw` za PNG, `.jgw` za JPEG ili `.wld`) i, ako postoji, njezinom `.prj` datotekom. Možete ih i ispustiti na plan zajedno.
2. Bez `.prj` CivilCraft pita koji sustav koristi world file: {{ui:Sustav projekta}} (najčešći), {{ui:Odaberite sustav…}} ili, u projektu bez sustava, **Koordinate projekta**.
3. Slika se pojavljuje ispod plana, a {{ui:Prilagodi}} je uključuje.

RGB GeoTIFF (aerofoto spremljen kao GeoTIFF) nosi vlastiti smještaj i sustav: otvorite ga zasebno. Slika se čuva **unutar datoteke projekta** (do 25 MB); veća se odbija uz prikaz svoje veličine, pa spremite manju kopiju (manje piksela ili JPEG).

## Pločice, WMS, WMTS i kartografske usluge

Prvo uključite **Slojevi karte s interneta**. Zatim u **Dodaj sloj**:

| Iz | Što zalijepiti | Što CivilCraft radi |
|---|---|---|
| Adresa pločica | Predložak s `{z}`, `{x}` i `{y}` (ili `{-y}`) i `{s}` za slovo poslužitelja, na primjer `https://tile.example.org/{z}/{x}/{y}.png`. Dajte mu naziv i navođenje autora. | Pločice u web Mercatorovoj projekciji za područje i zumiranje na zaslonu. |
| WMS poslužitelj | Adresa poslužitelja ili njegova GetCapabilities poveznica. Odaberite {{ui:Dohvati slojeve}}, zatim sloj. | Jedna slika područja na zaslonu, traži se u EPSG kodu projekta kad ga poslužitelj nudi, inače u web Mercatoru ili WGS 84. |
| WMTS poslužitelj | Adresa poslužitelja ili njegova `WMTSCapabilities.xml`. Odaberite {{ui:Dohvati slojeve}}, zatim sloj i skup matrica pločica. | Pločice iz skupa u koordinatnom sustavu projekta kad postoji, inače web Mercator. |
| ArcGIS kartografska usluga (REST) | URL koji završava s `/MapServer` ili `/ImageServer`. Odaberite {{ui:Pročitaj uslugu}}. | Usluge u web Mercatoru s predmemorijom crtaju se iz svojih pločica; ostale se traže kao jedna slika područja na zaslonu. |

Nema unaprijed postavljenih poslužitelja. Javni primjeri, svi iz USGS National Map (javna domena):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kartografska usluga: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (također `USGSImageryOnly` za aerofotografije)

Mnogi gradski i županijski GIS odjeli objavljuju vlastite WMS ili kartografske usluge; njihove GIS stranice daju adresu. Poslužitelj koji traži prijavu ili ključ ne radi: CivilCraft ne šalje korisnička imena, lozinke ni ključeve.

## Kako se slojevi crtaju

- Slike u drugom sustavu od sustava projekta pretvaraju se u njega (warping): slika se reže na dijelove, a svaki se postavlja tako da bude unutar četvrtine piksela zaslona od točnog položaja.
- Pločice se biraju za područje na zaslonu i zumiranje: najviše 64 po prikazu, 6 istovremeno. Kad pomičete ili zumirate, zahtjevi za stari prikaz se otkazuju. Oko 200 pločica čuva se u memoriji (ništa se ne sprema na disk).
- Slika WMS ili kartografske usluge traži se kad prikaz prestane pomicati; dok ne stigne, zadnja ostaje na mjestu.
- Navođenje autora svakog sloja na zaslonu prikazuje se sitno u donjem desnom kutu plana.

## Promjena, redoslijed i uklanjanje slojeva

U dijaloškom okviru svaki sloj ima potvrdni okvir za prikaz ili skrivanje, klizač **Prozirnost**, strelice za crtanje ranije (niže) ili kasnije (na vrhu), gumb za zumiranje (slike) i gumb za uklanjanje. Prvi sloj u popisu crta se na dnu. Svaka promjena je jedan korak poništavanja.

## Kad sloj ništa ne prikazuje

Razlog se pojavljuje jednom u statusnoj traci i ostaje ispod naziva sloja u dijaloškom okviru:

| Poruka | Što učiniti |
|---|---|
| Isključeno: slojevi karte s interneta su isključeni u Postavkama. | Uključite **Slojevi karte s interneta**. |
| Treba koordinatni sustav projekta | Postavite ga pod {{ui:Koordinate}}. |
| Poslužitelj nije dopustio ovoj stranici da koristi njegove slike (CORS) ili se nije mogao doseći. | Poslužitelj ne dopušta web stranicama da koriste njegove slike ili je pao. Nakon četiri odbijanja CivilCraft prestaje pitati; sakrijte i prikažite sloj da pokušate ponovo. |
| Poslužitelj je odgovorio 404 … / Poslužitelj je poslao text/xml, a ne sliku: … | URL, sloj ili stil je pogrešan, ili poruka poslužitelja kaže što želi. |
| Ovaj sloj nije ponuđen u sustavu projekta, web Mercatoru ni WGS 84 | Poslužitelj ne može crtati tamo gdje CivilCraft može postaviti sloj. |

## Što je provjereno

- Brojevi pločica provjereni su prema standardnoj web Mercator podjeli; odgovori WMS 1.1.1 i 1.3.0, WMTS i kartografske usluge čitani su iz ručno pisanih datoteka i iz stvarnih odgovora spremljenih s USGS National Map i terrestris OpenStreetMap poslužitelja; WMS 1.3.0 zahtjevi stavljaju geografsku širinu prvu za EPSG:4326, kako standard kaže.
- Pretvorba (warping) uspoređena je s točnom pretvorbom po pikselu prema PROJ brojevima: unutar 0,13 px za pločice, WMS slike i sliku veličine županije, u mjerilu lokaliteta i pri odzumiranju.
- Slika s world file i RGB GeoTIFF koji je zapisao GDAL (preko rasterio) crtani su tamo gdje kaže njihov smještaj, provjereno piksel po piksel u pregledniku.
- U pregledniku, protiv zamjenskog poslužitelja na testnom računalu: pločice slijeću u pločicu koju PROJ dodjeljuje svakoj točki, WMS slika slijeće unutar 2 px, najviše 6 zahtjeva radi istovremeno, a kad je postavka isključena nijedan zahtjev ne izlazi sa stranice. Gore navedena kartografska usluga USGS National Map također je jednom pročitana i nacrtana uživo u pregledniku (pločice su stigle i nacrtane su, s tekstom autorskih prava); ostali javni poslužitelji čitani su samo iz spremljenih odgovora.
