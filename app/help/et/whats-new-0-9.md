---
title: Mis on uut versioonis 0.9 (varasem)
summary: Koridori- ja maamallid, haakumised ja valimisnupud joonistamisel, GIS-analüüs atribuuttabeliga, varju-, päikesesaagi-, mugavus- ja tuulestuudiumid objektile, 3D renderdusvaade ning lisamoodulid Punktipilved ja WaterCraft.
keywords: mis on uut 0.9, varasem väljalase, mis on uut, 0.9, väljalaske märkused, koridori mallid, maamallid, mallide redaktor, tüüpristlõige, mitu koridori, haakumine, haakumised, vali, teisalda, kopeeri, pööra, puutuja, renderda, 3D renderdus, GIS-analüüs, puhver, kattuvus, ruumiline ühendamine, atribuuttabel, stiil atribuudi järgi, varjuuuring, päikesesaak, UTCI, välistingimuste mugavus, tuulestuudium, OpenFOAM, punktipilved, LAS, LAZ, WaterCraft, tuletõrje vooluhulk, hüdrant, vee vanus, kloor, nõudlus, tööriistavihjed, paigutus, muudatuste logi, muudatused, 0.8, 0.8.1, versioon, uued funktsioonid, vihm, sadu, tiigid, ülevool, pinnasetööd, tasakaal, kaevand ja täide, vedu, parim tee, väikseim kulu, trass, viivitustiik, väljavool, tühjenemine, vaba kõrgus, edenemine, mõõdistus, droon, laoplats, aadress asukohani, krunt, pinnas, üleujutus, nõlva stabiilsus, Bishop, vajumine, ristmik, markeering, märgid, nähtavuskolmnurk, korrigeerimine, vähimruutude, polügoonikäik, lahtine kaevandus, blokkmudel, raadiolink, Fresnel, vahetus, ristühendus, keeled, probleemid, reaalajas, dwg
from: 4664522c
---

Need on muudatused CivilCraft 0.9-s võrreldes versiooniga 0.8.1. CivilCraft 0.9 on osa CadCraft Studio 0.9-st ja selle kaheksast rakendusest. Suured osad on koridori- ja maamallid, haakumised joonistamise ajal, GIS-analüüs, objekti päikese-, päikesesaagi-, mugavus- ja tuulestuudiumid ning kaks lisamoodulit: Punktipilved ja WaterCraft.

## Uus

### Koridori- ja maamallid

- **Koridori mallid.** Ava {{ui:Pind}} › {{ui:Veel}} › {{ui:Koridori mallid…}} (või kirjuta {{cmd:TEMPLATES}}). Mall on väike ristlõige komponentidega, nihetega, kallete, materjalide ja punktikoodidega. Hoia neid projektis, menüüs {{ui:Minu teek}} või failina `.cctemplates.json`. Malli redaktor näitab tõelises mõõtkavas joonist ja loetleb probleeme sisestamise ajal.
- **Mallid jaamade kaupa.** Vali trass ja lülita selle atribuutides sisse {{ui:Ehita mallide järgi jaamade kaupa}}. Igal piirkonna poolel on oma kattekihtide loend ja oma otsatingimus. {{ui:Lisa koridor}} jaotises {{ui:Koridorid sellel joondisel}} paneb mitu koridori ühele trassile.
- **Maamallid.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Maamallid…}} (või kirjuta {{cmd:TERRAINTEMPLATES}}) katab maastiku kihiliste materjalidega, nagu mullakiht või katend ja alus, koos pindala ja mahuga kihi kohta. Vt [Koridori mallid ja maamallid](topic:corridor-templates).

### Joonistamine

