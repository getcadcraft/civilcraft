---
title: Mis on uut versioonis 0.7
summary: CivilCraft 0.7 lisab Elektriliinide tööruumi (õhu- ja maakaablid oma teekide, ripe ja pinge, vahekauguste ja tugevuse kontrollid, paigaldustabelid, kogused, lehed ja GIS), Haljastuse tööruumi (taimenimekirja, istutusplaanid, planeerimise, sillutise, müürid ja trepid, niisutuse arvutusabi, haljastuslehed ja vabakujulised objektid), hoonemahud sinu sisestatud tsoneerimispiirangute ja päikesetundidega, klotoidspiraalid, koridorid, mis koostatakse mõlema külje osadest, USD-ekspordi ning rohkem tööriistu tehisintellekti abilistele.
keywords: mis on uut, versioonimärkmed, muudatuste logi, muudatused, versioon 0.7, versioon, uued funktsioonid, haljastus, haljastuse tööruum, taimenimekiri, taimed, istutamine, taimeloend, istutusala, hekk, planeerimine, platvorm, vall, kuivkraav, punktkõrgus, kalde analüüs, veekogumine, sillutis, rada, müür, äärekivi, rambid, trepid, niisutus, pihusti, tilkniisutus, haljastuslehed, vabakujuline objekt, hoonemahu, mahud, brutopõrandapind, tsoneerimine, taandus, ehitusruum, taevatasand, korruspindade suhe, hõivatus, päikesetunnid, vari, ifc, arenda BimCraftis, spiraal, klotoid, üleminek, lõiketüüp, kraav, kõnnitee, usd, abilised, ühikud, portugali keel
from: 3c9d79db
---

See on, mis muutus CivilCraft'i versioonis 0.7 võrreldes versiooniga 0.6. Suurimad uued osad on Elektriliinide ja Haljastuse tööruumid ning hoonemahud.

## Uus

### Haljastuse tööruum

