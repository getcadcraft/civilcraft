---
title: Lesa hæðarlínur, hæðir og halla
summary: Stilla hæðarlínubil og stórar hæðarlínur, sýna hæðarbil, hallaörvar og þríhyrninga og lesa landhæð undir bendlinum.
keywords: hæðarlínur, hæðarlínubil, stórar hæðarlínur, merkingar, hæðarbil, hallaörvar, þríhyrningar, punkthæð, yfirborðsgreining, hæðargreining, hallagreining
from: 585e500a
---

Yfirborðið er sýnt með hæðarlínum um leið og það er til. Allt sem fjallað er um í þessu efni er stillt undir **Birting** í vinstra spjaldinu. Stillingar birtingar breyta aðeins því sem þú sérð (og því sem þú flytur út); þær eru ekki afturköllunarskref.

## Stilla hæðarlínubil

1. Undir **Birting** velur þú gildi í **Hæðarlínur á**.
   - Í fetum: 0.25, 0.5, 1, 2, 5, 10 eða 20 ft.
   - Í metrum: 0.1, 0.25, 0.5, 1, 2, 5 eða 10 m.
2. Veldu **Stórar hæðarlínur á**: 2., 4., 5. eða 10. hæðarlínu.
   Stórar hæðarlínur eru dregnar þykkari og merktar með hæð sinni. Þær falla á heila margfeldi af stóra bilinu (með 1 ft hæðarlínum og á 5. hverri stórri: 245, 250, 255 …).
3. Slökktu á {{ui:Merkingar hæðarlína}} ef merkingarnar þyrpast á litla lóð.

Nýtt verkefni byrjar með 1 einingu og á 5. hverri hæðarlínu er stór lína. Hæðarlínur beygjast við brotlínur; ef þær skera beint þvert yfir rennslislínu eða hrygg, þá er sú lína ekki enn brotlína (sjá [Byggja og betrumbæta yfirborðið](topic:build-surface)).

:::note
Hæðarlínur eru aðeins dregnar þegar það eru ekki fleiri en 2.000 hæðarstig milli lægsta og hæsta punkts. Á svæði með mikinn hæðarmun og mjög litlu bili sýnir teikningin engar hæðarlínur: veldu stærra bil.
:::

## Mýkja hæðarlínurnar

Hæðarlínur eru dregnar sem beinir bútar, einn yfir hvern þríhyrning yfirborðsins, þannig að þær beygja smávægilegt horn við hverja þríhyrningsbrún. **Mýking hæðarlína** undir **Birting** ávalar þessi horn:

- **Engin (beinir bútar)**: línurnar eins og þær voru dregnar. Þetta er það sem nýtt eða eldra teikning sýnir.
- **Lítil**: horn ávöl lítillega. Lína hreyfist aldrei meira en 10% í átt að næstu hæðarlínu og aldrei lengra frá beina bútnum sínum en sjötti hluti af lengd hans.
- **Mikil**: flæðandi bogi. Lína hreyfist aldrei meira en 25% í átt að næstu hæðarlínu og aldrei lengra frá beina bútnum sínum en þriðjungur af lengd hans.

Með hvorum valkosti sem er sker mýkta hæðarlínan enn hverja þríhyrningsbrún á sama punkti og rakta línan, helst innan þríhyrningsins sem hver bútur sker og getur því aldrei skorið eða snert aðra hæðarlínu. Þar sem hæðarlína sker brotlínu eða mörk heldur hún skarpa beygjunni sinni. Mýktu línurnar eru þær sem eru teiknaðar og fluttar út (DXF, DWG, PDF, GIS og 3D), með fleiri hornpunktum en raktu línurnar.

Mýking breytir aðeins teiknuðu línunum. Hæðir, rúmmál, langsnið og þversnið eru enn lesin úr yfirborðinu sjálfu. Hæðarlína sem fer nákvæmlega í gegnum mælipunkta (punktur í 250.00 á 250 hæðarlínunni) heldur litlu horni á hverjum slíkum punkti.

## Hvernig yfirborðið á bak við hæðarlínurnar verður til

