---
title: Skuggi, sólarorka og útivistarþægindi
summary: Rannsakaðu skuggann sem byggingarmassarnir þínir varpa yfir dag eða árstíð, sjáðu hreyfimynd af honum, reiknaðu hversu mikla raforku sólarplötur á þökum og veggjum myndu framleiða á dæmigerðu ári, sjáðu hversu þægileg gatan við byggingu er (UTCI), og fáðu forskoðunarmat á vindþægindi gangandi vegfarenda.
keywords: skuggarannsókn, skuggi, sólarstundir, hreyfimynd, sólar, PV, sólarrafhlöður, plötur, afrakstur, kWh, EPW, veðurskrá, UTCI, hitaþægindi, útivistarþægindi, hitaálag, vindur
from: 96e7af4d
---

Hlutinn **Umhverfi** er undir **Sólarstundir** í **Eiginleikum** massa. Hann notar massana sem þú hefur teiknað sem byggingarnar.

## Hlaða inn veðurskrá

Veldu dæmigerða ársveðurskrá (**.epw**) fyrir bæinn þinn. Þær eru ókeypis á veðursíðu EnergyPlus og á climate.onebuilding.org. Skráin er áfram í vafranum þínum í þessari heimsókn. Sólarafraksturinn og þægindarannsóknin þurfa hana; skuggarannsóknin virkar án hennar þegar verkefnið hefur hnitakerfi.

## Skuggarannsókn

Veldu dagsetningu (eða hakaðu við **Árstíð** og síðustu dagsetningu og skref í dögum) og tímabelti, og síðan **Keyra skuggarannsókn**. Þú færð kort af sólarstundum, eða skuggastundum, á landinu í kringum massana; töflu yfir hversu stór hluti landsins er í skugga yfir daginn; og hreyfimynd af deginum sem þú getur spilað eða farið í gegnum skref fyrir skref. **Vista kort**, **Vista ramma hreyfimyndar** (allir rammarnir á einni mynd) og **Vista stundir** (CSV) geyma niðurstöðurnar.

Landið er talið slétt í hæð lægsta massans. Fyrir skugga á halla notarðu **Sólarstundir**, sem les landslagið.

## Sólarafrakstur

Stilltu nýtni plötunnar, hversu stór hluti hvers þaks og veggjar er þakinn og tapið í kerfinu, og keyrðu síðan **Keyra sólarafrakstur**. Fyrir hvert þak og vegg færðu raforkuna sem fermetri af plötu myndi framleiða á dæmigerðu ári, hversu mikið af henni nálægir massar taka frá, og samtölu fyrir hvern massa. Líkanið er skrifað út með einföldu máli við hliðina á hnappinum: þetta er áætlun fyrir skipulag út frá dæmigerðu ári, ekki ábyrgð.

## Útivistarþægindi

**Keyra þægindi** reiknar út Universal Thermal Climate Index (UTCI) fyrir standandi manneskju á opnu landi og við hlið fyrsta massans (suður-, norður-, austur- og vesturhlið), með skugga frá hverjum massa. Það sýnir hversu mikill himinn sést, meðal-UTCI yfir daginn og fjölda stunda yfir 32 (hitaálag) og undir 0 (kuldaálag).

## Vindur (forskoðun)

**Keyra vindrannsókn** leysir loftstreymið umhverfis massana einu sinni fyrir hverja vindátt sem blæs í veðurskránni þinni (4, 8, 12 eða 16 áttir), yfir umhverfinu sem þú velur (opið land, úthverfi eða miðbær), og leggur síðan saman klukkustundarvind alls ársins. Kortið litar landið eftir þægindaflokki, frá grænu (**sitja**) yfir í **standa**, **rölta** og **ganga** og að rauðu (**óþægilegt**): athöfnin þar sem mörkhraðinn (4, 6, 8 og 10 m/s) er ekki farinn yfir í meira en 5 % stunda. Önnur tafla gefur NEN 8100-einkunina (A til E) út frá hlutfalli stunda þar sem vindurinn fer yfir 5 m/s. Vindhviðustuðullinn margfaldar klukkustundarmeðaltalið til að fá virka hviðu.