- **Haljastuse tööruum samal alal.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Haljastuse tööruum}} lisab olemasolevale alale istutamise, planeerimise, kõvade pindade ja niisutuse tööriistad: samad mõõdistuspunktid, pinnad ja projektifail. Tagasi minemiseks vali **Tsiviil** jaotises **Tööruum**. Vaata [Haljastuse tööruum](topic:landscape).
- **Taimenimekiri.** Umbes 420 tavalist parasvöötme ja vahemerelist puud, põõsast, hekki, rohttaime, mitmeaastast taime, katmistaime ja ronitaime koos suurustega istutamisel ja täiskasvanuna, talvekindluse tsooniga, valguse, vee ja vahekaugusega. Otsi nime järgi inglise, hispaania või portugali keeles. Impordi oma nimekiri CSV-na; see salvestatakse projektiga. Sisseehitatud suurused on tüüpilised ja ümardatud: kontrolli neid kohaliku taimlaga. Vaata [Taimenimekiri](topic:plant-list).
- **Istutusplaanid.** {{ui:Taim}} paigutab üksikud taimed, mis istuvad maapinnale ja järgivad hilisemat planeerimist; {{ui:Istutusala}} täidab kontuuri taimede vahekaugusel protsentuaalse segu järgi; {{ui:Hekk}} seab ühe või kaks rida mööda joont. Taimed on plaanil märgistatud. Vaata [Istutusplaanid ja loendid](topic:planting).
- **Taimeloend.** Veel › {{ui:Taimeloend…}} loeb taimed liigi ja istutussuuruse järgi kokku. Salvesta see CSV- või XLSX-na või saada TakeoffCraftile hinnastamiseks. Vaata [Taimeloend](topic:planting#the-plant-schedule).
- **Planeerimine haljastuse jaoks.** {{ui:Planeerimine}} sisaldab platvorme (tasaseid või langevaid), valle, kuivkraave ja planeerimisalasid punktkõrgustega ja samakõrgusjoontega, mida lohistad. Väljakaevamine ja täide kuvatakse kohe. **Kalde analüüs** värvib pinna sinu enda kahe piiriga ja **Voolunooled ja veekogumine** näitab, kus vesi voolab ja kus see koguneks. Kõik läheb samasse planeeritud pinnasse, mis platsid ja koridorid. Vaata [Planeerimine haljastuse jaoks](topic:landscape-grading).
- **Sillutis, rajad, müürid, äärekivid, rambid ja trepid.** {{ui:Kõvad pinnad}} joonistab sillutise ristkalde või langusega äravoolu suunas, mustri ja selle kihid; rajad, mis järgivad maapinda; tugi- ja vabalseisvad müürid astmelise alusega; äärekivid; ning rambid ja trepid, mida kontrollitakse sinu seatud piiride vastu. Tugimüür üle 1,2 m (4 ft) märgitakse insenerile kontrollimiseks. Vaata [Sillutis, müürid ja trepid](topic:hardscape).
- **Niisutuse arvutusabi.** {{ui:Niisutus}} paigutab pihustid, lateraalid, peatoru, ventiilid, tilkvoolikud ja ühenduspunkti. {{ui:Kontrolli süsteemi…}} leiab tsoonid torude järgi ja arvutab iga tsooni vooluhulga, ventiili juures ja toitel vajaliku rõhu (Hazen–Williams), sademe, tööajad, katvuse ja materjalide loendi. See on arvutusabi, mitte projekteerimise kinnitus: niisutuse projekteerija kontrollib iga tulemust. Pihustid on üldised tüübid või sinu enda failist. Vaata [Niisutuse projekteerimine](topic:irrigation).
- **Haljastuslehed.** Veel › {{ui:Haljastuslehed…}} koostab istutus-, planeerimis- ja niisutusplaanid koos legendidega ning detailide lehe müürilõigete, sillutiste ülesehituste ja treppidega ühe PDF-ina. Vaata [Haljastuslehed](topic:landscape-sheets).
- **Vabakujulised objektid.** Veel › {{ui:Vabakujuline objekt…}} paigutab teises rakenduses tehtud STL-, OBJ- või teegi võrgu, näiteks istutuskasti või skulptuuri. See seisab maapinnal või lõikub sellesse, ja selle maht, pindala ja jalajälg arvutatakse. Vaata [Vabakujulised objektid](topic:freeform-objects).
- **Haljastuse IFC.** Veel › {{ui:Ekspordi haljastuse IFC}} salvestab taimed (taimestikuna oma omadustega), sillutise ja vabakujulised objektid IFC 4.3-na BIM-mudeli jaoks. Vaata [IFC](topic:planting#ifc).
- **Algusest lõpuni.** [Kujunda aed algusest lõpuni](topic:landscape-walkthrough) käib kogu tööruumi läbi näidisalal.

### Elektriliinide tööruum

- **Õhuliinid ja maakaablid sinu alal.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Elektriliinide tööruum}}: joonista liin toetuspunktide järgi, kaablid kraavides, seadmed ja takistused samal maapinnal ja samas projektifailis. Vaata [Elektriliinide tööruum](topic:power-lines).
- **Sinu enda teegid.** Juhtmed, kaablid, toed, seadmed (ristpuud, isolaatorid, liitmikud, tugitrossid, trafod, kapid, muhvid) ja kraavitüübid kategooriates, mida sa nimetad; jagatud failina või tabelina. Ühtegi riigi ega tootja kataloogi pole sisse ehitatud; näited ütlevad, et need on näited. Vaata [Sinu elektriliinide teek](topic:power-line-library).
- **Ripe ja pinge sinu koormusjuhtumite järgi.** Temperatuur, tuul, jää ja jää ühel küljel; pingepiirangud osana purunemistugevusest; täpne kettjoon igal vahemikul, kaldega arvestades; paigaldustabelid. Vaata [Ripe ja pinge](topic:sag-and-tension).
- **Kontrollid, alati ajakohased.** Vaba kõrgus maapinnast ja takistustest, faasivahe, isolaatori kõikumine, tõste, toetuste koormused koos mõõtmisega sinu teegi järgi, tugitrossid, liitmikud, vundamendid, puuduvad andmed, lahtised kaablid, ülekoormused ja pingelangus, märgitud plaanil ja liinprofiilil. Abivahend projekteerimisel: insener kontrollib. Vaata [Elektriliinide kontrollid](topic:power-line-checks).
- **Tabelid, lehed ja GIS.** Paigaldus- ja toetustabelid, kogused (CSV, Excel, TakeoffCraft), plaani- ja profiililehed koos uuringu aruandega ühes PDF-is, GIS-kihid koos iga objekti andmetega. Vaata [Elektriliinide tabelid, kogused, lehed ja GIS](topic:power-line-outputs).
- **Pärast esimesi katseid.** Liinprofiil järgib valitud liini, sellel on **Liin**-loend, see loeb osuti all maapinda, juhet ja vahekaugust ning mõõdab kahe punkti vahel. Haljastuse taimed ja müürid loevad liinide all takistusteks; kaablitrassid ja torud kuvatakse liinprofiilis ning ristuvad sinu valitud vahekauguse reegliga; iga vahekauguse kõrval olev **Reeglid…** avab sinu enda reeglid; ja reeglikomplektid koos teegiga salvestuvad paketina riigiti jagamiseks. Vaata [Elektriliinide kontrollid](topic:power-line-checks) ja [Paketid](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Sinu enda failivormingud.** Elektriliinid salvestatakse CivilCraft'i projektifaili, teegid failidesse `.cclines.json` või CSV, reeglikomplektid ja paketid omaenda JSON-failidesse: avatud vormingud, mida kõik saavad lugeda või teisendada. `.DON` uuringufail on lisaks imporditav ja eksporditav nende kõrval.
- **Uuringufailid (.DON), testimata.** Salvesta liin `.DON` uuringufailina teisele liinitarkvarale või loe sealt toed sisse; fail on ehitatud vormingu väljanimedest ja pole veel selle programmiga testitud. Vaata [Uuringufailid](topic:power-line-study-file).

### Mõõtmine

- **Mõõtetööriist.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Mõõda}} (või {{key:M}}) mõõdab plaanil: iga külje pikkuse ja suuna, jooksva summa, pikkuse mööda maapinda ja kalde, ning pindala ja ümbermõõdu, kui kuju suletakse. Midagi ei joonistata projekti. Vaata [Mõõda](topic:measure).

