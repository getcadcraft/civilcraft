---
title: Mis on uut versioonis 0.7 (varasem)
summary: CivilCraft 0.7 lisab Elektriliinide tööruumi (õhuliinid ja maa-alused kaablid oma teekidega, hälve ja pinge, vabaruumi ja tugevuse kontrollid, paigaldustabelid, kogused, lehed ja GIS), Haljastuse tööruumi (taimenimekiri, istutusplaanid ja -loendid, haljastuse planeerimine, sillutis, seinad ja trepid, niisutuse arvutusabi, haljastuslehed ja vabakujulised objektid), ehitusmahud sinu sisestatud tsoneerimispiirangute ja päikesetundidega, klotoidsed üleminekukaared, koridorid, mis ehitatakse osadest mõlemal pool, USD-ekspordi ning rohkem tööriistu tehisintellekti abilistele.
keywords: mis on uut 0.7, varasem väljalase, väljalaskemärkmed, muudatuste loend, muudatused, 0.7, versioon, uued funktsioonid, haljastus, haljastuse tööruum, taimenimekiri, taimed, istutamine, taimeloend, istutusala, hekk, planeerimine, platvorm, muldvall, kuivkraav, kõrgusmärk, nõlva analüüs, veelompimine, kõvad pinnad, sillutis, rada, sein, kanttee, rambid, trepid, niisutus, pihusti, tilkniisutus, haljastuslehed, vabakujuline objekt, ehitusmaht, mahud, brutopõrandapind, tsoneerimine, tagasiaste, ümbrik, hoonestusintensiivsus, katvus, päikesetunnid, vari, ifc, töötle BimCraftis, üleminekukaar, klotoid, üleminek, koost, kõnnitee, usd, abilised, ühikud, portugali keel
from: 797d2f2f
---

See on see, mis muutus CivilCraft 0.7 versioonis, võrreldes versiooniga 0.6. Suurimad uued osad on Elektriliinide ja Haljastuse tööruumid ning ehitusmahud.

## Uut

### Haljastuse tööruum

