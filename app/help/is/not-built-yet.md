---
title: Ekki útfært enn
summary: Það sem þessi útgáfa CivilCraft gerir ekki enn, og hvað á að gera í staðinn í dag.
keywords: vantar, takmarkanir, vegvísir, ekki tiltækt, spírölur, breikkun, dwg, dxf, niðurföll, tímabundin geymsla, þversnið, síðar, mörk
from: a2d970ef
---

CivilCraft er snemma á þróunarstigi. Þessi síða listar það sem núverandi útgáfa gerir ekki, svo þú leitir ekki að því. Ekkert hér er lofað á ákveðinni dagsetningu.

## Punktar

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Að bæta annarri punktaskrá við fyrstu | Sameinaðu skrárnar í textaritli eða töflureikni fyrst |
| Útflutningur á punktatextaskrá | Fluttu út LandXML (punktar fara út sem CgPoints), notaðu GIS {{ui:Flytja út}} (punktar með reitunum P, N, E, Z og D), eða {{ui:Afrita}} punktana í töflureikni |
| Stílar punktamerkinga, tákn fyrir hvern lýsingarlykil, bogar úr línukóðum, lýsingarlykilskrá til að deila milli verkefna | Merkingar sýna númer, kóta og lýsingu, eða minna ([Stillingar CivilCraft](topic:settings)); lyklar eru geymdir í verkefnaskránni |
| Einingabreyting | Breyttu skránni áður en hún er flutt inn; **Einingar** endurmerkir aðeins einingarnar |

