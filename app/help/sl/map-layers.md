---
title: Prikaz slojev zemljevida pod načrtom
summary: Postavite georeferencirano sliko, ploščice zemljevida, strežnik WMS ali WMTS ali kartografsko storitev pod načrt kot kontekst lokacije, z nastavitvijo interneta, neprosojnostjo, vrstnim redom in navedbo avtorja.
keywords: sloji zemljevida, podlaga, osnovni zemljevid, ozadje, zračni posnetek, ortofoto, satelitska slika, raster, world file, pgw, jgw, tfw, wld, geotiff, georeferencirana slika, xyz, ploščice, slippy map, wms, wmts, getcapabilities, kartografska storitev, rest, mapserver, imageserver, usgs, national map, navedba avtorja, neprosojnost
from: 32d7718e
---

Sloji zemljevida so slike, narisane pod vaš načrt: zračni posnetek z možno world datoteko ali zemljevidi s strežnikov na internetu. So zgolj kontekst lokacije na zaslonu: **niso** v izrisih PDF, izvozih DXF ali DWG ali v 3D pogledu.

Izberite {{ui:Zemljevid}} v skupini {{ui:GIS}}. Pogovorno okno **Sloji zemljevida** našteje sloje projekta in dodaja nove. Sloji zemljevida potrebujejo koordinatni sistem projekta ([Nastavitev koordinatnega sistema projekta](topic:coordinate-systems)), razen slike, katere world datoteka uporablja koordinate samega projekta.

## Nastavitev interneta

CivilCraft ne zahteva ničesar od strežnikov zemljevidov, dokler to ne dovolite: {{ui:Nastavitve}}, {{ui:CivilCraft}}, **Sloji zemljevida iz interneta**: **Izklopljeno** (na začetku) ali **Vklopljeno**.

:::note
Ko je vklopljeno, CivilCraft strežnikom zemljevidov, ki jih dodate, zahteva slike območja na zaslonu. Vaša risba ostane na tem računalniku; strežnik vidi območje in vaš internetni naslov.
:::

Ko je izklopljeno, so sloji iz interneta navedeni v pogovornem oknu, vendar sivi, z razlogom, in nič se ne riše ali zahteva. Odpiranje projekta, ki navaja strežnike zemljevidov, jih prav tako ne kliče. Slika iz datoteke deluje vedno. Gumb {{ui:Odpri nastavitve}} v pogovornem oknu vas tja pripelje.

## Georeferencirana slika (deluje brez povezave)

1. V **Dodaj sloj** pustite **Georeferencirana slika** in izberite datoteke: sliko (PNG ali JPEG) **skupaj z** njeno world datoteko (`.pgw` za PNG, `.jgw` za JPEG ali `.wld`) in, če obstaja, njeno `.prj`. Lahko jih tudi skupaj spustite na načrt.
2. Brez `.prj` CivilCraft vpraša, kateri sistem uporablja world datoteka: {{ui:Sistem projekta}} (najpogostejši), {{ui:Izberite sistem …}} ali, v projektu brez sistema, **Koordinate projekta**.
3. Slika se pojavi pod načrtom in {{ui:Prilagodi}} jo vključi.

RGB GeoTIFF (zračni posnetek, shranjen kot GeoTIFF) nosi svojo postavitev in sistem: odprite ga samostojno. Slika ostane **v datoteki projekta** (do 25 MB); večja je zavrnjena z navedbo velikosti, zato shranite manjšo kopijo (manj slikovnih pik ali JPEG).

## Ploščice, WMS, WMTS in kartografske storitve

Najprej vklopite **Sloji zemljevida iz interneta**. Nato v **Dodaj sloj**:

| Od | Kaj prilepite | Kaj naredi CivilCraft |
|---|---|---|
| URL ploščic | Predloga z `{z}`, `{x}` in `{y}` (ali `{-y}`) ter `{s}` za črko strežnika, na primer `https://tile.example.org/{z}/{x}/{y}.png`. Dajte ji ime in navedbo avtorja. | Ploščice v spletnem Mercatorju za območje in povečavo na zaslonu. |
| Strežnik WMS | Naslov strežnika ali njegova povezava GetCapabilities. Izberite {{ui:Pridobi sloje}}, nato sloj. | Ena slika območja na zaslonu, zahtevana v kodi EPSG projekta, kadar jo strežnik ponuja, sicer v spletnem Mercatorju ali WGS 84. |
| Strežnik WMTS | Naslov strežnika ali njegova `WMTSCapabilities.xml`. Izberite {{ui:Pridobi sloje}}, nato sloj in nabor matrik ploščic. | Ploščice iz nabora v sistemu projekta, kadar ga ima, sicer v spletnem Mercatorju. |
| Kartografska storitev ArcGIS (REST) | URL, ki se konča z `/MapServer` ali `/ImageServer`. Izberite {{ui:Preberi storitev}}. | Predpomnjene storitve v spletnem Mercatorju se rišejo iz svojih ploščic; druge se zahtevajo kot ena slika območja na zaslonu. |