Hæðarlínur fylgja yfirborðinu og yfirborðið fylgir **Hæðarlínuaðferð** undir **Yfirborð** í vinstra spjaldinu. Sjálfgefið er **Þríhyrningun með línulegri innskotun**, sem tengir punktana þína í þríhyrninga og heldur hverjum punkti og brotlínu nákvæmlega. Hinar aðferðirnar passa fyrst reit yfir punktana (kriging, lágmarksbeygju, næsta nágranna, öfuga fjarlægð og fleiri), sem gefur ávalari hæðarlínur milli punkta en fer ekki nákvæmlega í gegnum alla punkta; yfirborðsskýrslan undir **Yfirborð** segir hversu langt niðurstaðan víkur frá punktunum þínum.

**ABOS (nálgun byggð á mýkingu)** er ein af reitaaðferðunum. Hún hefur tvær eigin stillingar: **Sléttleiki** (0.5 til að byrja; lægra er sléttara) og **Nákvæmni** (1 til að byrja: yfirborðið er fært innan 1% af hæðarsviði svæðisins í punktunum þínum; skrifaðu minni tölu fyrir nánari passa). Ef hún nær ekki nákvæmninni á reitnum sem hún hefur, segir yfirborðsskýrslan það: skrifaðu minna **Reitabil**.

## Lesa hæð hvar sem er

Færðu bendilinn yfir teikninguna. Stöðustikan sýnir:

- **E** og **N** undir bendlinum
- **Land** og núverandi landhæð þar, reiknuð með innskotun á þríhyrningnum undir bendlinum
- **Mótað** og tillöguhæð, þar sem reitur eða gangur hefur breytt landinu
- „Utan yfirborðsins“ utan yfirborðsins

Til að lesa mælipunkt nákvæmlega skaltu velja {{ui:Velja}} og smella á punktinn: hægra spjaldið sýnir númer hans, austurhnit, norðurhnit, hæð, lýsingu og hóp.

## Sýna hæðarbil

1. Hakaðu við {{ui:Hæðarbil}}.
   Yfirborðið er fyllt með lit frá lágu (blágrænt) til háu (okkurbrúnt). Skýring undir gátreitunum sýnir hæðarsvið hvers bils.
2. Veldu hversu mörg bil í **Bil**: 5, 8, 10 eða 12. Bilin skipta sviðinu frá lægstu til hæstu hæðar í jafna búta.

Hæðarbil eru eingöngu til skoðunar. Þau eru ekki flutt út í DXF og ekki prentuð í PDF.

## Sýna hallaörvar

Hakaðu við {{ui:Hallaörvar}}. Stutt ör á hverjum þríhyrningi, nógu stórum til að rúma hana, vísar niður brekkuna. Flatir þríhyrningar fá enga ör. Örvarnar eru fljótleg athugun á rennslisstefnu; hallagildið sjálft er ekki merkt ennþá.

## Sýna þríhyrninga, punkta og brúnir

- {{ui:Þríhyrningar}} sýnir brúnir TIN-netsins. Kveiktu á því til að athuga hvernig yfirborðið tengir punktana, einkum við brotlínur og við ytri mörkin.
- {{ui:Punktar}} sýnir hvern mælipunkt; {{ui:Merkingar punkta}} bætir við númeri hans, hæð og lýsingu (eða minna: sjá **Merkingar punkta** í [Stillingar CivilCraft](topic:settings)).
- {{ui:Brotlínur}} sýnir brotlínur (og mörkin) í appelsínugulu.
- {{ui:Jaðar yfirborðs}} sýnir útlínu yfirborðsins.

## Núverandi eða tillaga

Þegar reitur eða gangur mótar landið án vandræða býður **Yfirborð** undir **Birting** upp á {{ui:Tillaga (mótuð)}}. Hæðarlínurnar, bilin og örvarnar sýna þá mótaða yfirborðið, svo þú sjáir nýja landið og skurðina og fyllingarnar við jaðarinn. Skiptu aftur yfir í {{ui:Núverandi land}} til að sjá mælinguna.

## Hvað er flutt út

DXF- og PDF-útflutningur fylgir þessum stillingum: það sem þú hefur slökkt á er ekki skrifað, og hæðarlínurnar eru þær sem yfirborðið sýnir. Hæðarbil eru aldrei flutt út.
