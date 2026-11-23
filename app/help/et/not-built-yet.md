---
title: Veel valmis pole
summary: Mida see CivilCraft'i versioon veel ei tee ja mida praegu selle asemel teha.
keywords: puudu, piirangud, arendusplaan, pole saadaval, spiraalid, laiendamine, dwg, dxf, sissevoolud, viivitustiik, ristlõiked, tulevikus, piirid
from: b91588d4
---

CivilCraft on alles algusjärgus. See lehekülg loetleb, mida praegune versioon ei tee, et sa sellist asja ei otsiks. Siin loetletu ei ole kuupäevaga lubatud.

## Punktid

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Teise punktifaili lisamine esimesele | Ühenda failid enne tekstiredaktoris või tabelarvutusprogrammis |
| Punktitekstifaili eksport | Ekspordi LandXML (punktid lähevad välja CgPointsina), kasuta GIS {{ui:Export}}it (punktid väljadega P, N, E, Z ja D) või {{ui:Copy}}i punktid tabelarvutusse |
| Punktisiltide stiilid, sümbolid kirjelduse võtme järgi, kaared rea koodidest, kirjelduste võtmefail, mida jagada projektide vahel | Sildid näitavad numbrit, kõrgust ja kirjeldust või vähem ([CivilCraft'i sätted](topic:settings)); võtmed hoitakse projektifailis |
| Ühikute teisendamine | Teisenda fail enne importi; **Ühikud** ainult muudab sildi |

## Pinnad

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Rohkem kui üks pind punktidest | Üks projekt pinna kohta |
| Sisemiste piirjoonte peitmine | Kasuta **Pikim väline serv** või välispiiri |
| Ühe joonistatud murdjoone valimine või muutmine | {{key:Mod+Z}} või {{ui:Remove drawn breaklines}} ja joonista uuesti |
| LandXML-ist loetud pinna (murdjooned, piir) muutmine | {{ui:Rebuild the surface from the points}} |
| Kõrgusruudustikust tehtud pinna muutmine | Impordi ruudustik uuesti teiste valikutega |
| LandXML-ist loetud pinna teisendamine, kui koordinaatsüsteem muutub | Kõigepealt {{ui:Rebuild the surface from the points}} |
| Kõrgusmärgid ja kaldeväärtused siltidega | Loe need olekuribalt või värvi pind kalde järgi, kasutades **Kaldeanalüüs** haljastuse tööruumis ([Haljastuse planeerimine](topic:landscape-grading#grading-checks)) |

## Trassid ja pikiprofiilid

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Spiraalid, mis pole klotoidid; spiraal kahe kõvera vahel (liitsiirdekõverad) | Klotoidspiraalid kõvera otstes on saadaval; teised on nimetatud ja jäetakse LandXML-importimisel vahele |
| PI sisestamine kahe teise vahele | Joonista trass uuesti või sisesta PI koordinaadid uuesti |
| Trassid objektidest, nihked, laiendused | Joonista PI-dega |
| K sisestamine vertikaalkõvera jaoks | Sisesta L (K kuvatakse) |
| Ringjad ja asümmeetrilised vertikaalkõverad | Ainult sümmeetrilised parabooli kõverad |
| Rohkem kui üks projekteeritud pikiprofiil trassi kohta | Üks trass variandi kohta |
| Pikiprofiilivaate suumimine, profiiliribad pikiprofiili all | Pikiprofiilivaade mahutab kogu trassi; joonista see [plaani- ja pikiprofiili lehtedel](topic:plan-profile-sheets) |
| Lõiked DWG-s või LandXML-is | Põikprofiilide lehed PDF-ina; {{ui:CSV}} pindade ja mahtude kohta |
| Proovijooned nurga all või erineva laiusega mööda teed | Üks laius igal pool kogu trassi kohta |

## Koridorid

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Mediaanid, tõkked ja ülekallutus, mis pöörab malle | Joonista need mallidena ([Koridori mallid](topic:corridor-templates)); jaamade kaupa mallid ei võta veel ülekallutust arvesse |
| Järkjärguline üleminek kahe piirkonna mallide vahel (üleminekud, kitsenemised) | Muuda malli jaamas või anna punktile laiussihik joonele, mis on joonistatud üleminekuna |
| Pöörlemine ümber serva, ülekallutus LandXML-is | Ülekallutus pöörleb ringkõveratel keskjoone ümber; laienda sõidurada laiussihiga tunnusjoonele |
| Päevavalguse nõlvade sihikud (päevavalgus joonele või pinnale), koridorile oma pinnad | Sihikud liigutavad katteserva ja ääriala servi ([Koridorid](topic:corridor)); koridor planeeritakse projekteeritud pinnale |
| Nurgakõverad, pöörderajad ja saared ristmikuna planeeritud; kõrvatee lõpp lõigatud peatee servale viltu; rada, mis on plaanis teega ühendatud, oma pikkuses ja pindalas | Teed, mis kohtuvad, ühendatakse ristkülikuna, peatee serv avatakse ja kõrvatee tasandatakse sinna ([Kus teed kohtuvad](topic:corridor#where-roads-meet-roads-pads-and-paths)); rada peatub tee servas projekteeritud pinnal ja 3D-s |
| Koridorid eksporditakse LandXML-i teedena; teine koridor trassil IFC-ekspordis | Eksporditakse projekteeritud pind |
| Maamallid, mis muudavad projekteeritud pinda 3D-s või lõigetes | Need annavad iga kihi pindalad ja mahud ([Maamallid](topic:corridor-templates#terrain-templates)) |
| Pöördeteed kiiruse, rehvilibisemise, roolimisaja, roolitavate haagiste või kere vabaruumiga; standardsete projekteerimissõidukite raamatukogu; pöördetee, mis joonistatakse sõidukit lohistades | Madala kiirusega pöördeteed mööda tunnusjoont või trassi, oma sõidukimõõtmetega ([Sõidukite pöördeteed](topic:swept-paths)) |

## Planeerimine ja mahud

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Pingid, avatud tunnusjooned, mis on planeeritud projekteeringusse, planeerimine tunnusjoonele teisest kohast | Sulge tunnusjoon ([Tunnusjooned](topic:feature-lines)) või kasuta seda olemasoleva maapinna murdjoonena |
| Tunnusjoone tipu lisamine või eemaldamine | Joonista joon uuesti või tee sellest astmeline nihe |
| Kaared joonistatud murdjoontes (läbi mõõdistuspunktide), spiraalid tunnusjoontes | Joonista tunnusjoon kaartega ja kasuta seda olemasoleva maapinna murdjoonena |
| Planeerimine kaugusele, kõrgusele või teisele pinnale | Ainult päevavalgus olemasolevale maapinnale |
| Pinnaplatvormi nurga lisamine või eemaldamine | Kustuta platvorm ja joonista uuesti |
| TIN-TIN (prisma) mahud, lahtri suuruse valimine ruudustikus | Ruudustiku meetod, lahtri suurus valitakse sinu eest |
| Paisumine ja kahanemine, humuskiht, katendi paksused | Rakenda tegurid ise esitatud arvudele |
| Vaba vedu ja ülevedu, vedu eri trasside vahel, laenualad ja jäätmekohad plaanil | Massi ülekandmise diagramm tasakaaluomadustega, liigutatud mahud ja keskmised veokaugused |

## Torustikud

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Rohkem kui üks võrk projekti kohta | Eraldi projektid sademevee ja reoveesüsteemi jaoks |
| Veetorud: vee kvaliteet ja vanus, reeglipõhised juhtimised, muud ventiilitüübid (vooluhulga juhtimine, drosselventiil, hoidev ventiil), pumbad antud võimsusega, nõudlus, mis sõltub rõhust, Darcy–Weisbachi valik, torukataloog seinapaksuste ja rõhuklassidega. Ülejäänud survevõrkude osa on laboris: [Veetorud](topic:water-mains) | Kontrolli neid veejaotustarkvaraga; reovee arvutusvoolud on [Reovee arvutusvoolud](topic:sanitary-design) |
| Reoveevoolud ajas (hüdrogrammid, dünaamiline suunamine, mahutid, pumbad, ülevoolud) | [Reovee arvutusvoolud](topic:sanitary-design) annab arvutusjoonise jaoks püsiva tippvoolu |
| Sissevoolu võimsus, kraavi levik, viivitustiigi suunamine, hüdrogrammid, energiakaod peale ühe ristmiku koefitsiendi | Kontrolli neid muus tarkvaras; voolud, mõõdud ja joonte tasemed on [Sademeveedrenaaž](topic:storm-drainage) |
| Valgalad PDF-plotis, DWG-s, DXF-s või LandXML-is; valgalad pinnalt (veelahkmed) | Joonista valgalad käsitsi; need salvestatakse projektifaili |
| Torukataloogid, mittevoolu torud, mitte püstised konstruktsioonid (koonused, astmed, pingid), sademevee kategooria raamatukogus | Konstruktsioonitüübid parameetritest ([Torustiku konstruktsioon](topic:pipe-network)); torud läbimõõduga |
| Torud pikiprofiilivaates, kõverad torud | Loe kõrgused ja katted paremast paneelist |

## Krundid

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Krundide paigutamine pindala või rinde järgi, krundid ümbritsevatest joontest, teemaa | Joonista iga krunt nurkade järgi või sisesta selle kõned |
| Kõverate tabelid ja joonte tabelid plaanil; käsitsi liigutatud sildid | Iga lõik on märgitud oma pikkuses |
| Krundid LandXML-is | Krundid salvestatakse projektifaili ja lähevad PDF-i, DWG-sse ja DXF-i |

## Polügoonikäigud

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Vähimruutude korrigeerimine, transiidireegel, nurkade kaalumine kauguste vastu | Kompassi reegel |
| Nurgadeflektsioonid, zenitnurgad ja kaldekaugused, kõrgused trigonomeetrilise nivelleerimisega | Taanda õigesti horisontaalkaugusteks ja nurkadeks või asimuutideks |
| Külgmised mõõtmised, toorandmefailid andmekogujatelt | Impordi punktid punktifailina |

## Märkimine

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Nihkemärgid (võrdlusjärgud taandatud märgist), nõlvamärgid tabamispunktis | Märgi nihked, mida vajad, sealhulgas kaugemale kui ääriala |
| Märkimisandmete saatmine otse andmekogujate oma vormingusse | CSV avaneb enamiku andmekogujate kontoritarkvaras |
| Torude, platvormide ja krundide märkimine | Kasuta trassi lähedal mõõdistuspunkte või krundi lõike |

## Failid ja väljund

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Tekst, kaevised ja mõõtmed DWG-st või DXF-ist; paberruum; lingitud joonised (xrefs); binaarne DXF | Mudeliruumi joonistus avaneb ([Ava DWG või DXF joonisena](topic:open-dwg-dxf)); ava lingitud joonised eraldi |
| Mitme punkti korraga lohistamine | Lõika ja kleebi need või muuda ükshaaval |
| Portreesuunas lehed, oma tiitelplokid, paigutatavad vaateaknad, plaani- ja pikiprofiililehed DWG-s | Üks maastikusuunas plaanileht PDF-i kohta või plaani- ja pikiprofiililehed mööda trassi (PDF) |
| Kõrgusribade ja profiilide joonistamine | Ribad on ainult ekraanil; tee ekraanitõmmis, kui neid vajad |
| Kihinimede, värvide või sildistiilide muutmine | Muuda need CAD-programmis pärast DXF-eksporti |
| Pilvesalvestus ja versioonide ajalugu | Salvesta `.civilcraft.json` failid ja hoia need varundatuna; ühiseks tööks ühe projektiga kasuta elavat seanssi CadCraft Studios ([Tööta ühe objekti kallal koos, otse](topic:work-live)) |
| CadCraft Studio iPadile ja iPhone'ile ning Google Playst | Kasuta CivilCraft'i brauseris seadmel; Androidil installib CadCraft Studio oma APK-st aadressil getcadcraft.com/download |
| Mitme punkti- või projektifaili avamine korraga | Üks fail avamise kohta (GIS-failid, mis kuuluvad kokku, nagu shapefile'i osad, avanevad koos) |

## Haljastus

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Tootjate peakud ja düüsid | Üldised peakud või lisa oma peakud failist; tootjate andmed tulevad sisse, kui nad selle loa annavad |
| Tilkvoolikute maksimaalsed külgpikkused, voolud ajas, pumbad, ringtorustikud | Hoia tilkjooksud tootja avaldatud pikkuses; kontroll vajab harutatud võrku |
| Kumera vaba kujundi täpne piirjoon; selle maa-alune maht täpselt | Kumerkatte järgi planeeritakse ja maa-alune maht on hinnang (öeldud atribuutides) |
| Taimed BimCraft'i ja ModelCraft'i enda raamatukogust paigutamisega | Ekspordi haljastuse IFC ja ava see BimCraftis hoone kõrval |
| Üksikasjalikud taimemudelid (lehed, oksad, aastaajad) 3D-vaates; vabakujulised objektid ja kastmine 3D-vaates | Taimed on 3D-s lihtsate kujunditena, mille suurus tuleneb taimenimekirjast ([Vaata objekti 3D-s](topic:site-3d)); ModelCrafti hajutus teeb taimepildid |
| Kõvade pindade seinad, mis hoiavad tasandi taga pinnal | Anna platvormile või padjale vertikaalsed küljed: need on pinnal tugiseinad ([Planeerimine](topic:grading)) |
| SVG-teisendused oma sümbolites; oma GLB-taimemudelite tekstuurid ja värvid; tihendatud GLB geomeetria | Lameda teisendused kõigepealt joonistusprogrammis; mudelid joonistatakse taime värviga; ekspordi GLB tihendamata ([Taimede graafika](topic:plant-graphics)) |
| Oma taimenimekiri, mida hoitakse Raamatukogu kontos (muudetakse rakenduses) | Muuda projekti oma nimekirja taimetabelis ja salvesta see taimefailina |
| Haljastuse tööriistad abilistele ilma aknata (failiserver ja käsurida) | Need töötavad CivilCraft'i akna lahti olles ([Lase AI-assistendil töötada oma objektiga](topic:assistants)) |

## Elektriliinid

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Riigi standard sisseehitatuna (koormusjuhud, vabad ruumid, tegurid) | Sisesta oma standardi väärtused menüüs {{ui:Koormusjuhud ja piirangud…}} ning salvesta need koos raamatukoguga paketina, mida taaskasutada ja jagada ([Paketid](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Juhtme külgmine kaugus puuvõrani või seinani liini kõrval | Vertikaalne vaba ruum taimede ja seinte kohal, mida liin ületab ([Elektriliinide kontrollid](topic:power-line-checks#clearances)) |
| Juhtme roomamine ja uue juhtme venimine | Arvesta nendega läbi paigaldustabeli temperatuuride |
| Maa-aluste kaablite soojuslik nimivool (vooluvõime paigaldusviisist) | Sisesta kaabli üksusele oma tarnija nimivool |
| Lühise-, kaitse- ja maandusuuringud | Kasuta eraldi elektriprogrammi; CivilCraft annab võrgu pikkused ja kaablid |
| Pülooni torn liikmete kaupa projekteeritud ja pingutusankrud pinnases | Toed kontrollitakse nimikoormuse järgi; pingutused oma nimikoormuse järgi |
| `.DON` uuringufail, mida kontrollitakse programmis, mis seda loeb | Kontrolli faili seal; saada meile näidis, et saaksime testida päris failiga |
| Elektriliinid 3D-vaates ja IFC-s | Plaan, liini pikiprofiil, lehed ja GIS-kihid |
| Elektriliini tööriistad abilistele ilma aknata | Need töötavad CivilCraft'i akna lahti olles ([Lase AI-assistendil töötada oma objektiga](topic:assistants)) |

## Hoonemahud

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Raamatukogu tsoneerimiskoodide või ühegi linna eeskirjade kohta | Sisesta piirangud oma eeskirjast ([Tsoneerimispiirangud](topic:zoning-limits)) |
| Taevavalgus seintel (fassaadi päevavalgus), tuul | [Päikesetunnid](topic:sun-hours) arvestab ainult otsest päikest |
| Vari puudelt, taimedelt või millelt iganes, mida pole joonistatud massina | Joonista naabruses olevad hooned massidena |
| Katusekujud massidel | Lameda ülaosaga massid |
| Avad, katused ja seinatüübid, kui mass arendatakse BimCraftis | BimCraft ehitab lihtsad välisseinad igale tasandile ja põrandad; lisa ülejäänu seal |

## GIS ja koordinaatsüsteemid

| Veel valmis pole | Selle asemel praegu |
|---|---|
| File Geodatabase; KML-i stiilid, ikoonid, maapealsed kattekihid ja võrgulingid | Teisenda GeoPackage'iks, shapefile'iks või GeoJSONiks; KML-märgid loetakse ilma stiilideta |
| GIS-objektide või nende atribuutide muutmine | Muuda neid GIS-programmis ja impordi uuesti. Analüüsipaneel teeb uusi kihte (puhver, kattuvus, ühendamine, valik) ja lisab pindala- ja pikkusväljad, aga ei muuda objekti kohapeal |
| Võrgu- ja rasteranalüüs, puhvrid lamedate või ruudukujuliste otstega ja ühepoolsed puhvrid, ridade lisamine või kustutamine ja välja tüübi muutmine atribuuttabelis, käsitsi klassivärvid, stiilide legend graafikutes | Kasuta valikut objektide valimiseks ja kihi tegemiseks neist; lameda otsa ei pakuta. Atribuudi järgi värvimine ja atribuuttabel on olemas: vt [Kihi stiil atribuudi järgi](topic:gis-symbology) ja [Kihi atribuuttabeliga töötamine](topic:gis-table) |
| Sildi stiilid (suurus, paigutus) ja siltide vältimine üksteist | Sildid on ühe suurusega ja võivad tihedates kohtades kattuda |
| Vertikaalsed andmed ja geoidi mudelid | Kõrgusi kasutatakse nii, nagu fail neid annab; kontrolli vertikaalset andmet ise |
| Nihked muudele kui NAD27-st NAD83-sse, mida pakutakse ala järgi (OSTN15, NTv2 teistele andmetele töötavad, kui lisad faili), mitu võrku korraga, vertikaalsed võrgud | Lisa oma andmele vastav võrgufail ise; üks võrk projekti kohta |
| Kaardikihid DXF-is või 3D-eksportides | Kaardikihid lähevad PDF-plotti ja DWG-s pildina kõrvale |
| Kaardiserverid, mis nõuavad sisselogimist, võtit või tokenit | Kasuta avalikke teenuseid või geograafiliselt seotud pildifaili |
| LAS- või LAZ-failide kirjutamine pinnast, maamudelist või kõrgusruudustiku ja LiDAR-tööriistadest | Ekspordi pinnad GeoTIFF kõrgusruudustikuna. [Punktipilvede](topic:point-clouds) lisamoodul kirjutab puhastatud pilve LAS 1.4 või LAZ-na |
| LiDAR-i intensiivsus, värv ja tagasipeegeldused; kõrgusruudustikud mitme kihiga; ruudustiku- või LiDAR-failid üle 200 MB | LiDAR filtreeritakse ainult klassi järgi, ruudustikud kasutavad esimest kihti; lõika suured failid kõigepealt tükkideks |

## Sisend

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Kastvalik puuteekraaniga (vajab {{key:Shift}}) | Vajuta pikalt iga mõõdistuspunkti peale, et see lisada |
| Kirjutatud koordinaadid või kaugused joonistamise ajal | Joonista umbkaudselt, seejärel sisesta täpsed PI koordinaadid trassi PI-tabelis |
| Koordinaatide kirjutamine platvormi nurkadele ja rajatistele | Lohista nende käepidemeid; suumi täpsuse jaoks sisse ja jälgi olekuribal E ja N |
| Haakumine objektidega (muud kui mõõdistuspunktid murdjoontele) | Suumi sisse ja jälgi olekuriba |

## 3D-vaade

| Veel valmis pole | Selle asemel praegu |
|---|---|
| Joonistamine või muutmine 3D-vaates | Joonista ja muuda plaanil; 3D-vaade järgib iga muudatust |
| Koridori tunnusjoonte või GIS-objektide valimine klõpsates 3D-s | Klõpsa neid plaanil |
| Liialdatud vaate või jalgades ekspordi | Eksport on tõelises mõõtkavas meetrites; vt [Ekspordi objekt 3D-s](topic:export-3d) |
| Sildid GLB- või OBJ-eksportides, siltide suurused ja stiilid 3D-s | Sildid on näha ainult 3D-vaates, ühe suurusega; vt [Vaata objekti 3D-s](topic:site-3d) |
| Tekstuurid fotodest, sõidu salvestamine videona, varjud väljaspool objekti, päikesetunnid 3D-vaates | Kaardikihid kaetud pindadel; sõit ja päikese asukoht ühel ajal; [päikesetunnid](topic:sun-hours) päeva või hooaja kohta plaanil |