Strežniki niso prednastavljeni. Javni primeri, vsi iz USGS National Map (javna domena):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kartografska storitev: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (tudi `USGSImageryOnly` za zračne posnetke)

Mnoge mestne in občinske GIS službe objavljajo lastne strežnike WMS ali kartografske storitve; njihove strani GIS navajajo naslov. Strežnik, ki zahteva prijavo ali ključ, ne deluje: CivilCraft ne pošilja uporabniških imen, gesel ali ključev.

## Kako se sloji rišejo

- Slike v sistemu, ki ni sistem projekta, se preslikajo vanj: slika se razreže na kose, vsak postavljen tako, da je znotraj četrt slikovne pike zaslona od tam, kamor jo postavi natančna pretvorba.
- Ploščice se izberejo za območje na zaslonu in povečavo: največ 64 za pogled, 6 hkrati. Ko premikate ali povečujete, se zahteve za stari pogled prekličejo. V pomnilniku je hranjenih približno 200 ploščic (nič se ne shrani na disk).
- Slika WMS ali kartografske storitve se zahteva, ko se pogled neha premikati; dokler ne prispe, ostane zadnja na mestu.
- Navedba avtorja vsakega sloja se na zaslonu prikaže majhna v spodnjem desnem kotu načrta.

## Sprememba, vrstni red in odstranjevanje slojev

V pogovornem oknu ima vsak sloj potrditveno polje za prikaz ali skrivanje, drsnik **Neprosojnost**, puščice za risanje prej (spodaj) ali pozneje (zgoraj), gumb za povečavo (slike) in gumb za odstranitev. Prvi sloj v seznamu je narisan spodaj. Vsaka sprememba je en korak razveljavitve.

## Ko sloj ne kaže ničesar

Razlog se pojavi enkrat v vrstici stanja in ostane pod imenom sloja v pogovornem oknu:

| Sporočilo | Kaj storiti |
|---|---|
| Izklopljeno: sloji zemljevida iz interneta so v nastavitvah izklopljeni. | Vklopite **Sloji zemljevida iz interneta**. |
| Potrebuje koordinatni sistem projekta | Nastavite ga pod {{ui:Koordinate}}. |
| Strežnik ni dovolil, da ta stran uporablja njegove slike (CORS), ali ni bil dosegljiv. | Strežnik ne dovoli spletnim straneh uporabe svojih slik ali pa je nedosegljiv. Po štirih zavrnitvah CivilCraft neha zahtevati; skrijte in pokažite sloj, da poskusite znova. |
| Strežnik je odgovoril 404 … / Strežnik je poslal text/xml, ne sliko: … | URL, sloj ali slog je napačen, ali pa sporočilo strežnika pove, kaj želi. |
| Ta sloj ni ponujen v sistemu projekta, spletnem Mercatorju ali WGS 84 | Strežnik ne more risati tam, kamor lahko CivilCraft postavi sloj. |

## Kaj je bilo preverjeno

- Številke ploščic so bile preverjene glede na standardno spletno Mercatorjevo ploščičenje; odgovori WMS 1.1.1 in 1.3.0, WMTS ter kartografske storitve so bili prebrani iz ročno napisanih datotek in iz pravih odgovorov, shranjenih s strežnikov USGS National Map in terrestris OpenStreetMap; zahteve WMS 1.3.0 za EPSG:4326 postavijo zemljepisno širino na prvo mesto, kot določa standard.
- Preslikava je bila primerjana z natančno pretvorbo po slikovni piki z uporabo številk PROJ: znotraj 0.13 px za ploščice, slike WMS in sliko velikosti okraja, pri merilu lokacije in pri oddaljenem pogledu.
- Slika z world datoteko in RGB GeoTIFF, ki ga je zapisal GDAL (prek rasterio), sta bili narisani tam, kamor kaže njuna postavitev, preverjeno slikovno piko za piko v brskalniku.
- V brskalniku, proti nadomestnemu strežniku na testnem računalniku: ploščice pristanejo v ploščici, ki jo PROJ določi za vsako točko; slika WMS pristane znotraj 2 px; največ 6 zahtev teče hkrati, in ko je nastavitev izklopljena, nobena zahteva ne zapusti strani. Zgoraj navedena kartografska storitev USGS National Map je bila prebrana in enkrat narisana v živo v brskalniku (njene ploščice so prispele in bile narisane, s svojim besedilom avtorskih pravic); druge javne strežnike smo prebrali samo iz shranjenih odgovorov.