- **Haakumised.** Tööriistad Trass, Platvorm, Krunt, Mass, Tunnusjoon, Mõõt, Piir ja Valgala haakuvad mõõdistuspunktidele, PI-dele, nurkadele, tippudele ja rajatistele, sildiga markeri kõrval. Hoia {{key:Alt}}, et saada vaba punkt.
- **Valimisnupud, puutuja ning teisalda, kopeeri, pööra.** Platvormi, krundi ja tunnusjoone nurkadel on kirjutatavad väljad Ida ja Põhi ning ristkursoriga nupp Vali. Atribuutides on trassidele {{ui:Puutuja kahest punktist}} ja trassidele, platvormidele, kruntidele ning tunnusjoontele {{ui:Teisalda, kopeeri ja pööra}}. Vt [Joonistamine haakumiste, valitud nurkade ning teisalda, kopeeri ja pööra abil](topic:draft-with-snaps).
- **Renderdusvaade 3D-s.** Nupp {{ui:Renderda}} 3D-ribal joonistab maa looduslike värvidega, taeva, udu ja pehmed varjud. See ei muuda mudelit. Menüül {{ui:Päike}} on nüüd nupud {{ui:Rakenda}} ja {{ui:Sulge}}. Vt [Vaata objekti 3D-s](topic:site-3d).
- **Paneelid avanevad ühe jaotisena korraga.** Vasak paneel ja atribuutide paneel avavad ühe jaotise ning sulgevad teised, ja Haljastuse lindi plaadid, mis hoiavad mitut tööriista, on jagatud nuppudeks.

### GIS-analüüs

- **Analüüs.** {{ui:Pind}} › {{ui:Veel}} › {{ui:Analüüs}} pakub puhvrit, kattuvust, ruumilist ühendamist, valikut atribuudi või kuju järgi ning mõõtmist. Iga tööriist teeb uue kihi ühe tagasivõtmise sammuga.
- **Atribuuttabel.** Kihi kolme punktiga menüüs on {{ui:Atribuuttabel…}} ja {{ui:Stiil atribuudi järgi…}}. Vt [GIS-kihtide analüüs](topic:gis-analysis) ja [Kihi atribuuttabeliga töötamine](topic:gis-table).

### Objekt: päike, päikesesaak, mugavus ja tuul

- **Keskkonna jaotis.** Vali mass: jaotis {{ui:Keskkond}} asub atribuutides jaotise {{ui:Päikesetunnid}} all. Sellel on varjuuuring (kaart, tabel, animatsioon, CSV), päikesesaak tüüpilise aasta ilmafailist (.epw) ja välistingimuste mugavus (UTCI).
- **Tuul, ainult esialgseks sõeluringiks.** {{ui:Käivita tuulestuudium}} värvib maapinna iga tuulesuuna jaoks istumisest ebamugavuseni vastavalt ilmafailile. See pole kinnitatud ja paneel ütleb seda.
- **Jalakäijate tuul (OpenFOAM) lisamoodul.** Väljas, kuni lülitad selle sisse menüüs {{ui:Sätted}} › {{ui:Lisandmoodulid}}. OpenFOAM on tarkvara, mille paigaldad ise. Vt [Vari, päikesesaak ja välistingimuste mugavus](topic:environment).

### Punktipilved (lisamoodul)

- Lülita {{ui:Punktipilved}} sisse menüüs {{ui:Sätted}} › {{ui:Lisandmoodulid}}; parempoolsel paneelil ilmub sakk Punktipilved. Ava LAS- või LAZ-fail, puhasta see, jaota maapinnaks, taimestikuks ja hoonteks, koosta maapind, kõverjooned ja mahud ning ekspordi LAS või LAZ. Vt [Punktipilved droonist või skannerist](topic:point-clouds).

### WaterCraft (lisamoodul)

- Lülita {{ui:WaterCraft (veejaotus)}} sisse menüüs {{ui:Sätted}} › {{ui:Lisandmoodulid}}; ilmub sakk WaterCraft. Sellel on nõudlus klientidelt, tuletõrje vooluhulk igal hüdrandil, millise torustiku katkestus on kõige olulisem, ning vee vanus ja kloor, mis kõik salvestatakse CSV-na. Vt [WaterCraft: nõudlus, tuletõrje vooluhulk, katkestused ja vee vanus](topic:watercraft).

