---
title: Importo të dhënat GIS
summary: Sill shapefile, GeoJSON dhe GeoPackage në një projekt si shtresa GIS, vendosi përmes sistemit të duhur koordinativ, shiko atributet e tyre dhe përdori ato për sipërfaqen.
keywords: gis, etiketa, etiketo elementët, atribute në planimetri, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importo, shtresa, atribute, sistem koordinativ, epsg, gjerësi gjeografike, gjatësi gjeografike, kontura, parcela, vijat e thyerjes, kufi
from: f6b235cc
---

Departamentet GIS të qyteteve dhe qarqeve japin kontekstin e vendit si skedarë GIS: parcela, servitute, kontura, shërbime, pika kontrolli topografik. CivilCraft hap tre lloje të tyre si **shtresa GIS** që qëndrojnë nën projektimin tuaj në planimetri.

| Skedari | Çfarë të hapet |
|---|---|
| Shapefile | Skedarin `.shp` së bashku me `.shx`, `.dbf`, `.prj` dhe `.cpg` (përzgjidhi të gjitha), ose `.zip`-in ku erdhën. Një zip që mban disa shapefile jep disa shtresa. |
| GeoJSON | Skedarin `.geojson` (një skedar `.json` rreshtat e parë të të cilit thonë `FeatureCollection` ose `Feature` gjithashtu funksionon). |
| GeoPackage | Skedarin `.gpkg`. Çdo tabelë elementesh në të listohet. |
| KML ose KMZ | Skedarin `.kml` (nga Google Earth ose një hartë web), ose `.kmz`-in e zipuar. Çdo dosje bëhet një shtresë (ndahet në pika, vija dhe poligone kur mban disa lloje); emri, përshkrimi dhe të dhënat e zgjeruara të një shenje vendi bëhen atribute të saj. Lartësitë janë në metra dhe gjerësi e gjatësi gjeografike, si te GeoJSON. |

Pikat, shumëpikat, vijat, poligonet me vrima dhe format me shumë pjesë lexohen, me lartësitë e tyre (z) kur skedari i ka. Vlerat e matjes (M) lihen jashtë. Rrjetat e lartësive dhe LiDAR hapen në të njëjtën mënyrë: shih [Rrjetat e lartësive dhe LiDAR](topic:elevation-grids-and-lidar).

## Hap skedarët

1. Kliko {{ui:Importo}} te grupi **GIS** (ose {{ui:Hap}}), zgjidh skedarët, ose hidhi ata mbi planimetri. Skedarët lexohen në këtë kompjuter; asgjë nuk ngarkohet.
2. Dialogu **Importo të dhënat GIS** liston çdo shtresë të gjetur: llojin e saj, sa elemente ka (dhe sa nuk kanë gjeometri), sa fusha atributesh ka, dhe sistemin koordinativ që emëron skedari. Hiq shenjën e shtresave që nuk i do.
3. Lexo pjesën **Sistemi koordinativ** (më poshtë) dhe rreshtin **Çfarë do të ndodhë**, pastaj kliko {{ui:Importo}}.
4. Shtresat shfaqen në planimetri dhe nën **Shtresat GIS** në panelin e majtë. Importi është një hap i vetëm: {{key:Mod+Z}} e kthen mbrapsht.

Një skedar i madh shfaq një rresht progresi mbi planimetri me një buton {{ui:Anulo}}.

## Sistemi koordinativ

Skedarët GIS thonë ku janë përmes një sistemi koordinativ (`.prj` i një shapefile, tabela e referencës hapësinore e një GeoPackage; GeoJSON është gjithmonë gjerësi dhe gjatësi gjeografike). CivilCraft konverton çdo shtresë nga sistemi i vet në atë të projektit. Nuk supozon kurrë:

