---
title: Ekki smíðað enn
summary: Það sem þessi útgáfa af CivilCraft gerir ekki enn, og hvað þú gerir í staðinn í dag.
keywords: vantar, takmarkanir, vegvísir, ekki tiltækt, bogar, breikkun, dwg, dxf, niðurföll, ræsi, þversnið, kemur síðar, mörk
from: b91588d4
---

CivilCraft er snemma á þróunarstigi. Þessi síða listar það sem núverandi útgáfa gerir ekki, svo þú leitir ekki að því. Ekkert hér er lofað á ákveðnum degi.

## Punktar

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Að bæta annarri punktaskrá við þá fyrstu | Sameinaðu skrárnar í textaritli eða töflureikni fyrst |
| Útflutningur punktaskráar sem texta | Fluttu út LandXML (punktar fara út sem CgPoints), notaðu GIS {{ui:Flytja út}} (punktar með P, N, E, Z og D reitum), eða {{ui:Afrita}} punktana í töflureikni |
| Stíll merkja fyrir punkta, tákn eftir lýsingarlykli, bogar úr línukóðum, lýsingarlykilskrá til að deila milli verkefna | Merkin sýna númer, hæð og lýsingu, eða minna ([Stillingar CivilCraft](topic:settings)); lyklar eru geymdir í verkefnaskránni |
| Umbreyting eininga | Breyttu skránni áður en þú flytur hana inn; **Einingar** endurmerkir aðeins |

