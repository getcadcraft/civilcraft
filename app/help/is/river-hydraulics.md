---
title: Yfirborðssnið vatns í ám
summary: Móttu á eftir landyfirborðinu og reiknaðu fastar yfirborðslínur vatns með staðlaðri skrefaðferð: vatnshæðir, orku, hraða, Froude-tölur og flóðaútbreiðsluna á grunnmyndinni. Tilraunaeiginleiki; sérhver niðurstaða þarfnast yfirferðar verkfræðings.
keywords: varnargarður, óvirkt rennslissvæði, sniðritill, á, vatnafræði, yfirborðssnið vatns, bakvatn, staðlað skref, fast rennsli, 1d, þversnið, manning, grófleiki, flutningsgeta, krítísk dýpt, eðlilegt dýpt, froude, orkulína, flóðaútbreiðsla, flóðasléttur, flóð, bakkamót, kaflalengdir, þrenging, útvíkkun, undirkrítískt, yfirkrítískt, blandað ástand, vatnsstökk
from: fb8bf425
---

CivilCraft reiknar fast, eindimensional yfirborðssnið vatns eftir á: fyrir hvert rennsli sem þú gefur upp, vatnshæðina á hverju þversniði, út frá orkujöfnunni milli nálægra þversniða (staðlaða skrefaðferðin). Hún er í tilraunastofu meðan hún er prófuð.

**Aðeins hönnunarhjálp.** Vatnshæðirnar þurfa yfirferð hæfs verkfræðings áður en nokkur reiðir sig á þær: eintvívíddarlíkan er jafngott og þversniðin, grófleikagildin, kaflalengdirnar og jaðrarnir, og það þekkir ekki brýr, ræsi né rennsli sem fer úr ánni.

## Teikna ána

1. Byggðu fyrst núverandi landyfirborð (punkta, brotlínur eða TIN sem þú opnaðir).
2. Undir **Yfirborð** › {{ui:Meira}}, veldu {{ui:Á}}.
3. Smelltu eftir miðlínu árinnar **ofan straums að neðan straums**, og ýttu síðan á {{key:Enter}} eða tvísmelltu.

CivilCraft sker þversnið hornrétt á miðlínuna á 50 m (200 ft) fresti, 100 m (300 ft) til hvorrar hliðar, úr landinu. Stöðvar árinnar eru mældar frá neðri enda hennar, svo þær vaxa upp á móti straumi. Bakkarnir byrja sem ágiskun 10 m (30 ft) hvoru megin við lægsta punkt hvers þversniðs.

Til að bæta við þversniði þar sem áin þrengist eða mannvirki stendur, veldu ána, smelltu á {{ui:Bæta við sniði}} og teiknaðu skurðlínu þvert yfir hana (hvoru megin frá: hún er snúin þannig að hún liggi frá vinstri til hægri þegar horft er niður straum).

## Setja ána upp

Veldu ána til að sjá hana í **Eiginleikum**:

- **Rennslisástand**: undirkrítískt (algengast: reiknað ofan straums frá neðri jaðri), yfirkrítískt (reiknað neðan straums frá efri jaðri) eða blandað (bæði, síðan það með stærri sértæka kraft á hverju þversniði; forskoðun).
- **Rennslissnið**: heiti og rennsli fyrir hvert (til dæmis 10 ára og 100 ára rennsli), og jaðarinn í neðri enda (og efri endanum þegar ástandið er ekki undirkrítískt): **Eðlilegt dýpt** með orkuhalla (botnhalli er fyrsta ágiskun), þekkt **vatnsyfirborðshæð**, eða **Krítískt dýpt**.
- **Þversnið úr landinu**: bilið, hversu langt til vinstri og hægri, ágiskun bakkans og tvö Manning n-gildi; {{ui:Skera þversnið aftur}} kemur í stað þversniðanna (eitt skref í afturköllun).
- **Þversniðstaflan**: fyrir hvert þversnið, frávik vinstri og hægri bakka, n fyrir farveg og n fyrir flóðasléttu, kaflalengdirnar niður að næsta þversniði (vinstri flóðaslétta, farvegur, hægri flóðaslétta; mældar á grunnmynd til að byrja með) og þrengingar- og útvíkkunarstuðlana (0,1 og 0,3 til að byrja með: mjúk umskipti). {{ui:Breyta}} opnar þversniðsritilinn (næst); punktur á eftir henni þýðir að þversniðið hefur varnargarð eða óvirkt svæði.