- **Projekti ka një sistem koordinativ** (vendosur te {{ui:Koordinatat}}): çdo shtresë me sistem të vet konvertohet në të, duke përfshirë një rregullim tokësor ose lokal. Një skedar pa `.prj` merr dy zgjedhje: **Njëjtë me projektin** (numrat e tij ngarkohen ashtu si janë) ose **Zgjidh sistemin e skedarit**.
- **Projekti nuk ka asnjë, dhe skedari është në një sistem të projektuar në njësitë e projektit** (një zonë state plane në këmbë topografike US për një projekt në këmbë, për shembull): dialogu ofron **Përdore atë sistem si sistem koordinativ të projektit**. Vendoset në të njëjtin hap zhbërjeje me importin. Asgjë në projekt nuk lëviz; sistemi thotë vetëm çfarë do të thotë numri. Mund të zgjidhni një sistem tjetër për projektin në vend të kësaj, dhe shtresat konvertohen në të.
- **Projekti nuk ka asnjë, dhe skedari është në gjerësi dhe gjatësi gjeografike** (çdo GeoJSON) **ose në njësi të tjera**: {{ui:Importo}} mbetet i çaktivizuar deri sa të zgjidhni sistemin koordinativ të projektit. Zgjedhësi nis afër të dhënave.
- **As projekti as skedarët nuk emërojnë asnjë sistem**: numrat ngarkohen ashtu si janë, dhe dialogu e thotë këtë.

Lartësitë konvertohen gjithashtu: lartësitë e GeoJSON janë në metra (kështu thotë standardi GeoJSON); lartësitë e skedarëve të tjerë merren në njësinë e sistemit të vet.

:::warning
Pozicionet në një skedar GeoJSON jashtë gjatësisë gjeografike ±180° ose gjerësisë gjeografike ±90° nuk janë gjerësi dhe gjatësi gjeografike. Ato elemente lihen jashtë dhe dialogu thotë sa janë. Një skedar i tillë është zakonisht një skedar i projektuar i ruajtur pa sistemin e vet; kërkojeni përsëri, ose shapefile-in me `.prj`-in e tij.
:::

NAD83 trajtohet si e njëjtë me WGS 84 (sistemi që përdor GeoJSON); të dyja ndryshojnë me disa metra në Amerikën e Veriut, kështu që të dhënat GeoJSON mund të jenë jashtë asaj sasie. Kur zhvendosja më e mirë kërkon një skedar rrjeti (NADCON për NAD27, për shembull), CivilCraft përdor një zhvendosje më të trashë të publikuar, dhe dialogu i sistemit koordinativ tregon sa e trashë është (për NAD27, rreth 20 m), derisa të shtoni rrjetin: shih [Skedarët e zhvendosjes së rrjetit](topic:coordinate-systems).

## Shtresat GIS

Çdo rresht nën **Shtresat GIS** ka:

- një kutizë për të shfaqur ose fshehur shtresën (shtresat e fshehura nuk zgjidhen as);
- ngjyrën e saj, të zgjedhur nga lista;
- një menu (tre pikat) me {{ui:Zmadho te}}, {{ui:Përdore për sipërfaqen…}}, {{ui:Riemëro…}} dhe {{ui:Hiq}}.

Shfaqja, fshehja, ndryshimi i ngjyrës, riemërimi dhe heqja janë hapa zhbërjeje. Shtresat GIS ruhen në skedarin e projektit dhe kthehen kur e hapni. Ato dalin edhe me printimin PDF të planimetrisë dhe eksportet e saj DXF dhe DWG, secila në një shtresë të emërtuar `GIS-` dhe numrin e saj.

## Etiketo elementët nga një atribut