## Yfirborð

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Fleiri en eitt yfirborð byggt úr punktum | Eitt verkefni fyrir hvert yfirborð |
| Fela innri jaðra | Notaðu **Lengsta ytri brún** eða ytri jaðar |
| Val eða breyting á einni teiknaðri brotlínu | {{key:Mod+Z}}, eða {{ui:Fjarlægja teiknaðar brotlínur}} og teiknaðu aftur |
| Breyting á yfirborði sem er lesið úr LandXML (brotlínur, jaðar) | {{ui:Byggja yfirborðið upp aftur úr punktunum}} |
| Breyting á yfirborði sem gert er úr hæðarneti | Fluttu netið inn aftur með öðrum valkostum |
| Umbreyting yfirborðs sem er lesið úr LandXML þegar hnitakerfið breytist | {{ui:Byggja yfirborðið upp aftur úr punktunum}} fyrst |
| Merktar staðkótur og hallagildi | Lestu þau á stöðustikunni, eða litaðu yfirborðið eftir halla með **Hallagreining** í vinnusvæðinu Landslag ([Landmótun fyrir landslag](topic:landscape-grading#grading-checks)) |

## Veglínur og langsnið

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Spírölur aðrar en klóthoíð; spírala á milli tveggja kúrfa (samsettar umskiptingar) | Klóthoíð-spírölur við enda kúrfu eru tiltækar; hinar eru nefndar og sleppt við LandXML-innflutning |
| Setja PI á milli tveggja annarra | Teiknaðu veglínuna aftur, eða sláðu PI-hnitin inn aftur |
| Veglínur úr hlutum, útfærslum, breikkunum | Teiknaðu eftir PI |
| Að slá inn K fyrir lóðrétta kúrfu | Sláðu inn L (K birtist) |
| Hringlaga og ósamhverfar lóðréttar kúrfur | Aðeins samhverfar parabólukúrfur |
| Fleiri en eitt hönnunarlangsnið á hverri veglínu | Ein veglína fyrir hvert afbrigði |
| Aðdráttur á langsniðssýn, langsniðsbönd undir langsniðinu | Langsniðssýnin passar alla veglínuna; teiknaðu hana á [grunnmynda- og langsniðsblöð](topic:plan-profile-sheets) |
| Snið í DWG eða LandXML | Sniðblöð sem PDF; {{ui:CSV}} af flatarmálum og rúmmálum |
| Sniðlínur í horni, eða með mismunandi breidd eftir veginum | Ein breidd hvorum megin fyrir alla veglínuna |

## Vegstokkar

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Miðeyjar, vegrið og yfirhalli sem snýr sniðmátum | Teiknaðu þau sem sniðmát ([Sniðmát vegstokks](topic:corridor-templates)); sniðmát eftir stöð taka ekki yfirhalla enn |
| Smám saman breyting á milli sniðmáta tveggja svæða (umskipti, mjókkun) | Breyttu sniðmátinu við stöð, eða gefðu punkti breiddarmarkmið á línu sem er teiknuð sem mjókkunin |
| Snúningur um brún, yfirhalli í LandXML | Yfirhalli snýst um miðlínuna í bogum; breikkaðu akrein með breiddarmarkmiði á einkennalínu |
| Markmið fyrir hliðarhallana (dagsbirta að línu eða yfirborði), eigið yfirborð vegstokks | Markmið færa brúnir malbiks og öxla ([Vegstokkar](topic:corridor)); vegstokkurinn er mótaður inn í fyrirhugað yfirborð |
| Vegstokkar fluttir út sem LandXML-vegir; annar vegstokkur á veglínu í IFC-útflutningi | Fyrirhugaða yfirborðið er flutt út |
| Landsniðmát sem breyta fyrirhuguðu yfirborði, í þrívídd eða í sniðunum | Þau gefa flatarmál og rúmmál hvers lags ([Landsniðmát](topic:corridor-templates#terrain-templates)) |
| Akstursferlar með hraða, dekkjasleppi, stýritíma, stýrðum eftirvögnum eða yfirbyggingarbili; safn staðlaðra hönnunarökutækja; akstursferill teiknaður með því að draga ökutækið | Akstursferlar á lágum hraða eftir einkennalínu eða veglínu, með þínum eigin stærðum ökutækja ([Akstursferlar ökutækja](topic:swept-paths)) |

## Mótun og rúmmál

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Bekkir, opnar einkennalínur mótaðar inn í hönnunina, mótun að einkennalínu annars staðar frá | Lokaðu einkennalínunni ([Einkennalínur](topic:feature-lines)), eða notaðu hana sem brotlínu núverandi lands |
| Setja inn eða fjarlægja hornpunkt einkennalínu | Teiknaðu línuna aftur, eða búðu til þrepaskipta útfærslu af henni |
| Bogar í teiknuðum brotlínum (um mælipunkta), spírölur í einkennalínum | Teiknaðu einkennalínu með bogum og notaðu hana sem brotlínu núverandi lands |
| Mótun að fjarlægð, kóta eða öðru yfirborði | Dagsbirta aðeins að núverandi landi |
| Bæta við eða fjarlægja horn pallsins | Eyddu pallinum og teiknaðu hann aftur |
| TIN-í-TIN (prisma) rúmmál, val á stærð reitanets | Netaðferð, reitastærð valin fyrir þig |
| Þensla og rýrnun, gróðurmold, dýpt malbiks | Beittu stuðlum á tilkynntu tölurnar sjálfur |
| Kostnaður við frjálsan flutning og yfirflutning, flutningur milli mismunandi veglína, efnistökustaðir og urðunarstaðir settir á grunnmynd | Massaflutningsritið með jafnvægispunktum, flutt rúmmál og meðalflutningsvegalengdir |

## Lagnanet

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Fleiri en eitt net í hverju verkefni | Sérstök verkefni fyrir regnvatn og skolp |
| Vatnsveitulagnir: gæði vatns og aldur, reglubundin stýring, aðrar gerðir loka (flæðistýring, inngjöf, viðhaldsloki), dælur gefnar upp með afli, eftirspurn sem fer eftir þrýstingi, Darcy–Weisbach-valkostur, lagnaskrá með veggþykktum og þrýstiflokkum. Restin af þrýstinetum er í tilraunastofunni: [Vatnsveitulagnir](topic:water-mains) | Athugaðu þetta í hugbúnaði fyrir vatnsdreifingu; hönnunarflæði skolps er í [Hönnunarflæði skolps](topic:sanitary-design) |
| Skolpflæði yfir tíma (vatnsritar, kraftmikil leiðsögn, geymsla, dælur, yfirföll) | [Hönnunarflæði skolps](topic:sanitary-design) gefur stöðugt hámarksflæði sem hönnunarblað notar |
| Afkastageta niðurfalla, dreifing í rennu, leiðsögn tímabundinnar geymslu, vatnsritar, orkutap annað en einn stuðull tengistykkis | Athugaðu þau í öðrum hugbúnaði; flæði, stærðir og vatnshæðarlínur eru í [Regnvatnsrennsli](topic:storm-drainage) |
| Vatnasvæði í PDF-teikningu, DWG, DXF eða LandXML; vatnasvæði úr yfirborði (vatnaskil) | Teiknaðu vatnasvæði með hendi; þau eru vistuð í verkefnaskránni |
| Lagnaskrár, óhringlaga lagnir, mannvirki sem eru ekki upprétir kassar eða strokkar (keilur, þrep, bekkir), frárennslisflokkur í safninu | Gerðir mannvirkja út frá breytum ([Lagnanet](topic:pipe-network)); lagnir með þvermáli |
| Lagnir í langsniðssýninni, bognar lagnir | Lestu botnkóta og yfirdekkingu í hægra spjaldinu |

## Lóðir

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Skipulag lóða eftir flatarmáli eða framhlið, lóðir úr línunum í kringum þær, vegsvæði | Teiknaðu hverja lóð eftir hornum hennar, eða sláðu inn mælingar hennar |
| Bogatöflur og línutöflur á grunnmynd; merkingar færðar með hendi | Hver lína er merkt eftir sjálfri sér |
| Lóðir í LandXML | Lóðir eru vistaðar í verkefnaskránni og fara í PDF, DWG og DXF |

## Hringmælingar

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Minnstu kvaðrata-leiðrétting, flutningsreglan, vigtun horna á móti fjarlægðum | Áttavitareglan |
| Útslagshorn, sjónarhorn frá lóðlínu og hallafjarlægðir, kótar með þríhyrningamælingu | Reiknaðu láréttar fjarlægðir og horn rétt, eða stefnur |
| Hliðarmælingar, hrágagnaskrár frá gagnasöfnurum | Fluttu punktana inn sem punktaskrá |

## Afstikun

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Útfærðir stikar (viðmiðunarpunktar settir aftur frá stikanum), hallastikar við skurðpunkt | Stikaðu á þeim útfærslum sem þú þarft, líka handan við öxlina |
| Senda stikana beint á eigið snið gagnasafnara | CSV-skráin opnast í skrifstofuhugbúnaði flestra gagnasafnara |
| Stikun lagna, palla og lóða | Notaðu mælipunkta nálægt veglínu, eða hornpunkta lóðarinnar |

## Skrár og úttak

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Texti, skygging og málsetningar úr DWG eða DXF; pappírsrými; tengdar teikningar (xrefs); tvíundar-DXF | Línur úr líkanrými opnast ([Opna DWG eða DXF sem línur](topic:open-dwg-dxf)); opnaðu tengdar teikningar sérstaklega |
| Færa nokkra punkta í einu með drætti | Klipptu þá og límdu, eða breyttu þeim einum í einu |
| Blöð í andlitsstöðu, eigin titilreitir, sýnigluggar sem þú raðar, grunnmynda- og langsniðsblöð í DWG | Eitt lárétt grunnmyndablað í PDF, eða grunnmynda- og langsniðsblöð eftir veglínu (PDF) |
| Teikning kótabanda og langsniða | Bönd eru aðeins á skjá; taktu skjámynd ef þú þarft þau |
| Breyting á heitum laga, litum eða merkingarstílum | Breyttu þeim í CAD-forriti eftir DXF-útflutning |
| Skýjavistun og útgáfusaga | Vistaðu `.civilcraft.json`-skrár og taktu öryggisafrit; til að vinna saman að einu verkefni notarðu lifandi lotu í CadCraft Studio ([Hanna eitt svæði saman, í beinni](topic:work-live)) |
| CadCraft Studio fyrir iPad og iPhone, og úr Google Play | Notaðu CivilCraft í vafranum í tækinu; á Android er CadCraft Studio sett upp úr APK á getcadcraft.com/download |
| Opna nokkrar punkta- eða verkefnaskrár í einu | Ein skrá í einu (GIS-skrár sem tilheyra saman, eins og hlutar shapefile, opnast saman) |

## Landslag

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Hausar og stútar framleiðenda | Almennir hausar, eða bættu við þínum eigin hausum úr skrá; gögn framleiðenda koma inn þegar þeir gefa leyfi |
| Hámarkslengdir hliðarlagna fyrir droplínur, flæði yfir tíma, dælur, lokuð lagnanet | Haltu droprennum innan lengdar sem framleiðandi birtir; athugunin krefst greinótts nets |
| Nákvæm útlína íhvolfs frjálsforms hlutar; rúmmál hans undir jörðu mælt nákvæmlega | Kúpta skelin er mótuð og rúmmál undir jörðu er áætlun (sagt í Eiginleikum) |
| Plöntur í eigin Setja inn úr safni BimCraft og ModelCraft | Fluttu út landslags-IFC og opnaðu það í BimCraft við hlið byggingarinnar |
| Ítarleg líkön af plöntum (blöð, greinar, árstíðir) í þrívíddarsýninni; frjálsform hlutir og áveita í þrívíddarsýninni | Plöntur birtast í þrívídd sem einföld form í stærð eftir plöntulistanum ([Skoða svæðið í þrívídd](topic:site-3d)); dreifing ModelCraft býr til gróðursetningarmyndir |
| Hörð veggi sem halda mótuðu stigi á bak við sig á yfirborðinu | Gefðu palli eða palli lóðrétta hliðar: þær eru stoðveggir á yfirborðinu ([Mótun](topic:grading)) |
| SVG-umbreytingar í eigin táknum; áferð og litir eigin GLB-plöntulíkana; þjappað GLB-rúmfræði | Sléttaðu umbreytingar í teikniforritinu fyrst; líkön eru teiknuð í lit plöntunnar; flyttu GLB út án þjöppunar ([Myndir af plöntum](topic:plant-graphics)) |
| Þinn eigin plöntulisti geymdur á Safn-aðgangnum þínum (breytt í forritinu) | Breyttu lista verkefnisins í Plöntutöflunni og vistaðu hann sem plöntuskrá |
| Landslagsverkfærin fyrir aðstoðarmenn án gluggans (skráaþjónninn og skipanalínan) | Þau virka með CivilCraft-glugganum opnum ([Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants)) |

## Háspennulínur

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Staðall lands innbyggður (álagstilvik, bil, stuðlar) | Stilltu gildi staðalsins í {{ui:Álagstilvik og mörk…}} og vistaðu þau, ásamt safni þínu, sem pakka til að endurnota og deila ([Pakkar](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Hliðarfjarlægð frá leiðara að trjákrónu eða vegg við línuna | Lóðrétt bil upp yfir gróður og veggi sem línan fer yfir ([Athuganir á háspennulínum](topic:power-line-checks#clearances)) |
| Skrið leiðara og teygja nýs leiðara | Taktu tillit til þeirra með hitastigunum í strengingartöflunni |
| Hitamat grafinna kapla (straumsmat eftir því hvernig þeir eru lagðir) | Sláðu inn straumsmat birgjans á kapalhlutinn |
| Skammhlaups-, varnar- og jarðtengingarrannsóknir | Notaðu sérstakt rafmagnsforrit; CivilCraft gefur lengdir netsins og kapla |
| Grindarmöstur hönnuð stykki fyrir stykki, og festingar stagsins í jarðveginum | Stoðvirki eru athuguð með nafnálagi; stög með metnu álagi |
| `.DON`-rannsóknarskrá athuguð í forritinu sem les hana | Athugaðu skrána þar; sendu okkur sýnishorn svo við getum prófað gegn raunverulegri skrá |
| Háspennulínur í þrívíddarsýninni og í IFC | Grunnmyndin, langsnið línunnar, blöðin og GIS-lögin |
| Háspennulínutól fyrir aðstoðarmenn án gluggans | Þau virka með CivilCraft-glugganum opnum ([Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants)) |

## Byggingarmassar

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Safn skipulagsreglna eða reglna einhverrar borgar | Sláðu inn mörkin úr þinni eigin samþykkt ([Skipulagsmörk](topic:zoning-limits)) |
| Himinbirta á veggjum (dagsbirta á framhlið), vindur | [Sólartímar](topic:sun-hours) telur aðeins beina sól |
| Skuggi frá trjám, plöntum eða öllu sem er ekki teiknað sem massi | Teiknaðu nágrannabyggingar sem massa |
| Þakform á massa | Massar með flötu þaki |
| Op, þök og veggjagerðir þegar massi er þróaður í BimCraft | BimCraft byggir einfalda ytri veggi á hverri hæð og gólfi; bættu hinu við þar |

## GIS og hnitakerfi

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| File Geodatabase; KML-stílar, tákn, yfirlög á landi og netteningar | Breyttu í GeoPackage, shapefile eða GeoJSON fyrst; KML-merki eru lesin án stíla |
| Breyting á GIS-eiginleikum eða eigindum þeirra | Breyttu þeim í GIS-forriti og fluttu inn aftur. Greiningarspjaldið býr til ný lög (biðminni, yfirlögn, tenging, val) og bætir við reitum fyrir flatarmál og lengd, en breytir ekki eiginleika á staðnum |
| Net- og rastergreining, biðminni með flötum eða ferköntuðum endum og einhliða biðminni, að bæta við eða eyða röðum og breyta gerð reits í eigindatöflu, handvirkir flokkalitir, stílskýring á teikningum | Notaðu {{ui:Velja}} til að velja eiginleika og búa til lag úr þeim; flatir endar eru ekki í boði. Litun eftir eigind og eigindatafla eru tiltæk: sjá [Stílsetja lag eftir eigind](topic:gis-symbology) og [Vinna með eigindatöflu lags](topic:gis-table) |
| Stílar merkinga (stærð, staðsetning) og merkingar sem forðast hvor aðra | Merkingar eru ein stærð og mega skarast þar sem eiginleikar eru þéttir |
| Lóðrétt viðmiðunarstig og geóíðlíkön | Kótar eru notaðir eins og skráin gefur þá; athugaðu lóðrétta viðmiðun sjálfur |
| Hnitakerfisbreytingar aðrar en NAD27 í NAD83 sem stungið er upp á eftir svæði (OSTN15, NTv2 fyrir önnur viðmiðunarstig virka þegar þú bætir skránni við), nokkur net í einu, lóðrétt net | Bættu netskránni við fyrir þitt viðmiðunarstig sjálfur; eitt net í verkefni |
| Kortalög í DXF eða í þrívíddarútflutningi | Kortalög fara í PDF-teikninguna, og við hlið DWG sem mynd |
| Kortaþjónar sem krefjast innskráningar, lykils eða tóka | Notaðu opinbera þjónustu, eða skrá af mynd sem er staðsett |
| Skrifun LAS- eða LAZ-skráa úr yfirborði, landlíkani eða hæðarnets- og LiDAR-verkfærum | Fluttu yfirborð út sem GeoTIFF-hæðarnet. [Punktaský](topic:point-clouds)-viðbótin skrifar hreinsað ský sem LAS 1.4 eða LAZ |
| LiDAR-styrkur, litur og endurkast; hæðarnet með nokkrum böndum; net- eða LiDAR-skrár yfir 200 MB | LiDAR er síað aðeins eftir flokki, net nota fyrsta bandið; skerðu stórar skrár í flísar fyrst |

## Innsláttur

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Kassaval með snertingu (það þarf {{key:Shift}}) | Haltu inni á hverjum mælipunkti til að bæta honum við |
| Slegin hnit eða fjarlægðir meðan teiknað er | Teiknaðu gróflega, sláðu síðan inn nákvæm PI-hnit í PI-töflu veglínunnar |
| Að slá inn hnit fyrir hornpunkta palla og mannvirki | Dragðu gripin; notaðu aðdrátt fyrir nákvæmni og fylgstu með E og N á stöðustikunni |
| Smellfesting við hluti (annað en mælipunktar fyrir brotlínur) | Aðdráttur og fylgstu með stöðustikunni |

## Þrívíddarsýn

| Ekki útfært enn | Í staðinn, í dag |
|---|---|
| Teikning eða breyting í þrívíddarsýninni | Teiknaðu og breyttu á grunnmynd; þrívíddarsýnin fylgir hverri breytingu |
| Val á einkennalínum vegstokks eða GIS-eiginleikum með smelli í þrívídd | Smelltu á þá á grunnmynd |
| Útflutningur á ýktri sýn eða í fetum | Útflutningar eru í réttum mælikvarða í metrum; sjá [Flytja út svæðið í þrívídd](topic:export-3d) |
| Merkingar í GLB- eða OBJ-útflutningi, stærðir og stílar merkinga í þrívídd | Merkingar birtast aðeins í þrívíddarsýninni, í einni stærð; sjá [Skoða svæðið í þrívídd](topic:site-3d) |
| Áferð úr ljósmyndum, upptaka ferðar sem myndband, skuggar frá því sem er utan svæðisins, sólartímar sýndir í þrívíddarsýninni | Kortalög lögð yfir yfirborðin; akstur og staða sólar á einum tíma; [sólartímar](topic:sun-hours) fyrir dag eða árstíð á grunnmynd |
