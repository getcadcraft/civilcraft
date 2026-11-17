---
title: Punktaský frá dróna eða skanna
summary: Með viðbótinni Punktaský opnar þú LAS- eða LAZ-skrá með milljónum punkta, skoðar hana alla, hreinsar hana, flokkar í land, gróður og byggingar og býrð til landið, hæðarlínurnar og rúmmálin út frá henni.
keywords: punktaský, las, laz, dróni, ljósmyndamæling, recap, lidar, skönnun, land, flokka, hávaði, efnishaugur, rúmmál, skurður og fylling, hæðarlínur, brotlína, dýptarlýsing, ortó, sveipa, kortalag, flytja út las, flytja út laz, þjappa
from: e4a4901f
---

Mörgum þarf þetta aldrei, þess vegna er þetta viðbót. Kveiktu á {{ui:Punktaský}} í Stillingar › Viðbætur; flipi með heitinu {{ui:Punktaský}} birtist í hægra spjaldinu. Skráin er lesin í vafranum þínum og skorin í reiti sem eru geymdir í geymslurými vafrans (eða í möppu sem þú velur). **Ekkert er hlaðið upp.**

:::warning
Allt sem þessi flipi sýnir er tala úr gögnunum þínum, ekki vottorð. Hann var prófaður á uppdiktuðu svæði, ekki enn á raunverulegri dróna-mælingu: lestu fyrstu niðurstöðurnar með varúð og segðu okkur hvað þú finnur. Skráður fagaðili ákveður hvers virði landið, hæðarlínurnar og rúmmálin eru.
:::

## Opna punktaský

Undir {{ui:Opna punktaský}} veldu LAS- eða LAZ-skrá. Flipinn segir hversu marga punkta hún hefur, hnitakerfi hennar og einingar, og hversu mikið pláss smíðin þarf; ýttu á {{ui:Byggja punktaský}}. Hægt er að stöðva smíðina og halda áfram með {{ui:Halda áfram}} (veldu sömu skrá aftur). Skránni er aldrei breytt. Skrá með 100 milljón punktum er smíðuð á nokkrum mínútum á vinnustöð og tekur um jafn mikið pláss og skráin sjálf.

Undir {{ui:Punktaský á þessari tölvu}} opnar þú eða fjarlægir ský. {{ui:Geyma ský í möppu…}} (Chrome, Edge og Studio-forritið) geymir reitina í möppu sem þú velur, til dæmis CadCraft-möppu fyrir ský í Skjölum, þannig að 10 GB ský þarf ekki að rúmast í geymslurými vafrans; ský sem voru smíðuð áður haldast þar sem þau voru smíðuð. Vafrinn spyr aftur um heimild eftir endurræsingu: ýttu á {{ui:Nota möppuna … aftur}}.

## Skoða skýið

{{ui:Skoða í 3D}} teiknar skýið úr grófum reitum og skerpir á því þegar þú færir þig nær, en aldrei fleiri en {{ui:Flestir punktar teiknaðir}} í einu (2.5 milljónir; 500 þúsund í síma). Litaðu eftir eigin lit skrárinnar, hæð, flokki, styrkleika eða afgangi. {{ui:Dýptarlýsing}} dregur fram brúnir eftir dýpt svo lögunin sést án normalvigra (slökkt í síma); {{ui:Punktar minnka með fjarlægð}} gerir fjarlæga punkta minni og nálæga stærri; {{ui:Stærð punkta}} stillir stærðina. Grunnmyndin sýnir skýið sem rastamynd undir teikningunni þinni og **skerpir á því þegar þú aðdrar að** hluta þess.

## Hreinsa það

Undir {{ui:Hreinsa}} teiknaðu lykkju, rétthyrning eða marghyrning á grunnmyndinni (eða í 3D úr yfirsýn: í 3D er útlínan tekin beint niður, þannig að hún er aðeins nákvæm að ofan). Flipinn sýnir hversu margir punktar eru innan **áður en** þú beitir: {{ui:Eyða þessum punktum}}, {{ui:Breyta flokki þeirra}}, {{ui:Endurheimta eydda punkta}} eða {{ui:Klippa að þessum jaðri}}. {{ui:Afturkalla}} og {{ui:Endurgera}} fara um breytingaskrána; skráin sjálf er aldrei breytt. {{ui:Hávaðasía…}} merkir reikandi punkta sem lágpunkta (flokkur 7) eða háan hávaða (flokkur 18).

## Flokka það

{{ui:Finna landið}} vinnur reit fyrir reit og merkir land (flokkur 2) og lágpunkta; vikmörkin eru 0.15 m, eða 0.08 m með rofanum fyrir mælingagæði. Hún tilkynnir reitamót sem stangast á. {{ui:Flokka gróður og byggingar}} merkir síðan lágan, meðalhá og háan gróður og byggingar út frá hæð yfir landinu og hversu slétt umhverfið er. Engin vélnám er notuð, þannig að flatt þak á skúr undir trjám getur verið rangt: skoðaðu það.

## Land, hæðarlínur, brotlínur

