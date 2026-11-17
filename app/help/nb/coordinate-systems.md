---
title: Angi prosjektets koordinatsystem
summary: Si hvilket koordinatsystem målingen er i, slik at CivilCraft viser breddegrad og lengdegrad, plasserer GIS-filer og kartlag, og skriver .prj-filer. Velg etter kode, etter navn, etter koordinatene selv eller fra en .prj-fil.
keywords: koordinatsystem, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projeksjon, prj, wkt, datum, breddegrad, lengdegrad, bredde lengde, geografisk, rutenett, georeferering, georeferer, angi koordinatsystem
from: 964250e2
---

Et prosjekts koordinater er bare tall til du sier hva de betyr. Å angi koordinatsystemet **flytter aldri noe**: det forteller CivilCraft at for eksempel Ø 6,150,000 N 2,080,000 er statsplankoordinater i sone 6 i California, i US survey feet. Når CivilCraft vet det:

- viser statuslinjen breddegrad og lengdegrad for pekeren,
- konverteres GIS-filer i andre systemer (shapefiler, GeoJSON, GeoPackage, høydegrid, LiDAR) inn i prosjektet når de åpnes,
- kan kartlag tegnes under planen ([Vis kartlag under planen](topic:map-layers)),
- inneholder eksport til GIS-formater systemet (en `.prj` for shapefiler, EPSG-koden for GeoPackage og GeoTIFF).

## Velg systemet

1. Velg {{ui:Koordinater}} i {{ui:GIS}}-gruppen på verktøylinjen. Dialogen **Koordinatsystem** åpnes. Øverst står det hva prosjektet er i nå, eller **Ingen — koordinatene er bare tall**.
2. Finn systemet på en av disse måtene:
   - **Søk**: skriv EPSG-koden (`2277`, `EPSG:2277`) eller ord fra navnet (`texas central`, `utm 14n`, `lambert-93`). Koder listes fra det du skrev; ord listes for systemer der navnet inneholder alle ordene.
   - {{ui:Systemer disse koordinatene passer i}} (når prosjektet har punkter eller en terrengmodell): CivilCraft leser midten av prosjektet i alle systemene i prosjektets lengdeenhetsfamilie og lister dem der området for bruk inneholder den. Statsplankoordinater passer vanligvis bare i noen få soner: et prosjekt i Texas på Ø 3,115,000 N 10,070,000 US survey feet passer i de fire Texas Central-variantene (NAD83, NAD83(2011), HARN, NSRS2007). Hver oppføring viser hvor midten av prosjektet ville havne.
   - **Nær (bredde, lengde)** og {{ui:Foreslå}}: skriv hvor stedet ligger, for eksempel `30.27, -97.74` eller `30°16′N 97°44′W`, så lister CivilCraft de projiserte systemene der området inneholder det, nasjonale og statlige rutenett først.
   - {{ui:Les en .prj-fil…}}: åpne `.prj`-filen som fulgte med en shapefil eller en tegning. CivilCraft finner den i listen ved hjelp av projeksjonsberegningene (så en `.prj` som navngir et datum annerledes, finner likevel rett system), og sier hvilket det er. Finnes ingen eksakt treff, brukes filens egen beskrivelse. Du kan også slippe en `.prj` på dialogen, eller åpne eller slippe en på planen alene.
3. Klikk et system i listen. Under **Valgt** vises navnet, EPSG-koden, enheten, hvor godt datumet er knyttet til WGS 84, området for bruk i breddegrad og lengdegrad, og hvor midten av prosjektet havner i det.
4. La **Rutenett** være valgt (for de fleste prosjekter; se [Terreng- og lokale koordinater](topic:ground-and-local-coordinates) for de andre) og velg {{ui:Bruk}}.

Statuslinjen viser nå pekerens breddegrad og lengdegrad ved siden av Ø og N. Å angi systemet er ett angretrinn: {{key:Mod+Z}} tar det tilbake.

:::note
Enhetene må stemme: et prosjekt i fot tar systemer i US survey feet eller internasjonale fot, et prosjekt i meter tar systemer i meter. CivilCraft forklarer en avvisning («Prosjektet er i fot, men dette systemet er i meter…»). Et fotprosjekt med et system i US survey foot bruker survey feet: prosjektets «ft» betyr systemets fot. Geografiske systemer (breddegrad og lengdegrad, for eksempel WGS 84 selv) kan ikke være et prosjekts system: tegninger trenger østlige og nordlige koordinater.
:::

## Endre eller fjern systemet

Åpne {{ui:Koordinater}} igjen, velg et annet system og velg {{ui:Bruk}}. Når prosjektet har punkter eller en prosjektering, spør CivilCraft **Er koordinatene i … allerede?**

