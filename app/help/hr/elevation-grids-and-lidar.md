---
title: Mreže visina i LiDAR
summary: Izradite postojeći teren iz DEM-a (GeoTIFF ili ASCII mreža) ili LiDAR točaka (LAS, LAZ) — odaberite područje, prorijedite podatke, odaberite klase i provjerite jedinice visine — te vratite teren kao GeoTIFF mrežu visina.
keywords: dem, dtm, mreža visina, geotiff, tif, ascii mreža, asc, lidar, las, laz, oblak točaka, klase, tlo, prorjeđivanje, nodata, raster, izvoz geotiff, gis
from: c8b2d18a
---

Javni podaci o visinama dolaze na dva načina: **mreže visina** (DEM: jedna visina po kvadratnoj ćeliji, obično GeoTIFF `.tif` ili ASCII mreža `.asc`) i **LiDAR točke** (milijuni laserskih povrata u datoteci `.las`, ili `.laz` ako je komprimirana). CivilCraft pretvara jedno ili drugo u geodetske točke ili teren, unutar preglednika: ništa se ne šalje na poslužitelj.

## Otvaranje datoteke

1. Kliknite {{ui:Otvori}} (ili {{ui:Uvezi}} u GIS skupini) i odaberite datoteku ili je povucite na tlocrt. Za ASCII mrežu odaberite i njezinu `.prj` datoteku, kako CivilCraft zna njezin koordinatni sustav.
2. Dijaloški okvir za uvoz prikazuje što datoteka kaže o sebi: veličinu, ćelije ili točke, koordinatni sustav, položaj u geografskoj širini i dužini te raspon visina. Za LiDAR najprije pročita svaku točku jednom kako bi prebrojao **klase** (traka napretka pokazuje koliko je daleko; {{ui:Odustani}} ga zaustavlja).

GeoTIFF s tri ili četiri kanala (crveni, zeleni, plavi) je slika, a ne visine: umjesto toga ide u slojeve karte.

## Odabir što uvesti

- **Područje**: {{ui:Opseg projekta i rubni pojas}} (upišite rub), {{ui:Ono što tlocrt sada prikazuje}} ili {{ui:Cijela datoteka}}. Čita se samo taj dio datoteke.
- **Prorijedi na**: razmak između točaka koje dobivate, u jedinicama projekta. Redak ispod postavki pokazuje koliko točaka to daje dok upisujete. Za mrežu CivilCraft zadržava svaku drugu, treću … ćeliju, pa visine ostaju točno one iz datoteke; nikada ne uprosječuje ćelije. Za LiDAR se područje dijeli na kvadrate te veličine i po kvadratu se zadržava jedna točka: {{ui:Točka najbliža središtu svake ćelije}} (zadano), {{ui:Najniža točka u svakoj ćeliji}} (dobro kada datoteka nema klasu tla: tlo je ispod drveća) ili {{ui:Prosjek točaka svake ćelije}}.
- **Klase** (LiDAR): tlo (klasa 2) je označeno kada ga datoteka ima; zgrade, drveće i šum su izostavljeni. Kada nema klase tla, označene su sve klase i dijaloški okvir to navodi.
- **Tlo** (LiDAR, 0.8): oblak s drona nema klasu tla. Kada datoteka nema nijednu, dijaloški okvir počinje na {{ui:Sam pronađi tlo (oblaci iz drona, bez klase tla)}}: čita se svaka klasa osim šuma, zadržava se najniža točka u svakoj ćeliji, a zatim CivilCraft izbacuje zgrade, drveće i izolirane niske točke progresivnim morfološkim filtrom (Zhang i dr., 2003) kojim možete upravljati: **Najveći objekt za uklanjanje** (širina najveće zgrade; prozori rastu dok je ne prekriju; 0 znači 20 ćelija) i **Najstrmiji nagib tla**. Posao se obavlja na mreži najnižih točaka, pa oblak od desetak milijuna točaka ne košta više od broja svojih ćelija (prorjeđivanje je jedan prolaz kroz tok podataka). Razmak određuje ćeliju: grublja je brža i manje promašuje male objekte nego što biste očekivali, finija zadržava više detalja tla. Izvješće navodi koliko je točaka zadržano kao tlo, koliko je ćelija izbačeno kao objekti i koliko je izoliranih niskih točaka odbačeno. Na izmišljenom snimanju drona od 300 m s pet zgrada, 70 stabala i 200 niskih odstupanja zadržane točke bile su unutar 3 cm od stvarnog terena, a nijedan krov ili krošnja nisu zadržani.
- **Visine u datoteci**: metri, stope ili američke geodetske stope. Kada datoteka to kaže, jedinica je već odabrana. Kada ne kaže, morate odabrati: dijaloški okvir prikazuje raspon visina na oba načina da možete prepoznati što ima smisla za lokaciju.
- **Uvezi kao** (samo mreže): {{ui:Geodetske točke (opis DEM)}} ili {{ui:Sam teren (mreža trokuta)}}.

