---
title: Mreže kota i LiDAR
summary: Izgradite postojeći teren iz DEM-a (GeoTIFF ili ASCII mreža) ili LiDAR tačaka (LAS, LAZ) — izaberite oblast, proredite podatke, izaberite klase i proverite jedinice kote — i vratite površ kao GeoTIFF mrežu kota.
keywords: dem, dtm, mreža kota, geotiff, tif, ascii mreža, asc, lidar, las, laz, oblak tačaka, klase, teren, proređivanje, nodata, raster, izvoz geotiff, gis
from: c8b2d18a
---

Javni podaci o kotama dolaze na dva načina: **mreže kota** (DEM: jedna kota po kvadratnoj ćeliji, obično GeoTIFF `.tif` ili ASCII mreža `.asc`) i **LiDAR tačke** (milioni laserskih odraza u `.las` datoteci, ili `.laz` kada je sažeta). CivilCraft pretvara bilo koje od njih u tačke snimanja ili površ, u samom pregledaču: ništa se ne otprema.

## Otvaranje datoteke

1. Kliknite {{ui:Otvori}} (ili {{ui:Uvezi}} u grupi GIS) i izaberite datoteku, ili je prevucite na plan. Za ASCII mrežu izaberite i njenu `.prj` datoteku, da CivilCraft zna njen koordinatni sistem.
2. Dijalog uvoza prikazuje šta datoteka kaže o sebi: veličinu, ćelije ili tačke, koordinatni sistem, položaj u geografskoj širini i dužini, i opseg kota. Za LiDAR najpre pročita svaku tačku jednom da prebroji **klase** (traka napretka pokazuje koliko je stigao; {{ui:Otkaži}} to zaustavlja).

GeoTIFF sa tri ili četiri kanala (crveni, zeleni, plavi) je slika, a ne kote: ide u slojeve karte.

## Izbor onoga što se uvozi

- **Oblast**: {{ui:Obuhvat projekta i margina}} (upišite marginu), {{ui:Šta plan sada prikazuje}}, ili {{ui:Cela datoteka}}. Čita se samo taj deo datoteke.
- **Proredi na**: razmak između tačaka koje dobijate, u jedinicama projekta. Linija ispod podešavanja pokazuje koliko tačaka to daje dok kucate. Za mrežu, CivilCraft zadržava svaku drugu, treću … ćeliju, pa kote ostaju tačno iz datoteke; nikad ne usrednjava ćelije. Za LiDAR, oblast se deli na kvadrate te veličine i zadržava se jedna tačka po kvadratu: {{ui:Tačka najbliža centru svake ćelije}} (podrazumevano), {{ui:Najniža tačka u svakoj ćeliji}} (dobro kada datoteka nema klasu terena: teren je ispod drveća) ili {{ui:Prosek tačaka svake ćelije}}.
- **Klase** (LiDAR): teren (klasa 2) je označen kada ga datoteka ima; zgrade, drveće i šum se ne uzimaju. Kada nema klase terena, označene su sve klase, a dijalog to kaže.
- **Teren** (LiDAR, 0.8): oblak sa drona nema klasu terena. Kada datoteka nema nijednu, dijalog počinje sa {{ui:Sam pronađi teren (oblaci tačaka iz drona, bez klase terena)}}: čita se svaka klasa osim šuma, zadržava se najniža tačka u svakoj ćeliji, a zatim CivilCraft izbacuje zgrade, drveće i slučajne niske tačke pomoću progresivnog morfološkog filtera (Zhang i saradnici, 2003) kojim možete upravljati: **Najveći objekat za uklanjanje** (širina najveće zgrade; prozori rastu dok je ne pokriju; 0 znači 20 ćelija) i **Najstrmiji nagib terena**. Rad se obavlja na mreži najnižih tačaka, pa oblak od desetina miliona tačaka ne košta više od broja svojih ćelija (proređivanje je jedan prolaz kroz podatke). Razmak je ćelija: grublja je brža i manje promašuje male objekte nego što mislite, a finija zadržava više detalja terena. Izveštaj kaže koliko je tačaka zadržano kao teren, koliko je ćelija uklonjeno kao objekti i koliko je slučajnih niskih tačaka odbačeno. Na izmišljenom snimku drona od 300 m sa pet zgrada, 70 stabala i 200 niskih odstupanja, zadržane tačke bile su u okviru 3 cm od stvarnog terena, a nijedan krov ni krošnja nisu zadržani.
- **Kote u datoteci**: metri, stope ili američke geodetske stope. Kada datoteka to kaže, jedinica je već izabrana. Kada ne kaže, morate izabrati: dijalog prikazuje opseg kota na oba načina da vidite koji ima smisla za lokaciju.
- **Uvezi kao** (samo mreže): {{ui:Tačke snimanja (opis DEM)}}, ili {{ui:Sama površ (mreža trouglova)}}.