- **Haljastuse tööruum samal alal.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Haljastuse tööruum}} lisab olemasolevale alale istutus-, planeerimis-, kõvapinna- ja niisutustööriistad: samad mõõdistuspunktid, pinnad ja projektifail. Tagasi minemiseks vali jaotises **Tööruum** **Civil**. Vaata [Haljastuse tööruum](topic:landscape).
- **Taimenimekiri.** Umbes 420 tavalist parasvöötme ja Vahemere kliimas kasvavat puud, põõsast, hekki, rohttaime, mitmeaastast taime, katet ja ronitaime, koos nende suuruse istutamisel ja täiskasvanuna, talvekindluse tsooni, valguse, vee ja vahekaugusega. Otsi mis tahes nime järgi inglise, hispaania või portugali keeles. Impordi oma loend CSV-na; see salvestatakse projektiga. Sisseehitatud suurused on tüüpilised ja ümardatud: kontrolli neid kohaliku taimlaga. Vaata [Taimenimekiri](topic:plant-list).
- **Istutusplaanid.** {{ui:Taim}} paigutab üksikud taimed maapinnale, mis järgivad hilisemat planeerimist; {{ui:Istutusala}} täidab kontuuri taimede vahekaugusega, segu protsentides; ja {{ui:Hekk}} seab ühe või kaks rida mööda joont. Taimed on plaanil märgistatud. Vaata [Istutusplaanid ja loendid](topic:planting).
- **Taimeloend.** Veel › {{ui:Taimeloend…}} loeb taimed liigi ja istutussuuruse järgi. Salvesta see CSV või XLSX formaadis või saada see TakeoffCraftile hinnastamiseks. Vaata [Taimeloend](topic:planting#the-plant-schedule).
- **Planeerimine haljastuse jaoks.** {{ui:Planeerimine}} pakub platvorme (tasaseid või langevaid), muldvalle, kuivkraave ja planeerimisalasid punktkõrguste ja samakõrgusjoontega, mida lohistad. Kaevand ja täide kuvatakse töö käigus. **Nõlva analüüs** värvib pinna sinu enda kahe piiri järgi ja **Voolunooled ja veelompimine** näitab, kus vesi voolab ja kus see koguneks. Kõik see läheb samasse projekteeritavasse pinda kui platvormid ja koridorid. Vaata [Planeerimine haljastuse jaoks](topic:landscape-grading).
- **Sillutis, rajad, seinad, kanttee, rambid ja trepid.** {{ui:Kõvad pinnad}} joonistab sillutise ristkalde või kaldega äravoolu suunas, mustri ja selle kihid; rajad, mis järgivad maapinda; tugi- ja vabalt seisvad seinad koos astmelise vundamendiga; kantteed; ning rambid ja trepid, mida kontrollitakse sinu seatud piirangute järgi. Üle 1.2 m (4 ft) kõrgune tugisein märgitakse insenerile kontrollimiseks. Vaata [Sillutis, seinad ja trepid](topic:hardscape).
- **Niisutuse arvutusabi.** {{ui:Niisutus}} paigutab pihustid, lateraalid, peatorustiku, ventiilid, tilkniisutusliinid ja liitumispunkti. {{ui:Kontrolli süsteemi…}} leiab torustikust tsoonid, arvutab iga tsooni vooluhulga, ventiilis ja toitepunktis vajaliku rõhu (Hazen–Williams), sademe, töötamisajad, katvuse ja materjalide loendi. See on arvutusabi, mitte projekteerimise sertifikaat: niisutusprojekteerija kontrollib iga tulemust. Pihustid on üldised tüübid või sinu enda failist. Vaata [Niisutuse projekteerimine](topic:irrigation).
- **Haljastuslehed.** {{ui:Veel}} › {{ui:Haljastuslehed…}} teeb istutus-, planeerimis- ja niisutusplaanid koos legendidega ning detaililehe seinalõigete, sillutuskonstruktsioonide ja trepiastmete jaoks, ühe PDF-ina. Vaata [Haljastuslehed](topic:landscape-sheets).
- **Vabakujulised objektid.** Veel › {{ui:Vabakujuline objekt…}} paigutab teises rakenduses tehtud STL-, OBJ- või teegi võrgu, näiteks istutuskasti või skulptuuri. See asub maapinnal või lõikub sellesse ning selle maht, pindala ja jalajälg arvutatakse. Vaata [Vabakujulised objektid](topic:freeform-objects).
- **Haljastuse IFC.** Veel › {{ui:Ekspordi haljastuse IFC}} salvestab taimed (taimestikuna oma omadustega), kõvad pinnad ja vabakujulised objektid IFC 4.3 formaadis BIM-mudeli jaoks. Vaata [IFC](topic:planting#ifc).
- **Algusest lõpuni.** [Aia kujundamine algusest lõpuni](topic:landscape-walkthrough) käib läbi kogu tööruumi näidisalal.

### Elektriliinide tööruum

- **Õhuliinid ja maa-alused kaablid sinu alal.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Elektriliinide tööruum}}: joonista liin toetuste kaupa, kaablid kraavides, seadmed ja takistused samal maapinnal ja samas projektifailis. Vaata [Elektriliinide tööruum](topic:power-lines).
- **Sinu enda teegid.** Juhid, kaablid, toetused, seadmed (traversid, isolaatorid, kinnitused, ankurdused, trafod, kapid, liitmikud) ja kraavitüübid kategooriates, mille sina nimetad, jagatud failina või tabelina. Ühtegi riigi ega tootja kataloogi pole sisse ehitatud; näited ütlevad, et need on näited. Vaata [Sinu elektriliinide teek](topic:power-line-library).
- **Hälve ja pinge sinu koormusjuhtumite all.** Temperatuur, tuul, jää ja jää ühel küljel; pingepiirangud osana purunemistugevusest; täpne kettjoon igal vahemikul, kaldeid arvestades; paigaldustabelid. Vaata [Hälve ja pinge](topic:sag-and-tension).
- **Kontrollid, alati ajakohased.** Vabaruum maapinna ja takistuste kohal, faasivahe, isolaatori kõikumine, üleslükkamine, toetuste koormused koos mõõtmisega sinu teegi järgi, ankurdused, kinnitused, vundamendid, puuduvad andmed, lahtiühendatud kaablid, ülekoormused ja pingekadu, märgitud plaanile ja liini profiilile. Arvutusabi: insener kontrollib. Vaata [Elektriliinide kontrollid](topic:power-line-checks).
- **Tabelid, lehed ja GIS.** Paigaldus- ja toetustabelid, kogused (CSV, Excel, TakeoffCraft), plaani- ja profiililehed koos uuringuaruandega ühes PDF-is, GIS-kihid koos iga vara andmetega. Vaata [Elektriliinide tabelid, kogused, lehed ja GIS](topic:power-line-outputs).
- **Pärast esimesi katseid.** Liini profiil järgib sinu valitud liini, sellel on loend **Liin**, see loeb pinda, juhti ja vabaruumi kursori all ning mõõdab kahe punkti vahel. Haljastuse taimed ja seinad loetakse liinide all takistusteks; kaablitrassid ja torud kuvatakse liini profiilis ning ristuvad sinu valitud vabaruumi reegli järgi; iga vabaruumi kõrval olev **Reeglid…** avab sinu enda reeglid; ja reeglikomplektid koos teegiga salvestatakse paketina, mida jagada riigi kaupa. Vaata [Elektriliinide kontrollid](topic:power-line-checks) ja [Paketid](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Sinu enda failivormingud.** Elektriliinid salvestatakse CivilCraft projektifaili, teegid failidesse `.cclines.json` või CSV, reeglikomplektid ja paketid nende enda JSON-failidesse: avatud vormingud, mida igaüks saab lugeda või teisendada. `.DON`-uuringufail on nende kõrval lisaks import ja eksport.
- **Uuringufailid (.DON), testimata.** Salvesta liin `.DON` uuringufailina teisele liiniprogrammile või loe sealt toetusi. See on koostatud vormingu väljanimede järgi, seda pole veel selle programmiga testitud. Vaata [Uuringufailid](topic:power-line-study-file).

### Mõõtmine

- **Mõõtetööriist.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Mõõda}} (või {{key:M}}) mõõdab plaanil: iga külje pikkuse ja suuna, jooksva kogusumma, pikkuse mööda maapinda ja kalde, ning pindala ja ümbermõõdu, kui kuju sulgud. Projekti ei joonistata midagi. Vaata [Mõõda](topic:measure).