### Hoonemahud

- **Hoonemahtude joonistamine.** Omadustes jaotises **Hoonemahud** {{ui:Joonista maht}} (ka {{ui:Pind}} › {{ui:Veel}} › {{ui:Mahud}}). Anna mahule korrused ja korruse kõrgus ning loe selle brutopõrandapind. Vali, kuidas see seisab kaldus maapinnal (astmeline, sokkel või lõige), ning vaata täidet ja lõiget. Mahud on plaanil, PDF-is ning DWG- ja DXF-is omaette kihtidel. Vaata [Hoonemahtude joonistamine alale](topic:building-masses).
- **Lükka ja tõmba 3D-s.** 3D-vaates lohista valitud mahu katust või vajuta {{key:PageUp}} ja {{key:PageDown}}, et muuta seda korruse kaupa ühe tagasivõtmise sammuga. **Päike** heidab mahtude varjud. Vaata [3D-vaates](topic:building-masses#in-the-3d-view).
- **Sisestatud tsoneerimispiirangud.** Taandused rea kaupa tänavajoonest, kõrgusepiirang, taevatasandi nõue, korruspindade suhe ja hõivatus. Lubatud ehitusruum joonistub plaanile ning iga mahu juurde tuleb linnuke või rist iga piirangu kohta. CivilCraft'is pole ühtegi tsoneerimisseadustikku: iga arv on see, mille sa oma määrusest sisestad. Vaata [Mahtude kontroll sisestatud tsoneerimispiirangute vastu](topic:zoning-limits).
- **Päikesetunnid.** Vali päev või hooaeg ning ajavöönd nime või nihke järgi ja loe otsese päikese tunnid igal mahu seinal ja igal korrusel ning ümbritseval maapinnal; need joonistuvad plaanile. Salvesta seinad ja maapind CSV-na. Projektil peab olema koordinaatsüsteem. Vaata [Päikesetundide arvutamine alal](topic:sun-hours).
- **Mahud IFC-na ja edasi BimCraftis.** {{ui:Mahud IFC-na}} salvestab mahud IFC4-na, kaardile paigutatuna, kui projektil on koordinaatsüsteem. {{ui:Arenda BimCraftis}} avab BimCraft uuel vahelehel mahtudega, kus **Arenda seda mahtu** ehitab seinad igale tasandile ja põranda jalajäljest. Midagi ei üleslaadita. Vaata [Saada edasi](topic:building-masses#send-it-on).

### Trassid

- **Klotoidspiraalid.** Sisesta pikkus väljadele **Spiraal sisse** ja **Spiraal välja** kõvera PI-tabelis: puutuja, spiraal, kõver, spiraal, puutuja, võrdsete või erinevate pikkustega. Plaan märgib TS, SC, CS ja ST; kõverate loend annab θs ning puutuja ja välise kauguse; jaamad ja nihked kulgevad läbi spiraalide. Vaata [Spiraalid](topic:alignment#spirals).
- **Spiraalid LandXML-is.** LandXML kirjutab ja loeb klotoidspiraale. Spiraalidega trassid, mida CivilCraft varem importimisel vahele jättis, avanevad nüüd. Vaata [LandXML-vahetus](topic:landxml).

### Koridorid

- **Iga külg osadest.** Lülita sisse **Koosta iga külg osadest**, et anda igale küljele oma loend keskjoonest väljapoole: sõidurajad, äärmine rada, kraav, äärekivi, istutusriba, kõnnitee ja külgkalle oma väljakaevamise ja täitega. Alusta valikust {{ui:Maantee}} või {{ui:Linnatänav}} ja kopeeri üks külg teisele. Ristlõiked märgivad voolujoone, äärekivi ja kõnnitee ning planeeritud pinnal on äärekivi. Vaata [Iga külg osadest](topic:corridor#build-each-side-from-parts).
- **Ülekõrgendus spiraalidel.** Kõveral spiraalidega ulatub ülekõrgenduse üleminek üle spiraali: tasane pealispind TS-il, täielik ülekõrgendus SC-l. Vaata [Ülekõrgendus](topic:corridor#superelevation).

### 3D-failid

- **USD-eksport.** 3D-vaates kirjutab {{ui:USD}} ala `.usda`, `.usdc` või `.usdz` vormingus tõelises mõõtkavas ja oma projektikoordinaatides: pinnad, torud ja rajatised võrkudena, jooned, iga trass ning mõõdistuspunktid numbritega. Vaata [Ala eksportimine 3D USD-na](topic:usd).

### Tehisintellekti abilised

- **Rohkem abilistele.** Kui abilised on sisse lülitatud jaotises {{ui:Sätted}} › {{ui:CivilCraft}}, saab abiline nüüd lugeda ka katastriüksusi, väljakaevamist ja täidet ning profiile, lisada mõõdistuspunkte, salvestada projekti, eksportida LandXML-i, DWG-d ja USD-d ning töötada kaustades, mille valid rakenduses CadCraft Studio. Haljastuse tööruum lisab tööriistu taimede otsimiseks, taimede, istutusalade ja hekkide paigutamiseks, planeerimiseks ja niisutuse kontrollimiseks. Failiserver ja käsurida `cadcraft` avavad salvestatud projektid ilma aknata. Vaata [Lase tehisintellekti abilisel töötada sinu alaga](topic:assistants).

## Igas rakenduses

- **Ühikud.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Ühikud}} sisaldab iga pikkuse, pindala, mahu, nurga ja kalde jaoks ühte loendit, täpsete suurustega, mis tulevad ühikute definitsioonidest (USA mõõdistusjalg on oma ühik). Lülita välja ühikud, mida ei kasuta, ja need lahkuvad ühikuloendist; märgi üks tärniga ja uus töö algab selles. Fail hoiab alati oma ühikut. CivilCraft'is järgib projekti loend **Ühikud** lülitit: meetrilise pikkuse tärn alustab uusi projekte meetrites (muidu jalgades, mis on USA mõõdistusjalad), pindala või mahu tärn määrab ühiku, milles pindalad ja mahud esitatakse, ning pikkuse väli võtab vastu ükskõik millise ühiku tähise, näiteks `3 ch` või `450 mm`. Vaata [Ühikud, sisestatud väärtused ja ühikuloendid](common:unit-lists).
- **Tihedam paigutus ja paneelid, mis koonduvad.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Paigutuse tihedus}} › {{ui:Tihe}} mahutab ekraanile rohkem (puuteekraanid ja telefonid säilitavad suured nupud). Igal külgpaneelil on kitsas pealkirjariba: lohista seda, et paneel kinnitada või ujuvaks muuta; viska teise paneeli ribale, et jagada üks raam vahelehtedena; kinnita, et see libiseks servale; või peida ja too servast tagasi. Vaata [Paneelide paigutamine](common:arrange-panels#make-the-layout-denser).
- **Dialoogid liiguvad.** Lohista dialoogi pealkirjaribast joonise eest eemale; see tuleb tagasi sinna, kust lahkusid. Topeltklõps pealkirjaribal tsentreerib selle uuesti. Vaata [Dialoogi liigutamine](common:arrange-panels#move-a-dialog).
- **Retseptid tehisintellekti abilistele.** Kümme läbitöötatud päringut sinu enda abilisele (korrasta joonis, plotti komplekt, kontrolli jooniseid, küsi mudelilt, koosta mahtude kokkuvõte, proovi detaili varianti …), igaüks koos tööriistadega, mida see kasutab, ja vajalike õigustega; iga üks käivitatakse meie testides uuesti. Rakendused ei sisalda tehisintellekti. Vaata [Retseptid tehisintellekti abilistele](common:assistants-recipes).
- **Keeled.** **Português (Portugal)** on uus jaotises {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Keel}}. See, **Português (Brasil)**, **Español (México)** ja **Bahasa Indonesia** sisaldavad nüüd kõiki rakenduste sõnu, kuid mustandina, mida pole emakeelne kasutaja üle vaadanud. Abiteemad on inglise keeles, mõned hispaania keeles.
- **CadCraft Studio** ütleb, miks värskenduste kontroll ebaõnnestus (sobivat faili sinu süsteemile pole veel, võrguühendus puudub, allkiri on vigane), mitte lihtsalt „Valmis“, ja ei too enam tagasi Mis on uut kaarti, mille sa sulgesid, enne kui tuleb uuem väljalase.

## Pole veel selles versioonis

- **0.7 pole koodiga allkirjastatud.** Allkirjastamine ja Microsoft Store'i pakend lükati versioonile 0.8, sest sertifikaadi kinnitus pole veel tulnud. Kontrolli iga faili kõrval olevat SHA-256 väärtust aadressil getcadcraft.com/download. Windowsis, kui SmartScreen peatab installeri, vali {{ui:Täpsemalt}}, siis {{ui:Käivita siiski}}. Macil vali esmakordsel käivitamisel CadCraft Studio paremklõpsuga ja vali {{ui:Ava}}. CadCraft Studio pole veel rakenduste poes ning iPadi ega iPhone'i versiooni pole veel.
- Nurga- ja kalde loendeid jaotises {{ui:Ühikud}} salvestatakse, aga veel ükski väli neid ei loe.
- Tootjate niisutuspihustid: ainult üldised pihustid ja sinu enda pihustid failist. Tootjate andmed tulevad sisse ainult nende loal ja luba pole veel antud.
- BimCraft ja ModelCraft kannavad taimenimekirja, kuid nende {{ui:Paiguta teegist}} ei paku veel taimi. Taimed jõuavad BimCraftini haljastuse IFC kaudu.
- Haljastuse tööriistad abilistele töötavad CivilCraft'i akna avamisel; failiserver ja käsurida neid veel ei oma.
- Hoonemahud: pole fassaadi päevavalgust ega tuult, pole varju puudelt ega millelt iganes, mida pole joonistatud mahuna, pole katusekujusid, ja päikesetunnid kuvatakse plaanil, mitte 3D-vaates. Arendamine BimCraftis koostab tavalisi seinu ja põranda, ilma avade ja katuseta.
- Elektriliinid: pole ühtegi riigi standardit sisse ehitatud (sina seadistad koormusjuhtumid, piirangud ja vahekaugused); pole juhtme roomamise, maa-kaablite termilise koormuse, lühisvoolu, kaitse ega maandusuuringuid; pole liine 3D-vaates ega IFC-s. `.DON` uuringufail pole testitud programmiga, mis seda loeb.
- Muud kui klotoidspiraalid, spiraal kahe kõvera vahel ja spiraalid joonelementides. Spiraale on kontrollitud valemite ja LandXML-skeemi vastu, mitte veel LandXML-failiga, kus on spiraalid teisest programmist.
- Koridori lõiketüübid, mis muutuvad mööda teed; piirkonnad ja kaldekalde sihtmärgid.
- Veetorud ja survevõrgud (järgmine tsiviiltöö), ajas muutuvad voolud ning ühendused vee- ja sademeveevõrkude vahel.
- Joonistatud murdejoonte kaared. Standardsete projekteerimissõidukite tabelid: viis kaasasolevat sõidukit on kohahoidjad. Projektide vahel jagatud joonelemendid ootavad meeskonnaprojekte.

Kõik muu on jaotises [Veel ehitamata](topic:not-built-yet).
