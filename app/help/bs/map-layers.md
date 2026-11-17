---
title: Prikaz karata ispod plana
summary: Stavite georeferencirani snimak, pločice karte, WMS ili WMTS server ili servis karte ispod plana kao kontekst lokacije, sa postavkom interneta, neprozirnošću, redoslijedom i atribucijom.
keywords: slojevi karte, osnovna karta, pozadina, aerofoto, ortofoto, snimak, satelit, raster, world file, pgw, jgw, tfw, wld, geotiff, georeferencirana slika, xyz, pločice, slippy map, wms, wmts, getcapabilities, servis karte, rest, mapserver, imageserver, usgs, national map, atribucija, neprozirnost
from: 32d7718e
---

Slojevi karte su slike iscrtane ispod vašeg projekta: aerofoto sa svojom world datotekom, ili karte sa servera na internetu. Oni su kontekst lokacije samo na ekranu: **nisu** u PDF crtežima, DXF ili DWG izvozima, ili 3D prikazu.

Izaberite {{ui:Karta}} u grupi {{ui:GIS}}. Dijalog **Slojevi karte** navodi slojeve projekta i dodaje nove. Slojevi karte trebaju koordinatni sistem projekta ([Postavite koordinatni sistem projekta](topic:coordinate-systems)), osim slike čija world datoteka koristi koordinate samog projekta.

## Postavka interneta

CivilCraft nikada ne traži ništa od servera karte dok to ne dozvolite: {{ui:Postavke}}, {{ui:CivilCraft}}, **Slojevi karte sa interneta**: **Isključeno** (početno) ili **Uključeno**.

:::note
Kada je uključeno, CivilCraft traži od servera karte koje dodate slike područja na ekranu. Vaš crtež ostaje na ovom računaru; server vidi područje i vašu internet adresu.
:::

Dok je isključeno, slojevi sa interneta su navedeni u dijalogu ali posivljeni, sa razlogom, i ništa se ne crta niti traži. Otvaranje projekta koji navodi servere karte ih također ne kontaktira. Slika iz datoteke radi u oba slučaja. Dugme {{ui:Otvori Postavke}} u dijalogu vodi vas tamo.

## Georeferencirana slika (radi van mreže)

1. U **Dodaj sloj** ostavite **Georeferencirana slika** i izaberite datoteke: sliku (PNG ili JPEG) **zajedno sa** njenom world datotekom (`.pgw` za PNG, `.jgw` za JPEG, ili `.wld`) i, ako postoji, njenim `.prj`. Možete ih i prevući zajedno na plan.
2. Bez `.prj`, CivilCraft pita koji sistem world datoteka koristi: {{ui:Sistem projekta}} (najčešće), {{ui:Odaberi sistem…}}, ili, u projektu bez sistema, **Koordinate projekta**.
3. Slika se pojavljuje ispod plana i {{ui:Uklopi}} je uključuje.

RGB GeoTIFF (aerofoto spašen kao GeoTIFF) nosi sopstveni položaj i sistem: otvorite ga sam. Slika se čuva **unutar datoteke projekta** (do 25 MB); veća se odbija uz prikaz veličine, pa spasite manju kopiju (manje piksela, ili JPEG).

## Pločice, WMS, WMTS i servisi karte

Prvo uključite **Slojevi karte sa interneta**. Zatim, u **Dodaj sloj**:

| Izvor | Šta nalijepiti | Šta CivilCraft radi |
|---|---|---|
| URL pločica | Šablon sa `{z}`, `{x}` i `{y}` (ili `{-y}`), i `{s}` za slovo servera, na primjer `https://tile.example.org/{z}/{x}/{y}.png`. Dajte mu naziv i atribuciju. | Pločice u web Mercator-u za područje i zumiranje na ekranu. |
| WMS server | Adresa servera, ili njegov GetCapabilities link. Izaberite {{ui:Preuzmi slojeve}}, zatim sloj. | Jedna slika područja na ekranu, traži se u EPSG kodu projekta kada ga server nudi, inače u web Mercator-u ili WGS 84. |
| WMTS server | Adresa servera, ili njegov `WMTSCapabilities.xml`. Izaberite {{ui:Preuzmi slojeve}}, zatim sloj i skup matrica pločica. | Pločice iz skupa u sistemu projekta kada postoji, inače web Mercator. |
| ArcGIS servis karte (REST) | URL koji se završava sa `/MapServer` ili `/ImageServer`. Izaberite {{ui:Pročitaj servis}}. | Keširani web Mercator servisi se crtaju iz svojih pločica; ostali se traže kao jedna slika područja na ekranu. |

