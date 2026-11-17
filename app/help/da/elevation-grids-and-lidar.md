---
title: Højdegitre og LiDAR
summary: Opbyg det eksisterende terræn fra en DEM (GeoTIFF eller ASCII-gitter) eller LiDAR-punkter (LAS, LAZ) — vælg området, tynd dataene ud, vælg klasser og kontrollér enhederne for kote — og eksportér en overflade som et GeoTIFF-højdegitter.
keywords: dem, dtm, højdegitter, geotiff, tif, ascii-gitter, asc, lidar, las, laz, punktsky, klasser, terræn, udtynding, nodata, raster, eksport geotiff, gis
from: c8b2d18a
---

Offentlige højdedata kommer på to måder: **højdegitre** (en DEM: én kote pr. kvadratisk celle, typisk en GeoTIFF `.tif` eller et ASCII-gitter `.asc`) og **LiDAR-punkter** (millioner af laserrefleksioner i en `.las`-fil, eller `.laz` når den er komprimeret). CivilCraft omdanner begge dele til opmålingspunkter eller en overflade inde i browseren: intet uploades.

## Åbn filen

1. Klik på {{ui:Åbn}} (eller {{ui:Importér}} i gruppen GIS) og vælg filen, eller træk den ind på planen. Ved et ASCII-gitter skal du også vælge dets `.prj`-fil, så CivilCraft kender dets koordinatsystem.
2. Importdialogen viser, hvad filen oplyser om sig selv: dens størrelse, celler eller punkter, koordinatsystem, hvor den ligger i breddegrad og længdegrad, og dens kotespænd. Ved LiDAR læser den først alle punkter én gang for at tælle **klasserne** (en statuslinje viser, hvor langt den er; {{ui:Annuller}} stopper den).

En GeoTIFF med tre eller fire bånd (rød, grøn, blå) er et billede, ikke koter: den føres i stedet til kortlagene.

## Vælg, hvad der skal hentes ind

- **Område**: {{ui:Projektets udstrækning og en margen}} (skriv marginen), {{ui:Hvad planen viser nu}} eller {{ui:Hele filen}}. Kun den del af filen læses.
- **Tynd ud til**: afstanden mellem de punkter, du får, i projektets enheder. Linjen under indstillingerne viser, hvor mange punkter det giver, mens du skriver. For et gitter beholder CivilCraft hver anden, tredje … celle, så koterne forbliver præcis som filens; den midler aldrig celler sammen. Ved LiDAR skæres området i kvadrater af den størrelse, og ét punkt beholdes pr. kvadrat: {{ui:Det punkt, der er nærmest hver celles centrum}} (standard), {{ui:Det laveste punkt i hver celle}} (godt, når filen ikke har en terrænklasse: terrænet ligger under træerne) eller {{ui:Gennemsnittet af hver celles punkter}}.
- **Klasser** (LiDAR): terræn (klasse 2) er afkrydset, når filen har den; bygninger, træer og støj er udeladt. Når der ikke er nogen terrænklasse, er alle klasser afkrydset, og dialogen siger det.
- **Terræn** (LiDAR, 0.8): en droneky har ingen terrænklasse. Når filen ingen har, starter dialogen på {{ui:Find terrænet selv (droneskyer, ingen terrænklasse)}}: alle klasser undtagen støj læses, det laveste punkt i hver celle beholdes, og derefter fjerner CivilCraft bygninger, træer og spredte lave punkter med et progressivt morfologisk filter (Zhang m.fl., 2003), som du kan styre: **Største objekt der skal fjernes** (bredden af den største bygning; vinduer vokser, indtil de dækker den; 0 betyder 20 celler) og **Stejleste terrænhældning**. Arbejdet udføres på gitteret af de laveste punkter, så en sky på titusinder af millioner punkter ikke koster mere end sit antal celler (udtyndingen er ét streaming-gennemløb). Afstanden er cellen: en grovere én er hurtigere og overser små objekter mindre, end man måske tror; en finere én bevarer mere terrændetalje. Rapporten angiver, hvor mange punkter der blev beholdt som terræn, hvor mange celler der blev fjernet som objekter, og hvor mange spredte lave punkter der blev fjernet. På en konstrueret 300 m droneopmåling med fem bygninger, 70 træer og 200 lave outliers lå de beholdte punkter inden for 3 cm af det sande terræn, og intet tag eller krone blev beholdt.
- **Koter i filen**: meter, fod eller US survey-fod. Når filen oplyser det, er enheden allerede valgt. Når den ikke gør, skal du vælge: dialogen viser kotespændet begge veje, så du kan se, hvilken der giver mening for stedet.
- **Importér som** (kun gitre): {{ui:Opmålingspunkter (beskrivelse DEM)}} eller {{ui:Selve overfladen (et net af trekanter)}}.

