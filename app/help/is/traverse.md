---
title: Slá inn hringmælingu og jafna hana með áttavitareglunni
summary: Sláðu inn hornin í gráðum eða stefnur og vegalengdir, athugaðu hornalokun, línulokun og nákvæmni, jafnaðu með áttavitareglunni og bættu stöðvunum við sem mælipunktum eða hringnum sem lóð.
keywords: hringmæling, lokuð hringmæling, hringur, hægri horn, baksýn, stefnur, vegalengdir, lokun, skekkja, nákvæmni, áttavitaregla, bowditch, jöfnun, mæling
from: 56ce5a8c
---

Hringmæling er röð mældra hliða: á hverri stöð er horn (eða stefna) og vegalengd að þeirri næstu. Smelltu á **Slá inn hringmælingu** undir **Hringmæling** í hægra spjaldinu þegar ekkert er valið.

## Hvar hún byrjar og endar

1. **Byrja á mælipunkti**: númer hans. Eða sláðu inn norður- og austurhnit.
2. **Hliðar sem**: **Hægri horn og vegalengdir**, eða **Stefnur og vegalengdir**.
3. Með hornum skaltu tilgreina hvar þau byrja: **baksýnismælipunkt**, eða **asimút hans** (frá fyrstu stöð að baksýninni, réttsælis frá norðri).
4. **Endar**: **aftur á upphafsstað (hringur)**, eða **á mælipunkti** og númeri hans (opin hringmæling milli þekktra punkta).

## Sláðu inn hliðarnar

Ein hlið á línu, síðan vegalengdin, og síðan heiti stöðvarinnar sem hún nær til ef þú vilt:

- Hægri horn, mæld réttsælis á stöðinni sem hliðin fer frá, frá stöðinni að baki til þeirrar næstu: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` og `270.0028` virka líka.
- Stefnur: `N 45°30'15" E 125.50 B`, eða asimút sem eitt orð: `AZ 45-30-15 125.50 B`.
- Á hring með hornum skaltu enda á `close` og horninu við upphafið aftur, mæld frá síðustu stöðinni til annarrar: `close 270°00'05"`. Það er það sem athugar hornin.

Línur sem ekki er hægt að lesa eru skráðar með línunúmerum. „feet“, kommur og athugasemdalínur með `#` eru í lagi.

## Lesa lokunina

Meðan þú skrifar sýnir glugginn:

- **Hornalokun**: hversu langt hornin eru frá því að loka, og hlutdeild hvers horns. Án lokunarhorns eru hornin ekki athuguð og villa í þeim kemur fram í línulokuninni.
- **Línulokun**: hversu langt hringmælingin endar frá þeim stað þar sem hún ætti að enda, og í hvaða átt.
- **Nákvæmni**: lengd hringmælingarinnar deilt með línulokuninni: 1 : 10,000 þýðir 1 ft í 10,000 ft.
- Stöðvarnar eftir jöfnun, og hversu langt hver þeirra færðist.

## Jöfnunin

Fyrst er hornalokuninni dreift jafnt á hornin. Síðan er línulokuninni dreift á hliðarnar með áttavitareglunni (Bowditch): hver stöð færist á móti skekkjunni í hlutfalli við vegalengdina sem farin er til að ná henni, þannig að hringmælingin endar nákvæmlega þar sem hún á að enda.

:::note
Áttavitareglan er staðlað jöfnunaraðferð, ekki minnstu-fervika-aðferð, og hún vegur ekki horn á móti vegalengdum. Það er undir þínum eigin stöðlum og lögsögunnar komið að segja til um hvort nákvæmnin sé nógu góð.
:::

## Nota niðurstöðuna

- **Bæta við sem mælipunktum**: jöfnuðu stöðvarnar verða mælipunktar með heitunum sem þú gafst (annars næstu lausu númer), lýsingin `TRAV`, engin hæð. Síðasta stöð hrings er upphafið, þannig að hún er ekki bætt við tvisvar. Eitt skref: {{key:Mod+Z}} afturkallar það.
- **Bæta við sem lóð** (hringir): jöfnuðu stöðvarnar verða [lóð](topic:parcels), með merkingum sínum og lagalýsingu.
- **Skýrsla (CSV)**: lokunarlínurnar, síðan stefna, vegalengd, ójöfnuð og jöfnuð hnit og leiðréttingar hverrar stöðvar.