Nijedan server nije unaprijed postavljen. Javni primjeri, svi iz USGS National Map (javni domen):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servis karte: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (također `USGSImageryOnly` za aerofotografije)

Mnoga gradska i općinska GIS odjeljenja objavljuju vlastite WMS ili servise karte; njihove GIS stranice daju adresu. Server koji traži prijavu ili ključ ne radi: CivilCraft ne šalje korisnička imena, lozinke ili ključeve.

## Kako se slojevi crtaju

- Slike u drugom sistemu od projektovog se deformišu u njega: slika se reže na dijelove, svaki postavljen tako da bude unutar četvrtine piksela ekrana od mjesta gdje ga tačna konverzija stavlja.
- Pločice se biraju za područje na ekranu i zumiranje: nikada više od 64 za prikaz, 6 istovremeno. Kada pomjerate pogled ili zumirate, zahtjevi za stari prikaz se otkazuju. Oko 200 pločica se čuva u memoriji (ništa se ne čuva na disku).
- Slika WMS-a ili servisa karte se traži kada pogled prestane da se pomjera; dok ne stigne, posljednja ostaje na mjestu.
- Atribucija svakog sloja na ekranu prikazuje se sitno, dolje desno na planu.

## Promjena, redoslijed i uklanjanje slojeva

U dijalogu svaki sloj ima potvrdni okvir za prikaz ili skrivanje, klizač **Neprozirnost**, strelice za crtanje ranije (niže) ili kasnije (na vrhu), dugme za zumiranje (slike) i dugme za uklanjanje. Prvi sloj na spisku crta se na dnu. Svaka promjena je jedan korak poništavanja.

## Kada sloj ništa ne prikazuje

Razlog se jednom pojavi u statusnoj liniji i ostaje ispod naziva sloja u dijalogu:

| Poruka | Šta uraditi |
|---|---|
| Isključeno: slojevi karte sa interneta su isključeni u Postavkama. | Uključite **Slojevi karte sa interneta**. |
| Treba koordinatni sistem projekta | Postavite ga pod {{ui:Koordinate}}. |
| Server nije dozvolio ovoj stranici da koristi njegove slike (CORS), ili nije dostupan. | Server ne dozvoljava web stranicama da koriste njegove slike, ili je van funkcije. Poslije četiri odbijanja CivilCraft prestaje da traži; sakrijte i prikažite sloj da pokušate ponovo. |
| Server je odgovorio 404 … / Server je poslao text/xml, a ne sliku: … | URL, sloj ili stil nisu tačni, ili poruka servera kaže šta traži. |
| Ovaj sloj nije ponuđen u sistemu projekta, web Mercator-u ili WGS 84 | Server ne može crtati tamo gdje CivilCraft može da ga postavi. |

## Šta je provjereno

- Brojevi pločica su provjereni prema standardnom web Mercator popločavanju; odgovori WMS 1.1.1 i 1.3.0, WMTS i servisa karte su pročitani iz ručno napisanih datoteka i iz stvarnih odgovora sačuvanih sa USGS National Map i terrestris OpenStreetMap servera; WMS 1.3.0 zahtjevi stavljaju geografsku širinu prvu za EPSG:4326, kako standard kaže.
- Deformacija je poređena sa tačnom konverzijom po pikselu kroz PROJ-ove brojeve: unutar 0.13 px za pločice, WMS slike i sliku općinske veličine, na razmjeri lokacije i odzumirano.
- Slika sa svojom world datotekom i RGB GeoTIFF koji je napisao GDAL (preko rasterio) crtani su tamo gdje kaže njihov položaj, provjereno piksel po piksel u pregledaču.
- U pregledaču, naspram zamjenskog servera na test računaru: pločice padaju u pločicu u koju PROJ stavlja svaku tačku, WMS slika pada unutar 2 px, najviše 6 zahtjeva se izvršava istovremeno, a kada je postavka isključena, nijedan zahtjev ne napušta stranicu. Gore navedeni servis karte USGS National Map je također jednom pročitan i nacrtan uživo u pregledaču (njegove pločice su stigle i nacrtane su, sa svojim autorskim tekstom); ostali javni serveri su pročitani samo iz sačuvanih odgovora.
