---
title: Hanna lóðrétt langsnið
summary: Opnaðu langsniðssýnina, byrjaðu hönnunarlangsnið frá landinu, bættu við og dragðu PVI, stilltu lengdir lóðréttra sveigja og lestu hallana, K-gildi og hæstu og lægstu punkta.
keywords: langsnið, lóðrétt lína, pvi, lóðréttur bogi, halli, k-gildi, hryggur, dæld, bvc, evc, langsniðssýn, endanlegur halli, fg, núverandi landlangsnið, eiginlínur í langsniði, skurðpunktar, varpað, kantur, skurður, merkingar
from: dbb1f32d
---

Hver veglína hefur eitt hönnunarlangsnið: lista yfir PVI (stöð og hæð) tengda með beinum hallalínum, með samhverfum parabólískum lóðréttum boga við hvern innri PVI sem hefur lengd. Núverandi landlangsnið er sótt fyrir þig úr yfirborðinu.

## Opna langsniðssýnina

1. Veldu veglínuna (smelltu á hana með {{ui:Velja}}).
2. Ýttu á {{key:R}}, eða smelltu á {{ui:Langsnið}} á tækjastikunni, eða {{ui:Sýn langsniðs}} neðst í hægra spjaldinu.
   Langsniðssýnin opnast undir grunnmyndinni með núverandi landi meðfram veglínunni. Með tvær eða fleiri veglínur velurðu eina í listanum vinstra megin á langsniðsstikunni.

Sýnin byrjar á því að sýna alla veglínuna og teygir hæðirnar til að fylla rúðuna; ýkingin er prentuð neðst í vinstra horni, til dæmis „Lóðrétt ýking 10×“.

## Aðdráttur og hliðrun langsniðsins

- **Aðdráttur:** snúðu músarhjólinu (eða klíptu á snertiborði) og sýnin zoomar að bendlinum. Haltu inni {{key:Shift}} til að zooma aðeins stöðvarnar, eða {{key:Alt}} til að zooma aðeins hæðirnar (það breytir ýkingunni). Með langsniðssýnina virka mínus- og plús-takkarnir og zooma um miðjuna.
- **Hliðrun:** dragðu með hægri eða miðju músarhnappi, eða strokaðu með tveimur fingrum á snertiborði.
- **Passa:** tvísmelltu á langsniðið eða ýttu á {{key:F}} til að sýna alla veglínuna aftur.

Að breyta PVI heldur aðdrættinum sem þú valdir; sýnin hoppar ekki aftur á passa.

Færðu bendilinn eftir langsniðinu: stikan sýnir stöðina, hæðir landsins og hönnunarinnar, hallann og skurð eða fyllingu þar, og punktur fylgir veglínunni á grunnmyndinni.

## Byrja hönnunarlangsniðið

1. Í hægra spjaldinu undir **Hönnunarlangsnið** smelltu á {{ui:Byrja á landinu}}.
   Tveir PVI eru settir á landið við báða enda veglínunnar, tengdir með einum beinum halla. Stöðustikan segir „Hönnunarlangsnið byrjað á landinu við báða enda. Kveiktu á Bæta við PVI og smelltu til að bæta við hallaskilum; gefðu þeim lengd sveigju í töflunni.“

Ef veglínan sker ekki yfirborðið færðu „Þessi veglína hefur ekkert land undir sér til að byrja frá.“ Bættu þá við PVI með smellum í staðinn (næsti kafli).

## Bæta við PVI

1. Ýttu á {{key:I}}, eða smelltu á {{ui:Bæta við PVI}} í langsniðsstikunni. Hnappurinn helst niðurhalaður.
2. Smelltu í langsniðið þar sem þú vilt hallaskil. PVI er bætt við á þeirri stöð og hæð, ávöl að 0.01, og valið.
3. Bættu við eins mörgum og þú þarft, ýttu síðan aftur á {{key:I}} til að hætta.

Smellur þar sem þegar er PVI er hafnaður („Það er nú þegar PVI við …“). PVI-arnir halda alltaf stöðvaröð.

## Smella við þegar þú bætir við eða dregur

**Smella**-hnappurinn í langsniðsstikunni er kveiktur í upphafi. Á meðan hann er kveiktur lendir PVI sem þú bætir við eða dregur á næsta PVI, grunnpunkti, stöð PVI eða landlínunni, og merki við punktinn segir hvað. Haltu inni {{key:Alt}} fyrir frjálsan punkt, hvar sem er.

## Stilla PVI

