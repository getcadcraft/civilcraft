---
title: Zobrazenie mapových vrstiev pod pôdorysom
summary: Georeferencovaný obrázok, mapové dlaždice, server WMS alebo WMTS či mapová služba pod pôdorysom ako kontext lokality, s nastavením internetu, nepriehľadnosťou, poradím a uvedením autora.
keywords: mapové vrstvy, podkladová mapa, podklad, letecký snímok, ortofotomapa, snímky, satelit, raster, svetový súbor, pgw, jgw, tfw, wld, geotiff, georeferencovaný obrázok, xyz, dlaždice, interaktívna mapa, wms, wmts, getcapabilities, mapová služba, rest, mapserver, imageserver, usgs, national map, uvedenie autora, nepriehľadnosť
from: 32d7718e
---

Mapové vrstvy sú obrázky kreslené pod vaším návrhom: letecká fotografia so svojím svetovým súborom alebo mapy zo serverov na internete. Sú to kontext lokality len na obrazovke: **nie sú** v exportoch PDF, DXF ani DWG ani v 3D zobrazení.

Vyberte {{ui:Map}} v skupine {{ui:GIS}}. Dialógové okno **Mapové vrstvy** vypíše vrstvy projektu a pridáva nové. Mapové vrstvy potrebujú súradnicový systém projektu ([Nastavenie súradnicového systému projektu](topic:coordinate-systems)), okrem obrázka, ktorého svetový súbor používa súradnice samotného projektu.

## Nastavenie internetu

CivilCraft sa nikdy nepýta mapový server na nič, kým to nepovolíte: {{ui:Settings}}, {{ui:CivilCraft}}, **Mapové vrstvy z internetu**: **Vypnuté** (na začiatku) alebo **Zapnuté**.

:::note
Keď je zapnuté, CivilCraft pýta mapové servery, ktoré pridáte, o obrázky oblasti na obrazovke. Váš výkres zostáva na tomto počítači; server vidí oblasť a vašu internetovú adresu.
:::

Keď je vypnuté, internetové vrstvy sú v dialógovom okne uvedené, ale sivé, s dôvodom, a nič sa nekreslí ani nepožaduje. Otvorenie projektu, ktorý pomenúva mapové servery, ich tiež nekontaktuje. Obrázok zo súboru funguje v oboch prípadoch. Tlačidlo {{ui:Open Settings}} v dialógovom okne vás tam privedie.

## Georeferencovaný obrázok (funguje offline)

1. V **Pridať vrstvu** ponechajte **Georeferencovaný obrázok** a vyberte súbory: obrázok (PNG alebo JPEG) **spolu s** jeho svetovým súborom (`.pgw` pre PNG, `.jgw` pre JPEG, alebo `.wld`) a, ak existuje, jeho `.prj`. Môžete ich aj pretiahnuť na pôdorys spolu.
2. Bez `.prj` sa CivilCraft opýta, ktorý systém svetový súbor používa: {{ui:The project’s system}} (najčastejší), {{ui:Pick a system…}}, alebo v projekte bez systému **Súradnice projektu**.
3. Obrázok sa zobrazí pod pôdorysom a {{ui:Fit}} ho zahrnie.

GeoTIFF RGB (letecká fotografia uložená ako GeoTIFF) nesie vlastné umiestnenie a systém: otvorte ho samostatne. Obrázok sa uchová **vo vnútri súboru projektu** (až do 25 MB); väčší sa odmietne s uvedením veľkosti, takže uložte menšiu kópiu (menej pixelov alebo JPEG).

## Dlaždice, WMS, WMTS a mapové služby

Najprv zapnite **Mapové vrstvy z internetu**. Potom v **Pridať vrstvu**:

| Z | Čo vložiť | Čo CivilCraft robí |
|---|---|---|
| Adresa dlaždíc | Šablóna s `{z}`, `{x}` a `{y}` (alebo `{-y}`) a `{s}` pre písmeno servera, napríklad `https://tile.example.org/{z}/{x}/{y}.png`. Dajte jej názov a jej uvedenie autora. | Dlaždice vo web Mercator pre oblasť a priblíženie na obrazovke. |
| Server WMS | Adresa servera alebo jeho odkaz GetCapabilities. Vyberte {{ui:Get the layers}}, potom vrstvu. | Jeden obrázok oblasti na obrazovke, vyžiadaný v kóde EPSG projektu, keď ho server ponúka, inak vo web Mercator alebo WGS 84. |
| Server WMTS | Adresa servera alebo jeho `WMTSCapabilities.xml`. Vyberte {{ui:Get the layers}}, potom vrstvu a sadu matíc dlaždíc. | Dlaždice zo sady v systéme projektu, keď nejaký je, inak vo web Mercator. |
| Mapová služba ArcGIS (REST) | URL končiaca na `/MapServer` alebo `/ImageServer`. Vyberte {{ui:Read the service}}. | Služby vo web Mercator s uloženými dlaždicami sa kreslia z ich dlaždíc; ostatné sa pýtajú na jeden obrázok oblasti na obrazovke. |

