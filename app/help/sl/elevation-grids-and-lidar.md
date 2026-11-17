---
title: Mreže višin in LiDAR
summary: Zgradite obstoječi teren iz DEM (GeoTIFF ali ASCII mreže) ali točk LiDAR (LAS, LAZ) – izberite območje, zredčite podatke, izberite razrede in preverite enote višin – ter površje vrnite kot mrežo višin GeoTIFF.
keywords: dem, dtm, mreža višin, geotiff, tif, ascii mreža, asc, lidar, las, laz, oblak točk, razredi, teren, redčenje, nodata, raster, izvoz geotiff, gis
from: c8b2d18a
---

Javni podatki o višinah pridejo na dva načina: **mreže višin** (DEM: ena višina na kvadratno celico, običajno GeoTIFF `.tif` ali ASCII mreža `.asc`) in **točke LiDAR** (na milijone laserskih odbojev v datoteki `.las` ali `.laz`, če je stisnjena). CivilCraft jih v brskalniku pretvori v geodetske točke ali površje: nič se ne naloži na strežnik.

## Odprite datoteko

1. Kliknite {{ui:Odpri}} (ali {{ui:Uvozi}} v skupini GIS) in izberite datoteko ali jo povlecite na tloris. Pri ASCII mreži izberite tudi njeno datoteko `.prj`, da CivilCraft pozna njen koordinatni sistem.
2. Pogovorno okno za uvoz pokaže, kaj datoteka pove o sebi: velikost, celice ali točke, koordinatni sistem, kje je v zemljepisni širini in dolžini ter razpon višin. Pri LiDAR najprej prebere vsako točko enkrat, da prešteje **razrede** (vrstica napredka kaže, koliko je opravljeno; {{ui:Prekliči}} ustavi).

GeoTIFF s tremi ali štirimi pasovi (rdeč, zelen, moder) je slika, ne višine: namesto tega gre med kartne sloje.

## Izberite, kaj uvoziti

- **Območje**: {{ui:Obseg projekta in rob}} (vnesite rob), {{ui:Kar tloris prikazuje zdaj}} ali {{ui:Celotna datoteka}}. Prebran je samo ta del datoteke.
- **Zredči na**: razmik med točkami, ki jih dobite, v enotah projekta. Vrstica pod nastavitvami pokaže, koliko točk to da, med tipkanjem. Pri mreži CivilCraft ohrani vsako drugo, tretjo … celico, tako da višine ostanejo natančno take kot v datoteki; celic nikoli ne povpreči. Pri LiDAR se območje razreže na kvadrate te velikosti in na vsak kvadrat se ohrani ena točka: {{ui:Točka, najbližja središču vsake celice}} (privzeto), {{ui:Najnižja točka v vsaki celici}} (dobro, kadar datoteka nima razreda terena: teren je pod drevesi) ali {{ui:Povprečje točk vsake celice}}.
- **Razredi** (LiDAR): teren (razred 2) je označen, kadar ga datoteka ima; stavbe, drevesa in šum so izpuščeni. Če razreda terena ni, so označeni vsi razredi, pogovorno okno pa to pove.
- **Teren** (LiDAR, 0.8): oblak iz drona nima razreda terena. Kadar datoteka nobenega nima, pogovorno okno začne pri {{ui:Teren poišči samodejno (oblaki iz dronov, brez razreda terena)}}: prebere se vsak razred razen šuma, ohrani se najnižja točka v vsaki celici, nato CivilCraft z napredujočim morfološkim filtrom (Zhang in drugi, 2003) odstrani stavbe, drevesa in posamezne nizke točke. Filter lahko nastavite: **Največji objekt za odstranitev** (širina največje stavbe; okna rastejo, dokler je ne pokrijejo; 0 pomeni 20 celic) in **Najstrmejši naklon terena**. Delo poteka na mreži najnižjih točk, zato oblak s desetinami milijonov točk stane največ toliko, kolikor je njegovih celic (redčenje je en tok branja). Razmik je celica: grobejša je hitrejša in manj spregleda majhne objekte, kot bi pričakovali, finejša ohrani več podrobnosti terena. Poročilo pove, koliko točk je ohranjenih kot teren, koliko celic je odstranjenih kot objekti in koliko posameznih nizkih točk je zavrženih. Na izmišljenem snemanju z dronom 300 m s petimi stavbami, 70 drevesi in 200 nizkimi osamelci so bile ohranjene točke znotraj 3 cm od pravega terena, nobena streha ali krošnja pa ni bila ohranjena.
- **Višine v datoteki**: metri, čevlji ali ameriški geodetski čevlji. Če datoteka to pove, je enota že izbrana. Če ne, morate izbrati: pogovorno okno prikaže razpon višin na oba načina, da lahko presodite, kateri ustreza lokaciji.
- **Uvozi kot** (samo mreže): {{ui:Geodetske točke (opis DEM)}} ali {{ui:Samo površje (mreža trikotnikov)}}.

