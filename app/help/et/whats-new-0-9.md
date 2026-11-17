---
title: Mis on uut versioonis 0.9
summary: Koridori- ja maastikumallid, haakumised ja valimisnupud joonistamisel, GIS-analüüs atribuuditabeliga, varjuuuring, päikeseenergia saagis, mugavus ja tuuleuuring ala jaoks, 3D Render-vaade ning lisandmoodulid Punktipilved ja WaterCraft.
keywords: mis on uut, 0.9, väljalaskemärkmed, koridori mallid, maastikumallid, mallide redaktor, tüüpiline lõige, mitu koridori, haakumine, haakumised, valimine, teisaldamine, kopeerimine, pööramine, puutuja, render, 3D render, GIS-analüüs, puhver, kattumine, ruumiline ühendamine, atribuuditabel, stiil atribuudi järgi, varjuuring, päikeseenergia saagis, utci, välistingimuste mugavus, tuuleuuring, openfoam, punktipilved, las, laz, watercraft, tuletõrje vooluhulk, hüdrant, vee vanus, kloor, tarbimised, tööriistavihjed, paigutus, muudatuste loend, 0.8, 0.8.1, versioon, uued funktsioonid, vihm, sademevesi, veelompimine, üleujutus, ülevool, pinnasetasakaal, kaevand ja täide, vedu, parim trass, vähim kulu, trass, sademeveetiik, väljavool, veetaseme langus, vaba kõrgus, edenemine, mõõdistus, droon, ladu, aadress asukohaks, krunt, pinnas, üleujutus, nõlva stabiilsus, Bishop, vajumine, ristmik, markeering, märgid, nähtavuskaugus, korrigeerimine, vähimruutude meetod, polügoonikäik, lahtine kaevandus, plokkmudel, raadiolink, Fresneli tsoon, raudteevahetus, ristvahetus, keeled, probleemid, reaalajas, dwg
from: d7ac5b14
---

See on see, mis muutus CivilCraft 0.9 versioonis, võrreldes versiooniga 0.8.1. CivilCraft 0.9 on osa CadCraft Studio 0.9-st ja selle kaheksast rakendusest. Suurimad osad on koridori- ja maastikumallid, haakumine joonistamisel, GIS-analüüs, ala päikese, päikeseenergia saagise, mugavuse ja tuule uuringud ning kaks lisandmoodulit: Punktipilved ja WaterCraft.

## Uut

### Koridori- ja maastikumallid

- **Koridori mallid.** Ava {{ui:Pind}} › {{ui:Veel}} › {{ui:Koridori mallid…}} (või kirjuta {{cmd:TEMPLATES}}). Mall on väike ristlõige koos komponentide, nihkete, kallete, materjalide ja punktikoodidega. Hoia neid projektis, teegis {{ui:Minu teek}} või failina `.cctemplates.json`. Malliredaktor näitab õige mõõtkavaga joonist ja loetleb probleemid, kui sa kirjutad.
- **Ehita mallide järgi jaamade kaupa.** Vali trass ja lülita selle omadustes sisse {{ui:Ehita mallide järgi jaamade kaupa}}. Iga piirkonna iga küljel on oma kattekihtide loend ja oma lõpptingimus. {{ui:Lisa koridor}} all {{ui:Koridorid sellel joondisel}} paneb mitu koridori ühele trassile.
- **Maastikumallid.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Maastikumallid…}} (või kirjuta {{cmd:TERRAINTEMPLATES}}) katab maastikku kihiliste materjalidega, nagu mullakiht või katend ja alus, koos pindala ja mahuga kihi kohta. Vaata [Koridorimallid ja maastikumallid](topic:corridor-templates).

### Joonistamine