### Koostöö

- Reaalajas seansis näed teiste kursoreid ja nimesid plaanil. Haljastuse raamatukogu taimed alustavad oma vaikekogust {{ui:CivilCraft'i haljastus}}.

## Kõigis rakendustes

- Vihjed kuvatakse Bootstrapi tööriistavihjetena ning alustusvihje saab sulgeda.
- Paneeli sakiriba, mis ei mahu ära, kerib selle asemel, et lõigata maha.
- Brauseri vahelehtede pealkirjad on `<document> - CivilCraft | CadCraft`.
- {{ui:Sätted}} on paigutuse jaotis, kus paigutused on kahe rea valikutega rippmenüü.
- Kaalu ja temperatuuri ühikud on menüüs {{ui:Sätted}} › {{ui:Globaalne}} › {{ui:Ühikud}}.
- Keelte loend näitab keeli, mille jaoks versioonil on failid. Muud keeled kui inglise keel on masintõlked.

## Parandatud

- Aadressiotsingu ja EnergyPlus-i kontrolli lisamooduleid ei saanud sisse lülitada; nüüd saab.
- Abi ütleb nüüd, et Punktipilvede lisamoodul kirjutab puhastatud pilve LAS 1.4 või LAZ-na.
- Valitud objekti enda käepideme klõpsamine ei käivita enam käepideme lohistamist, mis peatas ootava valimise.

## Ausad piirangud

- Näidiskoridori mallid on kohatäited, mitte ühestki standardist; insener peab need kontrollima. Maamallid ei lisa pinda ega joonistata 3D-s ega lõikevaates. Teine koridor trassil ei ole IFC-ekspordis. Kahe malli vahel jaamade kaupa ei ole üleminekut.
- Punktipilved testiti tehtud failidega, mitte päris droonimõõdistusega. Loetakse ainult LAS ja LAZ.
- GIS-analüüs testiti tehtud kihtidega.
- Varju, päikesesaak ja mugavus on planeerimise hinnangud; tuul on kinnitamata sõelumine. Ükski neist pole projekteerimisväärtus.
- WaterCraft on arvutusabi, mis on kontrollitud tehtud võrkudel. Vee insener otsustab, mida arvud väärt on.
- Muud keeled kui inglise keel on masintõlked.
- Windowsi paigaldajad pole koodiga allkirjastatud ja macOS-i kettapilt pole notariseeritud.

## Varasem: 0.8 ja 0.8.1

Need on muudatused CivilCraft 0.8-s (2026-11-01) ja 0.8.1-s (2026-11-02) võrreldes versiooniga 0.7. Suured uued osad on tööriistad, mis testivad sinu planeeringut ja objekti (vihm, pinnasetööd, teed, tiigid, edenemine), ning kuus arvutusakent maapinnale, teedele, mõõdistusele, kaevandustele, linkidele ja raudteele.

### Uus

**Testi oma planeeringut**

- **Sajab vihma.** {{ui:Lase sadada…}} (menüüs {{ui:Pind}}) paneb tormi planeeritud maapinnale. Näed, kuidas vesi voolab platvormidelt, koguneb madalatesse nurkadesse ja ületab liiga väikesed tiigid. Käik on animeeritud ja annab mahud, tippväljavoolu ning CSV iga tiigi kohta. Vaikimisi koht on jäme, nii et esmane vaade on kiire; peenem koht on aeglasem. Ületavad tiigid ilmuvad ka paneelile Probleemid.
- **Pinnasetasakaal.** {{ui:Pinnasetasakaal…}} tõstab või langetab platvormi, kuni kaevand võrdub täitega, ja näitab nende vahel vedamise tabelit.
- **Parim tee.** {{ui:Parim trass…}}: vali algus ja lõpp, ning CivilCraft leiab maastikult odavaima tee, mis jääb sinu kalde- ja kõverapiirangute sisse, ja teeb sellest trassi.
- **Viivitustiigid.** {{ui:Sademeveetiigid…}} arvutab astme ja mahu sinu maapinnalt, võtab väljavoolu seadmed (ava, pais, V-sälk, ülevoolutamm), suunab tormi läbi tiigi ning kontrollib kinnipeetud tippvoolu, tühjenemisaega ja vaba kõrgust.
- **Edenemine mõõdistustest.** {{ui:Edenemine mõõdistustest…}} võrdleb erinevatel kuupäevadel droonide või skaneerimise pindu maapinnaga nagu see oli ja projektiga: protsent valmis mahu järgi, üle kaevatud ja üle täidetud alad, laod ning aeg, millal töö selle tempoga lõpeb (märgitud hinnanguna).

**Tunne objekti**

- **Aadress asukohani.** {{ui:Aadressist asukohani…}} koondab avatud krundi-, hoone-, tsoneerimis-, pinnase-, üleujutus- ja maastikuandmed ühele objektile. Võid objekti hoida projektifailis: kirjutatud aadress, iga allikas koos päevaga, mil see toodi, ja selle litsents ning see, mis tuli tagasi. Ava projekt uuesti või jaga seda ja objekt on ikka seal, ilma et midagi uuesti tooks. Võid selle salvestada ka objektifailina või saata BimCraftile. Vt [Aadress asukohani](topic:address-to-site).

**Maapind, teed, mõõdistus, kaevandused, lingid ja raudtee**

- **Pinnased ja nõlvad.** {{ui:Pinnased ja nõlvad…}} joonistab pinnaseprofiili sisestatud puuraukude vahel. Bishopi meetod otsib seejärel kriitilise ringi sinu maapinnal, arvestades veetaset, lisakoormust ja maavärinakoefitsienti; vundamendi vajumine saab konsolideerumise, koheise vajumise ja aja.
- **Ristmikud ja markeering.** {{ui:Ristmikud ja markeering…}} ühendab harud nurgakõveratega (üks raadius haru kohta või kolmekeskmelised kõverad), vaatekauguse projekteerimiskiiruse järgi, nähtavuskolmnurkade kontrolli, ülekäigurajad, peatumisjooned, markeeringud ja märgid märkide loendiga. Need joonistatakse plaanile ja salvestatakse nimetatud kihtidega DXF-failina.
- **Mõõdistuse korrigeerimine.** {{ui:Mõõdistuse korrigeerimine…}} teeb polügoonikäigu või võrgu vähimruutude korrigeerimise: korrigeeritud koordinaadid, veaellipsid, khi-ruut-test ja märgi mõõtmisele, mis ei sobi. Vabad võrgud, polügoonikäigu sulgemine kompassi reegliga ning RW5, GSI, JobXML või CSV väljafailid on kaasas ja korrigeeritud punktid salvestuvad CSV-na.
- **Lahtised kaevandused.** {{ui:Lahtised kaevandused…}} muudab puuraproovid blokkmudeliks ja lõpliku kaevandi sinu nõlvanurga piires, koos kõrvalkivi suhtega, astmete kaupa tabeli ning sisalduse ja tonnaaži kõveraga. Tulu teguri järgi pesastatud kaevandid ja diskonteeritud rahavoogudega tootmisgraafik on samuti olemas.
- **Raadiolingid.** {{ui:Raadiolingid…}} kontrollib nähtavust sinu maapinna kohal arvestades maakera kumerust ja esimest Fresneli tsooni, ning annab sidesumma, pleekimisvaru ja mitmeteelise katkestuse ning masti kõrguse, mis puhastaks tee. Teeb ka kiudoptika kaoarvestuse, teekoguste ja tuule mõju masti peal.
- **Raudteevahetused.** {{ui:Raudteevahetused…}} teeb vahetuse selle ristmiku numbri järgi, paralleelsete rööbasteede vahel ristühendused ja konstruktsioonipiiri, mida kallutab kalle ja laiendab kõveras. Vahetus võib asuda trassi jaamas.

Vt [Pinnased, ristmikud, mõõdistuse korrigeerimine, kaevandused, raadiolingid ja vahetused](topic:soils-roads-survey-mines-links).

### Kõigis rakendustes

- **Keeled.** 54 keelt, neist kümme uut. Muud kui inglise keeled on masintõlked, kuni emakeelne lugeja need loeb. Abitekstid on enamasti veel inglise keeles.
- **Tööriistaribad.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Tööriistariba read}}: Mähi (nagu varem), 2 rida või 1 rida. CivilCraft'i lint näitab kõige enam kasutatavat tööriista suurelt, järgmised väikesed ja ülejäänud grupi nime noole taga.
- **Sisendseadmed.** Puuteplaat, pliiats, 3D-hiir, kontroller ja MIDI võivad juhtida rakendusi.
- **Probleemid.** Probleemide paneel hoiatab kõigis rakendustes, kontrollidega, mis loevad regulatsioonipakette.
- **Reaalajas.** Vaade sellest, kes on kus reaalajas seansis.
- **Lisamoodulid.** Lisamoodulite loend, valgustuse lisamoodulitega.
- **Ühenda oma AI.** Iga ühendatud assistent võib juhtida CivilCraft'i tööriistu. See tuleb märkusega, et ühe klõpsuga ühendamine CadCraft Studios ja hostitud ühendaja pole veel valmis. Vt [Lase AI-assistendil töötada oma objektiga](topic:assistants).