Sérhver breyting er eitt skref í afturköllun ({{key:Mod+Z}}).

## Breyta þversniði: bakkar, varnargarðar og óvirk svæði

{{ui:Breyta}} á þversniði teiknar landið þess og leyfir þér að draga það sem lausnarinn les: **vinstri og hægri bakka** (þeir skipta þversniðinu í vinstri flóðasléttu, meginfarveg og hægri flóðasléttu), **varnargarð** hvoru megin og **óvirk rennslissvæði**. Hvert handfang má líka færa með örvatökkunum, og hvert gildi má skrifa inn við hliðina á myndinni. {{ui:Beita}} er eitt skref í afturköllun.

- **Varnargarður** hefur stað (frávik) og toppkóta. Landið hinum megin við hann, fjær ánni, er skilið frá ánni meðan vatnsyfirborðið er undir toppnum: flatarmál þess, blautur jaðar og flutningsgeta eru ekki tekin með. Yfir toppnum telst allt þversniðið aftur. Varnargarður liggur utan þess bakka sem hann verndar; ef hann liggur innan bakkanna er hann merktur.
- **Óvirkt rennslissvæði** heldur vatni en ber ekkert rennsli (pollur á bak við fyllingu, dautt vatn við brúaraðkomu). Gefðu upp tvö frávik þess og, ef þú vilt, vatnshæð sem það er óvirkt undir ({{ui:alltaf}} ef autt er): yfir þeirri hæð rennur það eins og hitt. Svæði sem nær yfir hluta meginfarvegarins er merkt.
- Milli tveggja þversniða skilur flóðaútbreiðslan eftir þurrt landið á bak við varnargarð sem bæði þversniðin eiga, meðan vatnsyfirborðið þar er undir toppnum (línan milli toppanna tveggja er bein).

## Reikna og lesa niðurstöðurnar

Smelltu á {{ui:Yfirborðssnið vatns}}. Fyrir það snið sem þú velur færðu:

- **línurit** eftir ánni (rennsli frá vinstri til hægri): botn farvegar, bakka, vatnsyfirborð, orkulínu og krítískt vatnsyfirborð; þversnið sem haldið er við krítískt dýpt eru hringuð;
- **töflu** fyrir hvert þversnið: stöð árinnar, rennsli, botn farvegar, vatnsyfirborð, krítískt vatnsyfirborð, orkulínu, dýpt, hraða í farvegi og í heild, Froude-tölu farvegarins, flæðisflatarmál, efri breidd, rennsli í hvorri flóðasléttu og farveginum, orkuhalla og viðvaranir;
- **viðvaranir** í einföldu máli, til dæmis þversnið stillt á krítískt dýpt, vatn yfir endum þversniðs, eða stóra breytingu á flutningsgetu milli tveggja þversniða (bættu þversniðum þar á milli).

{{ui:Tafla (CSV)}}, {{ui:Skýrsla}} (venjulegur texti með aðferðinni, jöðrunum og hverri töflu) og {{ui:Mynd (SVG)}} vista í niðurhöl þín. Sérhver þeirra ber yfirferðarlínuna.

Hakaðu við {{ui:Sýna flóðaútbreiðslu}} í **Eiginleikum** til að skyggja blauta svæðið á grunnmyndinni fyrir valið snið, með vatnslínunni dregna þar sem dýptin er núll. Milli þversniða er vatnsyfirborðið láréttt yfir ána og breytist línulega eftir stöð árinnar. Land á bak við varnargarð er látið vera þurrt meðan vatnið er undir toppi hans. Annað lágt land innan farvegsins sem vatnið nær ekki til (til dæmis á bak við vegfyllingu) er samt skyggt: athugaðu það.