- **Haakumine.** Tööriistad Trass, Platvorm, Krunt, Ehitusmaht, Tunnusjoon, Mõõda, Piir ja Valgala haakuvad mõõdistuspunktide, PI-punktide, nurkade, tippude ja rajatiste külge, märgiga markeri kõrval. Vabapunkti jaoks hoia all {{key:Alt}}.
- **Valimisnupud, puutuja ning teisalda, kopeeri, pööra.** Platvormi, krundi ja tunnusjoone nurkadel on sisestatavad Ida ja Põhja väljad ning ristkursoriga valimisnupp. Omadustes on ka {{ui:Puutuja kahest punktist}} trasside jaoks ja {{ui:Teisalda, kopeeri ja pööra}} trasside, platvormide, krundide ja tunnusjoonte jaoks. Vaata [Joonista haakumistega, valitud nurkade ja teisalda, kopeeri, pööra](topic:draft-with-snaps).
- **Render-vaade 3D-s.** Nupp {{ui:Renderda}} 3D-ribal joonistab maa loomulike värvide, taeva, udu ja pehmete varjudega. See ei muuda mudelit. Menüül {{ui:Päike}} on nüüd nupud {{ui:Rakenda}} ja {{ui:Sulge}}. Vaata [Ala vaatamine 3D-s](topic:site-3d).
- **Paneelid avanevad ükshaaval.** Vasak paneel ja Omaduste paneel avavad ühe jaotise ning sulevad teised, ja Haljastuse lindi plaadid, mis hoiavad mitut tööriista, on jagatud nupud.

### GIS-analüüs

- **Analüüs.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Analüüs}} pakub puhvrit, kattumist, ruumilist ühendamist, valimist atribuudi või kuju järgi ning mõõtmist. Iga tööriist teeb uue kihi ühe tagasivõtu sammuga.
- **Atribuuditabel.** Kihi kolme punkti menüüs on {{ui:Atribuuditabel…}} ja {{ui:Stiil atribuudi järgi…}}. Vaata [GIS-kihtide analüüs](topic:gis-analysis) ja [Töö kihi atribuuditabeliga](topic:gis-table).

### Ala: päike, päikeseenergia, mugavus ja tuul

- **Keskkonnajaotis.** Vali ehitusmaht: jaotis {{ui:Keskkond}} asub selle omadustes jaotise {{ui:Päikesetunnid}} all. Seal on varjuuuring (kaart, tabel, animatsioon, CSV), päikeseenergia saagis tüüpilise aasta ilmafailist (.epw) ja välistingimuste mugavus (UTCI).
- **Tuul, ainult sõeluuring.** {{ui:Käivita tuuleuuring}} värvib maapinna istumisest ebamugavani iga tuulesuuna järgi ilmafailis. See on valideerimata ja paneel ütleb seda.
- **Jalakäijate tuul (OpenFOAM) lisandmoodul.** Väljas, kuni lülitad selle sisse jaotises {{ui:Sätted}} › {{ui:Lisandmoodulid}}. OpenFOAM on tarkvara, mille paigaldad ise. Vaata [Vari, päikeseenergia saagis ja välistingimuste mugavus](topic:environment).

### Punktipilved (lisandmoodul)

- Lülita sisse {{ui:Punktipilved}} jaotises {{ui:Sätted}} › {{ui:Lisandmoodulid}}; paremale paneelile ilmub vahekaart Punktipilved. Ava LAS- või LAZ-fail, puhasta see, sorteeri punktid maapinnaks, taimestikuks ja hoonetes, koosta maapind, samakõrgusjooned ja mahud ning ekspordi LAS või LAZ. Vaata [Punktipilved droonilt või skannerilt](topic:point-clouds).

### WaterCraft (lisandmoodul)

- Lülita sisse {{ui:WaterCraft (veevarustus)}} jaotises {{ui:Sätted}} › {{ui:Lisandmoodulid}}; ilmub vahekaart WaterCraft. Sellel on tarbimised klientidelt, tuletõrje vooluhulk igal hüdrandil, millise torustiku katkestus on kõige olulisem, ning vee vanus ja kloor, igaüks salvestatud CSV-na. Vaata [WaterCraft: tarbimised, tuletõrje vooluhulk, katkestused ja vee vanus](topic:watercraft).

### Koostöö

