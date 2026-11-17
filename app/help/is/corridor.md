---
title: Sópa vegargangi
summary: Kveiktu á gangi fyrir veglínu, stilltu akreinar, axlir og hliðarhalla, og lestu þversniðin, jaðarlínurnar og jarðvinnuna sem hann myndar.
keywords: yfirhækkun, halli, aðlögunarlengd, útlögunarlengd, halla tafla, þverhalli, snúningur, gangur, samsetning, undirsamsetning, dæmigert þversnið, vegur, akrein, öxl, hliðarhalli, jaðar, skurður, fylling, þversnið, mark, mörk, breiddarmark, hæðarmark, breikkun, brún slitlags, fylgja öðrum gangi
from: 91303189
---

Gangur sópar einu einföldu dæmigerðu þversniði (samsetningu) eftir veglínu og hönnunarlengdarsniðinu hennar, mótar það inn í núverandi land og bætir niðurstöðunni við tillöguyfirborðið. Veglína getur borið nokkra ganga á mismunandi stöðubilum, og gang má byggja úr endurnýtanlegum sniðmátum eftir stöð ([Sniðmát gangs](topic:corridor-templates)). Einfalda samsetningin hér að neðan er eins beggja megin; til að gefa hvorri hlið sína eigin hluta, sjá [Byggja hvora hlið úr hlutum](topic:corridor#build-each-side-from-parts).

## Samsetningin

Frá miðlínu út á við, hvorum megin:

1. **akrein** af tiltekinni breidd, sem fellur frá hryggnum með **halla akreinarinnar**
2. **öxl** af tiltekinni breidd með **halla axlarinnar**
3. **hliðarhalli** frá brún axlarinnar þar til hann mætir landinu: **hallinn í skurði** þar sem landið er ofan og **hallinn í fyllingu** þar sem það er neðan

Upphafsgildin eru staðgenglar, ekki hönnunarstaðall:

| Gildi | US feet | Metrar |
|---|---|---|
| Breidd akreinar | 12 ft | 3.6 m |
| Halli akreinar | 2% | 2% |
| Breidd axlar | 4 ft | 1.2 m |
| Halli axlar | 4% | 4% |
| Halli í skurði | 2 : 1 | 2 : 1 |
| Halli í fyllingu | 3 : 1 | 3 : 1 |
| Þversnið á hverjum | 10 ft | 5 m |

Hliðarhallar eru láréttir á móti lóðréttum (L:L): 3 : 1 þýðir 3 lárétt á móti 1 niður.

## Byggja ganginn

Þú þarft veglínu án villna og hönnunarlengdarsnið með að minnsta kosti tveimur PVI-punktum og engum villum.

1. Veldu veglínuna.
2. Í hægra spjaldinu, undir **Gangur**, hakaðu við **Sópa samsetningu eftir hönnunarlengdarsniðinu**.
   Reitirnir birtast og gangurinn er byggður strax. Teikningin sýnir jaðra akreinar og axlar og jaðarlínurnar; með {{ui:Tillaga (mótuð)}} valið undir **Birting** sýna hæðarlínurnar nýja landið.
3. Breyttu hvaða gildi sem er: **Breidd akreinar**, **Halli akreinar**, **Breidd axlar**, **Halli axlar**, **Halli í skurði**, **Halli í fyllingu**, **Þversnið á hverjum**. Ýttu á {{key:Enter}} eftir hvert. Halli í skurði, halli í fyllingu og bil þversniðanna verða að vera meira en 0.
4. Lestu línuna undir reitunum, til dæmis „39 þversnið frá 0+00.00 til 3+86.36; skurður 240.2 cu yd, fylling 556.0 cu yd.“

Þversnið eru tekin á hverju **Þversnið á hverjum** skrefi, á endunum og við upphaf og endi hverrar láréttrar og lóðréttrar beygju. Hvert þversnið og línurnar í gegnum þau (miðlína, jaðrar akreinar og axlar, jaðarlínur) verða brotlínur tillöguyfirborðsins.

Til að slökkva á ganginum, afhakaðu gátreitinn. Gildin hans eru geymd fyrir næst.

## Þegar hann byggist ekki

Rauður reitur undir reitunum segir hvers vegna:

| Skilaboð | Hvað á að gera |
|---|---|
| „Gangurinn þarf hönnunarlengdarsnið án villna.“ | Bættu við PVI-punktum, eða lagfærðu skarandi lóðréttar beygjur (sjá [Hanna lóðréttan lengdarsnið](topic:profile)). |
| „Hönnunarlengdarsniðið skarast ekki veglínunni.“ | Færðu PVI-punktana á stöðubil veglínunnar. |
| „Gangurinn þarf að minnsta kosti tvö þversnið á yfirborðinu.“ | Mestur hluti gangsins er utan núverandi lands. |
| „4 hliðarhallar keyra út af yfirborðinu áður en þeir mæta landinu.“ | Nálægt jaðri yfirborðsins nær hallinn ekki landinu. Haltu veginum frá jaðrinum, eða lækkaðu fyllingar- eða skurðarhæðina þar. |
| „Jaðarlínur gangsins skarast (þversnið skarast, til dæmis innan á þröngri beygju). Notaðu stærri radíus eða þrengri samsetningu.“ | Þversnið innan á snarpri beygju skarast. Auktu radíusinn eða þrengdu samsetninguna. |

Gangur með vandamál er ekki mótaður inn og telst ekki með í jarðvinnunni.

## Gangar og pallar saman

Tillöguyfirborðið er byggt í röð: fyrst allir gangar, síðan allir pallar. Þar sem mótun palls skarast gangi, vinnur pallurinn. Rúmmál eru reiknuð innan allra jaðarlína saman; sjá [Jarðvinnurúmmál](topic:volumes).

## Yfirhækkun

Í beygju getur vegurinn hallað í átt að innri hliðinni, þannig að umferðin þrýstist minna út á ytri hliðina. Hakaðu við **Hækka beygjurnar** undir **Yfirhækkun** í **Eiginleikum** veglínunnar:

- Hver hringlaga beygja tekur halla **e** úr hallatöflunni: fyrstu röð sem radíus beygjunnar nær (röð með tómum halla heldur venjulegum hrygg). Taflan og **Hámarkshlutfallshalli** (0.5% til að byrja) eru staðgenglar, ekki staðall: stilltu þá eftir þínum eigin hönnunarviðmiðum. Bættu við eða fjarlægðu raðir eftir þörfum.
- Akreinarnar snúast um miðlínuna. Fyrir beygjuna flatast ytri akreinin út yfir **útlögunarlengdina** (venjulegur hryggur ÷ e × aðlögunarlengd), síðan yfir **aðlögunarlengdina** (breidd akreinar × e ÷ hallinn). Ytri akreinin heldur áfram að snúast þar til allur vegurinn hallar um e að innri hliðinni; tveir þriðju af aðlögunarlengdinni liggja fyrir beygjuna og einn þriðji á henni. Eftir beygjuna gerist það sama í öfugri röð.
- Öxl á lága hliðinni er aldrei flatari en akreinin hennar; á háu hliðinni heldur hún sínum halla (hún veltur yfir).
- Taflan undir henni listar radíus, halla, aðlögunarlengd og útlögunarlengd hverrar beygju og hvar full yfirhækkun byrjar og endar. **Yfirhækkunarmyndin** teiknar þverhallana beggja akreinanna eftir stöðunum (vinstri akreinin heil, sú hægri strikuð).
- Beygja sem er of stutt til að ná fullri yfirhækkun, eða tvær beygjur sem skarast í umbreytingum, er sagt frá í kassa fyrir ofan töfluna.

Þversnið, rúmmál, þrívíddarsýnin og blöðin sýna allir hallandi veginn. Sérhver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

## Mörk

Mark færir einn punkt á annarri hlið vegarins að línu: **Brún slitlags** eða **Brún axlar**, á **Vinstri** eða **Hægri**. Sérhvert þversnið mætir línunni hornrétt á miðlínuna og fer aðeins út á þeirri hlið, þannig að mark á hægri hlið færir aldrei vinstri hliðina.

| Stillir | Hvað gerist þar sem þversnið mætir línunni |
|---|---|
| **Breidd** | Punkturinn situr á línunni: akreinin (eða öxlin) breikkar eða mjókkar að henni og heldur sínum þverhalla. |
| **Hæð** | Punkturinn tekur hæð línunnar þar, á sinni eigin fjarlægð: þverhalli akreinarinnar (eða axlarinnar) fylgir. |

Línan getur verið eiginlína (hver sem **Notkunin** er) eða lína annars gangs: miðlína hans, brúnir slitlags, brúnir axla eða jaðarlínur. Lína gangs fylgir þeim gangi: breyttu hinum veginum og þessi fylgir. CivilCraft byggir hinn ganginn fyrst; tveir gangar sem myndu stilla hvor á annan í hring eru hafnaðir á annarri hliðinni, og taflan segir hvor.

1. Veldu veglínuna og kveiktu á gangi hennar.
2. Undir **Mörk** smelltu á {{ui:Bæta við marki}}.
3. Veldu **Hlið**, **Punkt**, hvað hann **Stillir** og **Að línunni**. Sérhver breyting er eitt afturköllunarskref.

**Niðurstaða** segir við hversu mörg þversnið línan náðist. Þversnið sem ná henni ekki (handan enda hennar, eða þar sem hún er á bak við miðlínuna) halda gildum samsetningarinnar. Lína sem er eytt skilur ganginn eftir eins og hann var fyrir markið, og taflan segir það. Ein hlið getur haft eitt breiddarmark og eitt hæðarmark fyrir hvern punkt.

## Byggja hvora hlið úr hlutum

Kveiktu á **Byggja hvora hlið úr hlutum** undir stillingum gangsins. Hver hlið hefur þá sinn eigin lista, frá miðlínu út á við: akreinar, öxl, rennustein, kantstein, gróðurrönd, gangstétt og loks hliðarhallann að landinu (með sínum eigin hlutföllum í skurði og fyllingu). Byrjaðu á {{ui:Sveitavegur}} eða {{ui:Þéttbýlisgata}}, bættu við og fjarlægðu hluta, færðu þá með örvunum og afritaðu aðra hliðina yfir á hina með {{ui:Afrita}}. Sérhver breyting er eitt afturköllunarskref.

Þverhalli er hallinn frá veginum, þannig að gangstétt sem rennur í átt að veginum er neikvæð. Kantsteinn er flötur af þeirri hæð sem þú gefur, efri brún af þeirri breidd sem þú gefur og valfrjálst fall að aftan. Yfirhækkun snýr öllum akreinum í fyrstu röð; rennusteinninn, kantsteinninn, gróðurröndin og gangstéttin hanga frá jaðri akreinanna eins og þær eru byggðar. Mörk færa enn enda akreinanna og síðasta hlutann. Þversnið marka rennuflæðilínuna, efri og aftari brún kantsteins og hitt. Á beygju með spírölum er aðlögunin spírallinn: jafn hryggur við TS, full yfirhækkun við SC.

## Lög vegyfirborðs

Akrein, öxl, rennustein, gróðurrönd eða gangstétt getur borið sitt eigið uppbyggingarlag: undir hlutanum bætir {{ui:Bæta við lagi}} við lagi með heiti, efni, þykkt og gerð þess (slitlag, bindilag, burðarlag, undirburðarlag, yfirlag eða annað), ofan frá og niður. Lögin hreyfa ekki yfirborð vegarins (efsta lagið er hönnunarflöturinn); hvert liggur undir hlutanum sínum, og dýpt þess er mæld beint niður. Þversnið teikna neðri brún hvers lags sem strikaða línu, og {{ui:Lög vegyfirborðs: magn}} listar flatarmál og rúmmál hvers lags (flatarmál eftir gangi frá þversniðum sínum, rúmmál = flatarmál × þykkt). IFC-útflutningurinn skrifar hvert lag sem sitt eigið frumefni með þykkt sinni og efni (sjá [IFC-útflutningur og innflutningur](topic:ifc)). Þykktin sem þú slærð inn er þín: CivilCraft ákvarðar ekki stærð slitlaga.

## Það sem er ekki byggt ennþá

Mörk fyrir halla jaðarsins eru ekki tiltæk ennþá. Fyrir gang sem breytist eftir veginum, með vinstri og hægri hlið aðskildum, notaðu [Sniðmát gangs](topic:corridor-templates). Sjá [Ekki byggt ennþá](topic:not-built-yet).