### Ehitusmahud

- **Joonista ehitusmahud.** Omadustes jaotises **Ehitusmahud**, {{ui:Joonista maht}} (ka {{ui:Pind}} › {{ui:Veel}} › {{ui:Mahud}}). Anna mahule korrused ja korruse kõrgus ning loe selle brutopõrandapind. Vali, kuidas see asetub kaldega maapinnal (astmeline, sokkel või kaevand), ja vaata täidet ning kaevandit. Mahud on plaanil, PDF-is ning DWG- ja DXF-failides omal kihil. Vaata [Ehitusmahtude joonistamine alale](topic:building-masses).
- **Lükka ja tõmba 3D-vaates.** 3D-vaates lohista valitud mahu katust või vajuta {{key:PageUp}} ja {{key:PageDown}}, et seda muuta korruse kaupa ühe tagasivõtu sammuga. **Päike** heidab mahtude varju. Vaata [3D-vaates](topic:building-masses#in-the-3d-view).
- **Tsoneerimispiirangud, mille sisestad.** Tagasiastmed joonte kaupa tänavajoonest, kõrgusepiirang, taevavalguse tasapind, hoonestusintensiivsus ja katvus. Ehitatav ala joonistatakse plaanile ning iga mahu juurde tuleb iga piirangu kohta linnuke või rist. CivilCraft ei sisalda tsoneerimisnorme: iga number on see, mille sisestad oma kohalikust määrusest. Vaata [Kontrolli mahte sisestatud tsoneerimispiirangute vastu](topic:zoning-limits).
- **Päikesetunnid.** Vali päev või hooaeg ning ajavöönd nime või nihke järgi ja loe otsese päikese tunnid igal mahu seinal ja igal korrusel ning nende ümbritsevas maapinnas, joonistatuna plaanile. Salvesta seinad ja maapind CSV-na. Projektil peab olema koordinaatsüsteem. Vaata [Päikesetundide arvutamine alal](topic:sun-hours).
- **Mahud IFC-na ja edasi BimCraftis.** {{ui:Mahud IFC-na}} salvestab mahud IFC4 formaadis, paigutatuna kaardile, kui projektil on koordinaatsüsteem. {{ui:Arenda BimCraftis}} avab BimCraft uuel vahekaardil mahtudega, kus **Arenda seda mahtu** ehitab igal tasandil seinad ja jalajäljest põranda. Midagi ei laadita üles. Vaata [Saada edasi](topic:building-masses#send-it-on).

### Trassid

- **Klotoidsed üleminekukaared.** Sisesta pikkus väljadele **Üleminekukaar sisse** ja **Üleminekukaar välja** PI-tabelis kõvera jaoks: puutuja, üleminekukaar, kõver, üleminekukaar, puutuja, võrdsete või erinevate pikkustega. Plaanil on märgitud TS, SC, CS ja ST, kõverate loend annab θs ning puutuja ja välised kaugused, ning joonkohad ja nihked kulgevad läbi üleminekukaarte. Vaata [Üleminekukaared](topic:alignment#spirals).
- **Üleminekukaared LandXML-is.** LandXML kirjutab ja loeb klotoidseid üleminekukaari. Trassid üleminekukaartega, mida CivilCraft importimisel varem vahele jättis, avanevad nüüd. Vaata [LandXML-i vahetus](topic:landxml).

### Koridorid

- **Ehita iga külg osadest.** Lülita sisse **Ehita iga külg osadest**, et igal küljel oleks oma loend keskjoonest väljapoole: sõidurajad, teeäär, rennik, kanttee, haljasriba, kõnnitee ja külgnõlv oma kaevandi ja täitega. Alusta valikust {{ui:Maantee}} või {{ui:Linnatänav}} ja kopeeri üks külg teisele. Ristlõiked märgivad voolujoone, kanttee ja kõnnitee ning planeeritud pind sisaldab kanttee. Vaata [Ehita iga külg osadest](topic:corridor#build-each-side-from-parts).
- **Üleminekukaare ülekõrgendus.** Kõveral üleminekukaartega käib ülekõrgenduse üleminek üle üleminekukaare: tasane kumerus TS-punktis, täielik ülekõrgendus SC-punktis. Vaata [Ülekõrgendus](topic:corridor#superelevation).

### 3D-failid

- **USD eksport.** 3D-vaates kirjutab {{ui:USD}} ala failina `.usda`, `.usdc` või `.usdz` õiges mõõtkavas ja projekti koordinaatides: pinnad, torud ja rajatised võrkudena, jooned, iga trass ning mõõdistuspunktid koos numbritega. Vaata [Ala 3D-eksport USD-na](topic:usd).

### Tehisintellekti abilised

- **Rohkem võimalusi abilistele.** Kui abilised on sisse lülitatud jaotises {{ui:Sätted}} › {{ui:CivilCraft}}, saab abiline nüüd lugeda ka krunte, kaevandeid, täiteid ja profiile, lisada mõõdistuspunkte, salvestada projekti, eksportida LandXML, DWG ja USD ning töötada kaustades, mille valid CadCraft Studios. Haljastuse tööruum lisab tööriistu taimede leidmiseks ja paigutamiseks, istutusalade ja hekkide paigutamiseks, planeerimiseks ja niisutuse kontrollimiseks. Failiserver ja käsurida `cadcraft` avavad salvestatud projektid ilma aknata. Vaata [Lase tehisintellekti abilisel töötada sinu alaga](topic:assistants).

## Kõigis rakendustes

- **Ühikud.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Ühikud}} sisaldab iga pikkuse, pindala, mahu, nurga ja kalde jaoks ühte loendit täpsete suurustega vastavalt ühikute definitsioonidele (USA mõõdistusjalg on oma ühik). Lülita välja ühikud, mida ei kasuta, ja need kaovad ühikuloenditest; tärni märkimine teeb uue töö selles ühikus. Fail säilitab alati oma ühiku. CivilCraftis järgib projekti **Ühikud**-loend lülitite seadeid: pikkuse tärn algatab uued projektid meetrites (muidu jalgades, mis on USA mõõdistusjalad), pindala või mahu tärn määrab ühiku, milles pindalad ja mahud esitatakse, ning pikkuse väli võtab vastu ükskõik millise ühiku tähise, näiteks `3 ch` või `450 mm`. Vaata [Ühikud, sisestatud väärtused ja ühikuloendid](common:unit-lists).
- **Tihedam paigutus ja kokkuvoltuvad paneelid.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Paigutuse tihedus}} › {{ui:Tihe}} mahutab ekraanile rohkem (puuteekraanid ja telefonid säilitavad suured nupud). Igal külgpaneelil on õhuke pealkirjariba: lohista seda, et paneel kinnitada või ujuma panna, lase see teise paneeli ribale, et jagada üks raam vahekaartidena, kinnita see, et see libiseks serva, või peida ja too servast tagasi. Vaata [Paneelide paigutamine](common:arrange-panels#make-the-layout-denser).
- **Dialoogid liiguvad.** Lohista dialoogi selle tiitelribast joonistusest eemale; see tuleb tagasi sinna, kus viimati olid. Topeltklõps tiitelribal tsentreerib selle uuesti. Vaata [Dialoogi liigutamine](common:arrange-panels#move-a-dialog).
- **Retseptid tehisintellekti abilistele.** Kümme näidisülesannet sinu enda abilisele (korrasta joonis, joonista komplekt, kontrolli jooniseid, küsi mudeli kohta küsimusi, arvuta koguste kokkuvõte, proovi detaili varianti …), igaüks koos kutsutavate tööriistade ja vajalike lubadega ning iga üks käitatud meie testides. Rakendused ei sisalda tehisintellekti. Vaata [Retseptid tehisintellekti abilistele](common:assistants-recipes).
- **Keeled.** **Português (Portugal)** on uus jaotises {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Keel}}. See, **Português (Brasil)**, **Español (México)** ja **Bahasa Indonesia** on nüüd rakenduste kõigi sõnadega, kuid mustanditena, mida emakeelne kasutaja pole veel üle vaadanud. Abiteemad on inglise keeles, mõned hispaania keeles.
- **CadCraft Studio** ütleb, miks uuenduse kontroll ebaõnnestus (failid sinu süsteemile pole veel valmis, võrk puudub, vale allkiri), selle asemel et öelda lihtsalt „Valmis“. Ta ei too enam tagasi kaarti „Mis on uut“, mille oled sulgenud, kuni on uuem väljalase.

## Pole selles versioonis veel

- **0.7 pole koodiga allkirjastatud.** Allkirjastamine ja Microsoft Store'i pakett lükati versioonile 0.8, sest sertifikaadi kinnitus pole veel tulnud. Kontrolli iga faili kõrval olevat SHA-256 summat aadressil getcadcraft.com/download. Windowsis, kui SmartScreen peatab paigaldaja, vali {{ui:Rohkem teavet}}, seejärel {{ui:Käivita siiski}}. Macis tee CadCraft Studios esmakordselt paremklõps ja vali {{ui:Ava}}. CadCraft Studio pole veel ühegi rakenduspoe kaupluses ja iPadi ega iPhone'i versiooni veel pole.
- Nurga- ja kalde loendid jaotises {{ui:Ühikud}} salvestatakse, kuid ükski kast neid veel ei loe.
- Tootjate niisutuspead: ainult üldised pead ja sinu enda pead failist. Tootjate andmed tulevad sisse ainult nende loal ja luba pole veel antud.
- BimCraft ja ModelCraft kannavad taimenimekirja, kuid nende Paiguta teegist ei paku veel taimi. Taimed jõuavad BimCraftini haljastuse IFC kaudu.
- Haljastuse tööriistad abilistele töötavad CivilCraft-akna avatuna; failiserver ja käsurida neid veel ei oma.
- Ehitusmahud: pole fassaadi päevavalgust ega tuult, pole varju puudelt ega millelt tahes, mida pole joonistatud mahuna, pole katusekujusid, ja päikesetunnid kuvatakse plaanil, mitte 3D-vaates. Arenda BimCraftis ehitab lihtsaid seinu ja põranda, ilma avade ja katuseta.
- Elektriliinid: ühtki riigi standardit pole sisse ehitatud (sina sead koormusjuhtumid, piirangud ja vabaruumid); pole juhtme roomamise, maa-aluste kaablite termilise hinnangu, lühisevoolu, kaitse ega maandusuuringuid; pole liine 3D-vaates ega IFC-s. `.DON` uuringufaili pole testitud programmiga, mis seda loeb.
- Üleminekukaared muud kui klotoidsed, kaar kahe kõvera vahel ja üleminekukaared tunnusjoontes. Üleminekukaari on kontrollitud valemite ja LandXML-skeemi järgi, kuid veel mitte LandXML-failiga, mis on tehtud teisest programmist.
- Koridori koostud, mis muutuvad mööda teed, piirkonnad ja külgnõlva sihtmärgid.
- Veetorustikud ja rõhuvõrgud (järgmine tsiviiltöö), vooluhulgad, mis muutuvad ajas, ning seosed vee- ja sademeveevõrkude vahel.
- Joonistatud murdejoontes olevad kaared. Standardsete projekteerimissõidukite tabelid: viis kaasasolevat sõidukit on märgitud kohatäitjatena. Projektide vahel jagatud tunnusjooned ootavad meeskonnaprojekte.

Kõik muu on lehel [Veel valmimata](topic:not-built-yet).
