---
title: Athuganir á raflínum
summary: Það sem CivilCraft athugar á hverri línu og kapli, alltaf uppfært: lágmarksfjarlægðir, bil milli leiðara, sveiflu, lyftikraft, álag á möstur og stærðir, tengihluti, strekkivíra, undirstöður, vantandi gögn, tengingar, ofálag og spennufall.
keywords: athuganir, lágmarksfjarlægð, fjarlægð yfir jörðu, hindrun, þverun, fasabil, sveifla einangrara, lyftikraftur, álag á mastur, nafnálag, stærðir, undirstaða, strengur, strekkivír, stag, tengihlutur, þverslá, spennufall, ofálag, vantandi gögn, aftengt
from: e6a0da47
---

**Athuganir** í kaflanum Raflínur sýnir hvert vandamál, rautt fyrir það sem stenst ekki og gult fyrir viðvaranir. Smelltu á eitt þeirra til að velja línuna, mastrið, kapalinn eða búnaðinn sem það varðar; mistakandi möstur og bil eru auðkennd með rauðum hring á grunnmyndinni meðan vinnusvæðið er opið.

:::warning
Hönnunarhjálp: þetta eru athuganir á hönnun þinni gegn þínum eigin reglum, ekki vottun.
:::

## Lágmarksfjarlægðir

Lægsti fasi leiðarans er rakinn eftir hverju bili við hvert álagstilvik. Lægsta fjarlægð hans yfir jörðu verður að ná **lágmarksfjarlægðarreglunni** á línunni. Þar sem bil þverar **hindrun** (teiknuð með {{ui:Hindrun}}: punktur eða lína, með hæð sinni yfir jörðu og eigin lágmarksreglu) er fjarlægðin yfir efsta hluta hindrunarinnar athuguð á sama hátt.

**Það sem Landslagsvinnusvæðið setur ofan á jörðina telst líka.** Stakar plöntur (krónan við fullan vöxt og hæð), hekkir og gróðurbeð (hæsta tegundin í þeim) og veggir (efsta brún þeirra) eru hindranir undir línu, án þess að teikna þær aftur. Þær fylgja reglunum sem settar eru í {{ui:Álagstilvik og mörk…}}: **Landslagsplöntur undir línu** (dæmasettin nota *Tré og plöntur*, 3 m) og **Landslagsveggir undir línu** (*Bygging*); veldu **Ekki athugað** til að sleppa þeim. Fjarlægðin er mæld beint upp frá efsta hluta plöntunnar eða veggsins að leiðaranum þar sem bilið þverar hana; fjarlægðin til hliðar að krónu við hlið línunnar er ekki athuguð. Að færa tré eða hækka vegg breytir athugunum strax.

Reglurnar um lágmarksfjarlægð eru þínar eigin: opnaðu þær með **Reglur…** við hliðina á hvaða **lágmarksfjarlægðarreglu** sem er (eða í {{ui:Álagstilvik og mörk…}}) til að bæta við, endurnefna, breyta eða fjarlægja þær.

## Bil og sveifla

- **Fasabil** sem þarf: k·√(durgur + lengd einangrara) + U/150, með durg heita álagsins og spennu U í kV (algengt form; k er úr reglusettinu þínu). Borið saman við fasabil þverslárinnar.
- **Sveifla einangrara** á hengistöðum, í vindálagstilvikinu: atan(þverálag ÷ lóðrétt álag), borið saman við mestu leyfðu sveiflu reglusettsins.
- **Lyftikraftur**: hengistóð sem er lægra en nágrannarnir getur lyfst upp í kulda; það er merkt.

## Álag á möstur og stærðir

Fyrir hvert mastur og álagstilvik, með öllum leiðurum línunnar:

- **Þverálag**: vindur á metra × vindbil (helmingur beggja bila), að viðbættu 2·H·sin(beygja ÷ 2) við beygju.
- **Eftir línunni**: munurinn á spennu beggja hliða við endastöð eða horn; við hengistóð aðeins undir ís á annarri hlið (hvert bil reiknað fyrir sig, sem er varfærið).
- **Lóðrétt**: lóðrétt álag á metra × þyngdarbil (milli lægstu punkta hvorum megin) að viðbættum búnaðinum.

Láréttu álagi er varpað á nafnpunkt mastursins (jafngilt álag = álag × festingarhæð ÷ hæð nafnpunktsins) og borið saman við **nafnálag** þess × stuðul reglusettsins. Þegar það er of veikt er minnsta mastur af sama efni í safninu þínu sem ber það stungið upp á. Mastur með **strekkivír** flytur láréttu álagið yfir á strekkivírinn, sem ber álag ÷ sin(horn strekkivírs) og er athugaður gegn eigin einkunn.

Tengihlutir (klemmur, einangrarar, þverslár) eru athugaðir gegn metnu álagi: festitengihlutur ber átak leiðarans, hengitengihlutur sinn hluta af lóðréttu og þverálagi. **Undirstaðan** sem sýnd er er dýpt mastursins í jörðu og hola aðeins breiðari en fótur þess.

## Gögn, tengingar og straumur

- Hlutur með auðan reit sem þarf, eða lykil sem er ekki í safninu.
- Endi kapalleiðar, eða búnaður, sem er tengdur við ekkert.
- **Spennufall** og **straumur** frá hverjum gjafa (búnaði merktum sem gjafi) að álagi (kW og aflstuðull á búnaði), eftir loftbilum og köplum: √3·I·L·(R cos φ + X sin φ), með R við 20 °C. Meira en straumþol kapalsins, eða meira spennufall en reglusettið leyfir, er merkt.
