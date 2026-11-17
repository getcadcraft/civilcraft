---
title: Visa kartlager under planen
summary: Lägg en georefererad bild, kartrutor, en WMS- eller WMTS-server eller en kartstjänst under planen som tomtkontext, med internetinställningen, opacitet, ordning och källangivelse.
keywords: kartlager, bakgrundskarta, basemap, bakgrund, flygfoto, ortofoto, bildmaterial, satellit, raster, världsfil, pgw, jgw, tfw, wld, geotiff, georefererad bild, xyz, rutor, rutkarta, wms, wmts, getcapabilities, kartstjänst, rest, mapserver, imageserver, usgs, national map, källangivelse, opacitet
from: 32d7718e
---

Kartlager är bilder som ritas under din design: ett flygfoto med sin världsfil, eller kartor från servrar på internet. De är tomtkontext endast på skärmen: de finns **inte** i PDF-utskrifter, DXF- eller DWG-exporter eller 3D-vyn.

Välj {{ui:Karta}} i gruppen {{ui:GIS}}. Dialogrutan **Kartlager** listar projektets lager och lägger till nya. Kartlager behöver projektets koordinatsystem ([Ange projektets koordinatsystem](topic:coordinate-systems)), utom en bild vars världsfil använder projektets egna koordinater.

## Internetinställningen

CivilCraft ber aldrig en kartserver om något förrän du tillåter det: {{ui:Inställningar}}, {{ui:CivilCraft}}, **Kartlager från internet**: **Av** (startläget) eller **På**.

:::note
När den är på ber CivilCraft kartservrarna du lägger till om bilder av området på skärmen. Din ritning stannar på den här datorn; servern ser området och din internetadress.
:::

Medan den är av visas internetlager i dialogrutan men nedtonade, med orsaken, och ingenting ritas eller begärs. Att öppna ett projekt som anger kartservrar kontaktar dem inte heller. En bild från en fil fungerar i båda fallen. Dialogrutans knapp {{ui:Öppna Inställningar}} tar dig dit.

## En georefererad bild (fungerar offline)

1. Under **Lägg till ett lager** behåller du **Georefererad bild** och väljer filerna: bilden (PNG eller JPEG) **tillsammans med** sin världsfil (`.pgw` för PNG, `.jgw` för JPEG, eller `.wld`) och, om det finns en, dess `.prj`. Du kan också släppa dem på planen tillsammans.
2. Utan en `.prj` frågar CivilCraft vilket system världsfilen använder: {{ui:Projektets system}} (vanligast), {{ui:Välj ett system…}}, eller, i ett projekt utan system, **Projektkoordinater**.
3. Bilden visas under planen och {{ui:Anpassa}} tar med den.

En RGB-GeoTIFF (ett flygfoto sparat som GeoTIFF) bär med sig sin egen placering och sitt eget system: öppna den på egen hand. Bilden sparas **i projektfilen** (upp till 25 MB); en större nekas med sin storlek, så spara en mindre kopia (färre pixlar, eller JPEG).

## Rutor, WMS, WMTS och kartstjänster

Sätt först **Kartlager från internet** på. Sedan, under **Lägg till ett lager**:

| Från | Vad du klistrar in | Vad CivilCraft gör |
|---|---|---|
| Rut-URL | En mall med `{z}`, `{x}` och `{y}` (eller `{-y}`), och `{s}` för en serverbokstav, till exempel `https://tile.example.org/{z}/{x}/{y}.png`. Ge den ett namn och dess källangivelse. | Rutor i web Mercator för området och zoomen på skärmen. |
| WMS-server | Serverns adress, eller dess GetCapabilities-länk. Välj {{ui:Hämta lagren}}, och sedan lagret. | En bild av området på skärmen, begärd i projektets EPSG-kod när servern erbjuder den, annars i web Mercator eller WGS 84. |
| WMTS-server | Serverns adress, eller dess `WMTSCapabilities.xml`. Välj {{ui:Hämta lagren}}, och sedan lagret och rutmatrisuppsättningen. | Rutor från uppsättningen i projektets system när det finns ett, annars web Mercator. |
| ArcGIS-kartstjänst (REST) | En URL som slutar på `/MapServer` eller `/ImageServer`. Välj {{ui:Läs tjänsten}}. | Cachade web Mercator-tjänster ritas från sina rutor; andra begärs som en bild av området på skärmen. |

