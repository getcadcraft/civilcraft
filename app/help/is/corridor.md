---
title: Draga vegagang
summary: Kveiktu á gangi fyrir veglínu, stilltu gildi fyrir akrein, öxl og hliðarhalla, og skoðaðu þversniðin, dagsbirtulínurnar og jarðvinnuna sem hann býr til.
keywords: gatnamót, vegamót, vegur mætir vegi, hliðarvegur, T-gatnamót, þverun, hæð byggingarflatar, tenging, tengja saman, yfirhækkun, yfirhækkun, hallabeygja, yfirfærsla, útfærsla, gildatafla, þversalli, snúningur, gangur, samsetning, undirsamsetning, dæmigert snið, vegur, akrein, öxl, þversalli, hliðarhalli, dagsbirta, skurður, fylling, þversnið, mark, mörk, breiddarmark, hæðarmark, útfærslumark, breikkun, brún yfirborðs, fylgja öðrum gangi
from: 6dcb92b3
---

Gangur dregur eitt einfalt dæmigert þversnið (samsetningu) eftir veglínu og hönnunarlangsniði hennar, mótar það inn í núverandi land og bætir niðurstöðunni við breytta yfirborðið. Á einni veglínu geta verið nokkrir gangar á mismunandi stöðvasviðum, og gangur má byggja úr endurnýtanlegum sniðmátum eftir stöð ([Gangasniðmát](topic:corridor-templates)). Einfalda samsetningin hér að neðan er eins beggja megin; til að gefa hvorri hlið sína eigin hluta, sjá [Byggja hvora hlið úr hlutum](topic:corridor#build-each-side-from-parts).

## Samsetningin

Frá miðlínu út, hvorum megin:

1. **akrein** af tiltekinni breidd, sem hallar frá hryggnum á **akreinarhalla**
2. **öxl** af tiltekinni breidd á **axlarhalla**
3. **hliðarhalli** frá brún axlarinnar þar til hann mætir landinu: **skurðarhalli** þar sem landið er hærra, **fyllingarhalli** þar sem það er lægra

Upphafsgildin eru bráðabirgðagildi, ekki hönnunarstaðall:

| Gildi | US feet | Metrar |
|---|---|---|
| Breidd akreinar | 12 ft | 3.6 m |
| Akreinarhalli | 2% | 2% |
| Breidd axlar | 4 ft | 1.2 m |
| Axlarhalli | 4% | 4% |
| Skurðarhalli | 2 : 1 | 2 : 1 |
| Fyllingarhalli | 3 : 1 | 3 : 1 |
| Þversnið á bili | 10 ft | 5 m |

Hallar hliðarhalla eru láréttir á móti lóðréttum (H:V): 3 : 1 merkir 3 yfir og 1 niður.

## Byggja ganginn

Þú þarft veglínu án villna og hönnunarlangsnið með að minnsta kosti tveimur PVI og engum villum.

1. Veldu veglínuna.
2. Í hægra spjaldinu, undir **Gangur**, hakaðu við **Draga samsetningu eftir hönnunarlangsniði**.
   Reitirnir birtast og ganginum er byggður strax. Grunnmyndin sýnir brúnir akreinar og axlar og dagsbirtulínurnar; með {{ui:Tillaga (mótuð)}} valið undir **Birting**, sýna hæðarlínurnar nýja landið.
3. Breyttu hvaða gildi sem er: **Breidd akreinar**, **Akreinarhalli**, **Breidd axlar**, **Axlarhalli**, **Skurðarhalli**, **Fyllingarhalli**, **Þversnið á bili**. Ýttu á {{key:Enter}} eftir hvert. Skurður, fylling og bil þversniða verða að vera meira en 0.
4. Lestu línuna undir reitunum, til dæmis „39 þversnið frá 0+00.00 til 3+86.36; skurður 240.2 cu yd, fylling 556.0 cu yd.“

Þversnið eru tekin á hverju skrefi í **Þversnið á bili**, við endana og við upphaf og enda hverrar láréttrar og lóðréttrar sveigju. Hvert þversnið og línurnar í gegnum þau (miðlína, brúnir akreinar og axlar, dagsbirta) verða brotlínur breytta yfirborðsins.

Til að slökkva á ganginum, afhakaðu reitinn. Gildin hans haldast fyrir næst.

## Þegar hann byggist ekki

Rauður reitur undir reitunum segir hvers vegna:

| Skilaboð | Hvað á að gera |
|---|---|
| „Gangurinn þarfnast hönnunarlangsniðs án villna.“ | Bættu við PVI, eða lagaðu skarast lóðréttar sveigjur (sjá [Hanna lóðrétt langsnið](topic:profile)). |
| „Hönnunarlangsniðið skarast ekki veglínunni.“ | Færðu PVI inn á stöðvasvið veglínunnar. |
| „Gangurinn þarfnast að minnsta kosti tveggja þversniða á yfirborðinu.“ | Mestur hluti gangsins er utan núverandi lands. |
| „4 hliðarhallar ganga út af yfirborðinu áður en þeir mæta landinu.“ | Nálægt jaðri yfirborðsins nær hallinn ekki til landsins. Haltu veginum frá jaðrinum, eða lækkaðu fyllingar- eða skurðarhæðina þar. |
| „Dagsbirtulínur gangsins skerast (þversnið skarast, til dæmis innan á þröngri sveigju). Notaðu stærri radíus eða mjórri samsetningu.“ | Þversnið innan á skarpri sveigju skarast. Auktu radíusinn eða mjóðaðu samsetninguna. |

Gangur með vandamál er ekki mótaður inn og telst ekki með í jarðvinnunni.

## Gangar og byggingarflatir saman

Breytta yfirborðið er byggt í röð: fyrst allir gangar, síðan allar byggingarflatir. Þar sem mótun byggingarflatar skarast gangi, vinnur byggingarflötin. Þar sem síðara atriði skarast vegi, er aðeins sá hluti vegarins sem er innan dagsbirtulínu síðara atriðisins endurnýjaður; restin af veginum og hvaða landbrotlína sem vegurinn sker heldur lögun sinni. Rúmmál eru reiknuð innan allra dagsbirtulína saman; sjá [Jarðvinnurúmmál](topic:volumes).

## Yfirhækkun

Í gegnum sveigju getur vegurinn hallað inn á við, þannig að umferðin er minna þrýst út á við. Hakaðu við **Yfirhækkaðu sveigjurnar** undir **Yfirhækkun** í **Eiginleikum** veglínunnar:

- Hver hringlaga sveigja fær hlutfallið **e** úr gildatöflunni: fyrstu röðina sem radíus sveigjunnar nær (röð með tómu hlutfalli heldur venjulegum hrygg). Taflan og **Hámarks hlutfallslegur halli** (0.5 % til að byrja með) eru bráðabirgðagildi, ekki staðall: stilltu þau út frá þínum eigin hönnunarviðmiðum. Bættu við eða fjarlægðu raðir eftir þörfum.
- Akreinarnar snúast um miðlínuna. Fyrir sveigjuna flatast ytri akreinin út yfir **runout** (venjulegur hryggur ÷ e × runoff), og síðan yfir **runoff** (breidd akreinar × e ÷ hallinn) heldur ytri akreinin áfram að snúast þar til allur vegurinn hallar um e inn á við; tveir þriðju af runoff liggja fyrir sveigjuna og einn þriðji á henni. Eftir sveigjuna gerist það sama í öfugri röð.
- Öxl á lága hliðinni er aldrei flatari en akreinin hennar; á háa hliðinni heldur hún sínum eigin halla (hún veltist yfir).
- Taflan undir henni sýnir radíus, hlutfall, runoff og runout hverrar sveigju og hvar full yfirhækkun byrjar og endar. **Yfirhækkunarmyndin** teiknar þversalla beggja akreina eftir stöðvunum (vinstri akreinin heil lína, sú hægri brotin).
- Sveigja sem er of stutt til að ná fullri yfirhækkun, eða tvær sveigjur sem umbreytingar skarast, er tilkynnt í reit fyrir ofan töfluna.

Þversnið, rúmmál, þrívíddarsýnin og blöðin sýna allt hallandi veginn. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

## Mörk

Mark færir einn punkt á annarri hlið vegarins að línu: **Brún yfirborðs** (Edge of pavement) eða **Brún axlar**, á **Vinstri** eða **Hægri**. Hvert þversnið mætir línunni hornrétt á miðlínuna og fer aðeins út á þeirri hlið, þannig að mark hægra megin færir aldrei vinstri hliðina.

| Stillir | Hvað gerist þar sem þversnið mætir línunni |
|---|---|
| **Breidd** | Punkturinn situr á línunni: akreinin (eða öxlin) breikkar eða mjókkar að henni og heldur þversalla sínum. |
| **Hæð** | Punkturinn tekur hæð línunnar þar, í sinni eigin útfærslu: þversalli akreinarinnar (eða axlarinnar) fylgir. |

Línan getur verið eiginlína (hver sem **Notkun** hennar er) eða lína annars gangs: miðlína hans, brúnir yfirborðs, brúnir axla eða dagsbirtulínur. Lína gangs fylgir þeim gangi: breytir þú hinum veginum, fylgir þessi vegur. CivilCraft byggir hinn ganginn fyrst; tveir gangar sem myndu vísa hvor á annan í hring eru hafnaðir öðru megin, og taflan segir hvaða.

1. Veldu veglínuna og kveiktu á ganginum.
2. Undir **Mörk** smelltu á {{ui:Bæta við marki}}.
3. Veldu **Hlið**, **Punkt**, hvað það **Stillir** og **Að línunni**. Hver breyting er eitt afturkallsskref.

**Niðurstaða** segir á hversu mörgum þversniðum línan náðist. Þversnið sem ná ekki línunni (fyrir utan enda hennar, eða þar sem hún er á bak við miðlínuna) halda gildum samsetningarinnar. Lína sem er eytt skilur ganginn eftir eins og hann var fyrir markið, og taflan segir það. Ein hlið getur haft eitt breiddarmark og eitt hæðarmark fyrir hvern punkt.

## Byggja hvora hlið úr hlutum

Kveiktu á **Byggja hvora hlið úr hlutum** undir stillingum gangsins. Hvor hlið hefur þá sinn lista, frá miðlínu út: akreinar, öxl, rennu, kant, gróðurrönd, gangstétt og loks hliðarhallann að landinu (með sínum eigin skurðar- og fyllingarhlutföllum). Byrjaðu á {{ui:Sveitavegur}} eða {{ui:Þéttbýlisgata}}, bættu við og fjarlægðu hluta, færðu þá með örvunum og {{ui:Afrita}} aðra hliðina yfir á hina. Hver breyting er eitt afturkallsskref.

Þversalli er hallinn frá veginum, þannig að gangstétt sem rennur í átt að veginum er neikvæð. Kantur er flötur í þeirri hæð sem þú gefur, með efri brún í þeirri breidd sem þú gefur og valfrjálsu falli að aftan. Yfirhækkun snýr öllum akreinum í fyrstu röð; renna, kantur, gróðurrönd og gangstétt hanga frá brún akreinanna eins og þær eru byggðar. Mörk færa enn enda akreinanna og síðasta hlutann. Þversnið merkja rennulínuna, efri og aftari brún kants, og hitt. Í sveigju með sveigjubogum er runoff sveigjubogi: jöfn hryggur við TS, full yfirhækkun við SC.

## Yfirborðslög

Akrein, öxl, renna, gróðurrönd eða gangstétt getur borið sinn uppbyggingarlag: undir hlutanum bætir {{ui:Bæta við lagi}} við lagi með nafni, efni, þykkt og gerð þess (slitlag, bindilag, undirlag, undirbygging, yfirlag eða annað), ofan frá og niður. Lögin hreyfa ekki yfirborð vegarins (efsti hluti þess er hönnunarflöturinn); hvert liggur undir sínum hluta og dýpt þess er mæld beint niður. Þversnið teikna neðri brún hvers lags sem brotna línu, og {{ui:Lög vegyfirborðs: magn}} listar grunnflöt og rúmmál hvers lags (flatarmál meðfram ganginum út frá þversniðum hans, rúmmál = flatarmál × þykkt). IFC-útflutningurinn skrifar hvert lag sem sitt eigið frumefni með þykkt sinni og efni (sjá [IFC-útflutningur og innflutningur](topic:ifc)). Þykktin sem þú slærð inn er þín: CivilCraft ákvarðar ekki stærð yfirborðs.

## Þar sem vegir mætast vegum, byggingarflötum og stígum

Með {{ui:Tengja vegi og byggingarflatir sem hann mætir}} kveikt (það er kveikt fyrir alla ganga) tengir CivilCraft gang við það sem hann mætir á grunnmynd:

- **Vegur sem endar á öðrum vegi** (endi veglínu hans liggur á hinum veginum, eða innan um helmings af eigin yfirborðsbreidd frá brún þess vegar) er hliðarvegur gatnamóta. Vegurinn sem hann mætir opnar brún sína fyrir yfirborð hliðarvegarins: yfir munnann eru öxl, kantur, rönd og stígur lögð á þversalla akreinarinnar og teiknuð sem yfirborð. Hliðarvegurinn er lagður á yfirborð aðalvegarins þar sem þeir skarast og fellur upp eða niður að honum yfir aðkomuna.
- **Tveir vegir sem þvera** eru tengdir eins báðum megin. Vegurinn sem er fyrst skráður undir Veglínum er aðalvegurinn; hinn fylgir yfirborði hans yfir þverunina.
- **Vegur sem endar við byggingarflöt** (inni í henni, eða innan um helmings yfirborðsbreiddar hans frá brún hennar) kemur í hæð byggingarflatarinnar og er mildaður að henni yfir aðkomuna.
- **Stígur** (Harðyfirborð) stöðvast við ytri brún vegar, í hæð gangstígsins eða axlarinnar þar, í stað þess að liggja yfir veginum. Stígur sem sker veg verður tvö stykki. Endi sem er teiknaður lítillega stuttur frá vegi (innan tvöfaldrar breiddar stígsins) er framlengdur að brún hans.

**Eiginleikar** segja hvaða gangur tengdist, hversu mikið var hækkað eða lækkað þar og yfir hvaða lengd. Sú lengd er það stærra af 10 m (30 ft) og tuttugu sinnum breytingunni, og aldrei meira en 45% af ganginum. **Hönnunarlangsniðinu er ekki breytt**: langsniðssýnin sýnir ennþá hallalínuna sem þú teiknaðir, en þversnið, breytta yfirborðið, rúmmálið og þrívíddarsýnin sýna veginn eins og hann er tengdur. Til að gera tenginguna nákvæma í hönnun, færðu síðasta PVI í þá hæð sem Eiginleikar gefa upp.

Slökktu á rofanum á gangi til að skilja hann eftir nákvæmlega eins og langsnið hans og samsetning segja til um; hann tekur þá engan þátt í neinum gatnamótum, hvorki sem hliðarvegur né aðalvegur. Vegir sem mætast nærri í beinni línu (innan um 20°) eru látnir í friði, og það sama gildir um slóðir.

Það sem gatnamót gera ekki enn: engir kantbogar (horn eru ferhyrnd), engar beygjureinar né eyjar, endi hliðarvegarins er skorinn ferhyrndur við eigin veglínu, og gangur byggður úr sniðmátum opnar brún sína á sama einfalda hátt (skurður eða veggur í endaástandi hans er jafnaður yfir munnann, án ræsis). Fyrir kantboga í grunnmynd, sjónþríhyrninga og merkingar sjá [Jarðvegur, vegir, mæling, námur og tengingar](topic:soils-roads-survey-mines-links).

## Ekki smíðað enn

Mörk fyrir dagsbirtuhalla eru ekki tiltæk enn. Fyrir gang sem breytist eftir veginum, með vinstri og hægri hlið aðskildum, notaðu [Gangasniðmát](topic:corridor-templates). Sjá [Ekki smíðað enn](topic:not-built-yet).
