---
title: Exportera as-built-data för GIS
summary: Lämna över mätpunkter, höjdkurvor, linjeföringar, byggplattor, ledningar och konstruktioner till en kommuns eller myndighets GIS-avdelning som shapefiler, GeoPackage, GeoJSON eller KML, i rutnätskoordinater för projektets koordinatsystem.
keywords: gis, export, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, ledningar, konstruktioner, ledningsnät, kommun, län, rutnät, mark, epsg, prj
from: bba4fea5
---

Många kommuner och län begär as-built-data i ett GIS-format när ett projekt avslutas: var ledningar och brunnar lades, slutliga planeringar, vägens mittlinje. **GIS › Exportera** skriver det CivilCraft har som GIS-lager, ett per typ av objekt.

## Innan du exporterar

1. Ange projektets koordinatsystem under {{ui:Coordinates}}. En GIS-avdelning behöver veta var siffrorna finns; utan ett system bär filerna projektets egna siffror och anger inget namn.
2. Kontrollera terrängmodellen, linjeföringarna, byggplattorna och ledningsnätet så som du vill att de ska levereras.
3. Fråga avdelningen vilket format och vilket koordinatsystem de vill ha. Många vill fortfarande ha shapefiler i den lokala state plane-zonen; nyare system tar GeoPackage.

## Exportera

1. Klicka på {{ui:Export}} i gruppen **GIS**.
2. Under **Vad**, markera vilka typer som ska skickas. Varje visar hur många objekt den har; typer utan något ännu är nedtonade.
3. Under **Som** väljer du formatet.
4. Läs anmärkningarna om koordinater och enheter, och klicka sedan på nedladdningsknappen. Statusraden säger vad som kom med, och vilka fältnamn som förkortades.

Dialogrutan innehåller även exporten av höjdrutnätet ({{ui:Surface as a GeoTIFF elevation grid}}); se [Höjdrutnät och LiDAR](topic:elevation-grids-and-lidar).

## Vad varje typ innehåller

| Typ | Form | Fält |
|---|---|---|
| Mätpunkter | Punkter med höjd | `P` punktnummer, `N` nordvärde, `E` östvärde, `Z` höjd, `D` beskrivning |
| Höjdkurvor för befintlig mark, för den planerade ytan | Linjer på sin höjd | `ELEV` |
| Brytlinjer | Linjer med höjder | `NAME` |
| Terrängmodellens gräns | Polygon (den ritade gränsen, annars terrängmodellens kant) | `NAME` |
| Linjeföringar | Mittlinjer | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stationer som vanliga tal) |
| Byggplattor | Polygoner på plattans höjd | `NAME`, `ELEV`, `AREA` |
| Släntkrönslinjer | Linjer med höjder (plattor och korridorer) | `NAME` |
| Korridorens funktionslinjer | Linjer med höjder: mitt, vägkanter, vägrenar | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Ledningar | Linjer från övre till nedre bottennivå | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procent), `LENGTH`, `NETWORK` |
| Konstruktioner | Punkter vid brunnskanten | `NAME`, `RIM`, `INVERT` (den lägsta bottennivån där), `SUMP`, `DIA`, `DIA_UNIT` |
| Varje GIS-lager | Som importerat | Sina egna fält |

Längder, stationer och höjder är i projektets enheter (US survey feet eller meter). Ledningars och konstruktioners diametrar är i tum för projekt i fot och i millimeter för projekt i meter; `DIA_UNIT` säger vilket.

## Formaten

- **Shapefile**: en `.zip` med en shapefil per typ (`.shp`, `.shx`, `.dbf`), en `.cpg` som anger att texten är UTF-8, och en `.prj` som anger koordinatsystemet. Former med höjder skrivs som shapefilens Z-typer. Fältnamn längre än 10 tecken förkortas, som formatet kräver, och statusraden listar dem.
- **GeoPackage**: en `.gpkg`-fil med en tabell per typ, koordinatsystemet lagrat med sin EPSG-kod. En fil i stället för många, och långa fältnamn behålls.
- **KML** eller **KMZ** (KML zippad): en fil med latitud och longitud för Google Earth och webbkartor, en mapp per typ, varje objekt en platsmärkning namngiven efter dess NAME-fält med alla fält som utökad data; höjder i meter (höjdläge absolut). Liksom GeoJSON behöver den projektets koordinatsystem.
- **GeoJSON**: en fil med latitud och longitud (GeoJSON-standarden tillåter inget annat) där varje objekt bär en egenskap `kind` (`pipes`, `structures`, …) så att mottagaren kan dela upp dem. Höjder omvandlas till meter, som standarden kräver; de ligger kvar i projektets vertikala referens (CivilCraft har ingen geoidmodell). Ett projekt utan koordinatsystem kan inte exportera GeoJSON, och dialogrutan säger varför.

## Rutnät, inte mark

GIS-avdelningar sparar sina data i **rutnätskoordinater** i ett koordinatsystem. Om ditt projekt använder mark- eller lokala koordinater (ställs in under {{ui:Coordinates}}) konverteras varje koordinat tillbaka till rutnät på vägen ut: siffrorna i filerna skiljer sig från planens med din skalfaktor (och rotation, för ett lokalt system). Punktfälten `N` och `E` innehåller också rutnätsvärdena. Dialogrutan påminner om detta.

:::tip
Skicka en kort anteckning med filerna: koordinatsystemet och dess EPSG-kod, den vertikala referensen för dina höjder, enheterna och vad varje fil är.
:::

## Vad som kontrollerats

- Varje skriven fil lästes tillbaka av GDAL, biblioteket de flesta GIS-program använder för att läsa dessa filer: varje form, höjd och attribut, objektantalen och koordinatsystemet som EPSG-kod (`.prj` och GeoPackage). Våra egna läsare läste tillbaka dem likadant.
- GeoJSON-filer följer RFC 7946: longitud före latitud, ingen `crs`-medlem, yttre ringar moturs och hål medurs; positionerna stämde mot PROJ inom 2 mm.
- Ett projekt med markkoordinater exporterades och varje punkt kontrollerades mot sina rutnätskoordinater.
- Inget här har ännu öppnats i andra GIS-program. Kontrollera den första leveransen med avdelningen innan du förlitar dig på den.