Në menunë {{ui:Më shumë}} të shtresës (tre pikat te **Shtresat GIS**), zgjidh një fushë nën **Etiketo me**: çdo element shfaq vlerën e vet në planimetri, në ngjyrën e shtresës. Pikat etiketohen pranë pikës, vijat përgjatë mesit të pjesës së tyre më të gjatë (të rrotulluara për t'u lexuar nga e majta në të djathtë), poligonet në qendrën e tyre. Numrat shfaqen deri në tre decimale. Etiketat janë 1.8 mm të larta në letër në çdo shkallë, dhe hyjnë në printimin PDF, DXF dhe DWG. Zgjidh **Pa etiketa** për t'i hequr; çdo ndryshim është një hap ({{key:Mod+Z}} e zhbën). Një shtresë etiketon deri në 5,000 elemente.

## Shiko një element

Me {{ui:Përzgjidh}} aktiv, kliko një element. **Vetitë** tregon shtresën e tij, cili element është, formën e tij (pjesët, vrimat, kulmet), lartësitë e tij, skedarin nga erdhi dhe sistemin koordinativ të atij skedari, pastaj çdo atribut në një tabelë. Atributet janë vetëm për lexim: CivilCraft shfaq të dhënat GIS ashtu si erdhën, nuk i redakton ato.

Pikat fitojnë mbi vijat kur të dyja janë nën kursor; brenda një poligoni, zgjidhet poligoni më i vogël.

## Përdore për sipërfaqen

Hap menunë e një shtrese dhe zgjidh {{ui:Përdore për sipërfaqen…}} (ose butonin te **Vetitë**). Ajo që ofrohet varet nga shtresa:

| Shtresa | Mund të bëhet |
|---|---|
| Vija me lartësi (vija 3D) | Vija të thyerjes në lartësitë e veta |
| Vija pa lartësi, por me një fushë numrore (kontura) | Vija të thyerjes në lartësinë te fusha që zgjedh |
| Poligone | Kufiri i sipërfaqes (poligoni i përzgjedhur, ndryshe më i madhi), ose vija të thyerjes përgjatë skajeve të tyre |
| Pika me lartësi, ose me një fushë lartësie | Pika të matjes, të përshkruara me emrin e shtresës që të formojnë një grup pikash |

Çdo përdorim është një hap zhbërjeje që kopjon gjeometrinë në projekt; vetë shtresa mbetet ashtu si është. Lartësitë merren në njësitë e projektit.

## Skedarë pikash me gjerësi dhe gjatësi gjeografike

Një skedar pikash, kreu i të cilit emëron kolonat **latitude** dhe **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`), lexohet si gradë, jo si veri dhe lindje. Dialogu i importit e thotë këtë. Te {{ui:Importo}}, pikat konvertohen në sistemin koordinativ të projektit; një projekt pa të kërkon të zgjidhni sistemin e tij më parë. Gradët nuk ngarkohen kurrë si këmbë. Rreshtat jashtë ±90° gjerësi gjeografike ose ±180° gjatësi gjeografike refuzohen me arsyen. Kolona e lartësisë merret ashtu si është, në njësitë e projektit.

## Skedarë LandXML që emërojnë një sistem koordinativ

Kur një skedar LandXML që hapni ka një element `CoordinateSystem` (një kod EPSG, një përshkrim WKT ose një emër sistemi), CivilCraft e ofron si sistem koordinativ të projektit. Asgjë nuk lëviz nëse e pranoni; sistemi thotë vetëm çfarë do të thonë numrat.

## Çfarë u kontrollua

- Çdo lexues u krahasua me GDAL, bibliotekën që përdorin shumica e programeve GIS për t'i lexuar këta skedarë, mbi skedarë që vetë GDAL i shkroi: shapefile të çdo lloji me dhe pa lartësi, vija me shumë pjesë, poligone me vrima, gjeometri boshe, atribute tekstuale, numrash, datash dhe po/jo, tekst UTF-8 dhe Windows-1252 me dhe pa `.cpg`, një zip me disa shapefile, GeoJSON me çdo lloj gjeometrie, dhe një GeoPackage me katër tabela. Çdo gjeometri, lartësi dhe atribut u përputh.
- Pozicionet e konvertuara nga gjerësia dhe gjatësia gjeografike, dhe nga UTM, u përputhën me PROJ (biblioteka e projeksioneve pas GDAL) deri në 3 mm.
- Skedarët e dëmtuar (të prerë shkurt, me madhësi të gabuara, zip të keq, GeoPackage të dëmtuar) japin një mesazh të thjeshtë; asgjë nuk ngec.
- Asgjë këtu nuk është hapur ende në programe të tjera GIS, dhe skedarët e geodatabazave, KML dhe KMZ nuk lexohen ende (shih [Nuk është ndërtuar ende](topic:not-built-yet)).
