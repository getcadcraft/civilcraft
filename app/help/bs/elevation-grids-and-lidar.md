---
title: Mreže kota i LiDAR
summary: Izgradite postojeći teren iz DEM-a (GeoTIFF ili ASCII mreža) ili LiDAR tačaka (LAS, LAZ) — odaberite područje, prorijedite podatke, odaberite klase i provjerite jedinice kota — i vratite površinu kao GeoTIFF mrežu kota.
keywords: dem, dtm, mreža kota, geotiff, tif, ascii mreža, asc, lidar, las, laz, oblak tačaka, klase, teren, prorjeđivanje, nodata, raster, izvoz geotiff, gis
from: c8b2d18a
---

Javni podaci o kotama dolaze na dva načina: **mreže kota** (DEM: jedna kota po kvadratnoj ćeliji, obično GeoTIFF `.tif` ili ASCII mreža `.asc`) i **LiDAR tačke** (milioni laserskih odraza u datoteci `.las`, ili `.laz` kad je sažeta). CivilCraft pretvara jedno ili drugo u tačke snimanja ili površinu, unutar pregledača: ništa se ne otprema.

## Otvaranje datoteke

1. Kliknite {{ui:Otvori}} (ili {{ui:Uvezi}} u grupi **GIS**) i odaberite datoteku, ili je prevucite na plan. Za ASCII mrežu odaberite i njenu `.prj` datoteku, da CivilCraft zna njen koordinatni sistem.
2. Dijalog za uvoz pokazuje šta datoteka kaže o sebi: veličinu, ćelije ili tačke, koordinatni sistem, gdje se nalazi po geografskoj širini i dužini, i raspon kota. Za LiDAR prvo pročita svaku tačku jednom da prebroji **klase** (traka napretka pokazuje koliko je stigao; {{ui:Cancel}} ga zaustavlja).

GeoTIFF s tri ili četiri kanala (crvena, zelena, plava) je slika, a ne kote: ide u slojeve karte.

## Odabir šta uvesti

- **Područje**: {{ui:The project’s extents and a margin}} (upišite marginu), {{ui:What the plan shows now}} ili {{ui:The whole file}}. Čita se samo taj dio datoteke.
- **Prorijedi na**: razmak između tačaka koje dobijete, u jedinicama projekta. Linija ispod postavki pokazuje koliko tačaka to daje dok kucate. Za mrežu CivilCraft zadržava svaku drugu, treću … ćeliju, tako da kote ostaju tačno kakve su u datoteci; nikad ne usrednjava ćelije. Za LiDAR, područje se dijeli na kvadrate te veličine i zadržava se jedna tačka po kvadratu: {{ui:The point nearest each cell’s center}} (podrazumijevano), {{ui:The lowest point in each cell}} (dobro kad datoteka nema klasu terena: teren je ispod drveća) ili {{ui:The average of each cell’s points}}.
- **Klase** (LiDAR): teren (klasa 2) je označen kad ga datoteka ima; zgrade, drveće i šum su izostavljeni. Kad nema klase terena, označene su sve klase, a dijalog to kaže.
- **Teren** (LiDAR, 0.8): oblak dronom nema klasu terena. Kad datoteka nema nijednu, dijalog počinje na {{ui:Find the ground myself (drone clouds, no ground class)}}: čitaju se sve klase osim šuma, zadržava se najniža tačka u svakoj ćeliji, a zatim CivilCraft uklanja zgrade, drveće i pojedinačne niske tačke progresivnim morfološkim filterom (Zhang i drugi, 2003) kojim možete upravljati: **Najveći objekt za uklanjanje** (širina najveće zgrade; prozori rastu dok je ne pokriju; 0 znači 20 ćelija) i **Najstrmiji nagib terena**. Rad se obavlja na mreži najnižih tačaka, pa oblak s desetinama miliona tačaka ne košta više od broja svojih ćelija (prorjeđivanje je jedan prolaz kroz podatke). Razmak je ćelija: grublja je brža i manje promašuje male objekte nego što mislite, a finija zadržava više detalja terena. Izvještaj kaže koliko je tačaka zadržano kao teren, koliko je ćelija uklonjeno kao objekti i koliko je pojedinačnih niskih tačaka odbačeno. Na izmišljenom snimku dronom od 300 m s pet zgrada, 70 stabala i 200 niskih odstupanja, zadržane tačke bile su unutar 3 cm od stvarnog terena, a nijedan krov ni krošnja nisu zadržani.
- **Kote u datoteci**: metri, stope ili američke geodetske stope. Kad datoteka to kaže, jedinica je već odabrana. Kad ne kaže, morate odabrati: dijalog pokazuje raspon kota u oba smjera da biste mogli vidjeti koji ima smisla za lokaciju.
- **Uvezi kao** (samo mreže): {{ui:Survey points (description DEM)}} ili {{ui:The surface itself (a grid of triangles)}}.