- {{ui:Ja — ingenting flyttes}}: tallene blir som de er, og bare betydningen deres endres. Bruk dette når det gamle systemet ble valgt ved en feil.
- {{ui:Nei — konverter dem}}: hvert målepunkt, bruddlinje, grense, veglinje-PI, byggeplatehjørne og kum konverteres fra det gamle systemet til det nye, i ett angretrinn. En terrengmodell lest fra LandXML som trekanter kan ikke konverteres; bygg den på nytt fra punktene først.

{{ui:Fjern systemet}} tar systemet bort (ingenting flyttes). GIS-lag som allerede er i prosjektet, blir værende der de er.

## Breddegrad og lengdegrad i statuslinjen

Mens prosjektet har et system, viser statuslinjen pekerens breddegrad og lengdegrad på WGS 84, for eksempel `30°18′00.00″ N  97°42′00.00″ V`. Velg desimalgrader i stedet under {{ui:Innstillinger}}, {{ui:CivilCraft}}, **Breddegrad og lengdegrad** ([innstillinger for CivilCraft](topic:settings)). Med terreng- eller lokale koordinater går avlesningen først gjennom det trinnet, slik at den stemmer for punktet under pekeren.

## Hvor god datumforskyvningen er

Breddegrad, lengdegrad, GeoJSON og kartlag er alle på WGS 84. Hvert systems knytning til WGS 84 vises i dialogen:

| Det dialogen sier | Hva det betyr |
|---|---|
| WGS 84 selv | Ingen forskyvning i det hele tatt. |
| NAD83 regnes som WGS 84 | De to skiller seg med en meter eller to i det meste av Nord-Amerika, og høyst noen meter. Godt for kartlag og stedskontekst; ikke for målenettet. |
| Kjent til omtrent *n* m (EPSGs tall) | En publisert forskyvning; kartlag og GeoJSON kan være ute med omtrent så mye. |
| Ikke kjent for dette datumet | Det finnes ingen publisert forskyvning uten en rutenettfil: kartlag og GeoJSON kan være ute med hundrevis av meter. |
| Fra rutenettforskyvningsfilen … | En rutenettforskyvningsfil er i bruk (under): innenfor omtrent 10 cm av NAD83 inne i rutenettet. |

Prosjektets egne koordinater går aldri gjennom en datumforskyvning: bare det som konverteres til eller fra breddegrad og lengdegrad, gjør det. Vertikale datum og geoidmodeller håndteres ikke (høyder konverteres aldri). Der den beste forskyvningen krever en rutenettfil, bruker listen en grovere publisert forskyvning, og dialogen viser nøyaktigheten (for NAD27-systemer, for eksempel omtrent 20 m), til du legger til rutenettet.

## Rutenettforskyvningsfiler

For et NAD27-system legger **Fil for rutenettforskyvning** i koordinatsystemdialogen breddegrad og lengdegrad, GIS-filer og kartlag innenfor omtrent 10 cm av NAD83 i stedet for omtrent 20 m:

- {{ui:Last ned}} rutenettet den foreslår for systemets område (NADCON5 for det sammenhengende USA, NADCON for Alaska, NTv2 for Canada) fra cdn.proj.org, PROJs offentlige rutenettserver. Bare rutenettfilens navn sendes.
- Eller **Legg til en rutenettfil…** du allerede har: NTv2 (`.gsb`) eller et PROJ GeoTIFF-rutenett (`.tif`), opptil 20 MB.

Rutenettet lagres i prosjektfilen, så det følger med prosjektet. Seksjonen sier om midten av prosjektet ligger innenfor rutenettet: utenfor det brukes ingen forskyvning i det hele tatt, så bruk et rutenett som dekker stedet. **Slutt å bruke rutenettet** går tilbake til den grove forskyvningen. Hver endring er ett trinn: {{key:Mod+Z}} angrer den.

GIS-lag som allerede er i prosjektet, blir værende der de er når rutenettet endres; importer dem på nytt for å plassere dem gjennom rutenettet. Prosjektets egne koordinater flyttes aldri.

## Hva som er kontrollert

- Hver konvertering er sammenlignet med PROJ (pyproj 3.7.1 med PROJ 9.5.1), koordinatbiblioteket de fleste GIS-programmer bruker, på over 330 systemer: statsplan i US survey feet og fot, UTM nord og sør, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator og web-Mercator, blant andre. Østlige og nordlige koordinater stemmer innen 1 cm med samme datumforskyvning (for de fleste godt under 1 mm), og projeksjonsberegningene stemmer med PROJs egne definisjoner innen 1 cm.
- `.prj`-filer skrevet av PROJ i begge vanlige former (ESRI og OGC) ble lest tilbake for 105 systemer: 208 av 210 traff sin eksakte EPSG-kode, og de to andre et system med samme beregninger på samme ellipsoide. `.prj`-filer CivilCraft skriver, leses av PROJ som det samme systemet. ESRI-`.prj`-filer for polare stereografiske systemer (UPS, Alaska polar) kan ikke leses; velg de systemene etter kode.
- Breddegraden og lengdegraden i statuslinjen stemte med PROJ til 0.01″ i nettleseren.
