---
title: Mis on uut versioonis 0.8 ja 0.8.1
summary: CivilCraft 0.8 lisab funktsioonid Lase sadada (sajuveejooks sinu pinnaplaneeringul), pinnasetasakaalu, parima trassi leidja, sademeveetiigid, edenemise mõõdistustest, aadressist asukohani importija, mis hoiab asukoha projektis, ning aknad pinnaste ja nõlvade, ristmike ja markeeringu, mõõdistuse korrigeerimise, lahtiste kaevanduste, raadiolinkide ja raudteevahetuste jaoks. 0.8.1 parandab DWG-failide lugemist.
keywords: mis on uut, uuendused, väljalaske märkmed, muudatuste logi, muudatused, 0.8, 0.8.1, versioon, uued funktsioonid, vihm, sadu, tiigistumine, üleujutus, pinnas, pinnasetasakaal, pinnasevedu, lõike ja täite, vedu, parim trass, väikseim kulu, trass, sademeveetiik, väljavool, veetaseme langus, vaba ruum, edenemine, mõõdistus, droon, laoplats, aadress asukohani, kinnisasi, pinnas, üleujutus, nõlva stabiilsus, Bishop, vajumine, ristmik, markeering, märgid, nähtavuskaugus, korrigeerimine, vähimate ruutude meetod, polügonomeetria, lahtine kaevandus, plokkmudel, raadiolink, Fresneli tsoon, vahetus, ristumisvahetus, keeled, probleemid, live, dwg
from: b0932cf0
---

Need on muudatused CivilCraft 0.8 (2026-11-01) ja 0.8.1 (2026-11-02) kohta, võrreldes versiooniga 0.7. Suurimad uued osad on tööriistad, mis katsetavad sinu pinnaplaneeringut ja objekti (vihm, pinnasetasakaal, trassid, tiigid, edenemine), ning kuus arvutusakent maapinna, teede, mõõdistuse, kaevanduste, linkide ja raudtee jaoks.

## Uus

### Katseta oma pinnaplaneeringut

- **Lase sadada.** {{ui:Lase sadada…}} (menüüs {{ui:Pind}} all) lasib planeeritud maapinnale sademe. Näed, kuidas vesi voolab platsidelt maha, koguneb madalatesse nurkadesse ja ületab liiga väikesed tiigid. Jooks on animeeritud ning annab mahud, tippvoolu ja CSV-faili iga tiigi kohta. Vaikimisi ruutvõrk on hõre, et esmane vaade oleks kiire; peenem ruutvõrk on aeglasem. Tiigid, mis ületavad, kuvatakse ka paneelis Probleemid.
- **Pinnasetasakaal.** {{ui:Pinnasetasakaal…}} tõstab või langetab platsi, kuni lõige võrdub täitega, ning näitab nende vahelist veotabelit.
- **Parim trass.** {{ui:Parim trass…}}: vali algus ja lõpp ning CivilCraft leiab maastikul odavaima tee, mis jääb sinu kalde- ja kõverapiirangute piiresse, ning koostab sellest trassi.
- **Sademeveetiigid.** {{ui:Sademeveetiigid…}} arvutab tasemed ja mahu sinu maapinnast, võtab arvesse väljavoolu seadmeid (ava, pais, V-sälk, ülevool), lasib sademe läbi tiigi ning kontrollib kinnipeetud tippvoolu, veetaseme langemise aega ja vaba ruumi.
- **Edenemine mõõdistustest.** {{ui:Edenemine mõõdistustest…}} võrdleb erinevate kuupäevade droonide või skannide pindu nii varasema maapinna kui ka projektiga: mahuline täitumise protsent, üle kaevatud ja üle täidetud alad, laoplatsid ning see, millal töö selle tempoga lõpeb (märgitud hinnanguna).

### Tunne asukohta

- **Aadressist asukohani.** {{ui:Aadressist asukohani…}} koondab avatud kinnisasja-, hoone-, planeerimis-, pinnase-, üleujutus- ja maastikuandmed ühele asukohale. Asukoha saab hoida projektifailis: sisestatud aadress, iga allikas koos kuupäevaga, millal see alla laeti, ja selle litsentsiga, ning tulemus. Projekti uuesti avades või jagades on asukoht alles ja midagi uuesti ei laeta. Asukoha saab salvestada ka asukohafailina või saata BimCraftile. Vaata [Aadressist asukohani](topic:address-to-site).

### Maapind, teed, mõõdistus, kaevandused, lingid ja raudtee

