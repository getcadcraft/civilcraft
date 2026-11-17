---
title: Hanna járnbrautarspor
summary: Gerðu veglínu að járnbraut: teinaaðlaganir (klóþoíð, þriðja stigs parabóla, Bloss, Helmert, hálf sínusbylgja, sínus), halli í hverri beygju með jafnvægishalla hennar, skortur og umfram, mörk halla og brautarrúmfræði sem viðvaranir, skiptispor og millispor eftir stöð, frjálst rými dregið eftir línunni og braut með teinum, þverbitum og ballestarbeði byggð sem gangur, í grunnmynd, sniðum, langsniði, þrívídd og magntölum.
keywords: járnbraut, teinn, braut, lest, neðanjarðarlest, sporvagn, halli, halli í beygju, ofurhækkun, skortur á halla, umfram halli, jafnvægishalli, aðlögun, aðlögunarbogi, klóþoíð, þriðja stigs parabóla, bloss, helmert, hálf sínusbylgja, kósínus, sporvídd, staðlað sporvídd, breið sporvídd, metrasporvídd, mjó sporvídd, þverbiti, ballest, undirballest, undirbygging, sporbrún, miðjufjarlægð brauta, 60E1, 54E1, UIC60, 115RE, 136RE, halli á halla, hraðabreyting á halla, skiptir, skiptispor, millispor, kross, krossnúmer, forlengd, lokabogi, hraði í afleið, rými, frjálst rými, rýmisumlykja, rýmisrammi, hleðslurammi, hreyfiumlykja, pallur, bil á palli, sporbil, halli, lóðréttur bogi, lágmarksradíus, LandXML halli
from: 99de9745
---

Sérhver veglína getur verið járnbrautarspor. Beygjur hennar fá þá aðlögunarboga og halla (ofurhækkun teinanna), og gangur hennar er byggður sem braut: teinar á þverbitum, á ballestarbeði, mótaðir inn í landið eins og vegur. Skiptispor og millispor fara á hana eftir stöð, og hægt er að draga frjálst rými eftir línunni og athuga það gegn því sem stendur við brautina.

Allar tölur hér að neðan eru **sýnigildi**, ekki staðlar. Járnbrautir setja sín mörk eftir hraða línunnar, gerð brautar og landi; settu þau eftir þínum eigin járnbrautarstaðli. CivilCraft fylgir engin landsbundin tafla.

## Gera veglínuna að járnbraut

1. Veldu veglínuna og finndu **Járnbraut** í **Eiginleikum**.
2. Hakaðu við **Þessi veglína er járnbrautarspor**. Hver breyting er eitt skref í afturköllun.
3. Stilltu **Hönnunarhraða** efst í eiginleikum veglínunnar: það er hraði línunnar sem hallinn er athugaður gegn. **Hægustu lestir** (í reitnum **Járnbraut**) er hraðinn sem umfram halli er athugaður gegn.

## Aðlögun

Gefðu hverri beygju aðlögunarlengd á hvorum enda í PI-töflunni (**Aðlögun inn**, **Aðlögun út**), veldu síðan gerð hennar í beygjutöflu reitsins **Járnbraut**, eða **Aðlögun fyrir allar beygjur**:

| Gerð | Sveigja eftir aðlögun |
|---|---|
| Klóþoíð | vex jafnt (vegaspíralinn) |
| Þriðja stigs parabóla | y = x³ / (6·R·L), með L mælt eftir snertilínu; boginn sjálfur er örlítið lengri |
| Bloss | 3u² − 2u³ af fullri sveigju (u = hlutdeild lengdarinnar): byrjar og endar mjúklega |
| Helmert | tvær parabólur, fyrst 2u² og síðan 1 − 2(1 − u)² |
| Hálf sínusbylgja | (1 − cos πu) / 2 |
| Sínus | u − sin(2πu) / 2π |