### Parandatud versioonis 0.8.1

- **DWG klasside jaotis.** Seda loeti vale tüübina (GitHub cadcraft#5). Parandatud CivilCraftis koos CadCrafti, BimCrafti, ModelCrafti ja TakeoffCraftiga.
- **Keele vahetamine töötamise ajal.** CadCraft Studio ja pakitud väljaanded saavad keelt vahetada töötamise ajal. Enne olid need ainult inglise keeles. Pole veel testitud igal platvormil: anna teada, kui keel ei vaheta.

### Pole selles versioonis veel

- **Need on arvutusabid.** Iga tulemus uutes akendes vajab insenerilt kontrolli. Pinnase tugevused alustavad tüüpilistest väärtustest pinnasegrupi järgi ja aken ütleb seda.
- **Sajab vihma.** Käik näidisobjektil võib brauseris võtta üle kahe minuti peene koha korral. See kontrolliti käsitsi juhtumitega ja V-kujulise valgalaga, mitte veel päris planeeritud objektil.
- **Aadress asukohani.** See loeb sinu toodud avatud andmefaile ja testiti ainult meie enda failidega. Puud ei ole allikas. Allikate toomine sinu eest ootab privaatsussõnastust.
- **Edenemine mõõdistustest.** Testitud ainult tehtud mõõdistustega. Edenemine lehtedel ja märgistustes (MarkupCraft) ning skaneerimine mudeli vastu (BimCraft) pole tehtud.
- **Pinnased ja nõlvad.** Ainult ringikujulised pinnad: kiilu- ja plokiotsingut ega pingepragu ei ole.
- **Ristmikud.** Üks raadius haru kohta, veokite pöördeteid ei ole ja need ei lähe veel koridori.
- **Väljafailid.** Lugejad kirjutati avalikest vormingukirjeldustest ja proovitud meie tehtud failidel. Päris instrumendi failid on oodatud.
- **Lingid ja raudtee.** Raadiolingid: ainult vaba ruumi kadu ja mitmeteelise levi (ilma vihmapleekimise ja antennimustriteta). Raudteestandardit ei ole: iga raudteepiir on kohatäide, mida raudteeinsener pole kontrollinud.
- **Windows ja macOS.** 0.8 pole koodiga allkirjastatud. Windows võib hoiatada ja macOS küsib paremklõpsu ning seejärel Ava.

Kõik muu on lehel [Veel valmis pole](topic:not-built-yet). Varasema väljalasde kohta vt [Mis on uut versioonis 0.7](topic:whats-new-0-7).