## Á teikningunni og í Vandamálum

Línur árinnar fara á grunnmyndina, PDF-skjalið og DWG-skrána á eigin lögum: **C-WATR-CNTR** (miðlínan), **C-WATR-SCTN** (hver skurðlína, með stöð árinnar) og **C-WATR-FLOD** (vatnslína flóðaútbreiðslunnar, þegar {{ui:Sýna flóðaútbreiðslu}} er hakað fyrir snið). Viðvaranir árinnar (þversnið stillt á krítískt dýpt, vatn yfir endum þversniðs, breyting á flutningsgetu sem kallar á fleiri þversnið, orkujafnvægi sem lokaðist ekki, varnargarður innan bakkanna) fara einnig í glugganum **Vandamál**, tengdar ánni og settar við þversniðið sem þær koma frá.

## Hvernig reiknað er

- Orka milli tveggja þversniða: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Flutningsgeta með skiptingu: hver flóðaslétta er skipt þar sem n hennar breytist, K = Σ (1/n)·A·R^(2/3) (1,486/n í bandarískum einingum); farvegurinn er eitt stykki, með samsettu n þegar n hans breytist. α kemur af því hvernig flutningsgetan skiptist.
- Núningshalli með meðalflutningsgetu, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², yfir kaflalengdina vegna rennslis.
- Þrengingarstuðull þegar rennsli hraðar sér niður straum, útvíkkunarstuðull þegar það hægir á sér.
- Krítískt dýpt = minnsta sértæka orka. Hver vatnshæð er leyst á bili, svo hún stökkvi aldrei yfir á ranga hlið krítísks dýpis; þegar ekkert svar er til er hún stillt á krítískt dýpi og merkt.

Forritið er prófað gegn eðlilegu dýpi Manning, krítísku dýpi í rétthyrndum farvegi og bakvatnsdæmi Chow (*Open-Channel Hydraulics*, 1959, 10. kafli), reiknuðu sjálfstætt. Sama aðferð er notuð af algengum eindimensionar árforritum, svo handreikningur eða glósur nemanda yfirfærast.

## Ræsi og brýr

Í **Eiginleikum** árinnar, undir **Ræsi og brýr**, setur {{ui:Bæta við ræsi}} eða {{ui:Bæta við brú}} eitt mannvirki milli tveggja þversniða (hvert bil hefur að minnsta kosti tvö þversnið). Snið fyrir neðan það breytist ekki; vatnsyfirborðið rétt fyrir ofan það kemur frá mannvirkinu, og sniðið heldur áfram ofan straums þaðan. **Niðurstöður** bætir við töflu fyrir hvert mannvirki: eftirstreymishæð, hæð vatns fyrir ofan, hvaða stjórnun ræður, rennslið um opið og rennslið yfir veginn eða dekkið. Aðeins undirkrítískt rennsli.

- **Ræsi** (kassalaga eða kringlótt, eitt eða fleiri jöfn rör). Inntaksstjórnun er yfirfallsrennsli meðan inntakið er frítt og gegnumstreymisrennsli þegar það er á kafi, blandað á milli fyrirstreymishæðar einn og einn og hálfur sinnum hæðin. Úttaksstjórnun er orkujöfnunin: inntakstap, núningur og útrennslishraðahæð, yfir því hærra af eftirstreymishæð og miðhæð krítísks dýpis og hvelfingunni, að frádregnu falli eftir rörinu. Fyrirstreymishæðin er sú stærri af þessu tvennu. Hakaðu við **Vatn getur flætt yfir veginn** og yfirfallsrennsli vegarins deilir rennslinu með rörunum.
- **Brú.** Opið er þversniðið undir brúnni, skorið við landstöplana, með hverjum stöpli sem svæði sem ber ekkert rennsli. Vatnsyfirborðið í opinu kemur úr þversniðinu fyrir neðan (útvíkkunarstuðull), og þversniðið fyrir ofan úr opinu (þrengingarstuðull). Ef opið getur ekki hleypt rennslinu í gegn við þessa eftirstreymishæð rennur það á krítísku dýpi og brúin er merkt sem stíflandi. Nái vatnið lágbitanum er rennslið þrýstirennsli (rennihlið meðan eftirstreymið er undir lágbitanum, á kafi fyrir ofan hann), og vatn yfir dekkinu bætir við yfirfallsrennsli; efri hæð vatns er sú þar sem þetta tvennt samanlagt jafngildir rennslinu.

