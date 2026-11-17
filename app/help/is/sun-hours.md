---
title: Reikna út sólarstundir á svæði
summary: Veldu dag (eða árstíð) og tímabelti og sjáðu beinar sólarstundir á hverjum vegg hvers byggingarmassa og á jörðinni umhverfis þá, með jörðinni teiknaðri á grunnmynd og tölunum sem CSV.
keywords: sól, sólarstundir, skuggi, sólaraðgangur, dagsbirtustundir, framhlið, veggur, árstíð, sólstöður, jafndægur, tímabelti, sumartími, breiddargráða, lengdargráða, CSV, raster
from: 4e32a314
---

**Sólarstundir** telur beinar sólarstundir sem ná til hvers veggs í hverjum byggingarmassa og jörðinni umhverfis þá, á degi sem þú velur eða meðaltal yfir árstíð. Massarnir og jörðin sjálf varpa skugga; ekkert annað gerir það (engin tré, engir nágrannar sem þú hefur ekki teiknað). Ljós af himninum sem er ekki bein sól er ekki talið með.

## Áður en þú byrjar

Sólarstaðan kemur úr breiddar- og lengdargráðu svæðisins, sem koma úr **hnitakerfi** verkefnisins. Verkefni án þess er hafnað með skilaboðum: stilltu það fyrst (**Hnit** í GIS-hópnum). Breiddar- og lengdargráða sem er skráð í höndunum væri ágiskun, þess vegna er enginn reitur fyrir þær.

## Reikna það út

Í **Eiginleikum**, undir **Byggingarmassar**, **Sólarstundir**:

1. Veldu **Dag**. Hann byrjar á þeim degi sem sólin er lægst þar sem þú ert (21. desember, eða 21. júní á suðurhveli). Fyrir árstíð skaltu haka við **Yfir árstíð**, velja **Síðasta dag** og hversu marga daga á milli á að taka sýni.
2. Skráðu **Tímabelti**: heiti eins og `America/Mexico_City`, eða frávik frá UTC eins og `-6`. Heiti fylgir sumartímareglum þess svæðis fyrir daginn; frávik sem þú skráir er notað nákvæmlega eins og það er skráð, svo notaðu það sem gildir þann dag. Línan undir reitnum segir þér hvaða frávik fannst.
3. Veldu hversu oft sólin er staðsett (á 5, 10, 15 eða 30 mínútna fresti), og síðan **Reikna út sólarstundirnar**. Árstíð keyrir í bakgrunnsvinnsluferlum; **Stöðva** hættir við hana.

## Það sem þú færð

- Tafla eftir massa: **versti veggurinn**, **meðaltal** og **besti veggurinn**, í klukkustundum á dag, og tafla yfir alla veggi með stefnu þeirra og sólarstundum hæð fyrir hæð.
- Jörðin umhverfis massana, teiknuð á grunnmynd frá dökku (engin sól) til gulu (mest sem hvaða reitur fær), með skýringu. Reitir undir massa eru auðir. **Sýna jörðina á grunnmynd** slekkur á henni.
- **Veggir sem CSV** og **Jörð sem CSV** vista tölurnar.

Fyrir árstíð eru tölurnar meðaltal á dag yfir þá daga sem tekin voru sýni. Ekkert er vistað í verkefninu: niðurstaðan er til skoðunar, og ef keyrt er aftur verður hún til á ný.

## Gott er að vita

- Veggur telur augnablik sem sólríkt aðeins þegar hann snýr að sólinni og ekkert er í veginum. Veggur sem snýr frá fær ekkert.
- Jörðin er sýnd á neti sem fer eftir stærð svæðisins, og staða sólarinnar er tekin um miðjan hvert tímaskref, þannig að stundirnar eru réttar upp að því skrefi sem þú valdir.
- Staða sólarinnar er birt stjörnufræðileg formúla, nákvæm upp í um eina bogamínútu.