Jedan uvoz uzima najviše 500,000 tačaka. Kad bi izbor dao više, dijalog kaže za koliko i koji razmak bi stao, a {{ui:Import}} ostaje isključen.

Kliknite {{ui:Import}}. Traka napretka pokazuje čitanje; {{ui:Cancel}} ga zaustavlja i ništa se ne mijenja.

:::warning
Vertikalne jedinice su česta zamka. Mnogi DEM-ovi u državnoj projekciji imaju istočne i sjeverne koordinate u stopama, ali kote u metrima. Uporedite raspon koji dijalog pokazuje s onim što znate o lokaciji.
:::

## Šta dobijate

- **Tačke snimanja**: numerisane nakon vašeg najvišeg broja tačke, s opisom `DEM` (mreže) ili `LIDAR`, tako da čine jednu grupu tačaka pod **Tačke** i grade površinu kao i svake druge tačke. Uvoz je jedan korak: {{key:Mod+Z}} ih ponovo uklanja.
- **Sama površina**: mrežni TIN, dva trougla po ćeliji, podijeljena po dijagonali jugozapad–sjeveroistok. Trougao s uglom bez podataka se izostavlja, tako da rupe u podacima ostaju rupe. Površina je jednaka mreži u svakoj mrežnoj tački i ravna ravan unutar svakog trougla između njih. Zamjenjuje površinu projekta (dijalog prvo pita); {{key:Mod+Z}} vraća prethodnu površinu. Naslov lijevog panela kaže **Površina (iz mreže kota)**.

## Koordinatni sistemi

- Ako projekat ima koordinatni sistem i datoteka navodi drugi, svaka tačka se pretvara u sistem projekta (i u njegove terenske ili lokalne koordinate kad ih ima).
- Ako projekat nema nijedan, a koordinatni sistem datoteke je u jedinicama projekta (stope ili metri), dijalog nudi da ga postavi kao koordinatni sistem projekta, u istom koraku poništavanja kao tačke.
- Ako je datoteka u geografskoj širini i dužini, ili u metrima za projekat u stopama, dijalog traži da prvo odaberete koordinatni sistem projekta.
- Ako datoteka to ne kaže, njeni brojevi se uzimaju kao koordinate projekta. Umjesto toga možete odabrati koordinatni sistem datoteke.

## Izvoz površine kao GeoTIFF

1. Kliknite {{ui:Export}} u grupi **GIS**.
2. U dijelu GeoTIFF odaberite površinu (postojeći teren ili projektovanu površinu) i veličinu ćelije. Podrazumijevana vrijednost dolazi iz prosječne ivice trougla površine. Dijalog pokazuje veličinu mreže koju će zapisati.
3. Kliknite {{ui:Download GeoTIFF}}.

Datoteka je jedan kanal 32-bitnih decimalnih kota (floating point) u jedinicama projekta, preko područja površine; ćelije izvan površine su „no data“ (−3.4028235e38). Vrijednost svake ćelije je kota površine u središtu ćelije. Koordinate su **mrežne** koordinate: projekat u terenskim ili lokalnim koordinatama pretvara se nazad u mrežu. Datoteka imenuje koordinatni sistem projekta svojim EPSG kodom; sistem bez EPSG koda se ne zapisuje, a dijalog vas upozorava da kažete GIS odjeljenju koji je to sistem.

## Šta je provjereno

- Čitači GeoTIFF i ASCII mreže provjereni su u odnosu na GDAL (preko rasterio), biblioteku koju koristi većina GIS programa za čitanje ovih datoteka: 32-bit float i 16-bit integer mreže, s pločicama i trakama, DEFLATE i LZW, nodata, skala i offset, pixel-is-point, UTM mreža, mreža državne projekcije u američkim geodetskim stopama i mreža geografske širine i dužine — svaka vrijednost jednaka.
- LAS i LAZ čitači provjereni su u odnosu na laspy: LAS 1.2 i 1.4, formati tačaka 0, 1, 3, 6, 7 i 8, sa i bez koordinatnog sistema, i LAZ zapisan LASzip-kompatibilnim backendom — svaka tačka jednaka.
- Pretvorene koordinate provjerene su u odnosu na PROJ na 1 mm.
- Izvezeni GeoTIFF-ovi čitani su nazad u GDAL-u: koordinatni sistem, položaji ćelija, nodata, jedinice i vrijednosti jednake površini do 0.0001.
- Ništa ovdje nije otvoreno u drugim GIS ili CAD programima.

## Još nije napravljeno

- Promjene vertikalnog datuma (geoidni modeli): kote se koriste onako kako ih datoteka ima.
- Podaci o talasnom obliku, LiDAR odrazi osim po klasi, boje i intenziteti.
- Više kanala, pregledi (overviews) ili datoteke veće od 200 MB.
- Pisanje LAS ili LAZ iz površine ili iz ovog alata ([dodatak Oblaci tačaka](topic:point-clouds) zapisuje očišćen oblak kao LAS 1.4 ili LAZ).