- Reaalajas seansis näed plaanil teiste kursoreid ja nimesid. Teegi taimed: CivilCraft Landscape alustab oma vaikimisi teegikogumikust, {{ui:CivilCraft haljastus}}.

## Kõigis rakendustes

- Vihjed kuvatakse Bootstrapi tööriistavihjetena ja alustusvihje saab sulgeda.
- Paneeli vahekaardiriba, mis ei mahu, kerib selle asemel, et lõigatult ära minna.
- Brauseri vahekaartide pealkirjad on kujul `<dokument> - CivilCraft | CadCraft`.
- {{ui:Sätted}} sisaldab paigutuse jaotist, kus paigutused on kaherealiste valikutega rippmenüü.
- Kaalu ja temperatuuri ühikud on jaotises {{ui:Sätted}} › {{ui:Globaalne}} › {{ui:Ühikud}}.
- Keelte loend näitab keeli, mille jaoks versioonil on failid. Muud kui inglise keeled on masintõlked.

## Parandatud

- Aadressi otsingu ja EnergyPlus-kontrolli lisandmooduleid ei saanud sisse lülitada; nüüd saab.
- Abi ütleb nüüd, et lisandmoodul Punktipilved kirjutab puhastatud pilve LAS 1.4 või LAZ formaadis.
- Valitud objekti enda käepideme klõpsamine ei käivita enam käepideme lohistamist, mis peatas ootava valimise.

## Piiranguid

- Koridorimallid on kohatäitjad, mis ei pärine ühestki standardist; insener peab need kontrollima. Maastikumallid ei lisa pinda ega joonistata 3D-s ega lõikevaates. Trassi teine koridor ei ole IFC-ekspordis. Kahe malli vahel pole jaamade kaupa üleminekut.
- Punktipilved testiti väljamõeldud failidega, mitte tegeliku droonimõõdistusega. Loetakse ainult LAS ja LAZ.
- GIS-analüüs testiti väljamõeldud kihtidega.
- Varju, päikese ja mugavuse arvutused on planeerimishinnangud; tuul on valideerimata sõeluuring. Ükski neist pole projekteerimisväärtus.
- WaterCraft on arvutusabi, mida kontrolliti väljamõeldud võrkudel. Veeinsener otsustab, mida arvud väärt on.
- Muud kui inglise keeled on masintõlked.
- Windowsi paigaldajad pole koodiga allkirjastatud ja macOS-i kettapilt ei ole notariseeritud.

## Varem: 0.8 ja 0.8.1

See on see, mis muutus CivilCraft 0.8 (2026-11-01) ja 0.8.1 (2026-11-02) versioonis, võrreldes versiooniga 0.7. Suurimad uued osad on tööriistad, mis testivad sinu planeerimist ja ala (vihm, pinnasetasakaal, trassid, tiigid, edenemine), ning kuus arvutusakent maapinnale, teedele, mõõdistusele, kaevandustele, raadiolinkidele ja raudteele.

### Uut

**Testi oma planeerimist**

- **Lase sadada.** {{ui:Lase sadada…}} (menüüs {{ui:Pind}}) laseb sademe planeeritud maapinnale. Näed, kuidas vesi voolab platvormidelt, koguneb madalatesse nurkadesse ja ületab liiga väikesed tiigid. Käik on animeeritud ning annab mahud, tippväljavoolu ja iga tiigi CSV. Vaikimisi lahter on jäme, et esmane vaade oleks kiire; peenem lahter on aeglasem. Tiigid, mis ületavad, ilmuvad ka Probleemide paneelile.
- **Pinnasetasakaal.** {{ui:Pinnasetasakaal…}} tõstab või langetab platvormi, kuni kaevand võrdub täitega, ja näitab nende vahelist veotabelit.
- **Parim trass.** {{ui:Parim trass…}}: vali algus ja lõpp, ning CivilCraft leiab maastikult kõige odavama tee, mis hoiab sinu kalde- ja kõverapiire, ning teeb sellest trassi.
- **Sademeveetiigid.** {{ui:Sademeveetiigid…}} arvutab veetaseme ja mahu sinu maapinnast, võtab väljavoolu seadmeid (ava, pais, V-pais, ülevoolurenn), juhib sademe läbi tiigi ning kontrollib kinnipeetud tippu, veetaseme langemise aega ja vaba kõrgust.
- **Edenemine mõõdistustest.** {{ui:Edenemine mõõdistustest…}} võrdleb erinevatel kuupäevadel tehtud droonide või skannide pindu maapinnaga, nagu see oli, ja projektiga: protsent valmis mahu järgi, üle kaevatud ja üle täidetud alad, laod ning millal töö sellel tempol lõpeb (märgitud hinnanguna).