En import tager højst 500,000 punkter. Hvis et valg ville give flere, siger dialogen, hvor mange, og hvilken afstand der ville passe, og {{ui:Importér}} forbliver deaktiveret.

Klik på {{ui:Importér}}. En statuslinje viser indlæsningen; {{ui:Annuller}} stopper den, og intet ændres.

:::warning
Lodrette enheder er en almindelig fælde. Mange state plane-DEM'er har øst og nord i fod, men koter i meter. Sammenlign det kotespænd, dialogen viser, med det, du ved om stedet.
:::

## Hvad du får

- **Opmålingspunkter**: nummereret efter dit højeste punktnummer, med beskrivelsen `DEM` (gitre) eller `LIDAR`, så de danner én punktgruppe under **Punkter** og opbygger overfladen ligesom alle andre punkter. Import af dem er ét trin: {{key:Mod+Z}} fjerner dem igen.
- **Selve overfladen**: et gitter-TIN, to trekanter pr. celle, delt langs den diagonal, der går fra sydvest til nordøst. En trekant med et hjørne uden data udelades, så huller i dataene forbliver huller. Overfladen er lig med gitteret i hvert gitterpunkt og er et fladt plan inde i hver trekant mellem dem. Den erstatter projektets overflade (dialogen spørger først); {{key:Mod+Z}} henter den forrige overflade tilbage. Overskriften i venstre panel siger **Terræn (fra et højdegitter)**.

## Koordinatsystemer

- Hvis projektet har et koordinatsystem, og filen angiver et andet, omregnes hvert punkt til projektets system (og til dets terræn- eller lokale koordinater, når de findes).
- Hvis projektet ikke har et, og filens system er i projektets enheder (fod eller meter), tilbyder dialogen at gøre det til projektets koordinatsystem, i samme fortrydelsestrin som punkterne.
- Hvis filen er i breddegrad og længdegrad, eller i meter for et fodprojekt, beder dialogen dig først vælge projektets koordinatsystem.
- Hvis filen ikke oplyser det, tages dens tal som projektets koordinater. Du kan i stedet vælge filens system.

## Eksportér en overflade som GeoTIFF

1. Klik på {{ui:Eksportér}} i gruppen GIS.
2. I GeoTIFF-delen vælger du overfladen (eksisterende terræn eller den planerede overflade) og cellestørrelsen. Standarden stammer fra overfladens gennemsnitlige trekantkant. Dialogen viser størrelsen af det gitter, den vil skrive.
3. Klik på {{ui:Download GeoTIFF}}.

Filen er ét bånd med 32-bit flydende kommatal som koter i projektets enheder, over overfladens udstrækning; celler uden for overfladen er »no data« (−3.4028235e38). Hver celles værdi er overfladens kote i cellens centrum. Koordinaterne er **gitter**-koordinater: et projekt i terræn- eller lokale koordinater omregnes tilbage til gitteret. Filen angiver projektets koordinatsystem med dets EPSG-kode; et system uden EPSG-kode skrives ikke, og dialogen advarer dig om at oplyse GIS-afdelingen, hvilket system det er.

## Hvad der er kontrolleret

- GeoTIFF- og ASCII-gitterlæserne er kontrolleret mod GDAL (via rasterio), det bibliotek, de fleste GIS-programmer bruger til at læse disse filer: 32-bit float- og 16-bit heltalsgitre, flise- og strimmelopdelte, DEFLATE og LZW, nodata, skala og offset, pixel-is-point, et UTM-gitter, et state plane-gitter i US survey-fod og et breddegrad/længdegrad-gitter — alle værdier var ens.
- LAS- og LAZ-læserne er kontrolleret mod laspy: LAS 1.2 og 1.4, punktformaterne 0, 1, 3, 6, 7 og 8, med og uden koordinatsystem, og LAZ skrevet af dens LASzip-kompatible backend — alle punkter var ens.
- Omregnede koordinater er kontrolleret mod PROJ til 1 mm.
- Eksporterede GeoTIFF-filer er læst tilbage af GDAL: koordinatsystem, cellepositioner, nodata, enheder og værdier, der er lig med overfladen til 0.0001.
- Intet her er blevet åbnet i andre GIS- eller CAD-programmer.

## Ikke lavet endnu

- Ændringer af lodret datum (geoidemodeller): koter bruges, som filen har dem.
- Bølgeformsdata, LiDAR-refleksioner andet end efter klasse, farver og intensiteter.
- Flere bånd, oversigter eller filer over 200 MB.
- Skrivning af LAS eller LAZ fra en overflade eller fra dette værktøj ([Punktskyer](topic:point-clouds)-add-on'et skriver en renset sky som LAS 1.4 eller LAZ).
