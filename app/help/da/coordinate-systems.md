---
title: Angiv projektets koordinatsystem
summary: Angiv hvilket koordinatsystem målingen er i, så CivilCraft viser breddegrad og længdegrad, placerer GIS-filer og kortlag og skriver .prj-filer. Vælg efter kode, efter navn, ud fra selve koordinaterne eller fra en .prj-fil.
keywords: koordinatsystem, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projektion, prj, wkt, datum, breddegrad, længdegrad, lat long, geografisk, gitter, georeferering, georeference, tildel koordinatsystem
from: 964250e2
---

Et projekts koordinater er blot tal, indtil du siger, hvad de betyder. At angive koordinatsystemet **flytter aldrig noget**: det fortæller CivilCraft, at for eksempel E 6,150,000 N 2,080,000 er state plane-koordinater for Californien, zone 6, i US survey feet. Når det er kendt:

- viser statuslinjen markørens breddegrad og længdegrad,
- konverteres GIS-filer i andre systemer (shapefiles, GeoJSON, GeoPackage, højdegitre, LiDAR) til projektet, når de åbnes,
- kan kortlag tegnes under planen ([Vis kortlag under planen](topic:map-layers)),
- medtager eksporter til GIS-formater systemet (en `.prj` til shapefiles, EPSG-koden til GeoPackage og GeoTIFF).

## Vælg systemet

1. Vælg {{ui:Koordinater}} i gruppen {{ui:GIS}} på værktøjslinjen. Dialogen **Koordinatsystem** åbnes. Øverst står, hvad projektet er i nu, eller **Ingen — koordinater er blot tal**.
2. Find systemet på en af disse måder:
   - **Søg**: skriv EPSG-koden (`2277`, `EPSG:2277`) eller ord fra navnet (`texas central`, `utm 14n`, `lambert-93`). Koder vises fra den, du skrev; ord viser de systemer, hvis navn har alle ordene.
   - {{ui:Systemer, disse koordinater passer til}} (når projektet har punkter eller en overflade): CivilCraft læser projektets midte i alle systemer i projektets enhedsfamilie og lister dem, hvis anvendelsesområde indeholder den. State plane-koordinater passer normalt kun til få zoner: et projekt i Texas ved E 3,115,000 N 10,070,000 US survey feet passer til de fire Texas Central-varianter (NAD83, NAD83(2011), HARN, NSRS2007). Hver post viser, hvor projektets midte ville ligge.
   - **Nær (bredde, længde)** og {{ui:Foreslå}}: skriv, hvor stedet ligger, for eksempel `30.27, -97.74` eller `30°16′N 97°44′W`. CivilCraft lister de projicerede systemer, hvis område dækker det, nationale og statslige gitre først.
   - {{ui:Læs en .prj-fil…}}: åbn den `.prj`, der fulgte med en shapefil eller en tegning. CivilCraft matcher den med sin liste ud fra projektionsberegningen (så en `.prj`, der navngiver datum anderledes, stadig finder det rette system) og siger, hvilket det er. Når intet matcher præcist, bruges filens egen beskrivelse. Du kan også trække en `.prj` hen over dialogen eller åbne eller trække en hen over planen alene.
3. Klik på et system i listen. Under **Valgt** vises navn, EPSG-kode, enhed, hvor godt dets datum er knyttet til WGS 84, dets anvendelsesområde i breddegrad og længdegrad, og hvor projektets midte ligger i det.
4. Lad **Gitter** være valgt (de fleste projekter; se [Terræn- og lokale koordinater](topic:ground-and-local-coordinates) for de øvrige) og vælg {{ui:Anvend}}.

Statuslinjen viser nu markørens breddegrad og længdegrad ved siden af E og N. At angive systemet er ét fortrydelsestrin: {{key:Mod+Z}} tager det tilbage.

:::note
Enhederne skal passe sammen: et projekt i fod tager systemer i US survey feet eller internationale fod, et projekt i meter tager systemer i meter. CivilCraft forklarer en afvisning (»Projektet er i fod, men dette system er i meter…«). Et projekt i fod med et US survey foot-system bruger survey feet: projektets »ft« betyder systemets fod. Geografiske systemer (breddegrad og længdegrad, sådan som WGS 84 selv) kan ikke være et projekts system: tegninger har brug for øst- og nordkoordinater.
:::

## Skift eller fjern systemet

Åbn {{ui:Koordinater}} igen, vælg et andet system og vælg {{ui:Anvend}}. Når projektet har punkter eller et design, spørger CivilCraft **Er koordinaterne i … allerede?**