- **Pinnased ja nõlvad.** {{ui:Pinnased ja nõlvad…}} joonistab pinnaseprofiili sisestatud puuraukude vahele. Bishopi meetod otsib seejärel kriitilise ringi sinu maapinnal, arvestades veetaset, koormust ja maavärinakoefitsienti; jalatsi vajumine arvestab konsolideerumist, koheset vajumist ja aega.
- **Ristmikud ja markeering.** {{ui:Ristmikud ja markeering…}} ühendab harud äärekivide ümardustega (üks raadius haru kohta või kolmekeskmelised ümardused), arvutab kavandatud kiiruse nähtavuskauguse, kontrollib nähtavuskolmnurki ning koostab ülekäigurajad, stopjooned, markeeringu ja märgid koos märkide loendiga. Need joonistatakse plaanile ja salvestatakse .dxf-failina nimetatud kihtidega.
- **Mõõdistuse korrigeerimine.** {{ui:Mõõdistuse korrigeerimine…}} teeb polügonometria või võrgu vähimate ruutude korrigeerimise: korrigeeritud koordinaadid, veaellipsid, khi-ruut-test ning märgistus mõõtmisele, mis ei sobi. Sisaldab vabu võrke, polügonometria sulgemist kompassireegliga ja RW5-, GSI-, JobXML- või CSV-väljafaile; korrigeeritud punktid salvestatakse CSV-na.
- **Lahtised kaevandused.** {{ui:Lahtised kaevandused…}} muudab puurproovid plokkmudeliks ja lõpliku kaevanduse sinu nõlvanurga piires, koos ribasuhte, astmete järgi koostatud tabeli ning sisalduse ja tonnaažikõveraga. Samuti on olemas tulufaktori järgi sisestatud kaevandused ja diskonteeritud rahavoogu sisaldav tootmisgraafik.
- **Raadiolingid.** {{ui:Raadiolingid…}} kontrollib nähtavust sinu maastikul, arvestades maakera kumerust, esimest Fresneli tsooni, lingieelarvet, hääbumisvaru ja mitmikteeteest tingitud katkestusi, ning annab masti kõrguse, millega tee on vaba. Samuti arvutab kiudoptiliste lülide kaod, marsruudi koguseid ja tuule koormust masti pealt.
- **Raudteevahetused.** {{ui:Raudteevahetused…}} koostab vahetuse selle ristmiku numbri järgi, paralleelsete rööbasteede vahelised ristumisvahetused ning konstruktsioonipiiri, mida kallutab kalle ja laiendab kõverik. Vahetus võib asuda trassi jaamas.

Vaata [Pinnased, ristmikud, mõõdistuse korrigeerimine, kaevandused, raadiolingid ja vahetused](topic:soils-roads-survey-mines-links).

## Igas rakenduses

- **Keeled.** 54 keelt, neist kümme on uued. Muud kui inglise keeled on masintõlked seni, kuni emakeelne kasutaja need üle vaatab. Abiteemad on enamasti veel inglise keeles.
- **Tööriistariba read.** {{ui:Sätted}} › {{ui:Üldine}} › {{ui:Tööriistariba read}}: Mähi (nagu varem), 2 rida või 1 rida. CivilCraft'i lint näitab kõige enam kasutatavat tööriista suurelt, järgmised väikselt ja ülejäänud rühma nime noolespikri taga.
- **Sisendseadmed.** Puuteplaat, pliiats, 3D-hiir, kontroller ja MIDI saavad rakendusi juhtida.
- **Probleemid.** Probleemide paneel, mis hoiatab igas rakenduses, koos kontrollidega, mis loevad regulatsioonipakette.
- **Live.** Vaade sellest, kes on Live-seansil millal kus.
- **Lisandmoodulid.** Lisandmoodulite loend, sealhulgas valgustuse lisandmoodulid.
- **Ühenda oma tehisintellekt.** Iga ühendatud assistent saab juhtida CivilCraft'i tööriistu. Sellega kaasneb märkus, et ühe klõpsuga ühendamine CadCraft Studios ja hostitud konnektor pole veel valmis. Vaata [Lase tehisintellekti assistendil töötada sinu asukohaga](topic:assistants).

## Parandatud versioonis 0.8.1

- **DWG klasside jaotis.** Seda loeti vale tüübina (GitHub cadcraft#5). Parandatud CivilCraftis koos rakendustega CadCraft, BimCraft, ModelCraft ja TakeoffCraft.
- **Keele vahetamine töötamise ajal.** CadCraft Studio ja pakitud väljaanded saavad keelt vahetada töötamise ajal. Varem oli ainult inglise keel. Pole veel testitud kõigil platvormidel: anna meile teada, kui keel ei muutu.

## Selles versioonis veel puudub

- **Need on arvutusabivahendid.** Iga tulemus uutes akendes vajab inseneri kontrolli. Pinnaste tugevused lähtuvad pinnarühma tüüpilistest väärtustest ning aken seda ka ütleb.
- **Lase sadada.** Jooks näidisasukohal brauseris võib peenema ruutvõrgu korral kesta üle kahe minuti. Seda on kontrollitud käsitsi arvutatud juhtumitel ja V-kujulisel valgala-alal, kuid mitte veel päris planeeritud objektil.
- **Aadressist asukohani.** Loeb sinu toodud avatud andmefaile ja on testitud ainult meie enda failidega. Puud ei ole allikaks. Allikate hankimine sinu eest ootab privaatsussõnastust.
- **Edenemine mõõdistustest.** Testitud ainult väljamõeldud mõõdistustega. Edenemist lehtede ja markeeringute (MarkupCraft) järgi ning skannimist mudeli vastu (BimCraft) pole loodud.
- **Pinnased ja nõlvad.** Ainult ringikujulised pinnad: kiilu- ega plokkotsingut ega tõmbepragu ei ole.
- **Ristmikud.** Üks raadius haru kohta, veoauto pöörderadu ei ole ning need ei lähe veel koridori.
- **Väljafailid.** Lugejad on kirjutatud avalike formaadikirjelduste järgi ja proovitud meie tehtud failidel. Vajame päris mõõteseadmete faile.
- **Lingid ja raudtee.** Raadiolingid: ainult vaba ruumi kadu ja mitmikteetee (ilma vihmahääbumise ja antennikarakteristikuteta) ning raudteestandardit pole: iga raudtee piirang on kohatäide, koos mustandarvudega, mida ükski raudteeinsener pole kontrollinud.
- **Windows ja macOS.** 0.8 pole koodiga allkirjastatud. Windows võib hoiatada ja macOS küsib paremklõpsu ning seejärel Ava.

Kõik muu on lehel [Pole veel valmis](topic:not-built-yet). Varasema väljaande kohta vaata [Mis on uut versioonis 0.7](topic:whats-new-0-7).
