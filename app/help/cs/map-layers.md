---
title: Zobrazení mapových vrstev pod půdorysem
summary: Vložte georeferencovaný obrázek, mapové dlaždice, server WMS nebo WMTS, nebo mapovou službu pod půdorys jako kontext lokality, s nastavením internetu, průhledností, pořadím a uvedením autora.
keywords: mapové vrstvy, podkladová mapa, pozadí, letecký snímek, ortofoto, snímky, satelit, rastr, world file, pgw, jgw, tfw, wld, geotiff, georeferencovaný obrázek, xyz, dlaždice, mapa dlaždic, wms, wmts, getcapabilities, mapová služba, rest, mapserver, imageserver, usgs, national map, uvedení autora, průhlednost
from: 32d7718e
---

Mapové vrstvy jsou obrázky, které se kreslí pod vaším návrhem: letecký snímek se svým world file, nebo mapy ze serverů na internetu. Jsou to jen kontext lokality na obrazovce; **nejsou** v PDF výstupech, exportech DXF nebo DWG ani v 3D zobrazení.

Zvolte {{ui:Mapa}} ve skupině {{ui:GIS}}. Dialog **Mapové vrstvy** vypíše vrstvy projektu a přidává nové. Mapové vrstvy potřebují souřadnicový systém projektu ([Nastavení souřadnicového systému projektu](topic:coordinate-systems)), kromě obrázku, jehož world file používá vlastní souřadnice projektu.

## Nastavení internetu

CivilCraft nikdy nepožádá mapový server o nic, dokud to nepovolíte: {{ui:Nastavení}}, {{ui:CivilCraft}}, **Mapové vrstvy z internetu**: **Vypnuto** (výchozí) nebo **Zapnuto**.

:::note
Je-li zapnuto, CivilCraft se mapových serverů, které přidáte, zeptá na obrázky oblasti na obrazovce. Váš výkres zůstává na tomto počítači; server vidí oblast a vaši internetovou adresu.
:::

Je-li vypnuto, internetové vrstvy jsou v dialogu vypsány šedě, s důvodem, a nic se nekreslí ani nevyžaduje. Otevření projektu, který jmenuje mapové servery, je také nekontaktuje. Obrázek ze souboru funguje v obou případech. Tlačítko {{ui:Otevřít Nastavení}} v dialogu vás tam přenese.

## Georeferencovaný obrázek (funguje offline)

1. V **Přidat vrstvu** ponechte **Georeferencovaný obrázek** a zvolte soubory: obrázek (PNG nebo JPEG) **spolu s** jeho world file (`.pgw` pro PNG, `.jgw` pro JPEG, nebo `.wld`) a, je-li k dispozici, jeho `.prj`. Můžete je také přetáhnout na půdorys najednou.
2. Bez `.prj` se CivilCraft zeptá, jaký systém world file používá: {{ui:Systém projektu}} (nejčastější), {{ui:Vyberte systém…}}, nebo v projektu bez systému **Souřadnice projektu**.
3. Obrázek se objeví pod půdorysem a {{ui:Přizpůsobit}} ho zahrne.

RGB GeoTIFF (letecký snímek uložený jako GeoTIFF) nese vlastní umístění a systém: otevřete jej samostatně. Obrázek se uchovává **uvnitř souboru projektu** (až 25 MB); větší se odmítne s uvedením velikosti, takže uložte menší kopii (méně pixelů, nebo JPEG).

## Dlaždice, WMS, WMTS a mapové služby

Nejprve zapněte **Mapové vrstvy z internetu**. Pak v **Přidat vrstvu**:

| Zdroj | Co vložit | Co CivilCraft udělá |
|---|---|---|
| URL dlaždic | Šablona s `{z}`, `{x}` a `{y}` (nebo `{-y}`) a `{s}` pro písmeno serveru, například `https://tile.example.org/{z}/{x}/{y}.png`. Dejte jí název a jeho uvedení autora. | Dlaždice ve web Mercatoru pro oblast a přiblížení na obrazovce. |
| Server WMS | Adresa serveru, nebo jeho odkaz GetCapabilities. Zvolte {{ui:Načíst vrstvy}}, pak vrstvu. | Jeden obrázek oblasti na obrazovce, vyžádaný v kódu EPSG projektu, pokud jej server nabízí, jinak ve web Mercatoru nebo WGS 84. |
| Server WMTS | Adresa serveru, nebo jeho `WMTSCapabilities.xml`. Zvolte {{ui:Načíst vrstvy}}, pak vrstvu a sadu matic dlaždic. | Dlaždice ze sady v systému projektu, je-li k dispozici, jinak ve web Mercatoru. |
| Mapová služba ArcGIS (REST) | URL končící na `/MapServer` nebo `/ImageServer`. Zvolte {{ui:Přečíst službu}}. | Služby ukládané do mezipaměti ve web Mercatoru se kreslí z dlaždic; ostatní se vyžádají jako jeden obrázek oblasti na obrazovce. |