Jedan uvoz uzima najviše 500,000 tačaka. Kada bi izbor dao više, dijalog kaže za koliko i koji razmak bi stao, a {{ui:Uvezi}} ostaje neaktivno.

Kliknite {{ui:Uvezi}}. Traka napretka prikazuje čitanje; {{ui:Otkaži}} zaustavlja ga, i ništa se ne menja.

:::warning
Jedinice visine su čest izvor greške. Mnoge DEM datoteke u ravnom državnom koordinatnom sistemu (State plane) imaju istočne i severne koordinate u stopama, ali kote u metrima. Proverite opseg koji dijalog prikazuje u odnosu na ono što znate o lokaciji.
:::

## Šta dobijate

- **Tačke snimanja**: numerisane posle vašeg najvišeg broja tačke, sa opisom `DEM` (mreže) ili `LIDAR`, pa čine jednu grupu tačaka pod **Tačke** i grade površ kao bilo koje druge tačke. Uvoz je jedan korak: {{key:Mod+Z}} ih ponovo uklanja.
- **Sama površ**: TIN mreža, dva trougla po ćeliji, podeljena po dijagonali jugozapad–severoistok. Trougao sa uglom koji nema podatke se izostavlja, pa rupe u podacima ostaju rupe. Površ je jednaka mreži u svakoj tački mreže i ravna ravan unutar svakog trougla između njih. Zamenjuje površ projekta (dijalog pita pre toga); {{key:Mod+Z}} vraća prethodnu površ. Naslov levog panela glasi **Površ (iz mreže kota)**.

## Koordinatni sistemi

- Ako projekat ima koordinatni sistem, a datoteka navodi drugi, svaka tačka se pretvara u sistem projekta (i u njegove terenske ili lokalne koordinate kada ih ima).
- Ako projekat nema nijedan, a koordinatni sistem datoteke je u jedinicama projekta (stope ili metri), dijalog nudi da ga postavi kao koordinatni sistem projekta, u istom koraku poništavanja kao tačke.
- Ako je datoteka u geografskoj širini i dužini, ili u metrima za projekat u stopama, dijalog traži da prvo izaberete koordinatni sistem projekta.
- Ako datoteka to ne kaže, njeni brojevi se uzimaju kao koordinate projekta. Umesto toga možete izabrati koordinatni sistem datoteke.

## Izvoz površi kao GeoTIFF

1. Kliknite {{ui:Izvoz}} u grupi GIS.
2. U delu GeoTIFF izaberite površ (postojeći teren ili isplanirana površ) i veličinu ćelije. Podrazumevana vrednost dolazi od prosečne ivice trougla površi. Dijalog prikazuje veličinu mreže koju će upisati.
3. Kliknite {{ui:Preuzmi GeoTIFF}}.

Datoteka je jedan kanal 32-bitnih vrednosti kota sa pokretnom tačkom, u jedinicama projekta, preko obuhvata površi; ćelije van površi su „nema podataka“ (−3.4028235e38). Vrednost svake ćelije je kota površi u centru ćelije. Koordinate su **mrežne**: projekat u terenskim ili lokalnim koordinatama se vraća u mrežu. Datoteka navodi koordinatni sistem projekta preko njegovog EPSG koda; sistem bez EPSG koda se ne upisuje, a dijalog vas upozorava da GIS odeljenju kažete koji je to sistem.

## Šta je provereno

- Čitači GeoTIFF i ASCII mreža proveravani su prema GDAL-u (preko rasterio), biblioteke koju koristi većina GIS programa: mreže sa 32-bitnim brojevima sa pokretnom tačkom i 16-bitnim celim brojevima, u pločicama i trakama, DEFLATE i LZW, nodata, skala i pomak, pixel-is-point, UTM mreža, mreža u ravnom državnom sistemu sa američkim geodetskim stopama i mreža geografske širine i dužine — sve vrednosti jednake.
- Čitači LAS i LAZ proveravani su prema laspy: LAS 1.2 i 1.4, formati tačaka 0, 1, 3, 6, 7 i 8, sa koordinatnim sistemom i bez njega, i LAZ napisan LASzip-kompatibilnom pozadinom — svaka tačka jednaka.
- Pretvorene koordinate proverene su prema PROJ-u na 1 mm.
- Izvezeni GeoTIFF-ovi pročitani su nazad preko GDAL-a: koordinatni sistem, položaji ćelija, nodata, jedinice i vrednosti jednake površi do 0.0001.
- Ništa ovde nije otvarano u drugim GIS ili CAD programima.

## Nije još napravljeno

- Promene vertikalnog datuma (modeli geoida): kote se koriste onakve kakve ih datoteka ima.
- Podaci o talasnom obliku, LiDAR odrazi osim po klasi, boje i intenziteti.
- Više kanala, pregledni nivoi, ili datoteke veće od 200 MB.
- Upisivanje LAS ili LAZ iz površi ili iz ovog alata (dodatak [Oblaci tačaka](topic:point-clouds) upisuje očišćen oblak kao LAS 1.4 ili LAZ).