Eden uvoz prinese največ 500.000 točk. Če bi izbira dala več, pogovorno okno pove, za koliko in kateri razmik bi ustrezal, {{ui:Uvozi}} pa ostane onemogočen.

Kliknite {{ui:Uvozi}}. Vrstica napredka prikazuje branje; {{ui:Prekliči}} ga ustavi in nič se ne spremeni.

:::warning
Navpične enote so pogosta past. Mnogi DEM v državni ravninski projekciji imajo vzhodne in severne koordinate v čevljih, višine pa v metrih. Razpon, ki ga prikaže pogovorno okno, primerjajte s tem, kar poznate o lokaciji.
:::

## Kaj dobite

- **Geodetske točke**: oštevilčene za vašo najvišjo številko točke, z opisom `DEM` (mreže) ali `LIDAR`, tako da tvorijo eno skupino točk pod **Točke** in zgradijo površje kot katere koli druge točke. Uvoz je en korak: {{key:Mod+Z}} jih spet odstrani.
- **Samo površje**: mrežni TIN, dva trikotnika na celico, razdeljena po diagonali jugozahod–severovzhod. Trikotnik z vogalom, ki nima podatkov, je izpuščen, zato luknje v podatkih ostanejo luknje. Površje je v vsaki mrežni točki enako mreži, med njimi pa je v vsakem trikotniku ravnina. Nadomesti površje projekta (pogovorno okno najprej vpraša); {{key:Mod+Z}} vrne prejšnje površje. Naslov levega podokna pravi **Površje (iz mreže višin)**.

## Koordinatni sistemi

- Če ima projekt koordinatni sistem, datoteka pa navaja drugega, se vsaka točka pretvori v sistem projekta (in v njegove terenske ali lokalne koordinate, kadar jih ima).
- Če projekt nima sistema in je sistem datoteke v enotah projekta (čevlji ali metri), pogovorno okno ponudi, da ga naredi za koordinatni sistem projekta, v istem koraku razveljavitve kot točke.
- Če je datoteka v zemljepisni širini in dolžini ali v metrih pri projektu v čevljih, vas pogovorno okno najprej prosi, da izberete koordinatni sistem projekta.
- Če datoteka tega ne pove, se njene številke vzamejo kot koordinate projekta. Namesto tega lahko izberete sistem datoteke.

## Izvoz površja kot GeoTIFF

1. Kliknite {{ui:Izvoz}} v skupini GIS.
2. V delu GeoTIFF izberite površje (obstoječi teren ali izravnano površje) in velikost celice. Privzeta vrednost pride iz povprečnega roba trikotnika površja. Pogovorno okno prikaže velikost mreže, ki jo bo zapisalo.
3. Kliknite {{ui:Prenesi GeoTIFF}}.

Datoteka je en pas 32-bitnih plavajočih višin v enotah projekta, čez obseg površja; celice zunaj površja so „ni podatkov“ (−3.4028235e38). Vrednost vsake celice je višina površja v središču celice. Koordinate so **mrežne**: projekt v terenskih ali lokalnih koordinatah se pretvori nazaj v mrežo. Datoteka imenuje koordinatni sistem projekta s kodo EPSG; sistem brez kode EPSG se ne zapiše, pogovorno okno pa vas opozori, da GIS oddelku poveste, za kateri sistem gre.

## Kaj je bilo preverjeno

- Bralniki GeoTIFF in ASCII mrež so bili preverjeni z GDAL (prek rasterio), knjižnico, ki jo večina GIS programov uporablja za branje teh datotek: 32-bitne plavajoče in 16-bitne celoštevilske mreže, v ploščicah in v trakovih, DEFLATE in LZW, nodata, merilo in odmik, pixel-is-point, mreža UTM, mreža državne ravninske projekcije v ameriških geodetskih čevljih in mreža zemljepisne širine in dolžine – vsaka vrednost enaka.
- Bralniki LAS in LAZ so bili preverjeni z laspy: LAS 1.2 in 1.4, oblike točk 0, 1, 3, 6, 7 in 8, z koordinatnim sistemom in brez njega, ter LAZ, zapisan z zaledjem, združljivim z LASzip – vsaka točka enaka.
- Pretvorjene koordinate so bile preverjene s PROJ na 1 mm.
- Izvoženi GeoTIFF-i so bili z GDAL prebrani nazaj: koordinatni sistem, položaji celic, nodata, enote in vrednosti, enake površju na 0.0001.
- Ničesar tukaj še niso odprli v drugih GIS ali CAD programih.

## Še ni izdelano

- Spremembe navpičnega datuma (modeli geoida): višine se uporabijo tako, kot jih ima datoteka.
- Podatki o valovni obliki, odboji LiDAR razen po razredu, barve in intenzitete.
- Več pasov, pregledi ali datoteke, večje od 200 MB.
- Pisanje LAS ali LAZ iz površja ali s tem orodjem (dodatek [Oblaki točk](topic:point-clouds) zapiše očiščen oblak kot LAS 1.4 ali LAZ).