Hvernig þetta virkar, með einföldu máli: lausn á stórvirlaflæði með lattice-Boltzmann-aðferð (okkar eigin, í safninu `lib/wind`) í kassa umhverfis byggingarnar, vindhraðasnið sem hækkar með hæðinni eftir völdu grófleika, og hraðinn um 1.5 m yfir jörðu borinn saman við hraðann uppstreymis í 10 m. **Forskoðun** er hröð og gróf; **Staðall** notar fleiri reiti og keyrir mun lengur. Ef spjaldið segir að netið sé gróft (undir 10 reitum yfir hæstu byggingunni), eða að flæðið hafi enn verið að breytast, skaltu treysta kortinu minna.

**Þetta er ekki.** Lausnin hefur verið prófuð á kennslubókarflæðum (rennsli í farvegi, lokaður hólf sem lokið knýr) og keyrð á teningi til að sjá hvort kjölfarið og hraðaaukningin við hornin líti rétt út. Hún hefur **ekki** verið staðfest með vindgangamælingum á byggingum, þannig að allar niðurstöður eru merktar sem óstaðfestar. Ekki nota hana fyrir hönnunargildi, vindálag eða skipulagsvottorð: vindverkfræðingur verður að keyra og staðfesta almennilega rannsókn. Flatt land, slétt byggingarveggir, flýtileiðin um grófleika veðurstöðvar og þröskuldatafla eru einföldun; þröskuldarnir geta verið ólíkir þeim viðmiðum sem yfirvald þitt notar.

## Vindur með OpenFOAM (viðbót)

Innbyggða vindvélin hér að ofan er tilraunakennd. Fyrir almennilegan flæðislausnara kveikirðu á viðbótinni **Vindur gangandi vegfarenda (OpenFOAM)** í **Stillingar > Viðbætur** (hún er óvirk þar til þú gerir það). Hún er GPL-leyfishugbúnaður út af fyrir sig, aðskilin frá öðru í CadCraft, og hún inniheldur ekki OpenFOAM: þú setur það upp sjálf(ur). Þá sýnir **Vél** í vindreitnum OpenFOAM.

Það sem þú setur upp, einu sinni:
1. **Settu upp OpenFOAM** (ESI v-útgáfuna frá openfoam.com; viðbótin er prófuð með v2512). Á Ubuntu eða Debian (líka inni í WSL á Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, síðan `sudo apt install openfoam2512-default`. Það er sett upp undir `/usr/lib/openfoam/openfoam2512`. CadCraft þarf `blockMesh`, `snappyHexMesh` og `simpleFoam` til að keyra. (Eldri `openfoam` 1912-pakkinn í eigin safni Ubuntu virkar líka, en fallhlutir hans hrynja; þá les viðbótin niðurstöðuskrárnar sjálf.)
2. **Ræstu hjálparann** úr `runner`-möppu viðbótarinnar með Node.js: `node cc-openfoam-runner.mjs serve`. Ef OpenFOAM er ekki á leitarslóðinni, gefðu honum litla `runner.json`-skrá með slóðinni að `etc/bashrc` OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) og ræstu hann með `--config runner.json`. Hjálparinn hlustar aðeins á þessa tölvu og prentar auðkenni.
3. **Límdu auðkennið** inn í reiti viðbótarinnar í vindreitnum (vistfangið helst `http://127.0.0.1:8765`) og ýttu á **Athuga hjálparann**.

Þá vinnur **Keyra vindrannsókn** eitt tilvik fyrir hverja vindátt í veðurskránni: massarnir þínir verða yfirborð (STL) í kassa sem er stærður eftir venjulegu viðmiði (5 byggingarhæðir umhverfis og yfir, 10 aftan við), netaðir með blockMesh og snappyHexMesh, keyrðir sem stöðugt k-epsilon RANS með andrúmsloftsmörkum inntaks yfir þá grófleika sem þú velur, og hraðinn í 1.5 m er lesinn til baka og færður í sömu Lawson- og NEN 8100-flokka. Ekkert fer úr tölvunni þinni.

**Það sem hefur verið prófað.** Textinn fyrir ofan niðurstöðurnar segir það skýrt og er hluti af hverri vistaðri CSV-skrá. Uppsetning tilvika viðbótarinnar, lestur niðurstaðna og öll keðjan eru prófuð án OpenFOAM, og einn teningur hefur verið keyrður í gegnum raunverulegt OpenFOAM í þremur netstærðum (tölurnar eru í verkefnaskýringunum). Hún hefur **ekki** verið staðfest með vindgangamælingum á byggingum. Þetta er forskoðunarlestur, ekki hönnunargildi og ekki vottorð. Staðlað k-epsilon ofmetur ókyrrð fyrir framan byggingar, landið er flatt, veggir eru sléttir og engin landslög eða gróður eru til staðar.