Allar nema þriðja stigs parabólan beygjast um L / 2R, eins og klóþoíðið. Stöðvar fylgja raunverulegri lengd. LandXML geymir gerðina (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Halli

Sláðu inn **Halla** hverrar beygju í millimetrum. Taflan sýnir fyrir hverja beygju:

- **Jafnvægishalli** = G·v² / (g·R), þar sem G er fjarlægðin milli miðja teinanna (**Fjarlægð teina**: sporvíddin auk breiddar teinshaussins, nema þú slærð hana inn sjálfur). Með G = 1500 mm er þetta kunnuglega 11.8·V² / R (V í km/h, R í m).
- **Skortur** = jafnvægishalli við hönnunarhraða línunnar − beitti halli.
- **Umfram** = beitti halli − jafnvægishalli við hraða hægustu lesta.
- **Hallaskipti**: brattasti hallahalli eftir hallaskiptum sínum, í mm á metra.

Hallinn eykst yfir hverja aðlögun og fylgir lögun sveiglunnar: beinn fyrir klóþoíð eða þriðja stigs parabólu, Bloss-lagaður fyrir Bloss o.s.frv. Beygjuendi án aðlögunar fær hallaskipti á beina kaflanum á undan, eins langt og mörk hallahallans krefjast, og er sagt frá því: halli breytist þá þar sem sveiglan gerir það ekki.

**Halli snýst um** segir hvaða teinn helst á hönnunarlangsniðinu: **lægri teinninn** (venjulega), **innri teinninn** eða **miðja brautar** (hvor teinn færist um hálfan halla). Hönnunarlangsniðið er efsta brún teinsins þar.

**Hallarit** teiknar hæð hvers teins yfir langsniðinu eftir stöðvunum. Langsniðsmyndin og grunnmynda- og langsniðsblöðin fá það sama sem band undir langsniðinu.

## Mörk halla og viðvaranir

**Mesti beitti halli**, **Mesti hallaskortur**, **Mesta hallaumfram**, **Brattasti hallahalli** og **Hraðasta hallabreyting** (hallahalli á hraða línunnar, mm/s) eru athuguð á hverri beygju. Gildi yfir marki er viðvörun í reitnum **Járnbraut** og í **Vandamálaspjaldinu**, með markinu og því gildi sem fannst. Án hönnunarhraða er skortur og hraðabreyting ekki athugað (athugasemd segir það).

## Brautin

Settu **Sporvídd** (staðlaða 1435 mm, breiða, metra- eða mjóa forstillingu, eða þína eigin), **Teinasnið** (60E1, 54E1, 49E1, 115RE, 136RE: aðeins birtar víddir þeirra), fjölda **Brauta** og **Miðjufjarlægð brauta**, og síðan **Þverbita og ballest**: efni þverbita, lengd, breidd, dýpt og bil; dýpt ballestar undir þverbitanum (við lægri teininn), **öxl**, halla, og hversu langt efst hennar liggur undir þverbitunum; dýpt undirballestar, **sporbrún** handan táar ballestarinnar, og þverhalla undirbyggingarinnar.

Ýttu á **Byggja brautina**. Þá kveikir hún á gangi veglínunnar, byggðum sem braut eftir hönnunarlangsniðinu: teinar og þverbitar hallast með hallanum, en undirbyggingin gerir það ekki. Dagsbirtuhalli liggur frá sporbrúninni við skurð og fyllingu gangsins, og brautin fellur inn í fyrirhugaða yfirborðið eins og vegur.

- **Grunnmynd**: báðir teinar hverrar brautar (lag C-RAIL-TRAK) og, með fleiri en einni braut, miðja hverrar brautar (C-RAIL-CNTR), á skjá, í DXF, DWG, PDF og grunnmynda- og langsniðsblöðum.
- **Snið**: þverbitarnir, teinarnir og botn ballestarinnar og undirballestarinnar í öllum sniðum.
- **Þrívídd**: teinarnir, hver þverbiti og ballestarbeðið (**Sýna › Braut**), einnig í GLB, OBJ og USD.
- **Magntölur**: lengd brautar, teinar (báðir teinar hverrar brautar, eftir eigin línu hverrar brautar), þverbitar, ballestarbeðið og ballestin án þverbitanna, og undirballestin, með meðaltali endaflatarmála milli sniða.

## Athuganir á brautarrúmfræði

Auk hallans athugar reitinn **Járnbraut** línuna sjálfa gegn sex mörkum til viðbótar (öll sýnigildi, og þú stillir þau öll):

- **Brattasti halli** hönnunarlangsniðsins, í mm á metra.
- **Minnsti radíus lóðrétts boga**, sem stuðull k í R ≥ k·V² (R í metrum, V í km/h). Parabólískur lóðréttur bogi af lengd L milli tveggja halla hefur radíus L deilt með breytingu hallans.
- **Styttsti lóðrétti bogi**.
- **Minnsti radíus boga** í grunnmynd (0 slekkur á athuguninni).
- **Styttsti bogi eða beinn kafli**, mældur í sekúndum ferðar á hraða línunnar: hringbogi, eða beinn kafli milli tveggja beygja, styttri en sú vegalengd er varað við. 1.8 s er kunnuglega „helmingur hraðans í km/h, í metrum“.
- **Hraðabreyting á skorti á halla** eftir hverri aðlögun, í mm/s á hraða línunnar.

**Brautarrúmfræði** sýnir brattasta hallann sem fannst og hvern lóðréttan boga með radíus sínum og radíusnum sem hraði línunnar krefst. Lóðréttur bogi sem liggur á aðlögun eða hallaskiptum fær athugasemd. Án hönnunarlangsniðs eða hönnunarhraða eru athuganir sem þurfa þau slepptar, og athugasemd segir það.

## Skiptispor og millispor

Undir **Skiptispor og millispor** ýttu á **Bæta við skiptisporum**. Það er sett á lengsta beina kaflann. Stilltu í töflunni:

- **Stöð táar skiptis**: hvar skiptisporið byrjar á þessari veglínu.
- **Krossinn**: krossnúmerið N (1:N). Horn krossins er 2·atan(1 / 2N).
- **Hlið**: vinstri eða hægri, séð í átt að vaxandi stöðvum.
- **Bil milli sporanna** í metrum: ef það er yfir 0 verður skiptisporið að millisporu yfir í samsíða braut í þeirri fjarlægð (tvö skiptispor og beini kaflinn á milli þeirra).

Taflan sýnir **Forlengd** (táin á skiptinu að krossinum), **Radíus** lokabogans og **Hraða í afleið** sem þessi radíus leyfir með þínu marki á skort á halla og engum halla. **Gera brautina** breytir afleiðuleiðinni í eigin veglínu (skiptið, lokabogann, og síðan beint áfram í horninu við krossinn) með sömu járnbrautarstillingum, tilbúna til lengingar.

Grunnmyndin teiknar tvo afleiðuteina hvers skiptispors, miðlínu þess, merki við tá skiptisins og við krossinn, og „1:N“ (lag C-RAIL-TURN), á skjá og í DXF, DWG, PDF og blöðum. Þrívíddarsýnin teiknar afleiðuteinana í hæð aðalbrautarinnar.

Lögunin er **sýnigildi**: beint skipti og einn lokabogi út frá krossnúmerinu. Smíðað skiptispor fylgir staðli járnbrautarinnar og teikningu framleiðandans. Viðvaranir: skiptispor sem gengur út fyrir veglínuna, liggur á beygju, aðlögun, halla eða lóðréttum boga, eða skarast öðru; og athugasemd þegar hraði línunnar er yfir hraða þess í afleið.

## Frjálst rými

Veldu **Dragðu frjálst rými eftir þessari braut**. Veldu **Útlínu** (tvær sýnigildisútlínur, eða **Þín eigin útlína** slegin inn sem einn punktur á línu: frávik frá miðju brautar, síðan hæð yfir efri brún teins, í metrum), **Lengd ökutækis** og **Miðjur drifgrinda** og, ef hún er til, **Brún palls** (hlið, fjarlægð frá miðju brautar, hæð yfir teini).

Á hverri stöð er útlínan hölluð með hallanum um lægri teininn og breikkuð vegna beygjunnar: miðja ökutækisins færist inn um b² / 8R, endar þess út um (L² − b²) / 8R (b miðjur drifgrinda, L lengd ökutækis, R radíus þar, sem fylgir aðlöguninni). Reiturinn teiknar sniðið á beina kaflanum og þar sem það er breiðast, og telur upp:

- **breiðasta rýmið** og hvar það er,
- **miðjufjarlægð brauta** borna saman við miðjufjarlægðirnar sem tvö nálæg rými þurfa,
- rýmið sem eftir er við **brún palls**, eða hversu langt hún er inni í því,
- hverja eiginleikalínu, rörbyggingu og aðra járnbrautarveglínu sem finnst **inni í rýminu**.

Eiginleikalína með hæðum er metin gegn útlínunni í hæð hennar yfir teininum. Án hönnunarlangsniðs, eða fyrir punkt án hæðar, er hún metin aðeins í grunnmynd, og listinn segir það. Grunnmyndin sýnir tvær brúnir rýmisins (lag C-RAIL-CLRN) með krossi við hvern hlut inni í því.

Útlínurnar sem boðnar eru eru **sýnigildi, ekki sporvídd neinnar járnbrautar**. Sláðu inn rýmisramma járnbrautarinnar áður en þú reiðir þig á niðurstöðu.

## Í öðrum forritum

- **LandXML**: járnbrautarveglína er skrifuð með aðlögunum sínum (spiType) og `Cant`-blokk: sporvíddin, snúningspunkturinn, hraði línunnar, og stöð þar sem hvert hallaskipti hefst og endar, með beitta halla, jafnvægishalla og skort. Opnun LandXML-skráar með `Cant`-blokk gerir þá veglínu að járnbraut með þeim höllum.
- **IFC**: veglínan með hallahlutum sínum, teinunum, þverbitunum, ballestinni og undirballestinni.

## Ekki smíðað enn

Skiptispor í IFC-útflutningi, skiptigerðir umfram staka lokabogann (bognir rofar, sveiflunefs-krossar, rennur, tígulskipti), reglur um hreyfisporvídd (rýmið er föst útlína með sveiglufærslu), loftlínur og merkjakerfi.

**Hvaða staðall.** Í reitnum **Járnbraut** er „Staðall til tilvísunar“ annað hvort Enginn eða Evrópskur (UIC og EN). Með Evrópskum eru nefnd þau skjöl sem evrópsk verkefni vísa í (EN 13803 fyrir breytur veglínu, EN 13232 fyrir skipti og krossa, EN 15273 fyrir rými, EN 13848 fyrir gæði brautarrúmfræði), og hvert mark fær reit fyrir greinina sem það kemur úr. Engin tala úr neinum staðli er innbyggð: halla-, skorts-, umfram-, hallahalla- og hraðamörkin, rúmfræði skiptisporanna og rýmisrammi eru öll enn sýnigildi, og gluggans segir það. Járnbrautarverkfræðingur athugar hvert gildi gegn texta staðalsins sjálfs og skrifar greinina við hliðina áður en nokkuð er smíðað. Suður-Afríka og AREMA-töflurnar eru ekki í þessari útgáfu.