- {{ui:Ja — intet flyttes}}: tallene bliver, som de er, og kun deres betydning ændres. Brug dette, når det gamle system blev valgt ved en fejl.
- {{ui:Nej — konvertér dem}}: hvert målepunkt, brudlinje, afgrænsning, tracé-PI, hjørne af et byggeplateau og hvert bygværk konverteres fra det gamle system til det nye i ét fortrydelsestrin. En overflade, der er læst fra LandXML som trekanter, kan ikke konverteres; byg den igen ud fra punkterne først.

{{ui:Fjern systemet}} fjerner systemet (intet flyttes). GIS-lag, der allerede er i projektet, bliver, hvor de er.

## Breddegrad og længdegrad i statuslinjen

Mens projektet har et system, viser statuslinjen markørens breddegrad og længdegrad på WGS 84, for eksempel `30°18′00.00″ N  97°42′00.00″ W`. Vælg i stedet decimalgrader under {{ui:Indstillinger}}, {{ui:CivilCraft}}, **Breddegrad og længdegrad** ([CivilCraft-indstillinger](topic:settings)). Med terræn- eller lokale koordinater går aflæsningen først gennem det trin, så den er rigtig for punktet under markøren.

## Hvor god datumforskydningen er

Breddegrad, længdegrad, GeoJSON og kortlag er alle på WGS 84. Hvert systems forbindelse til WGS 84 vises i dialogen:

| Hvad dialogen siger | Hvad det betyder |
|---|---|
| WGS 84 selv | Ingen forskydning overhovedet. |
| NAD83 regnes som WGS 84 | De to adskiller sig med en meter eller to det meste af Nordamerika, højst få meter. God til kortlag og stedkontekst; ikke til målingskontrol. |
| Kendt til ca. *n* m (EPSG's værdi) | En offentliggjort forskydning; kortlag og GeoJSON kan være forkerte med cirka det. |
| Ukendt for dette datum | Der findes ingen offentliggjort forskydning uden en gitterfil: kortlag og GeoJSON kan være forkerte med hundreder af meter. |
| Fra gitterforskydningsfilen … | En gitterforskydningsfil er i brug (nedenfor): inden for cirka 10 cm af NAD83 inden for gitteret. |

Projektets egne koordinater går aldrig gennem en datumforskydning: kun det, der konverteres til eller fra breddegrad og længdegrad. Lodrette datum og geoidemodeller håndteres ikke (koter konverteres aldrig). Hvor den bedste forskydning kræver en gitterfil, viser listen en grovere offentliggjort forskydning, og dialogen viser dens nøjagtighed (NAD27-systemer fx cirka 20 m), indtil du tilføjer gitteret.

## Gitterforskydningsfiler

For et NAD27-system bringer **Gitterforskydningsfil** i koordinatsystemdialogen breddegrad og længdegrad, GIS-filer og kortlag inden for cirka 10 cm af NAD83 i stedet for cirka 20 m:

- **Hent** det gitter, den foreslår for systemets område (NADCON5 for det sammenhængende USA, NADCON for Alaska, NTv2 for Canada) fra cdn.proj.org, PROJ's offentlige gitterserver. Kun gitterfilens navn sendes.
- Eller **Tilføj en gitterfil…**, du allerede har: NTv2 (`.gsb`) eller et PROJ GeoTIFF-gitter (`.tif`), op til 20 MB.

Gitteret gemmes i projektfilen, så det følger med projektet. Afsnittet siger, om projektets midte ligger inden for gitteret. Uden for det anvendes slet ingen forskydning, så brug et gitter, der dækker stedet. **Stop med at bruge gitteret** går tilbage til den grove forskydning. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

GIS-lag, der allerede er i projektet, bliver, hvor de er, når gitteret ændres; importér dem igen for at placere dem gennem gitteret. Projektets egne koordinater flytter sig aldrig.

## Hvad der er kontrolleret

- Hver konvertering blev sammenlignet med PROJ (pyproj 3.7.1 med PROJ 9.5.1), koordinatbiblioteket de fleste GIS-programmer bruger, på over 330 systemer: state plane i US survey feet og fod, UTM nord og syd, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator og web Mercator blandt dem. Øst- og nordkoordinater stemmer til 1 cm med den samme datumforskydning (de fleste langt under 1 mm), og projektionsberegningerne stemmer med PROJs egne definitioner til 1 cm.
- `.prj`-filer skrevet af PROJ i begge almindelige former (ESRI og OGC) blev læst tilbage for 105 systemer: 208 af de 210 matchede deres præcise EPSG-kode, og de to andre et system med samme beregning på samme ellipsoide. `.prj`-filer, CivilCraft skriver, læses af PROJ som det samme system. ESRI-`.prj`-filer for polære stereografiske systemer (UPS, Alaska polar) kan ikke læses; vælg disse systemer efter kode.
- Breddegrad og længdegrad i statuslinjen stemte med PROJ til 0.01″ i browseren.