## Yfirborð

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Fleiri en eitt yfirborð byggt úr punktum | Eitt verkefni fyrir hvert yfirborð |
| Fela (innri) mörk | Notaðu **Lengsta ytri brún** eða ytri mörk |
| Velja eða breyta einni teiknaðri brotlínu | {{key:Mod+Z}}, eða {{ui:Fjarlægja teiknaðar brotlínur}} og teikna aftur |
| Breyta yfirborði sem er lesið úr LandXML (brotlínum, mörkum) | {{ui:Byggja yfirborðið upp aftur úr punktunum}} |
| Breyta yfirborði gert úr hæðarneti | Fluttu netið inn aftur með öðrum valkostum |
| Umbreyta yfirborði sem er lesið úr LandXML þegar hnitakerfið breytist | {{ui:Byggja yfirborðið upp aftur úr punktunum}} fyrst |
| Merktar blettahæðir og hallagildi | Lestu þau í stöðustikunni, eða litaðu yfirborðið eftir halla með **Hallagreining** í Landslagsvinnusvæðinu ([Mótun fyrir garða](topic:landscape-grading#grading-checks)) |

## Veglínur og langsnið

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Bogar aðrir en klóþíður; bogi milli tveggja sveigja (samsettar umbreytingar) | Klóþíður við enda sveigju eru tiltækar; hinar eru nefndar og slepptar við LandXML-innflutning |
| Að setja PI milli tveggja annarra | Teiknaðu veglínuna aftur, eða sláðu hnit PI inn aftur |
| Veglínur úr hlutum, útfærslum, breikkunum | Teiknaðu með PI |
| Að slá inn K fyrir lóðréttan boga | Sláðu inn L (K er sýnt) |
| Hringlaga og ósamhverfir lóðréttir bogar | Aðeins samhverfir parabólískir bogar |
| Fleiri en eitt hönnunarlangsnið á hverja veglínu | Ein veglína fyrir hvert afbrigði |
| Aðdráttur á langsniðssýninni, bil langsniðs undir langsniðinu | Langsniðssýnin passar alla veglínuna; teiknaðu hana á [blöð fyrir grunnmynd og langsnið](topic:plan-profile-sheets) |
| Þversnið í DWG eða LandXML | Þversniðsblöð sem PDF; {{ui:CSV}} af flatarmálum og rúmmálum |
| Sýnilínur í horni, eða af mismunandi breidd meðfram veginum | Ein breidd hvorum megin fyrir alla veglínuna |

## Gangar

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Miðeyjar, hindranir og yfirhækkun sem snýr sniðmátum | Teiknaðu þau sem sniðmát ([Gangasniðmát](topic:corridor-templates)); sniðmát eftir stöð taka ekki yfirhækkun enn |
| Smám saman breyting milli sniðmáta tveggja svæða (umbreytingar, mjókkun) | Breyttu sniðmátinu á stöð, eða gefðu punkti breiddarmark að línu teiknaðri sem mjókkunin |
| Snúningur um brún, yfirhækkun í LandXML | Yfirhækkun snýst um miðlínuna á hringlaga sveigjum; breikkaðu akrein með breiddarmarki að eiginlínu |
| Mörk fyrir hliðarhalla (dagsbirta að línu eða yfirborði), eigin gangsyfirborð | Mörk færa brúnir yfirborðs og axla ([Gangar](topic:corridor)); gangurinn er mótaður inn í breytta yfirborðið |
| Kantbogar, beygjureinar og eyjar mótaðar inn í gatnamót; endi hliðarvegar skorinn að brún aðalvegar á skálínu; stígur tengdur vegi á grunnmynd, í lengd sinni og flatarmáli | Vegir sem mætast eru tengdir ferhyrndir, með brún aðalvegarins opnaða og hliðarveginum mildaðan að henni ([Þar sem vegir mætast](topic:corridor#where-roads-meet-roads-pads-and-paths)); stígur stöðvast við brún vegarins í breytta yfirborðinu og í 3D |
| Gangar fluttir út sem LandXML-vegir; annar gangur á veglínu í IFC-útflutningi | Breytta yfirborðið er flutt út |
| Landsniðmát sem breyta breytta yfirborðinu, í 3D eða í þversniðum | Þau gefa flatarmál og rúmmál hvers lags ([Landsniðmát](topic:corridor-templates#terrain-templates)) |
| Sporferlar með hraða, hjólasleppi, stýritíma, stýrðar kerrur eða líkamsrými; safn staðlaðra hönnunarökutækja; sporferill teiknaður með því að draga ökutækið | Lágrafarsporferlar meðfram eiginlínu eða veglínu, með þínum eigin stærðum ökutækja ([Sporferlar ökutækja](topic:swept-paths)) |

## Jöfnun og rúmmál

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Bekkir, opnar eiginlínur mótaðar inn í hönnunina, mótun að eiginlínu annars staðar | Lokaðu eiginlínunni ([Eiginlínur](topic:feature-lines)), eða notaðu hana sem brotlínu á núverandi landi |
| Að bæta við eða fjarlægja hnit eiginlínu | Teiknaðu línuna aftur, eða gerðu þrepaða útfærslu hennar |
| Bogar í teiknuðum brotlínum (um mælipunkta), þíróður í eiginlínum | Teiknaðu eiginlínu með bogum og notaðu hana sem brotlínu á núverandi landi |
| Mótun að fjarlægð, hæð eða öðru yfirborði | Dagsbirta aðeins að núverandi landi |
| Að bæta við eða fjarlægja hornpunkt byggingarflatar | Eyddu byggingarflötinni og teiknaðu hana aftur |
| Rúmmál þríhyrningsnets í þríhyrningsnet (prisma), val á stærð ristarreits | Ristaaðferð, stærð reits valin fyrir þig |
| Þensla og rýrnun, ofmoldarlag, dýpt yfirborðslaga | Notaðu stuðla á skýrsluðu tölurnar sjálfur |
| Kostnaður við flutning á eigin vegum (free-haul og overhaul), flutningur milli ólíkra veglína, lántökugryfjur og úrgangsstaðir settir á grunnmynd | Massaflutningsmyndin með jafnvægispunktum, færðu rúmmál og meðalflutningsfjarlægðir |

## Pípunet

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Fleiri en eitt net í hverju verkefni | Aðskilin verkefni fyrir regnvatn og skólp |
| Vatnsveitulagnir: gæði og aldur vatns, reglubundin stýring, aðrar lokategundir (flæðistýring, inngjöf, viðhald), dælur gefnar upp með afli, eftirspurn sem fer eftir þrýstingi, Darcy–Weisbach-valkostur, pípuskrá með veggþykktum og þrýstiflokkum. Restin af þrýstinetunum er á tilraunastigi: [Vatnsveitulagnir](topic:water-mains) | Athugaðu það í hugbúnaði fyrir vatnsdreifingu; hönnunarrennsli skólps er í [Hönnunarrennsli skólps](topic:sanitary-design) |
| Skólpflæði yfir tíma (vatnsrit, kraftmikil leiðsögn, geymsla, dælur, yfirföll) | [Hönnunarrennsli skólps](topic:sanitary-design) gefur stöðugt hámarksrennsli sem hönnunarblað notar |
| Afkastageta inntaka, dreifing í rennu, leiðsögn í tjörn, vatnsrit, orkutap önnur en einn stuðull fyrir gatnamót | Athugaðu í öðrum hugbúnaði; rennsli, stærðir og hallalínur eru í [Regnvatnsrennsli](topic:storm-drainage) |
| Vatnasvæði í PDF-teikningu, DWG, DXF eða LandXML; vatnasvæði út frá yfirborðinu (vatnaskil) | Teiknaðu vatnasvæði með hendi; þau eru vistuð í verkefnaskránni |
| Pípuskrár, óhringlaga pípur, mannvirki sem eru ekki lóðréttir kassar eða strokkar (keilur, þrep, bekkir), frárennslisflokkur í safninu | Gerðir mannvirkja eftir breytum ([Pípunet](topic:pipe-network)); pípur með þvermál |
| Pípur í langsniðssýninni, bognar pípur | Lestu botnhæðir og yfirdekkun í hægra spjaldinu |

## Lóðir

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Skipulag lóða eftir flatarmáli eða framhlið, lóðir út frá línunum í kringum þær, eignarréttur að vegi | Teiknaðu hverja lóð eftir hornum hennar, eða sláðu inn mælingar hennar |
| Ferilatöflur og línutöflur á grunnmynd; merki færð með hendi | Hver lína er merkt eftir sjálfri sér |
| Lóðir í LandXML | Lóðir eru vistaðar í verkefnaskránni og fara í PDF, DWG og DXF |

## Þræðingar

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Minnstu-ferninga jöfnun, flutningsreglan, vigtun horna á móti fjarlægðum | Þjöppunarreglan |
| Hornhalla, zenithorn og hallafjarlægðir, hæðir með þríhyrningsmælingu | Reiknaðu láréttar fjarlægðir og horn rétt eða legu |
| Hliðarskot, hrágagnaskrár frá gagnasöfnurum | Fluttu punktana inn sem punktaskrá |

## Útsetning

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Útsetningarstikur í fráviki (viðmiðunarpunktar settir aftur frá stikunni), hallastikur við snertipunkt | Settu stikur á þær fjarlægðir sem þú þarft, líka handan axlarinnar |
| Senda stikur beint á eigið snið gagnasafnara | CSV-skráin opnast í skrifstofuhugbúnaði flestra gagnasafnara |
| Útsetning á pípum, byggingarflötum og lóðum | Notaðu mælipunkta nálægt veglínu, eða lóðarlínurnar |

## Skrár og úttak

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Texti, skygging og málsetningar úr DWG eða DXF; pappírsrými; tengdar teikningar (xrefs); tvíundar-DXF | Línuteikning úr líkanrými opnast ([Opna DWG eða DXF sem línuteikningu](topic:open-dwg-dxf)); opnaðu tengdar teikningar sér |
| Að færa nokkra punkta í einu með því að draga | Klipptu og límdu þá, eða breyttu þeim einum í einu |
| Lóðrétt blöð, eigin titilreitir, gluggar sem þú raðar, grunnmynd og langsnið á blöðum í DWG | Eitt láréttt grunnmyndarblað á hverja PDF, eða grunnmynd og langsnið á blöðum meðfram veglínu (PDF) |
| Teikning hæðarbanda og langsniða | Bönd eru aðeins á skjá; taktu skjámynd ef þú þarft þau |
| Breyting á heitum laga, litum eða merkjastílum | Breyttu þeim í CAD-forriti eftir DXF-útflutning |
| Skýgeymsla og útgáfusaga | Vistaðu `.civilcraft.json` skrár og taktu afrit af þeim; til að vinna saman í einu verkefni, notaðu lifandi lotu í CadCraft Studio ([Hanna eitt svæði saman, í beinni](topic:work-live)) |
| CadCraft Studio fyrir iPad og iPhone, og frá Google Play | Notaðu CivilCraft í vafranum í tækinu; á Android er CadCraft Studio sett upp úr APK-skrá af getcadcraft.com/download |
| Opna nokkrar punkta- eða verkefnaskrár í einu | Ein skrá í einu (GIS-skrár sem tilheyra saman, eins og hlutar shapefile, opnast saman) |

## Landslag

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Haus og stútar framleiðenda | Almennir hausar, eða bættu við eigin hausum úr skrá; gögn framleiðenda koma inn þegar þeir gefa leyfi |
| Hámarkslengdir hliðarlagna fyrir dropalínur, rennsli yfir tíma, dælur, lykkjuð pípunet | Haltu dropalögnum innan útgefinnar lengdar framleiðandans; athugunin þarf greinótt net |
| Nákvæm útlína íhvolfs frjálsforms hlutar; rúmmál hans undir jörðu mælt nákvæmlega | Kúpti skrokkurinn er mótaður og rúmmál undir jörðu er áætlað (sagt í Eiginleikum) |
| Plöntur í Place from library í BimCraft og ModelCraft | Fluttu út landslags-IFC og opnaðu það í BimCraft við hliðina á húsinu |
| Nákvæm plöntulíkön (lauf, greinar, árstíðir) í þrívíddarsýninni; frjáls form og áveita í þrívíddarsýninni | Plöntur birtast í 3D sem einföld form, stærð eftir plöntulistanum ([Skoða svæðið í 3D](topic:site-3d)); dreifing ModelCraft gerir gróðurmyndir |
| Veggir á vettvangi sem halda upp hallaðri hæð á bak við sig á yfirborðinu | Gefðu palli eða byggingarflöt lóðrétta hliðar: þær eru stoðveggir á yfirborðinu ([Mótun](topic:grading)) |
| SVG-umbreytingar í eigin táknum; áferð og litir eigin GLB-plöntulíkana; þjappaður GLB-rúmfræði | Flettu umbreytingum út í teikniforritinu fyrst; líkön eru teiknuð í lit plöntunnar; fluttu út GLB án þjöppunar ([Myndefni plantna](topic:plant-graphics)) |
| Eigin plöntulisti vistaður í Library-reikningnum þínum (breytt í forritinu) | Breyttu eigin lista verkefnisins í Plöntutöflunni og vistaðu hann sem plöntuskrá |
| Landslagsverkfærin fyrir aðstoðarmenn án gluggans (skráaþjónninn og skipanalínan) | Þau virka með CivilCraft-glugganum opnum ([Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants)) |

## Raflínur

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Staðall lands innbyggður (álagstilvik, fjarlægðir, stuðlar) | Settu gildi staðalsins þíns í {{ui:Álagstilvik og mörk…}} og vistaðu þau, ásamt safninu þínu, sem pakka til að endurnota og deila ([Pakkar](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Láréttu fjarlægðina frá leiðara að trjákrónu eða vegg við hliðina á línunni | Lóðrétta fjarlægðin beint upp yfir plöntur og veggi sem línan fer yfir ([Athuganir á raflínum](topic:power-line-checks#clearances)) |
| Skriðnun leiðara og teygja nýs leiðara | Gerðu ráð fyrir þeim í gegnum hitastigin í strengingartöflunni |
| Hitaeinkunn grafinna kapla (straumeinkunn eftir því hvernig þeir eru lagðir) | Sláðu inn straumeinkunn birgjans þíns á kapalliðinn |
| Skammhlaupsathuganir, varnir og jarðtenging | Notaðu sérstakt rafmagnsforrit; CivilCraft gefur lengdir netsins og kaplana |
| Turnar í grind hannaðir stöng fyrir stöng, og strekkifestingar í jarðveginum | Stuðningar eru athugaðir eftir nafnálagi; strekkjur eftir metnu álagi |
| `.DON` rannsóknarskrá athuguð í forritinu sem les hana | Athugaðu skrána þar; sendu okkur sýnishorn svo við getum prófað á raunverulegri skrá |
| Raflínur í 3D-sýninni og í IFC | Grunnmyndin, línulangsniðið, blöðin og GIS-lögin |
| Raflínuverkfærin fyrir aðstoðarmenn án gluggans | Þau virka með CivilCraft-glugganum opnum ([Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants)) |

## Byggingarmassar

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Safn skipulagsreglna eða reglna einhverrar borgar | Sláðu inn mörkin úr þinni eigin samþykkt ([Skipulagsmörk](topic:zoning-limits)) |
| Dagsljós á veggjum (framhliðardagsbirta), vindur | [Sólarstundir](topic:sun-hours) telja aðeins beina sól |
| Skuggi frá trjám, plöntum eða öllu sem er ekki teiknað sem massi | Teiknaðu nágrannabyggingar sem massa |
| Þakform á massa | Massar með flötum toppi |
| Op, þök og veggjagerðir þegar massi er þróaður í BimCraft | BimCraft byggir einfalda ytri veggi á hverri hæð og gólf; bættu hinu við þar |

## GIS og hnitakerfi

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| File Geodatabase; KML-stílar, tákn, yfirlagsmyndir á jörð og netlenkir | Breyttu í GeoPackage, shapefile eða GeoJSON fyrst; KML-merki eru lesin án stíla sinna |
| Breyting á GIS-atriðum eða eiginleikum þeirra | Breyttu þeim í GIS-forriti og fluttu inn aftur. Greiningarspjaldið býr til ný lög (buffer, yfirlögn, tenging, val) og bætir við reitum fyrir flatarmál og lengd, en það breytir ekki atriði á staðnum |
| Netgreining og rastragreining, biðmörk með flötum eða ferköntuðum endum og einhliða biðmörk, bæta við eða eyða röðum og breyta gerð reits í eigindatöflunni, handvirkir litir flokka, stílskýring í prentun | Notaðu Velja til að velja atriði og búa til lag úr þeim; flatir endar eru ekki í boði. Lita eftir eigindum og eigindatafla eru tilbúin: sjá [Stíll lags eftir eigind](topic:gis-symbology) og [Vinna með eigindatöflu lags](topic:gis-table) |
| Merkjastílar (stærð, staðsetning) og merki sem forðast hvert annað | Merki eru ein stærð og mega skarast þar sem atriði eru þétt |
| Lóðrétt hæðarviðmið og jarðlíkön | Hæðir eru notaðar eins og skráin gefur þær; athugaðu lóðrétta viðmiðið sjálfur |
| Ristaskipti aðrar en í NAD83 úr NAD27 sem er stungið upp á eftir svæði (OSTN15, NTv2 fyrir önnur viðmið virka þegar þú bætir skránni við), nokkur net í einu, lóðrétt net | Bættu við netskránni fyrir þitt viðmið sjálfur; eitt net í hverju verkefni |
| Kortalög í DXF eða 3D-útflutningi | Kortalög fara í PDF-teikninguna, og við hlið DWG sem mynd |
| Kortaþjónar sem þurfa innskráningu, lykil eða tákn | Notaðu opinbera þjónustu, eða landfræðilega staðsetta myndskrá |
| Skrifa LAS- eða LAZ-skrár úr yfirborði, jarðlíkaninu eða hæðarnets- og LiDAR-verkfærunum | Fluttu yfirborð út sem GeoTIFF hæðarnet. Viðbótin [Punktaský](topic:point-clouds) skrifar hreinsað ský sem LAS 1.4 eða LAZ |
| LiDAR-styrkur, litur og endurkast; hæðarnet með mörgum böndum; net- eða LiDAR-skrár yfir 200 MB | LiDAR er síað eftir flokki eingöngu, net nota fyrsta bandið; skerðu stórar skrár í flísar fyrst |

## Inntak

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Kassaval með snertingu (það þarf {{key:Shift}}) | Haltu inni hverjum mælipunkti til að bæta honum við |
| Slegin hnit eða fjarlægðir meðan teiknað er | Teiknaðu gróflega, sláðu síðan inn nákvæm PI-hnit í PI-töflu veglínunnar |
| Slegin hnit fyrir hornpunkta byggingarflata og mannvirkja | Dragðu grip þeirra; aðdráttur inn fyrir nákvæmni og fylgstu með E og N í stöðustikunni |
| Smellifesting við atriði (annað en mælipunktar fyrir brotlínur) | Aðdráttur inn og fylgstu með stöðustikunni |

## 3D-sýn

| Ekki smíðað enn | Í staðinn, í dag |
|---|---|
| Teikning eða breyting í 3D-sýninni | Teiknaðu og breyttu í grunnmyndinni; 3D-sýnin fylgir öllum breytingum |
| Val á eiginlínum gangs eða GIS-atriðum með smelli í 3D | Smelltu á þau í grunnmyndinni |
| Útflutningur ýktrar sýnar eða í fetum | Útflutningar eru í réttum mælikvarða í metrum; sjá [Flytja svæðið út í 3D](topic:export-3d) |
| Merkimiðar í GLB- eða OBJ-útflutningi, stærðir og stíll merkimiða í 3D | Merkimiðar birtast aðeins í 3D-sýninni, ein stærð; sjá [Skoða svæðið í 3D](topic:site-3d) |
| Áferð úr ljósmyndum, upptaka af akstri sem myndband, skuggar frá því sem er utan svæðisins, sólarstundir sýndar í 3D-sýninni | Kortalög lögð yfir yfirborðin; aka og staða sólar á einum tíma; [sólarstundir](topic:sun-hours) fyrir dag eða árstíð á grunnmyndinni |
