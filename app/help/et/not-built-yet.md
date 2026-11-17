---
title: Veel pole valmis
summary: Mida see CivilCraft'i versioon veel ei tee ja mida selle asemel praegu teha.
keywords: puudu, piirangud, tegevuskava, pole saadaval, spiraalid, laiendamine, dwg, dxf, sissevoolud, kinnipidamine, ristlõiked, tulevikus, piirid
from: a2d970ef
---

CivilCraft on varajases arenduses. See leht loetleb, mida praegune versioon ei tee, et sa neid ei otsiks. Miski siin ei ole lubatud kindlaks kuupäevaks.

## Punktid

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Teise punktifaili lisamine esimesele | Ühenda failid enne tekstiredaktoris või tabelarvutuses |
| Punktide tekstifaili eksport | Ekspordi LandXML (punktid lähevad välja CgPoints-na), kasuta GIS-i {{ui:Export}} (punktid väljadega P, N, E, Z ja D) või {{ui:Copy}} punktid tabelarvutusse |
| Punktide silditüübid, sümbolid kirjelduskoodi kaupa, kaared joonekoodidest, kirjelduskoodi fail, mida jagada projektide vahel | Sildid näitavad numbrit, kõrgusmärki ja kirjeldust või vähem ([CivilCraft'i sätted](topic:settings)); koodid hoitakse projektifailis |
| Ühikute teisendamine | Teisenda fail enne importi; **Units** ainult muudab sildi |

## Pinnad

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Rohkem kui üks pind punktidest | Üks projekt pinna kohta |
| Sisemiste piirete peitmine | Kasuta **Longest outside edge** või välimist piiret |
| Ühe joonistatud murdejoone valimine või muutmine | {{key:Mod+Z}} või {{ui:Remove drawn breaklines}} ja joonista uuesti |
| LandXML-ist loetud pinna muutmine (murdejooned, piir) | {{ui:Rebuild the surface from the points}} |
| Kõrgusruudustikust tehtud pinna muutmine | Impordi ruudustik uuesti teiste valikutega |
| LandXML-ist loetud pinna teisendamine, kui koordinaatsüsteem muutub | Kõigepealt {{ui:Rebuild the surface from the points}} |
| Sildistatud punktkõrgused ja kalde väärtused | Loe need olekuribalt või värvi pind kalde järgi, kasutades **Slope analysis** Maastiku töölaual ([Maastiku kalded](topic:landscape-grading#grading-checks)) |

## Trassid ja profiilid

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Muud spiraalid kui klotoid; spiraal kahe kõvera vahel (liitsiirded) | Kõvera otstes on saadaval klotoidspiraalid; teised on nimetatud ja jäetakse LandXML-importimisel vahele |
| PI lisamine kahe teise vahele | Joonista trass uuesti või sisesta PI koordinaadid uuesti |
| Trassid objektidest, nihked, laiendused | Joonista PI-de kaupa |
| Vertikaalkõvera jaoks K sisestamine | Sisesta L (K on näidatud) |
| Ringjad ja asümmeetrilised vertikaalkõverad | Ainult sümmeetrilised parabooli kujulised kõverad |
| Rohkem kui üks projekteeritud profiil trassi kohta | Üks trass variandi kohta |
| Profiilivaate suumimine, profiiliribad profiili all | Profiilivaade mahutab kogu trassi; joonista see [plaani- ja profiililehtedele](topic:plan-profile-sheets) |
| Lõiked DWG-s või LandXML-is | Lõikelehed PDF-ina; {{ui:CSV}} pindade ja mahtude kohta |
| Proovijooned nurga all või erinevate laiustega mööda teed | Üks laius igal küljel kogu trassi kohta |

## Koridorid

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Mediaanid, tõkked ja ülekallet, mis pöörab mallid | Joonista need mallidena ([Koridori mallid](topic:corridor-templates)); jaamade kaupa mallid ei võta veel ülekallet arvesse |
| Järkjärguline üleminek kahe piirkonna mallide vahel (üleminekud, kitsenemised) | Muuda malli jaamas või anna punktile laiusesihik üleminekuna joonistatud joonele |
| Pööramine serva ümber, ülekalle LandXML-is | Ülekalle pöörab ümber keskjoone ringikujulistel kõveratel; laienda sõidurada laiusesihiga tunnusjoonele |
| Külgkalde sihid (valgus joonele või pinnale), koridori enda pinnad | Sihid liigutavad katte ja õlgade servi ([Koridorid](topic:corridor)); koridor on projekteeritud pinnaks |
| Koridorid LandXML-i teedena; teine koridor trassil IFC-ekspordis | Eksporditakse projekteeritud pind |
| Maapinna mallid, mis muudavad projekteeritud pinda, 3D-s või lõigetes | Need annavad iga kihi pindalad ja mahud ([Maapinna mallid](topic:corridor-templates#terrain-templates)) |
| Sõidukite pöörderajad kiiruse, rehvilibisemise, roolimisaja, haagiste ja kerepuhvriga; standardsete projekteerimissõidukite teek; pöörderadu, mis joonistatakse sõidukit lohistades | Madala kiirusega pöörderajad mööda tunnusjoont või trassi, sinu enda sõidukimõõtmetega ([Sõidukite pöörderajad](topic:swept-paths)) |

## Pinnasetööd ja mahud

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Pingid, avatud tunnusjooned, mis on projekteeritud pinnasetöödes, pinnasetöö tunnusjoonele mujalt | Sulge tunnusjoon ([Tunnusjooned](topic:feature-lines)) või kasuta seda olemasoleva maapinna murdejoonena |
| Tunnusjoone tipu lisamine või eemaldamine | Joonista joon uuesti või tee sellest astmeline nihe |
| Kaared joonistatud murdejoontes (läbi mõõdistuspunktide), spiraalid tunnusjoontes | Joonista tunnusjoon kaartega ja kasuta seda olemasoleva maapinna murdejoonena |
| Pinnasetöö kaugusele, kõrgusmärgile või teisele pinnale | Ainult olemasolevale maapinnale |
| Nurga lisamine või eemaldamine platvormil | Kustuta platvorm ja joonista uuesti |
| TIN-TIN (prisma) mahud, ruudustiku lahtri suuruse valimine | Ruudustiku meetod, lahtri suurus määratakse sinu eest |
| Paisumine ja kokkutõmbumine, pinnakiht, katendi paksused | Rakenda tegureid ise esitatud arvudele |
| Vabalt vedu ja ülevedu kulud, vedu eri trasside vahel, laenukohad ja prügilad plaanil | Massiveo diagramm tasakaalupunktidega, liigutatud mahud ja keskmised veokaugused |

## Torustikud

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Rohkem kui üks võrk projekti kohta | Eraldi projektid sademevee ja reovee jaoks |
| Veetorud: vee kvaliteet ja vanus, reeglipõhised juhtimised, muud ventiilitüübid (vooluhulga juhtimine, drosselventiil, toetav), pumbad võimsusega, nõudlus, mis sõltub rõhust, Darcy–Weisbachi valik, toruliste kataloog seinapaksuste ja rõhuklassidega. Ülejäänud rõhuvõrgud on laboris: [Veetorud](topic:water-mains) | Kontrolli neid veevarustuse tarkvaras; reovee projekteerimisvoolud on [Reovee projekteerimisvoolud](topic:sanitary-design) |
| Kanalisatsiooni voolud ajas (hüdrograafid, dünaamiline marsruutimine, mahutid, pumbad, ülevoolud) | [Reovee projekteerimisvoolud](topic:sanitary-design) annab püsiva tippvoolu, mida projektileht kasutab |
| Sissevoolu võimsus, rennivool, väljavoolu marsruutimine, hüdrograafid, muud energiakaod kui üks ristmiku koefitsient | Kontrolli neid muus tarkvaras; voolud, mõõdud ja hüdraulilised jooned on [Sademevee drenaaž](topic:storm-drainage) |
| Valgalad PDF-plotis, DWG-s, DXF-is või LandXML-is; valgalad pinnast (veelahkmed) | Joonista valgalad käsitsi; need salvestatakse projektifailis |
| Toru kataloogid, mittevoorud torud, rajatised, mis ei ole püstised kastid ega silindrid (koonused, astmed, pingid), drenaažikategooria teegis | Rajatiste tüübid parameetritest ([Torustik](topic:pipe-network)); torud läbimõõduga |
| Torud profiilivaates, kõverad torud | Loe sisepõhjad ja katted paremast paneelist |

## Kinnistud

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Krundide paigutamine pindala või rindejoone järgi, kinnistud ümbritsevatest joontest, sõidutee | Joonista iga kinnistu nurkade järgi või sisesta selle suunad |
| Kõverate tabelid ja joonte tabelid plaanil; käsitsi liigutatud sildid | Iga lõik on märgistatud oma joone järgi |
| Kinnistud LandXML-is | Kinnistud salvestatakse projektifailis ja lähevad PDF-i, DWG-sse ja DXF-i |

## Ülekanded

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Vähimruutude korrigeerimine, transiidireegel, nurkade kaalumine kauguste vastu | Kompassireegel |
| Kõrvalekaldenurgad, zeniidinurgad ja kaldekaugused, kõrgused trigonomeetrilise nivelleerimisega | Taanda horisontaalkaugusteks ja nurkadeks õigesti või suundadeks |
| Kõrvalpunktid, toorandmefailid andmekogujatest | Impordi punktid punktifailina |

## Märgistamine

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Nihkevaiad (tugipunktid, mis on nihutatud märgipunktist tagasi), kaldevaiad püüdmispunktis | Märgi nihked, mida vajad, sealhulgas õla taha |
| Märgivaiade saatmine otse andmekogujaa oma vormingus | CSV avaneb enamiku andmekogujate kontoritarkvaras |
| Torustike, platvormide ja kinnistute märgistamine | Kasuta trassi lähedal olevaid mõõdistuspunkte või kinnistu lõike |

## Failid ja väljund

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Tekst, viirutused ja mõõdud DWG-st või DXF-ist; paberruum; seotud joonised (xrefs); binaarne DXF | Mudeliruumi joonestik avaneb ([Ava DWG või DXF joonestikuna](topic:open-dwg-dxf)); seotud joonised ava eraldi |
| Mitme punkti korraga liigutamine lohistades | Lõika ja kleebi need või muuda neid ükshaaval |
| Portreelehed, oma tiitelplokid, paigutatavad vaateaknad, plaani- ja profiililehed DWG-s | Üks maastikulehekülg plaani kohta PDF-is või plaani- ja profiililehed mööda trassi (PDF) |
| Kõrgusribade ja profiilide plottimine | Ribad on ainult ekraanil; võta ekraanitõmmis, kui neid vajad |
| Kihtide nimede, värvide või sildistiilide muutmine | Muuda neid CAD-programmis pärast DXF-eksporti |
| Pilvesalvestus ja versioonide ajalugu | Salvesta `.civilcraft.json` failid ja hoia varukoopiad; ühiseks tööks ühel projektil kasuta reaalajas seanssi CadCraft Studios ([Projekteeri üks ala koos, reaalajas](topic:work-live)) |
| CadCraft Studio iPadile ja iPhone'ile ning Google Play'st | Kasuta CivilCraft'i seadmes brauseris; Androidil installitakse CadCraft Studio APK-failist getcadcraft.com/download |
| Mitme punkti- või projektifaili avamine korraga | Üks fail korraga (kokkukuuluvad GIS-failid, nagu shapefile'i osad, avanevad koos) |

## Maastik

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Tootjate pead ja düüsid | Üldised pead või lisa oma pead failist; tootjate andmed tulevad sisse, kui nad loa annavad |
| Tilkjuhtmete maksimaalsed külgpikkused, voolud ajas, pumbad, silmustatud torustikud | Hoia tilkjooksud tootja avaldatud pikkuses; kontroll nõuab harutatud võrku |
| Nõgusa vabakujulise objekti täpne kontuur; selle maapinnaalune maht täpselt | Kumer kate kaevatakse ja maapinnaalune maht on hinnang (öeldakse Omadustes) |
| Taimed BimCrafti ja ModelCrafti enda funktsioonis Paiguta teegist | Ekspordi maastiku IFC ja ava see BimCraftis hoone kõrval |
| Üksikasjalikud taimemudelid (lehed, oksad, aastaajad) 3D-vaates; vabakujulised objektid ja niisutus 3D-vaates | Taimed näidatakse 3D-s lihtsate kujudena, mis on suurustatud taimenimekirjast ([Vaata ala 3D-s](topic:site-3d)); ModelCrafti hajutus teeb istutuspilte |
| Kõrgust hoidvad seinad, mis hoiavad pinnal taga tasandatud taset | Anna platvormile või padile püstised küljed: need on pinnal toetusseinad ([Maastikutööd](topic:grading)) |
| SVG teisendused oma sümbolites; oma GLB-taimemudelite tekstuurid ja värvid; tihendatud GLB geomeetria | Lameda teisendused enne joonistusprogrammis; mudelid joonistatakse taime värvis; ekspordi GLB ilma tihendamata ([Taimede graafika](topic:plant-graphics)) |
| Sinu oma taimenimekiri, mis hoitakse Library kontos (muudetakse rakenduses) | Muuda projekti enda nimekirja taimetabelis ja salvesta taimefailina |
| Maastikutööriistad abilistele ilma aknata (failiserver ja käsurida) | Need töötavad, kui CivilCraft'i aken on avatud ([Lase tehisintellekti abilisel töötada sinu alaga](topic:assistants)) |

## Elektriliinid

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Riigi standardid sisse ehitatud (koormusjuhud, vabaruumid, tegurid) | Sisesta oma standardi väärtused menüüsse {{ui:Load cases and limits…}} ja salvesta need koos teegiga pakina, mida taaskasutada ja jagada ([Pakid](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Juhtme külgsuunaline kaugus puuvõra või liini kõrval oleva seina suhtes | Vaba vertikaalne ruumivaru taimede ja seinte kohal, mida liin ületab ([Elektriliinide kontrollid](topic:power-line-checks#clearances)) |
| Juhtme roomamine ja uue juhtme venimine | Arvesta nendega paigaldustabeli temperatuuride kaudu |
| Maasse paigaldatud kaablite termiline nimivool (vooluhulk paigaldusviisi järgi) | Sisesta oma tarnija vooluhulk kaabli kirjele |
| Lühise, kaitse ja maandusuuringud | Kasuta spetsiaalset elektriprogrammi; CivilCraft annab võrgu pikkused ja kaablid |
| Võrestikmastid, mida kujundatakse liikmete kaupa, ja mullas olevad ankrud | Mastid kontrollitakse nimikoormuse järgi; tõmmised nimikoormuse järgi |
| `.DON` uuringufail, mida kontrollitakse programmis, mis seda loeb | Kontrolli faili seal; saada meile näidis, et saaksime testida päris failiga |
| Elektriliinid 3D-vaates ja IFC-s | Plaan, liini profiil, lehed ja GIS-kihid |
| Elektriliinide tööriistad abilistele ilma aknata | Need töötavad, kui CivilCraft'i aken on avatud ([Lase tehisintellekti abilisel töötada sinu alaga](topic:assistants)) |

## Ehitusmahud

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Tsoneeringukoodide või ükskõik millise linna reeglite teek | Sisesta piirangud oma eeskirjast ([Tsoneeringu piirangud](topic:zoning-limits)) |
| Taevavalgus seinadel (fassaadi päevavalgus), tuul | [Päikesetunnid](topic:sun-hours) arvestab ainult otsest päikest |
| Varjud puudest, taimedest või millestki, mida ei ole joonistatud massina | Joonista naabruses olevad hooned massidena |
| Katusekujud massidel | Lamekatusega massid |
| Avad, katused ja seinatüübid, kui mass töötatakse välja BimCraftis | BimCraft ehitab lihtsad välisseinad igale korrusele ja põrandale; lisa ülejäänud seal |

## GIS ja koordinaatsüsteemid

| Veel pole valmis | Selle asemel praegu |
|---|---|
| File Geodatabase; KML-i stiilid, ikoonid, maapinnakatted ja võrguühendused | Teisenda enne GeoPackage'iks, shapefile'iks või GeoJSON-iks; KML-i märgid loetakse ilma stiilideta |
| GIS-objektide või nende atribuutide muutmine | Muuda neid GIS-programmis ja impordi uuesti. Analüüsipaneel teeb uusi kihte (puhver, kattuvus, liitmine, valik) ja lisab pindala- ja pikkusväljad, kuid ei muuda objekti kohapeal |
| Võrgu- ja rasteranalüüs, puhvrid lameda või ruudukujulise otsaga ja ühepoolsed puhvrid, ridade lisamine või kustutamine ja välja tüübi muutmine atribuuditabelis, käsitsi klassivärvid, stiilide legend plottides | Kasuta valikut, et valida objektid ja teha neist kiht; lamedaid otsi ei pakuta. Atribuudi järgi värvimine ja atribuuditabel on olemas: vaata [Kihi stiilimine atribuudi järgi](topic:gis-symbology) ja [Kihi atribuuditabeliga töötamine](topic:gis-table) |
| Sildi stiilid (suurus, paigutus) ja silte, mis üksteist ei kattu | Sildid on ühe suurusega ja võivad kattuda, kui objekte on tihedalt |
| Vertikaalsed andmetasandid ja geoidi mudelid | Kõrgusi kasutatakse nii, nagu fail need annab; kontrolli vertikaalset andmetasandit ise |
| Ruudustiku nihked muud kui NAD27-st NAD83-sse, mis soovitatakse piirkonna järgi (OSTN15, NTv2 teiste andmetasandite jaoks töötavad, kui lisad faili), mitu ruudustikku korraga, vertikaalsed ruudustikud | Lisa ruudustiku fail oma andmetasandi jaoks ise; üks ruudustik projekti kohta |
| Kaardikihid DXF-is ega 3D-eksportides | Kaardikihid lähevad PDF-plotti ja DWG-sse pildina |
| Kaardiserverid, mis nõuavad sisselogimist, võtit või tokenit | Kasuta avalikke teenuseid või geoviidatud pildifaili |
| LAS- või LAZ-failide kirjutamine pinnast, maapinna mudelist või kõrgusruudustiku ja LiDAR-i tööriistadest | Ekspordi pinnad GeoTIFF kõrgusruudustikuna. [Punktipilvede](topic:point-clouds) lisandmoodul kirjutab puhastatud pilve LAS 1.4 või LAZ-na |
| LiDAR-i intensiivsus, värv ja tagasipeegeldused; kõrgusruudustikud mitme ribaga; ruudustiku- või LiDAR-failid üle 200 MB | LiDAR filtreeritakse ainult klassi järgi, ruudustikud kasutavad esimest riba; lõika suured failid enne plokkideks |

## Sisend

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Valik kastiga puuteekraanil (see vajab {{key:Shift}}) | Vajuta pikalt iga mõõdistuspunkti peale, et see lisada |
| Trükitud koordinaadid või kaugused joonistamise ajal | Joonista umbkaudselt ja sisesta täpsed PI koordinaadid trassi PI-tabelis |
| Padi nurkade ja rajatiste koordinaatide trükkimine | Lohista nende käepidemeid; suumi täpsuse jaoks sisse ja jälgi olekuribal E ja N |
| Hakkamine objektidele (muud kui mõõdistuspunktid murdejoonte jaoks) | Suumi sisse ja jälgi olekuriba |

## 3D-vaade

| Veel pole valmis | Selle asemel praegu |
|---|---|
| Joonistamine või muutmine 3D-vaates | Joonista ja muuda plaanil; 3D-vaade järgib iga muudatust |
| Koridori tunnusjoonte või GIS-objektide valimine 3D-s klõpsates | Klõpsa neid plaanil |
| Liialdatud vaate või jalgades ekspordi väljastamine | Ekspordid on tõelises mõõtkavas meetrites; vaata [Ala eksport 3D-s](topic:export-3d) |
| Sildid GLB- või OBJ-eksportides, silditi suurused ja stiilid 3D-s | Sildid näitatakse ainult 3D-vaates, üks suurus; vaata [Vaata ala 3D-s](topic:site-3d) |
| Fotodelt tekstuurid, sõidu salvestamine videoks, varjud väljaspool ala, päikesetunnid 3D-vaates | Kaardikihid pindadel; sõit ja päikese asend ühel ajal; [päikesetunnid](topic:sun-hours) päeva või hooaja kohta plaanil |