- **Dragðu** PVI í langsniðinu til að færa hann. Hann getur ekki farið framhjá nágrönnum sínum. Færslan er eitt afturkallsskref.
- **Sláðu inn** nákvæm gildi í PVI-töfluna í hægra spjaldinu: **Stöð**, **Hæð**, **Halli %** og **Lengd sveigju** (lóðrétt lengd boga). Ýttu á {{key:Enter}} eftir hvert.
- **Veldu** gildi úr langsniðinu: litli hnappurinn við hlið stöðvar eða hæðar PVI bíður eftir einum smelli í langsniðssýninni og fyllir gildið inn. Smellurinn smellur eins og Bæta við PVI; haltu inni {{key:Alt}} fyrir frjálsan punkt; {{key:Esc}} hættir við.
- **Halli %** er hallinn á snertlinunni sem byrjar við þann PVI og liggur að þeim næsta. Með því að slá hann inn færist hæð **næsta** PVI (stöð hans færist aldrei). Ef næsti PVI er læstur færist hæð fyrri PVI í staðinn.
- **Læstu** PVI með lásnum í enda línu hans. Læstur PVI er ekki dreginn og breyting á halla færir hann ekki. Ef báðir endar snertlínu eru læstir er hallinn hennar fastur: stöðustikan segir það og þú opnar annan endann fyrst. Lásinn er vistaður í skránni.
- **Fjarlægðu** PVI með x-inu í enda línu hans, eða veldu hann (smelltu á hann) og ýttu á {{key:Delete}}. Þegar langsniðssýnin hefur fókus fjarlægir {{key:Backspace}} hann líka.

Fyrsti og síðasti PVI fá aldrei sveigju.

## Lóðréttir bogar

1. Sláðu inn lengd í **Lengd sveigju** fyrir innri PVI, til dæmis 200.
2. Sveigjan er teiknuð miðjuð á PVI. Langsniðið og hægra spjaldið sýna gerð hennar (hrygg eða dæld), L og K, BVC- og EVC-stöðvar og hæðir þeirra, og hæsta eða lægsta punkt hennar þegar hann er innan sveigjunnar.

K er reiknað út frá L (K = L deilt með algebrískum mismun hallanna, í prósentum). Þú slærð inn L; að slá inn K beint er ekki tiltækt enn.

Ef lóðrétt sveigja passar ekki birtist rauður reitur sem segir hvers vegna: hún gengur til baka inn í PVI eða sveigju á undan honum, eða framhjá næsta PVI, og hversu mikið rými er á þeirri hlið (sveigja þarf helming lengdar sinnar á hvorri hlið PVI). Hnappurinn hennar setur **lengstu sveigju sem passar**, með K sínu, sem eitt skref ({{key:Mod+Z}} afturkallar því). Eða færðu PVI-ana í sundur.

## Lestu staðreyndirnar

Undir PVI-töflunni listar skrá hvern halla í prósentum („Halli 1: +1.25%“) og hverja sveigju, til dæmis „Hryggur við 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, síðan „Hæsti punktur 1+62.40, 254.12“.

Ef PVI-arnir ná ekki báðum endum veglínunnar birtist athugasemd um það. Gangur er aðeins byggður þar sem langsnið og veglína skarast.

## Eiginlínur í langsniðinu

Eiginlínur birtast líka í langsniðssýninni, svo þú sjáir kant, skurð eða efri brún veggjar gagnvart langsniði vegarins.

- Þar sem eiginlína **sker** veglínuna sýnir langsniðið lítinn tígul á þeirri stöð og hæð, merktan með nafni línunnar og hæð hennar þar (eigin hæð línunnar, reiknuð eftir þeim hluta sem sker).
- Sláðu inn fjarlægð í {{ui:Innan við}} til að teikna einnig eiginlínurnar sem **liggja hlið við hlið** veglínunni innan þeirrar fjarlægðar, sem strikaðar línur í eigin hæðum. Tómt eða 0 sýnir aðeins skurðpunktana.
- Merki og merkimiðar fylgja öllum breytingum: færðu hnit, slærð inn halla eða hækkar línuna, og langsniðið sýnir nýju hæðirnar strax.
- Smelltu á tígul skurðpunkts til að velja þá eiginlínu; valda línan er teiknuð í áherslulitnum.
- {{ui:Eiginlínur}} í langsniðsstikunni felur eða sýnir þær allar. Báðar stillingar eru vistaðar með verkefninu.

Sjá [Eiginlínur](topic:feature-lines).

## Næst

- [Draga vegagang](topic:corridor) eftir veglínunni og þessu langsniði.
- Langsniðið er skrifað í LandXML með veglínunni; sjá [Flytja inn og út LandXML](topic:landxml).