Jedan uvoz uzima najviše 500,000 točaka. Kada bi izbor dao više, dijaloški okvir navodi za koliko i koji bi razmak stao, a {{ui:Uvezi}} ostaje isključen.

Kliknite {{ui:Uvezi}}. Traka napretka prikazuje čitanje; {{ui:Odustani}} ga zaustavlja i ništa se ne mijenja.

:::warning
Jedinice visine česta su zamka. Mnogi DEM-ovi državne ravnine imaju istok i sjever u stopama, ali visine u metrima. Usporedite raspon koji dijaloški okvir prikazuje s onim što znate o lokaciji.
:::

## Što dobivate

- **Geodetske točke**: numerirane nakon vašeg najvišeg broja točke, s opisom `DEM` (mreže) ili `LIDAR`, pa čine jednu skupinu točaka pod **Točke** i izrađuju teren kao i sve druge točke. Uvoz je jedan korak: {{key:Mod+Z}} ih ponovno uklanja.
- **Sam teren**: mrežni TIN, dva trokuta po ćeliji, podijeljena po dijagonali jugozapad–sjeveroistok. Trokut čiji kut nema podatke se izostavlja, pa rupe u podacima ostaju rupe. Teren je jednak mreži u svakoj točki mreže i između njih je ravna ploha unutar svakog trokuta. Zamjenjuje teren projekta (dijaloški okvir prvo pita); {{key:Mod+Z}} vraća prethodni teren. Naslov lijeve ploče glasi **Teren (iz mreže visina)**.

## Koordinatni sustavi

- Ako projekt ima koordinatni sustav, a datoteka navodi drugi, svaka točka pretvara se u sustav projekta (i u njegove terenske ili lokalne koordinate kada ih ima).
- Ako projekt nema nijedan, a sustav datoteke je u jedinicama projekta (stope ili metri), dijaloški okvir nudi da ga postavi kao koordinatni sustav projekta, u istom koraku poništavanja kao i točke.
- Ako je datoteka u geografskoj širini i dužini ili u metrima za projekt u stopama, dijaloški okvir prvo traži da odaberete koordinatni sustav projekta.
- Ako datoteka to ne navodi, njezini brojevi uzimaju se kao koordinate projekta. Umjesto toga možete odabrati sustav datoteke.

## Izvoz terena kao GeoTIFF

1. Kliknite {{ui:Izvoz}} u GIS skupini.
2. U dijelu GeoTIFF odaberite teren (postojeći teren ili projektirani teren nakon izravnanja) i veličinu ćelije. Zadana vrijednost dolazi od prosječne stranice trokuta terena. Dijaloški okvir prikazuje veličinu mreže koju će zapisati.
3. Kliknite {{ui:Preuzmi GeoTIFF}}.

Datoteka je jedan kanal 32-bitnih decimalnih visina u jedinicama projekta, preko područja terena; ćelije izvan terena su „nema podataka“ (−3.4028235e38). Vrijednost svake ćelije je visina terena u središtu ćelije. Koordinate su **mrežne** koordinate: projekt u terenskim ili lokalnim koordinatama pretvara se natrag u mrežu. Datoteka koordinatni sustav projekta navodi prema EPSG kodu; sustav bez EPSG koda se ne zapisuje, a dijaloški okvir upozorava da javite GIS odjelu koji je to sustav.

## Što je provjereno

- Čitači GeoTIFF i ASCII mreža provjereni su prema GDAL-u (preko rasterio), biblioteci koju koristi većina GIS programa za čitanje ovih datoteka: mreže 32-bitnih decimalnih i 16-bitnih cjelobrojnih vrijednosti, pločaste i trakaste, DEFLATE i LZW, nodata, skala i pomak, piksel-je-točka, UTM mreža, mreža državne ravnine u američkim geodetskim stopama i mreža geografske širine i dužine — svaka vrijednost jednaka.
- Čitači LAS i LAZ provjereni su prema laspy: LAS 1.2 i 1.4, formati točaka 0, 1, 3, 6, 7 i 8, sa i bez koordinatnog sustava, te LAZ zapisan njegovim pozadinskim dijelom kompatibilnim s LASzip — svaka točka jednaka.
- Pretvorene koordinate provjerene su prema PROJ-u na 1 mm.
- Izvezeni GeoTIFF-ovi ponovno su pročitani GDAL-om: koordinatni sustav, položaji ćelija, nodata, jedinice i vrijednosti jednake terenu na 0.0001.
- Ništa ovdje nije otvoreno u drugim GIS ili CAD programima.

## Još nije izrađeno

- Promjene vertikalnog datuma (modeli geoida): visine se koriste onako kako ih datoteka ima.
- Podaci valnog oblika, LiDAR povrati osim po klasi, boje i intenziteti.
- Više kanala, pregledi ili datoteke veće od 200 MB.
- Zapisivanje LAS ili LAZ iz terena ili iz ovog alata (dodatak [Oblaci točaka](topic:point-clouds) zapisuje očišćen oblak kao LAS 1.4 ili LAZ).