**Tunne ala**

- **Aadress asukohaks.** {{ui:Aadress asukohaks…}} koondab avatud krundi-, hoone-, tsoneeringu-, pinnase-, üleujutus- ja maastikuandmed ühele alale. Saad ala hoida projektifailis: sisestatud aadressi, iga allika koos kuupäevaga, mil selle tõid, ja litsentsiga, ning tagastatud andmed. Kui avad projekti uuesti või jagad seda, on ala ikka seal, ilma et midagi uuesti tooks. Saad ala salvestada ka asukohafailina või saata BimCraftile. Vaata [Aadress asukohaks](topic:address-to-site).

**Pinnas, teed, mõõdistus, kaevandused, lingid ja raudtee**

- **Pinnased ja nõlvad.** {{ui:Pinnased ja nõlvad…}} joonistab pinnaseprofiili sinu sisestatud puuraukude vahel. Bishopi meetod otsib seejärel kriitilise ringi sinu maapinnal, arvestades veetaset, koormust ja maavärina koefitsienti; jala vajumine saab konsolideerumise, kohese vajumise ja aja.
- **Ristmikud ja markeering.** {{ui:Ristmikud ja markeering…}} ühendab harud kanttee-ümardustega (üks raadius haru kohta või kolmekeskmelised ümardused), nägemiskauguse projekteerimiskiiruse järgi, nägemiskolmnurkade kontrolli, ülekäigurajad, peatusjooned, markeeringud ja märgid koos märgiloendiga. Need joonistatakse plaanile ja salvestatakse nimega kihtidega .dxf-failina.
- **Mõõdistuse korrigeerimine.** {{ui:Mõõdistuse korrigeerimine…}} teeb polügoonikäigu või võrgu vähimruutude korrigeerimise: korrigeeritud koordinaadid, veaellipsid, hii-ruut-test ning märge mõõtmisele, mis ei sobi. Vabad võrgud, polügoonikäigu sulgemine kompassi reegliga ja RW5, GSI, JobXML või CSV väljafailid on kaasas ning korrigeeritud punktid salvestatakse CSV-na.
- **Lahtised kaevandused.** {{ui:Lahtised kaevandused…}} muudab puuraproovid plokkmudeliks ja lõppkaevandiks sinu nõlvanurga piires, koos kattesuhtega, pingi kaupa tabeli ning sisalduse ja tonnaaži kõveraga. Pesastatud kaevandused tulu-teguri järgi ja tootmisgraafik diskonteeritud rahavoogudega on samuti olemas.
- **Raadiolingid.** {{ui:Raadiolingid…}} kontrollib nägemissuunda sinu maapinna kohal, arvestades maakera kumerust, esimest Fresneli tsooni, lingi eelarvet, väljalangemisvaru ja mitmeteelise katkestust ning annab masti kõrguse, mis puhastaks trassi. Samuti teeb kiudoptiliste liinide kaoeelarveid, trassi koguseid ja tornile mõjuva tuule arvutust.
- **Raudteevahetused.** {{ui:Raudteevahetused…}} teeb vahetuse selle sõlmeleibe numbrist, rööbasteede ühendused paralleelsete rööbasteede vahel ja konstruktsioonipiiri, mida kallutab ülekallang ja laiendab kõveras. Vahetus võib asuda trassi jaama juures.