Žádné servery nejsou předvoleny. Veřejné příklady, všechny z USGS National Map (volně použitelné):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Mapová služba: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (také `USGSImageryOnly` pro letecké snímky)

Mnoho městských a krajských GIS oddělení zveřejňuje vlastní WMS nebo mapové služby; jejich stránky GIS uvádějí adresu. Server, který žádá přihlášení nebo klíč, nefunguje: CivilCraft neodesílá uživatelská jména, hesla ani klíče.

## Jak se vrstvy kreslí

- Obrázky v jiném systému, než je systém projektu, se převádějí do něj: obrázek se rozdělí na kusy, každý umístěn tak, aby byl do čtvrt pixelu obrazovky od místa, kam ho přesný převod klade.
- Dlaždice se vybírají pro oblast na obrazovce a přiblížení: nikdy víc než 64 pro pohled, 6 najednou. Když posunete nebo přiblížíte, požadavky na starý pohled se zruší. V paměti se drží asi 200 dlaždic (nic se neukládá na disk).
- Obrázek WMS nebo mapové služby se vyžádá, jakmile se pohled přestane pohybovat; dokud nedorazí, zůstává na místě poslední.
- Uvedení autora každé vrstvy se na obrazovce zobrazí malé vpravo dole na půdorysu.

## Změna, pořadí a odebrání vrstev

V dialogu má každá vrstva zaškrtávací políčko pro zobrazení nebo skrytí, posuvník **Průhlednost**, šipky pro kreslení dříve (níž) nebo později (výš), tlačítko přiblížení (u obrázků) a tlačítko odebrání. První vrstva v seznamu se kreslí nejníže. Každá změna je jeden krok zpět.

## Když vrstva nic nezobrazí

Důvod se jednou objeví ve stavovém řádku a zůstává pod názvem vrstvy v dialogu:

| Zpráva | Co dělat |
|---|---|
| Vypnuto: mapové vrstvy z internetu jsou v Nastavení vypnuty. | Zapněte **Mapové vrstvy z internetu**. |
| Vyžaduje souřadnicový systém projektu | Nastavte jej v {{ui:Souřadnice}}. |
| Server tuto stránku nepustil k jeho obrázkům (CORS), nebo nebyl dostupný. | Server webovým stránkám nedovoluje používat jeho obrázky, nebo je mimo provoz. Po čtyřech odmítnutích CivilCraft přestane žádat; vrstvu skryjte a znovu zobrazte, aby to zkusil znovu. |
| Server odpověděl 404 … / Server poslal text/xml, ne obrázek: … | URL, vrstva nebo styl jsou špatně, nebo zpráva serveru říká, co chce. |
| Tato vrstva není nabízena v systému projektu, web Mercatoru ani WGS 84 | Server nemůže kreslit tam, kam ji CivilCraft umí umístit. |

## Co bylo ověřeno

- Čísla dlaždic se ověřila proti standardnímu dlaždicování web Mercatoru; odpovědi WMS 1.1.1 a 1.3.0, WMTS a mapové služby se četly z ručně psaných souborů a ze skutečných uložených odpovědí z USGS National Map a serverů terrestris OpenStreetMap; požadavky WMS 1.3.0 uvádějí zeměpisnou šířku jako první u EPSG:4326, jak to standard říká.
- Transformace se porovnala s přesným převodem po pixelech podle čísel PROJ: do 0,13 px u dlaždic, obrázků WMS a obrázku velikosti kraje, v měřítku pozemku i při oddálení.
- Obrázek s world file a RGB GeoTIFF vytvořený GDAL (přes rasterio) se vykreslily tam, kam říká jejich umístění, ověřeno pixel po pixelu v prohlížeči.
- V prohlížeči proti náhradnímu serveru na testovacím počítači: dlaždice přistávají v dlaždici, kterou PROJ přiřadí každému bodu; obrázek WMS přistává do 2 px; nejvýše 6 požadavků běží současně; a při vypnutém nastavení neodchází z stránky žádný požadavek. Mapová služba USGS National Map výše byla také jednou přečtena a vykreslena živě v prohlížeči (dlaždice dorazily a byly vykresleny, včetně jejího autorského textu); ostatní veřejné servery byly čteny jen z uložených odpovědí.
