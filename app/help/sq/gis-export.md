---
title: Eksporto të dhënat as-built për GIS
summary: Dorëzo pikat e matjes, konturat, aks-et, platformat, tubat dhe strukturat te departamenti GIS i një qyteti ose qarku si shapefile, GeoPackage, GeoJSON ose KML, në koordinata rrjeti të sistemit koordinativ të projektit.
keywords: gis, eksport, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tuba, struktura, shërbime, qytet, qark, rrjet, tokë, epsg, prj
from: bba4fea5
---

Shumë qytete dhe qarqe kërkojnë të dhëna as-built në një format GIS kur mbyllet një projekt: ku shkuan tubat dhe strukturat, nivelet finale, boshti i rrugës. **GIS › Eksporto** shkruan atë që mban CivilCraft si shtresa GIS, një për çdo lloj objekti.

## Para se të eksportoni

1. Vendosni sistemin koordinativ të projektit te {{ui:Koordinatat}}. Një departament GIS duhet të dijë ku janë numrat; pa sistem, skedarët mbartin numrat e vetë projektit dhe nuk emërojnë asnjë.
2. Kontrolloni sipërfaqen, aks-et, platformat dhe rrjetin e tubave ashtu si doni t'i dorëzoni.
3. Pyeteni departamentin cilin format dhe cilin sistem koordinativ duan. Shumë prej tyre kërkojnë ende shapefile në zonën lokale state plane; sistemet më të reja pranojnë GeoPackage.

## Eksporto

1. Kliko {{ui:Eksporto}} te grupi **GIS**.
2. Te **Çfarë**, shëno llojet për t'i dërguar. Secili tregon sa elemente ka; llojet pa asgjë ende janë të çaktivizuara.
3. Te **Si**, zgjidh formatin.
4. Lexo shënimet për koordinatat dhe njësitë, pastaj kliko butonin e shkarkimit. Rreshti i statusit thotë çfarë u fut dhe cilat emra fushash u shkurtuan.

Dialogu mban edhe eksportin e rrjetit të kotave ({{ui:Sipërfaqja si rrjet kotash GeoTIFF}}); shih [Rrjetat e kotave dhe LiDAR](topic:elevation-grids-and-lidar).

## Çfarë mban çdo lloj

| Lloji | Forma | Fushat |
|---|---|---|
| Pikat e matjes | Pika me lartësi | `P` numri i pikës, `N` veriu, `E` lindja, `Z` lartësia, `D` përshkrimi |
| Kontura të terrenit ekzistues, të sipërfaqes së nivelluar | Vija në lartësinë e tyre | `ELEV` |
| Vijat e thyerjes | Vija me lartësi | `NAME` |
| Kufiri i sipërfaqes | Poligon (kufiri i vizatuar, ndryshe skaji i sipërfaqes) | `NAME` |
| Aks-et | Boshtet qendrore | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stacionet si numra të thjeshtë) |
| Platformat | Poligone në lartësinë e platformës | `NAME`, `ELEV`, `AREA` |
| Vijat e ditës | Vija me lartësi (platformat dhe koridoret) | `NAME` |
| Vijat karakteristike të koridorit | Vija me lartësi: qendra, skajet e asfaltit, bermat | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tubat | Vija nga invert-i i sipërm te ai i poshtëm | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (përqind), `LENGTH`, `NETWORK` |
| Strukturat | Pika te buza | `NAME`, `RIM`, `INVERT` (invert-i më i ulët i tubit atje), `SUMP`, `DIA`, `DIA_UNIT` |
| Çdo shtresë GIS | Ashtu si u importua | Fushat e veta |

Gjatësitë, stacionet dhe lartësitë janë në njësitë e projektit (këmbë topografike US ose metra). Diametrat e tubave dhe strukturave janë në inç për projektet në këmbë dhe në milimetra për projektet në metra; `DIA_UNIT` tregon cilin.

## Formatet

- **Shapefile**: një `.zip` me një shapefile për çdo lloj (`.shp`, `.shx`, `.dbf`), një `.cpg` që thotë se teksti është UTF-8, dhe një `.prj` që emëron sistemin koordinativ. Format me lartësi shkruhen si llojet Z të shapefile. Emrat e fushave më të gjata se 10 karaktere shkurtohen, siç e kërkon formati, dhe rreshti i statusit i liston.
- **GeoPackage**: një skedar `.gpkg` me një tabelë për çdo lloj, sistemi koordinativ i ruajtur me kodin e vet EPSG. Një skedar në vend të shumë, emrat e gjatë të fushave ruhen.
- **KML** ose **KMZ** (KML i zipuar): një skedar me gjerësi dhe gjatësi gjeografike për Google Earth dhe harta web, një dosje për çdo lloj, dhe çdo element një shenjë vendi e emërtuar sipas fushës NAME me çdo fushë si të dhëna të zgjeruara; lartësitë në metra (mënyra e lartësisë absolute). Si GeoJSON, kërkon sistemin koordinativ të projektit.
- **GeoJSON**: një skedar me gjerësi dhe gjatësi gjeografike (standardi GeoJSON nuk lejon asgjë tjetër), me çdo element që mban një veçori `kind` (`pipes`, `structures`, …) që marrësi t'i ndajë. Lartësitë konvertohen në metra, siç kërkon standardi; ato mbeten në datumin vertikal të projektit tuaj (CivilCraft nuk ka model gjeoidi). Një projekt pa sistem koordinativ nuk mund të eksportojë GeoJSON, dhe dialogu thotë pse.

## Rrjet, jo tokë

Departamentet GIS i mbajnë të dhënat e tyre në koordinata **rrjeti** të një sistemi koordinativ. Nëse projekti juaj përdor koordinata tokësore ose lokale (të vendosura te {{ui:Koordinatat}}), çdo koordinatë kthehet në rrjet gjatë daljes: numrat në skedarë ndryshojnë nga ato të planimetrisë me faktorin tuaj të shkallës (dhe me rrotullimin, për një sistem lokal). Fushat e pikave `N` dhe `E` mbajnë edhe vlerat e rrjetit. Dialogu ju kujton këtë.

:::tip
Dërgoni një shënim të shkurtër me skedarët: sistemin koordinativ dhe kodin e tij EPSG, datumin vertikal të lartësive tuaja, njësitë dhe çfarë është çdo skedar.
:::

## Çfarë u kontrollua

- Çdo skedar i shkruar u lexua përsëri nga GDAL, bibliotekën që përdorin shumica e programeve GIS për t'i lexuar këta skedarë: çdo formë, lartësi dhe atribut, numri i elementeve, dhe sistemi koordinativ si kodi i tij EPSG (`.prj` dhe GeoPackage). Lexuesit tanë i lexuan përsëri në të njëjtën mënyrë.
- Skedarët GeoJSON ndjekin RFC 7946: gjatësia gjeografike para gjerësisë gjeografike, pa anëtarin `crs`, unazat e jashtme në drejtim kundërorar dhe vrimat orar; pozicionet u përputhën me PROJ deri në 2 mm.
- Një projekt me koordinata tokësore u eksportua dhe çdo pikë u kontrollua me koordinatat e veta të rrjetit.
- Asgjë këtu nuk është hapur ende në programe të tjera GIS. Kontrolloni dorëzimin e parë me departamentin përpara se të mbështeteni tek ai.
