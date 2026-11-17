---
title: Teikna lóðir og skrifa lögfræðilegar lýsingar þeirra
summary: Teiknaðu lóð eftir hornum hennar eða sláðu inn mælilínurnar úr afsali eða skipulagsuppdrætti, athugaðu hversu vel mælilínurnar lokast, merktu stefnur og fjarlægðir á grunnmyndina, gerðu hvaða braut sem er að boga og afritaðu drög að lögfræðilegri lýsingu.
keywords: lóðir, lóð, eignarmörk, mörk, afsal, skipulagsuppdráttur, mælilínur, stefna, fjarlægð, lokun, lokunarskekkja, nákvæmni, lögfræðileg lýsing, upphafspunktur, bogi, radíus, flatarmál, ekrur
from: 6793d6ce
---

Lóðir liggja á grunnmyndinni með stefnu og fjarlægð eftir hverri beinni braut (bogi sýnir radíus, lengd og miðhorn) og heiti sitt og flatarmál í miðjunni. Þær fara í PDF-útprentunina og DWG- og DXF-útflutninginn, á lögunum `V-PROP` (línur) og `V-PROP-TEXT` (merkingar). Allt er undir **Lóðir** í hægra spjaldinu þegar ekkert er valið.

## Teikna lóð

1. Smelltu á **Teikna lóð**.
2. Smelltu á hornin, og byrjaðu á upphafspunktinum. Smellur nálægt mælipunkti tekur nákvæma staðsetningu hans.
3. Smelltu á fyrsta hornið aftur, eða ýttu á {{key:Enter}}, til að ljúka. {{key:Backspace}} tekur síðasta hornið til baka; {{key:Esc}} fellir hornin sem komin eru; ýttu aftur á það til að fara úr verkfærinu.

## Slá inn mælilínurnar úr afsali

1. Smelltu á **Slá inn mælilínur úr afsali**.
2. Segðu hvar mælilínurnar byrja: númer mælipunkts, eða norðurhnit og austurhnit.
3. Skrifaðu eða límdu mælilínurnar, ein í línu:
   - lína: stefna og fjarlægð, eins og `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` og azimútar (`AZ 45°30'15"`) virka líka, og "thence", kommur og "feet" eru hunsuð.
   - bogi: `C R 300 L 52.36 right` (radíus og bogalengd), eða `C R 300 D 10°00'00" left` (radíus og miðhorn). Bogi fylgir þeirri braut sem kemur á undan; þegar hann gerir það ekki, bættu við hallastefnu hans: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` byrjar athugasemdarlínu.
4. Meðan þú skrifar sýnir glugginn lengd mælilínanna, **lokunarskekkjuna** (hversu langt frá upphafinu þær enda, og í hvaða átt), **nákvæmnina** (lengdina deilt með lokunarskekkjunni, 1 : 10,000 og svo framvegis) og flatarmálið. Línur sem hann getur ekki lesið eru taldar upp með línunúmerum sínum.
5. **Bæta við lóðinni**. Þegar mælilínurnar lokast ekki, lokast lóðin með beinni braut yfir bilið: athugaðu mælilínurnar við afsalið. Til að dreifa skekkju mælingarraðar yfir brautirnar, lagaðu hana fyrst.

## Bogar

Í **Eiginleikum** lóðar hefur hver braut **Radíus**. Skrifaðu inn radíus til að gera þá braut að boga gegnum sömu tvö horn (radíus minni en helmingur fjarlægðarinnar milli hornanna kemst ekki, og er hafnaður), og veldu **Hægri** eða **Vinstri** í **Bogar**: bogi til hægri hefur miðju sína hægra megin við stefnuna, eins og í afsali. Hreinsaðu radíusinn til að gera brautina beina aftur. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar henni.

## Lögfræðileg lýsing

Eiginleikar lóðar enda á lögfræðilegri lýsingu hennar, skrifaðri úr teikningunni:

- **Byrjar við** upphafspunktinn sem þú skrifar (til dæmis "norðausturhorn Lóðar 4"), annars norðurhnit og austurhnit fyrsta hornsins, eða mælipunktinn sem mælilínurnar byrjuðu á.
- **þaðan** hver braut: stefna og fjarlægð, eða bogi með radíus, bogalengd, miðhorn, og hallastefnu og fjarlægð hallans.
- **Inniheldur** flatarmálið í ferfetum og ekrum (fermetrum og hektörum í metraverkefni).

**Afrita** setur hana á klippiborðið; **Sækja sem texta** vistar hana sem `.txt`-skrá.

:::warning
Lögfræðilega lýsingin er drög úr teikningunni, ekki mæling. Löggiltur landmælingamaður þarf að yfirfara hana við skjölin og undirrita hana áður en nokkur treystir henni.
:::

Smelltu inni í lóð á grunnmyndinni til að velja hana; {{key:Delete}} eyðir henni. Lóðir eru vistaðar í verkefnaskránni.