Stuðlarnir (afrennsli, inntakstap, yfirfall) eru sléttar tölur sem þú slóst inn sem sjálfgefin gildi. Breyttu þeim fyrir þína hönnun. Þeir eru ekki þær prentuðu töflur sem hönnunarhandbækur fyrir ræsi birta, svo meðhöndlaðu fyrirstreymishæð ræsis nálægt mörkum sínum sem áætlun. Vatn yfir vegi eða dekki, inntak á kafi, stíflað op og hraðrennsli í röri birtast í **Vandamálum**.

## Óstöðugt rennsli

{{ui:Óstöðugt rennsli…}} í **Eiginleikum** árinnar sendir flóðaruðningarit niður þversniðin. Skrifaðu innrennslið sem klukkustundir og rennsli, eitt par í línu, botnhallann (eðlilegt dýpi) og hversu lengi á að keyra. Það byrjar frá föstu vatnsyfirborði við fyrsta rennsli og leysir fullu eindimensionar jöfnurnar (óbeina fjögurra punkta aðferðin, vegin 0,6 í tíma). Þú færð hámarksvatnshæð og rennsli á hverju þversniði ásamt þeirri klukkustund sem hvert gerist, línurit af rennsli í báðum endum og jöfnuathugun (inn, út og breytingin sem geymist). Hún er prófuð með því að fast rennsli haldist fast, með skrefi í innrennsli sem endar á föstu sniði nýja rennslisins, með því að jöfnunni lokar, og með hraða flóðbylgjunnar gegn hreyfibylgjunni. Undirkrítískt rennsli, einn kafli, ekkert hliðarinnrennsli, og engin ræsi né brýr inni í keyrslunni.

## Samtengingar

Kaflar sem sameinast í eitt útfall: rennslin leggjast saman, og vatnsyfirborðið við upphaf neðri kaflans er flutt upp á enda þeirra kafla sem sameinast honum (sama vatnsyfirborð við samtenginguna, einföld aðferð: ekkert horn, enginn skriðþungi, þess vegna hentar hún lágum Froude-tölum). Líkanið og prófin eru á sínum stað (`river-structures.js`); gluggi til að tengja tvær ár á grunnmyndinni er ekki smíðaður ennþá.

## Ekki smíðað ennþá

Stíflur og lokur sem sín eigin mannvirki, gluggi fyrir samtengingar, mannvirki inni í óstöðugri keyrslu, og óstöðugt yfirkrítískt rennsli. Keyrsla með blönduðu ástandi merkir vatnsstökk milli tveggja þversniða en staðsetur það ekki.

**Hvar ár sameinast.** Í Eiginleikum árinnar nefnir „Rennur í“ ána sem hún sameinast. Ár sem sameinast eru leystar saman: áin sem þær renna í ber summu rennsla þeirra, og hver þeirra endar við vatnsyfirborð fyrsta þversniðs þeirrar ár (aðferð jafnra vatnsyfirborða; hún sleppir horni og skriðþunga rennslanna). Til að sameina aðalá og læk, teiknaðu stutta á fyrir neðan samtenginguna og láttu báðar renna í hana. Niðurstöðurnar sýna samtengingartöflu. Sjálfgefnu gildin í þessum niðurstöðum (þrenging 0,1, útvíkkun 0,3, farvegur í einu stykki með samsettum grófleika, blandað ástand eftir sértækum krafti) standa þar til verkfræðingur hefur yfirfarið þau, og Niðurstöðurnar segja það.