{{ui:Byggja landið}} býr til núverandi landið úr landpunktunum og bætir því við verkefnið á sama hátt og LAS-innflutningur (eitt afturköllunarskref). Síðan ber það punktana saman við það: meðaltal, RMS, 95. hundraðshlutamark, hlutfall innan vikmarka og tíu staði sem víkja mest, hver með {{ui:Fara þangað}}. Litaðu eftir {{ui:Afgangur}} til að sjá hvar landið og skýið stangast á.

**Brotlína** (kantsteinn, skurður eða efsta brún bakka) er valin á skýinu: {{ui:Velja brotlínu á punktaskýinu}} í 3D-sýninni tekur næsta teiknaða punkt við hvern smell, og {{ui:Velja brotlínu á grunnmynd}} tekur næsta skýpunkt (land fyrst) undir hverjum smelli; tvísmelltu eða ýttu á Enter til að ljúka línunni. Næsta {{ui:Byggja landið}} notar hana. {{ui:Sýna hæðarlínur}} teiknar hæðarlínurnar yfir skýið í lítilli mynd og stillir bil verkefnisins.

## Rúmmál

{{ui:Rúmmál efnishaugs…}} reiknar rúmmál yfirborðsins fyrir ofan grunn innan jaðars sem þú teiknar. Teiknaðu jaðarinn á sléttu landi umhverfis hauginn og veldu grunninn: lægsta jaðarpunkt, flöt, mjúkan bogadreginn grunn, yfirborð í gegnum jaðarinn, eða kótu sem þú slærð inn. Á hallandi eða bogadregnu landi notaðu flötinn eða bogadregna grunninn; lægsti punkturinn gefur of háa niðurstöðu. Jaðarpunktar sem standa upp úr hinum (tré á línunni) eru skildir eftir utan grunnsins. {{ui:Flug á flug}} gefur skurð og fyllingu milli tveggja skýja. Hægt er að vista hvort tveggja sem CSV.

## Ortómósaík

Undir {{ui:Ortómósaík (mynd að ofan)}} veldu ortómósaík drónans ásamt heimsskrá sinni og `.prj` ef hún er til staðar: GeoTIFF, eða PNG eða JPEG. Hún verður **kortalag** verkefnisins, þannig að grunnmyndin sýnir hana undir teikningunni þinni, og 3D-sýnin (litur {{ui:Kort}}) málar hana á landið sem þú byggðir, þannig að {{ui:Byggja landið}} fyrst. Flipinn segir hversu mikið af skýinu myndin nær yfir og varar við ef hún nær yfir ekkert: algengasta orsökin er annað hnitakerfi, þannig að gefðu `.prj`-skrána með. Ef engin `.prj`-skrá er til spyr forritið hvar hnitin eru. Myndin er geymd inni í verkefnisskránni; GeoTIFF yfir 200 MB er hafnað og mjög stór ortómósaík er minnkuð í 16 megapixla, þannig að fyrir stóra mælingu skaltu fyrst klippa hana að svæðinu.

## Flytja út

{{ui:Flytja út}} skrifar hreinsaða, flokkaða skýið sem nýja skrá (alla punkta, hreinu flokkana eða aðeins landið). Undir {{ui:Skráargerð}} veldu:

- **LAS 1.4 (óþjöppuð)**: punktasnið 6, eða 7 með lit.
- **LAZ (þjöppuð)**: sömu punktar þjappaðir án taps, þannig að hver punktur kemur til baka nákvæmlega. Hún er skrifuð sem punktasnið 0, eða 2 með lit, í LAS 1.4-skrá. Á uppdiktaða 300 m svæðinu var LAZ um fimmtungur af stærð LAS 1.4-skrárinnar. LAZ-snið 0 og 2 geyma aðeins flokka 0 til 31: punktur með hærri flokk er hafnaður með skilaboðum, þannig að flyttu það ský út sem LAS 1.4.

LAZ-skráin er skrifuð af eigin þjöppunarforriti CadCraft, gerðu eftir birtri LAZ-forskrift. Við höfum athugað að okkar eigin lesari og tveir óháðir LAZ-lesarar (laz-perf, sem forritið notar til að opna LAZ-skrár, og laspy með lazrs) lesi hvern punkt til baka nákvæmlega, og að LAZ-skrár sem laspy býr til verði eins bæti fyrir bæti þegar við skrifum punktana þeirra aftur. Önnur forrit hafa ekki verið prófuð enn, þannig að ef eitthvert þeirra opnar ekki skrá, segðu okkur hvert það er.

Þar sem vafrinn getur skrifað skrá jafnóðum velur þú skrána fyrst og mjög stórt ský er skrifað í hana reit fyrir reit í stað þess að safna því í minni; annars er skráin safnað saman og sótt, sem er í lagi upp í nokkur hundruð megabæti.

## Það sem það gerir ekki

Það les aðeins LAS og LAZ (E57, PLY og PCD eru ekki tengd við þennan flipa enn, og nokkrar skrár úr einu flugi eru ekki sameinaðar), varpar ekki skýi yfir í annað hnitakerfi (kerfi og metrar verkefnisins eru gefin), les ekki RCP- eða RCS-skrár frá Autodesk, býr ekki til yfirborð úr ljósmyndum og finnur ekki staura, kantsteina eða lagnir af sjálfu sér.
