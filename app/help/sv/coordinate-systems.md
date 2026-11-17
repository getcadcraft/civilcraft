---
title: Ange projektets koordinatsystem
summary: Ange vilket koordinatsystem mätningen är i, så att CivilCraft visar latitud och longitud, placerar GIS-filer och kartlager och skriver .prj-filer. Välj efter kod, efter namn, efter koordinaterna själva eller från en .prj-fil.
keywords: koordinatsystem, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projektion, prj, wkt, datum, latitud, longitud, lat long, geografisk, rutnät, georeferens, georeferera, ange koordinatsystem
from: 964250e2
---

Ett projekts koordinater är bara siffror tills du anger vad de betyder. Att ange koordinatsystemet **flyttar aldrig något**: det talar om för CivilCraft att till exempel E 6,150,000 N 2,080,000 är state plane-koordinater för zon 6 i Kalifornien, i US survey feet. När programmet vet det:

- visar statusfältet latitud och longitud för pekaren,
- GIS-filer i andra system (shapefiler, GeoJSON, GeoPackage, höjdrutnät, LiDAR) omvandlas till projektet när de öppnas,
- kartlager kan ritas under planen ([Visa kartlager under planen](topic:map-layers)),
- export till GIS-format bär med sig systemet (en `.prj` för shapefiler, EPSG-koden för GeoPackage och GeoTIFF).

## Välj systemet

1. Välj {{ui:Koordinater}} i gruppen {{ui:GIS}} på verktygsfältet. Dialogrutan **Koordinatsystem** öppnas. Överst anges vad projektet ligger i just nu, eller **Inget — koordinater är bara siffror**.
2. Hitta systemet på ett av dessa sätt:
   - **Sök**: skriv EPSG-koden (`2277`, `EPSG:2277`) eller ord ur namnet (`texas central`, `utm 14n`, `lambert-93`). Koder listas utifrån det du skrev; ord listar system vars namn innehåller alla orden.
   - {{ui:System som de här koordinaterna passar}} (när projektet har punkter eller en terrängmodell): CivilCraft läser av projektets mitt i varje system i projektets enhetsfamilj och listar de vars användningsområde innehåller den. State plane-koordinater passar oftast bara i några få zoner: ett projekt i Texas vid E 3,115,000 N 10,070,000 US survey feet passar de fyra Texas Central-varianterna (NAD83, NAD83(2011), HARN, NSRS2007). Varje post visar var projektets mitt skulle hamna.
   - **Nära (lat, long)** och {{ui:Föreslå}}: skriv var platsen ligger, till exempel `30.27, -97.74` eller `30°16′N 97°44′W`, så listar CivilCraft de projicerade system vars område innehåller den, nationella och delstatliga rutnät först.
   - {{ui:Läs en .prj-fil…}}: öppna den `.prj` som följde med en shapefil eller en ritning. CivilCraft matchar den mot sin lista med projektionsberäkningarna (så en `.prj` som namnger ett datum på annat sätt hittar ändå rätt system) och säger vilket det är; när inget matchar exakt används filens egen beskrivning. Du kan också släppa en `.prj` på dialogrutan, eller öppna eller släppa en på planen ensam.
3. Klicka på ett system i listan. Under **Vald** visas namn, EPSG-kod, enhet, hur väl dess datum är knutet till WGS 84, dess användningsområde i latitud och longitud och var projektets mitt hamnar i det.
4. Låt **Rutnät** vara vald (för de flesta projekt; se [Mark- och lokala koordinater](topic:ground-and-local-coordinates) för de övriga) och välj {{ui:Verkställ}}.

Statusfältet visar nu pekarens latitud och longitud bredvid E och N. Att ange systemet är ett ångra-steg: {{key:Mod+Z}} tar tillbaka det.

:::note
Enheterna måste stämma: ett projekt i fot tar system i US survey feet eller internationella fot, ett projekt i meter tar system i meter. CivilCraft förklarar ett avslag (”Projektet är i fot men det här systemet är i meter…”). Ett projekt i fot med ett system i US survey foot använder survey feet: projektets ”ft” betyder systemets fot. Geografiska system (latitud och longitud, till exempel WGS 84 själv) kan inte vara ett projekts system: ritningar behöver östvärden och nordvärden.
:::

## Ändra eller ta bort systemet

Öppna {{ui:Koordinater}} igen, välj ett annat system och välj {{ui:Verkställ}}. När projektet har punkter eller en projektering frågar CivilCraft **Finns koordinaterna redan i … ?**