Vaata [Pinnased, ristmikud, mõõdistuse korrigeerimine, kaevandused, raadiolingid ja vahetused](topic:soils-roads-survey-mines-links).

### Kõigis rakendustes

- **Keeled.** 54 keelt, neist kümme uut. Muud kui inglise keeled on masintõlked, kuni emakeelne kasutaja need üle vaatab. Abiteemad on enamasti veel inglise keeles.
- **Tööriistariba read.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Tööriistariba read}}: Murra (nagu varem), 2 rida või 1 rida. CivilCraft-i riba näitab kõige enam kasutatud tööriista suurelt, järgmised väikselt ning ülejäänud rühma nime noole taga.
- **Sisendseadmed.** Puuteplaat, pliiats, 3D-hiir, kontroller ja MIDI võivad rakendusi juhtida.
- **Probleemid.** Probleemide paneel hoiatab kõigis rakendustes, kontrollid loevad reguleerimispakette.
- **Reaalajas.** Reaalajas seansi osalejate asukohtade vaade.
- **Lisandmoodulid.** Lisandmoodulite loend, koos valgustuse lisandmoodulitega.
- **Ühenda oma tehisintellekt.** Mis tahes ühendatud abiline võib juhtida CivilCraft tööriistu. See tuleb märkusega, et ühe klõpsuga ühendamine CadCraft Studios ja hostitud ühendaja pole veel valmis. Vaata [Lase tehisintellekti abilisel töötada sinu alaga](topic:assistants).

### Parandatud versioonis 0.8.1

- **DWG klasside jaotis.** Seda loeti vale tüübina (GitHub cadcraft#5). Parandatud CivilCraftis koos CadCrafti, BimCrafti, ModelCrafti ja TakeoffCrafti parandustega.
- **Keele vahetamine töö ajal.** CadCraft Studio ja pakitud väljaanded saavad keelt vahetada töö ajal. Varem oli ainult inglise keel. Pole veel testitud igal platvormil: anna teada, kui keel ei muutu.

### Pole selles versioonis veel

- **Need on arvutusabid.** Iga tulemus uutes akendes vajab insenerikontrolli. Pinnatugevused algavad pinnarühma tüüpilistest väärtustest ja aken ütleb seda.
- **Lase sadada.** Brauseris võib näidisalal käitamine peenel lahtril kesta üle kahe minuti. See kontrolliti käsitsi arvutatud juhtumite ja V-kujulise valgalaga, mitte veel tegelikul planeeritud alal.
- **Aadress asukohaks.** Loeb avatud andmefaile, mille sa tood, ja testiti ainult meie enda failidega. Puud pole allikaks. Allikate toomine sinu eest ootab privaatsussõnastust.
- **Edenemine mõõdistustest.** Testitud ainult väljamõeldud mõõdistustega. Edenemist lehtedel ja märgistustel (MarkupCraft) ning skannimist mudeli vastu (BimCraft) pole ehitatud.
- **Pinnased ja nõlvad.** Ainult ringikujulised pinnad: ei ole kiilu ega ploki otsingut ega pingepragu.
- **Ristmikud.** Üks raadius haru kohta, ei ole veokite pöördetrajektoore ning need ei lähe veel koridori.
- **Väljafailid.** Lugejad kirjutati avalike vormingukirjelduste järgi ja proovitud meie tehtud failidel. Vaja on tegelike instrumentide faile.
- **Lingid ja raudtee.** Raadiolingid: ainult vaba ruumi kadu ja mitmeteeline katkestus (ei ole vihmakustutust ega antennimustreid). Raudteestandardit pole: iga raudtee piirang on kohatäitja, koos mustandnumbritega, mida ükski raudteeinsener pole kontrollinud.
- **Windows ja macOS.** 0.8 pole koodiga allkirjastatud. Windows võib hoiatada ja macOS nõuab paremklõpsu, seejärel valikut {{ui:Ava}}.

Kõik muu on lehel [Veel valmimata](topic:not-built-yet). Varasema väljalasde kohta vaata [Mis on uut versioonis 0.7](topic:whats-new-0-7).