Inga servrar är förinställda. Offentliga exempel, alla från USGS National Map (allmän egendom):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kartstjänst: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (även `USGSImageryOnly` för flygfoton)

Många kommunala och regionala GIS-avdelningar publicerar egna WMS-tjänster eller kartstjänster; deras GIS-sidor anger adressen. En server som begär inloggning eller en nyckel fungerar inte: CivilCraft skickar inga användarnamn, lösenord eller nycklar.

## Så ritas lagren

- Bilder i ett annat system än projektets förvrängs in i det: bilden delas i bitar, var och en placerad så att den ligger inom en fjärdedels skärmpixel från där en exakt omräkning placerar den.
- Rutor väljs för området på skärmen och zoomen: aldrig fler än 64 för en vy, 6 åt gången. När du panorerar eller zoomar avbryts begäranden för den gamla vyn. Cirka 200 rutor hålls i minnet (ingenting sparas på disken).
- En WMS- eller kartstjänstbild begärs när vyn har slutat röra sig; tills den kommer ligger den senaste kvar på plats.
- Källangivelsen för varje lager på skärmen visas i liten storlek nere till höger i planen.

## Ändra, ordna och ta bort lager

I dialogrutan har varje lager en kryssruta för att visa eller dölja det, ett **Opacitet**-reglage, pilar för att rita det tidigare (lägre) eller senare (överst), en zoomknapp (bilder) och en ta bort-knapp. Det första lagret i listan ritas underst. Varje ändring är ett ångra-steg.

## När ett lager inte visar något

Orsaken visas en gång i statusraden och finns kvar under lagrets namn i dialogrutan:

| Meddelande | Vad du gör |
|---|---|
| Av: kartlager från internet är avstängda i Inställningar. | Sätt på **Kartlager från internet**. |
| Kräver projektets koordinatsystem | Ange det under {{ui:Koordinater}}. |
| Servern tillät inte den här sidan att använda dess bilder (CORS), eller så kunde den inte nås. | Servern låter inte webbsidor använda dess bilder, eller så är den nere. Efter fyra avvisningar slutar CivilCraft fråga; dölj och visa lagret för att försöka igen. |
| Servern svarade 404 … / Servern skickade text/xml, inte en bild: … | URL:en, lagret eller stilen är fel, eller serverns meddelande anger vad den vill ha. |
| Det här lagret erbjuds inte i projektets system, web Mercator eller WGS 84 | Servern kan inte rita där CivilCraft kan placera det. |

## Vad som har kontrollerats

- Rutnummer kontrollerades mot standardrutnätet för web Mercator; WMS 1.1.1 och 1.3.0, WMTS- och kartstjänstsvar lästes från handskrivna filer och från riktiga svar sparade från USGS National Map och terrestris OpenStreetMap-servrar; WMS 1.3.0-begäranden sätter latitud först för EPSG:4326, som standarden anger.
- Förvrängningen jämfördes med en exakt omräkning per pixel med PROJ:s tal: inom 0,13 px för rutor, WMS-bilder och en bild i länsstorlek, i tomtskala och utzoomad.
- En bild med sin världsfil och en RGB-GeoTIFF skriven av GDAL (via rasterio) ritades där deras placering anger, kontrollerad pixel för pixel i webbläsaren.
- I webbläsaren, mot en ersättningsserver på testdatorn: rutor hamnar i den ruta PROJ placerar varje punkt i, en WMS-bild hamnar inom 2 px, högst 6 begäranden körs åt gången, och med inställningen av lämnar ingen begäran sidan. USGS National Map-kartstjänsten ovan lästes och ritades också live i webbläsaren en gång (dess rutor kom fram och ritades, med sin upphovsrättstext); de andra offentliga servrarna lästes endast från sparade svar.