- {{ui:Ja — inget flyttas}}: siffrorna står kvar och bara deras betydelse ändras. Använd detta när det gamla systemet valdes av misstag.
- {{ui:Nej — omvandla dem}}: varje mätpunkt, brytlinje, gräns, linjeföringens PI, byggplattans hörn och brunn omvandlas från det gamla systemet till det nya, i ett enda ångra-steg. En terrängmodell som lästes från LandXML som trianglar kan inte omvandlas; bygg upp den från punkterna först.

{{ui:Ta bort systemet}} tar bort systemet (inget flyttas). GIS-lager som redan finns i projektet ligger kvar där de är.

## Latitud och longitud i statusfältet

Medan projektet har ett system visar statusfältet pekarens latitud och longitud i WGS 84, till exempel `30°18′00.00″ N  97°42′00.00″ W`. Välj decimalgrader i stället under {{ui:Inställningar}}, {{ui:CivilCraft}}, **Latitud och longitud** ([CivilCraft-inställningar](topic:settings)). Med mark- eller lokala koordinater går avläsningen först genom det steget, så den stämmer för punkten under pekaren.

## Hur bra datumförskjutningen är

Latitud, longitud, GeoJSON och kartlager ligger alla i WGS 84. Varje systems koppling till WGS 84 visas i dialogrutan:

| Dialogrutan visar | Vad det betyder |
|---|---|
| WGS 84 självt | Ingen förskjutning alls. |
| NAD83 används som WGS 84 | De två skiljer sig med en eller två meter på de flesta platser i Nordamerika, högst några meter. Bra för kartlager och platsens omgivning; inte för mätstomme. |
| Känd inom ungefär *n* m (EPSG:s värde) | En publicerad förskjutning; kartlager och GeoJSON kan vara fel med ungefär så mycket. |
| Inte känd för det här datumet | Det finns ingen publicerad förskjutning utan en rutnätsfil: kartlager och GeoJSON kan vara fel med hundratals meter. |
| Från rutnätsförskjutningsfilen … | En rutnätsförskjutningsfil används (nedan): inom ungefär 10 cm från NAD83 inom rutnätet. |

Projektets egna koordinater går aldrig genom en datumförskjutning: bara det som omvandlas till eller från latitud och longitud gör det. Vertikala datum och geoidmodeller hanteras inte (höjder omvandlas aldrig). Där den bästa förskjutningen kräver en rutnätsfil visar listan en grövre publicerad förskjutning och dialogrutan visar dess noggrannhet (NAD27-system, till exempel, ungefär 20 m), tills du lägger till rutnätet.

## Rutnätsförskjutningsfiler

För ett NAD27-system ger **Rutnätsförskjutningsfil** i dialogrutan för koordinatsystem att latitud, longitud, GIS-filer och kartlager hamnar inom ungefär 10 cm från NAD83 i stället för ungefär 20 m:

- **Ladda ner** rutnätet som den föreslår för systemets område (NADCON5 för de sammanhängande delarna av USA, NADCON för Alaska, NTv2 för Kanada) från cdn.proj.org, PROJ:s publika rutnätsserver. Endast rutnätsfilens namn skickas.
- Eller **Lägg till en rutnätsfil…** om du redan har en: NTv2 (`.gsb`) eller ett PROJ GeoTIFF-rutnät (`.tif`), upp till 20 MB.

Rutnätet sparas i projektfilen, så det följer med projektet. Avsnittet visar om projektets mitt ligger inom rutnätet: utanför det görs ingen förskjutning alls, så använd ett rutnät som täcker platsen. **Sluta använda rutnätet** går tillbaka till den grova förskjutningen. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

GIS-lager som redan finns i projektet ligger kvar där de är när rutnätet ändras; importera dem igen för att placera dem via rutnätet. Projektets egna koordinater flyttas aldrig.

## Vad som kontrollerats

- Varje omvandling jämfördes med PROJ (pyproj 3.7.1 med PROJ 9.5.1), koordinatbiblioteket de flesta GIS-program använder, över mer än 330 system: state plane i US survey feet och fot, UTM norr och söder, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator och web Mercator bland dem. Östvärden och nordvärden stämmer till 1 cm med samma datumförskjutning (de flesta väl under 1 mm), och projektionsberäkningarna stämmer med PROJ:s egna definitioner till 1 cm.
- `.prj`-filer som PROJ skrivit i båda vanliga former (ESRI och OGC) lästes tillbaka för 105 system: 208 av de 210 matchade sin exakta EPSG-kod och de övriga två ett system med samma beräkningar på samma ellipsoid. `.prj`-filer som CivilCraft skriver läses av PROJ som samma system. ESRI-`.prj`-filer för polära stereografiska system (UPS, Alaska polar) kan inte läsas; välj de systemen efter kod.
- Latitud och longitud i statusfältet stämde med PROJ till 0.01″ i webbläsaren.
