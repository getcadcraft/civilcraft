---
title: Adresa na lokalitu
summary: Převeďte adresu na to, co lokalita potřebuje vědět: parcelu, okolní budovy, zónování, půdu a záplavovou zónu z otevřených dat, která si vyžádáte tlačítkem nebo přinesete jako soubory, a předejte je BimCraftu jako návrhy.
keywords: adresa, geokódování, lokalita, parcela, budovy, zónování, půda, záplavy, otevřená data, openstreetmap, fema, ssurgo, usgs, kontext, ccsite, bimcraft
from: 125d848a
---

## Co to dělá

Povrch › Další › Adresa na lokalitu odpoví pro jeden bod: ve které parcele leží, jaké budovy jsou kolem něj, jaké je zónování, půda a záplavová zóna. Data jsou otevřená: soubory, které přidáte (GeoJSON, shapefile, KML, GeoPackage), a tlačítka, která po zapnutí doplňků vždy dotážou jednu otevřenou službu.

## Jak to použít

1. Napište adresu a stiskněte tlačítko hledání adresy (doplněk „Hledání adresy“), nebo zadejte zeměpisnou šířku a délku.
2. Přidejte vrstvy: soubory tlačítkem „Přidat soubory“, nebo dalšími zdrojovými tlačítky (záplavová zóna, budovy, půda, výška terénu, parcely okresu). Služba se dotáže, jen když stisknete její tlačítko; při spuštění se nic nestahuje.
3. Stiskněte tlačítko spuštění pro odpověď slovy a CSV.
4. „Uložit lokalitu jako soubor“ nebo „Odeslat do BimCraftu jako návrhy“ předá obrysy BimCraftu nebo ModelCraftu; ty je vypíší a přidají jen to, co zaškrtnete.

## Co je dobré vědět

- Hledání adresy jde přes getcadcraft.com, který za Vás dotáže Nominatim od OpenStreetMap (nejvýše jeden požadavek za sekundu; odpovědi se uchovávají 90 dní, takže se stejná adresa nikdy nedotazuje dvakrát; ukládá se jen hash adresy, nikdy to, kdo se ptal). Ostatní tlačítka jdou přímo z Vašeho prohlížeče ke své službě.
- Každý zdroj má vlastní licenci (OpenStreetMap je ODbL: ponechte řádek s uvedením autorství).
- Vrstvy jsou tak dobré, jaká jsou otevřená data ve Vašem místě. Co je důležité, ověřte proti geodetickému zaměření.