Žiadne servery nie sú predvoľbou. Verejné príklady, všetky z USGS National Map (verejná doména):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Mapová služba: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (aj `USGSImageryOnly` pre letecké fotografie)

Mnohé mestské a okresné oddelenia GIS zverejňujú vlastné WMS alebo mapové služby; ich stránky GIS uvádzajú adresu. Server, ktorý si vyžaduje prihlásenie alebo kľúč, nefunguje: CivilCraft neposiela používateľské mená, heslá ani kľúče.

## Ako sa vrstvy kreslia

- Obrázky v inom systéme, než je systém projektu, sa prevedú do neho: obrázok sa rozreže na kúsky, každý umiestnený tak, aby bol do štvrtiny pixela obrazovky od miesta, kam ho presne prevedie prevod.
- Dlaždice sa vyberajú pre oblasť na obrazovke a priblíženie: najviac 64 na pohľad, po 6 naraz. Pri posune alebo priblížení sa požiadavky na starý pohľad zrušia. Asi 200 dlaždíc sa drží v pamäti (nič sa neukladá na disk).
- Obrázok WMS alebo mapovej služby sa vyžiada, keď sa pohľad prestane hýbať; kým príde, posledný zostáva na mieste.
- Uvedenie autora každej vrstvy sa na obrazovke zobrazí malé v pravom dolnom rohu pôdorysu.

## Zmena, poradie a odstránenie vrstiev

V dialógovom okne má každá vrstva zaškrtávacie políčko na zobrazenie alebo skrytie, posuvník **Nepriehľadnosť**, šípky na kreslenie skôr (nižšie) alebo neskôr (navrch), tlačidlo priblíženia (obrázky) a tlačidlo na odstránenie. Prvá vrstva v zozname sa kreslí dole. Každá zmena je jeden krok späť.

## Keď vrstva nič nezobrazuje

Dôvod sa zobrazí raz v stavovom riadku a zostáva pod menom vrstvy v dialógovom okne:

| Hlásenie | Čo robiť |
|---|---|
| Vypnuté: mapové vrstvy z internetu sú v Nastaveniach vypnuté. | Zapnite **Mapové vrstvy z internetu**. |
| Vyžaduje súradnicový systém projektu | Nastavte ho v {{ui:Coordinates}}. |
| Server nepovolil tejto stránke použiť jeho obrázky (CORS), alebo sa nepodarilo pripojiť. | Server nedovolí webovým stránkam používať jeho obrázky, alebo je mimo prevádzky. Po štyroch odmietnutiach CivilCraft prestane pýtať; skryte a zobrazte vrstvu, aby ste to skúsili znova. |
| Server odpovedal 404 … / Server poslal text/xml, nie obrázok: … | URL, vrstva alebo štýl sú zlé, alebo správa servera hovorí, čo chce. |
| Táto vrstva nie je ponúkaná v systéme projektu, web Mercator ani WGS 84 | Server nemôže kresliť tam, kde ju CivilCraft môže umiestniť. |

## Čo bolo overené

- Čísla dlaždíc boli overené podľa štandardného web Mercator dlaždicovania; odpovede WMS 1.1.1 a 1.3.0, WMTS a mapovej služby boli čítané z ručne písaných súborov a zo skutočných odpovedí uložených z USGS National Map a serverov terrestris OpenStreetMap; požiadavky WMS 1.3.0 dávajú pri EPSG:4326 na prvom mieste zemepisnú šírku, ako to štandard hovorí.
- Prevod bol porovnaný s presným prevodom po pixeloch podľa čísel PROJ: do 0.13 px pre dlaždice, obrázky WMS a obrázok veľkosti okresu, v mierke lokality aj oddialene.
- Obrázok so svetovým súborom a RGB GeoTIFF zapísaný cez GDAL (cez rasterio) boli nakreslené tam, kde ich umiestnenie hovorí, overené pixel po pixeli v prehliadači.
- V prehliadači proti náhradnému serveru na testovacom počítači: dlaždice pristáli v dlaždici, do ktorej ich PROJ umiestňuje, obrázok WMS pristál do 2 px, najviac 6 požiadaviek beží naraz a pri vypnutom nastavení neodíde zo stránky žiadna požiadavka. Mapová služba USGS National Map uvedená vyššie bola tiež raz načítaná a nakreslená naživo v prehliadači (jej dlaždice prišli a boli nakreslené, s jej autorským textom); ostatné verejné servery boli čítané iba z uložených odpovedí.
