---
title: Teiknaðu byggingarmassa á svæði
summary: Teiknaðu byggingarmassa á lóð, gefðu honum hæðir og hæðarhæð, sjáðu brúttógólfflöt hans, veldu hvernig hann situr í halla, ýttu og togaðu hæð hans í þrívídd, og sendu hann til BimCraft eða vistaðu sem IFC-skrá.
keywords: massi, massamótun, byggingarmassi, rúmmál, grunnflötur, hæðir, hæðarhæð, brúttógólfflötur, GFA, halli, sökkull, skurður og fylling, ýta og toga, 3D, svæðisrannsókn, forhönnun, þróa, BimCraft, A-MASS
from: e5a67c16
---

Byggingarmassi er grunnflötur, fjöldi hæða og hæðarhæð: fyrsta spurningin í forhönnun, „hversu mikil bygging passar hér, og hvað gerir hún við landið“. Massar sitja á grunnmyndinni með heiti sínu, fjölda hæða og brúttógólfflöt, fara í PDF-prentunina og DWG- og DXF-útflutninginn á lögin `A-MASS` og `A-MASS-TEXT`, og eru vistaðir í verkefnaskránni.

## Teiknaðu massa

1. Undir **Eiginleikar**, undir **Byggingarmassar**, smelltu á **Teikna massa**. (Hann er líka í valmyndinni **Meira** á tækjastikunni við hliðina á **Yfirborð**.)
2. Smelltu á horn grunnflatarins. Smellur nálægt horni lóðar eða mælipunkti tekur nákvæma staðsetningu þess punkts.
3. Smelltu á fyrsta hornið aftur, eða ýttu á {{key:Enter}}, til að ljúka. {{key:Backspace}} tekur síðasta hornið til baka; {{key:Esc}} stöðvar.

Nýr massi hefur þrjár hæðir og hæðarhæð 12 ft (3.6 m), og tilheyrir þeirri lóð þar sem miðja hans lendir.

## Hæðir, hæð og flatarmál

Smelltu á massa til að breyta **Heiti**, **Notkun**, **Hæðum**, **Hæðarhæð** og **Lóð**. **Hæð** er hæðir sinnum hæðarhæð: skrifaðu hæð og hæðafjöldinn verður næsta heila tala hæða (aldrei minna en ein). **Grunnflötur** og **Brúttógólfflötur** (grunnflötur sinnum hæðir) eru reiknuð fyrir þig.

## Á hallandi landi

Landið undir massa er lesið úr yfirborðinu: núverandi land, eða mótað land þar sem þú valdir **Fyrirhugað land (mótað)**. **Á hallandi landi** segir hvar jarðhæðin fer:

- **Þrepað**: við meðalland undir grunnfletinum. Lága hliðin er fyllt upp að því og há hliðin skorin, og þessar tvær nálgast jafnvægi.
- **Sökkull**: við hæsta land. Traustur grunnur fyllir lágu hliðina.
- **Skurður**: við lægsta land. Háa hliðin er skorin burt inn í hólinn.

Eiginleikar sýna bilið af landi undir massanum, **Hæð jarðhæðar**, og rúmmál fyllingar og skurðar milli landsins og þeirrar hæðar. Blettur á grunnfletinum sem er utan yfirborðsins er sleppt, og Eiginleikar segja hversu margir.

## Í þrívíddarskoðun

Massar eru teiknaðir í þrívíddarskoðun svæðisins, með línu utan um hverja hæð og heiti þeirra yfir þakinu. **Sýna** hefur gátreit fyrir **Byggingarmassar**. Smelltu á einn til að velja hann. Með massa valinn:

- dragðu þak hans upp eða niður til að ýta eða toga hann einni hæð í einu, eða ýttu á {{key:PageUp}} og {{key:PageDown}};
- öll færslan er eitt afturkallsskref.

Götusýn **Akstur** sér massana líka, og **Sól** varpar skuggum þeirra á landið.

## Sendu áfram

- **Massar sem IFC** vistar hvern massa sem IFC4-skrá: svæði, byggingu með hæðum sínum, og massann sem byggingarhluta með tölunum sínum í eiginleikasafninu `CadCraft_SiteMass`. Þegar hnitakerfi er stillt á verkefnið er skráin sett á kortið og ber breiddar- og lengdargráðu svæðisins; án þess segir hún ekkert um hvar hún er.
- **Þróa í BimCraft** opnar BimCraft í nýjum flipa með massunum. Þar sýnir val á massa tölur hans og **Þróa þennan massa**, sem byggir veggi á hverri hæð og gólf undir byggingunni út frá grunnfletinum, í einu afturkallsskrefi. Ekkert er hlaðið upp: skráin fer á milli flipanna tveggja í þessum vafra.

Sjá einnig **Takmarkanir skipulags** og **Sólarstundir**.
