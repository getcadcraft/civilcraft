---
title: Teekoridori läbimine
summary: Lülita trassile koridor sisse, määra sõidurea, äärikuala ja külgkalde väärtused ning loe lõiked, piirijooned ja mullatööd, mida see annab.
keywords: ülekallutus, ülekallutus, kallutamine, üleminek, väljaulatus, määrade tabel, põikkalle, pöörlemine, koridor, koost, alamkoost, tüüplõige, tee, sõidurada, äärik, külgkalle, piirijoon, lõige, täide, lõiked, siht, sihid, laiuse siht, kõrguse siht, nihke siht, laiendus, sõiduteeserv, järgi teist koridori
from: 91303189
---

Koridor läbib trassi ühe lihtsa tüüplõike (koosti) ja selle projekteerimisprofiili, sobitab tulemuse olemasolevasse maapinda ja lisab selle valmis pinnale. Trassil võib olla mitu koridori erinevates jaamavahemikes ning koridor saab koostada korduvkasutatavatest mallidest jaamade kaupa ([Koridori mallid](topic:corridor-templates)). Allpool kirjeldatud lihtne koost on mõlemal küljel sama; et anda igale küljele oma osad, vaata [Ehita iga külg osadest](topic:corridor#build-each-side-from-parts).

## Koost

Keskjoonest väljapoole, igal küljel:

1. **sõiduriba** antud laiusega, langedes teljelt **sõidurea kalde** järgi
2. **äärik** antud laiusega **äärikukalde** järgi
3. **külgkalle** äärikuservast kuni maapinnani: **lõikekalle**, kus maapind on kõrgemal, ja **täitekalle**, kus see on madalamal

Algväärtused on kohatäitjad, mitte projekteerimisstandard:

| Väärtus | USA jalgades | Meetrites |
|---|---|---|
| Sõiduraja laius | 12 ft | 3.6 m |
| Sõidurea kalle | 2% | 2% |
| Äärikulaius | 4 ft | 1.2 m |
| Äärikukalle | 4% | 4% |
| Lõikekalle | 2 : 1 | 2 : 1 |
| Täitekalle | 3 : 1 | 3 : 1 |
| Lõige iga | 10 ft | 5 m |

Külgkallete kallded on horisontaalne vertikaalse suhtes (H:V): 3 : 1 tähendab 3 ühikut horisontaalselt 1 ühiku kohta vertikaalselt.

## Koridori koostamine

Vajad trassi ilma vigadeta ja projekteerimisprofiili, millel on vähemalt kaks PVI-d ja ükski viga.

1. Vali trass.
2. Parempoolses paneelis jaotises **Koridor** märgi ära **Pühi koost mööda projekteerimisprofiili**.
   Väljad ilmuvad ja koridor koostatakse kohe. Plaanil on näha sõidurea ja äärikuga piirid ning piirijooned; kui jaotises **Kuva** on valitud {{ui:Projekteeritud (planeeritud)}}, näitavad samakõrgusjooned uut maapinda.
3. Muuda mis tahes väärtust: **Sõiduraja laius**, **Sõidurea kalle**, **Äärikulaius**, **Äärikukalle**, **Lõikekalle**, **Täitekalle**, **Lõige iga**. Vajuta iga järel {{key:Enter}}. Lõikekalle, täitekalle ja lõigete vahe peavad olema suuremad kui 0.
4. Loe väljade all olevat rida, näiteks „39 lõiget jaamast 0+00.00 kuni 3+86.36; lõige 240.2 cu yd, täide 556.0 cu yd.“

Lõiked tehakse igal **Lõige iga** sammul, otstes ning iga horisontaal- ja vertikaalkõvera alguses ja lõpus. Iga lõige ja neid läbivad jooned (keskjoon, sõiduraja ja äärikuservad, piirijoon) muutuvad valmis pinna murdejoonteks.

Koridori väljalülitamiseks eemalda märge. Väärtused jäävad järgmiseks korraks alles.

## Kui see ei koostu

Väljade all olev punane kast ütleb, miks:

| Teade | Mida teha |
|---|---|
| „Koridor vajab projekteerimisprofiili ilma vigadeta.“ | Lisa PVI-sid või paranda kattuvad vertikaalkõverad (vaata [Vertikaalprofiili projekteerimine](topic:profile)). |
| „Projekteerimisprofiil ei kattu trassiga.“ | Liiguta PVI-d trassi jaamavahemikule. |
| „Koridor vajab pinnal vähemalt kahte lõiget.“ | Suurem osa koridorist on olemasolevast maapinnast väljas. |
| „4 külgkallet ulatuvad pinnast välja enne maapinnaga kohtumist.“ | Pinna servas ei jõua kalle maapinnani. Hoia tee pinna servast eemal või langeta sel kohal täite või lõike kõrgust. |
| „Koridori piirijooned ristuvad (lõiked kattuvad, näiteks tihedalt kõvera sisepoolel). Kasuta suuremat raadiust või kitsamat koosti.“ | Terava kõvera sisepoolel olevad lõiked kattuvad. Suurenda raadiust või kitsenda koosti. |

Koridor, millel on probleem, ei lähe pinda ega loe mullatöödesse.

## Koridorid ja platsid koos

Projekteeritud pind koostatakse järjekorras: kõigepealt kõik koridorid, siis kõik platsid. Kui platsi kujundus kattub koridoriga, võidab plats. Mahud arvutatakse kõigi piirijoonte sees koos; vaata [Mullatöömahud](topic:volumes).

## Ülekallutus

Kõvera läbimisel võib tee kalduda sissepoole, nii et liiklust surutakse väljapoole vähem. Märgi jaotises **Ülekallutus** trassi **Omadustes** märge **Kalluta kõverad**:

- Iga ringkõver võtab määrade tabelist kiiruse **e**: esimese rea, mille raadiusesse kõver ulatub (tühja määraga rida jätab tavalise sõiduteekalde). Tabel ja **Maksimaalne suhteline kalle** (algväärtus 0.5 %) on kohatäitjad, mitte standard: määra need oma projekteerimiskriteeriumide järgi. Lisa või eemalda ridu, kui vaja.
- Sõidurajad pöörlevad keskjoone ümber. Enne kõverat lameneb väliskülgriba üle **väljajooksu** (normaalne sõiduteekalle ÷ e × üleminek), seejärel üle **ülemineku** (sõiduraja laius × e ÷ kalle) keerab väliskülgriba edasi, kuni kogu tee kaldub kiirusega e sissepoole; kaks kolmandikku üleminekust jääb enne kõverat ja üks kolmandik sellele. Pärast kõverat toimub sama vastupidises järjekorras.
- Madalal küljel olev äärik ei ole kunagi lamedam kui oma sõidurada; kõrgel küljel säilitab ta oma kalde (see veereb üle).
- Selle all olev tabel loetleb iga kõvera raadiuse, määra, ülemineku ja väljajooksu ning kohad, kus täis ülekallutus algab ja lõpeb. **Ülekallutuse diagramm** joonistab mõlema sõidurea põikkalded jaamade kaupa (vasak sõidurada tahkjoonega, parem katkendjoonega).
- Liiga lühike kõver, et jõuda täieliku ülekallutuseni, või kaks kõverat, mille üleminekud kattuvad, on öeldud kasti kujul tabeli kohal.

Lõiked, mahud, 3D-vaade ja joonised näitavad kõik kallutatud teed. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

## Sihid

Sihk liigutab tee ühe külje ühte punkti joonele: **Sõiduteeserv** või **Äärikuserv**, **Vasakul** või **Paremal**. Iga lõige kohtub joonega ristiselt keskjoonega, minnes väljapoole ainult sel küljel, nii et parema külje siht ei liiguta kunagi vasakut külge.

| Seab | Mis juhtub kohas, kus lõige kohtub joonega |
|---|---|
| **Laius** | Punkt asub joonel: sõiduriba (või äärik) laieneb või kitseneb sinnani, säilitades oma põikkalde. |
| **Kõrgus** | Punkt võtab seal joone kõrguse oma nihkel; sõiduraja (või äärikuala) põikkalle järgib seda. |

Joon võib olla tunnusjoon (mis tahes oma **Kasutuse** järgi) või teise koridori joon: selle keskjoon, sõiduteeservad, äärikuservad või piirijooned. Koridori joon järgib seda koridori: muuda teist teed ja see tee järgib. CivilCraft koostab enne teise koridori; kaks koridori, mis sihiksid üksteist ringis, keeldutakse ühel küljel ja tabel ütleb, milline.

1. Vali trass ja lülita selle koridor sisse.
2. Jaotises **Sihid** klõpsa {{ui:Lisa siht}}.
3. Vali **Pool**, **Punkt**, mida see **Seab**, ja **Joon**, millele see **Joonele**. Iga muudatus on üks võtmistagasi samm.

**Tulemus** ütleb, mitmel lõikel joon saavutati. Lõiked, mis joonele ei jõua (joone otsadest mööda või kohas, kus see on keskjoonest taga), säilitavad koosti väärtused. Kustutatud joon jätab koridori sellisesse seisu, nagu see oli enne sihti, ja tabel ütleb seda. Ühel küljel võib igale punktile olla üks laiuse siht ja üks kõrguse siht.

## Koosta iga külg osadest

Lülita koridori seadete all sisse **Koosta iga külg osadest**. Iga küljel on siis oma loend keskjoonest väljapoole: sõidurajad, äärik, kraav, bordüür, haljasriba, kõnnitee ja viimasena külgkalle maapinnani (oma lõike- ja täitesuhetega). Alusta {{ui:Maantee}} või {{ui:Linnatänav}}; lisa ja eemalda osi, teisalda neid nooltega ning {{ui:Kopeeri}} üks külg teisele. Iga muudatus on üks võtmistagasi samm.

Põikkalle on kalle tee eemale, nii et kõnnitee, mis kallutab tee poole, on negatiivne. Bordüür on antud kõrgusega nägu, antud laiusega pealispind ja valikuline langus tagaküljel. Ülekallutus pöörab kõiki sõidurradu esimeses reas; rennkivi, bordüür, riba ja kõnnitee rippuvad valmis sõiduradade servast. Siht liigutab ikka sõiduradade lõppu ja viimast osa. Ristlõigetel on märgitud rennkivi voolujoon, bordüüri ülaosa ja tagakülg ning muu. Kõveral, kus on üleminekukõverad, on üleminek spiraal: tasane kalle TS-il, täielik ülekallutus SC-l.

## Sõiduteekihid

Sõiduraja, äärikut, rennkivi, haljasriba või kõnnitee saab varustada oma konstruktsiooniga: osa all klõpsa {{ui:Lisa kiht}}, et lisada kiht nime, materjali, paksuse ja liigiga (pealmine, sidekiht, alus, aluskiht, katte alus või muu), ülevalt alla. Kihid ei liiguta tee pinda (selle ülaosa on projekteeritud pind); iga kiht asub oma osa all ja selle sügavus mõõdetakse otse allapoole. Ristlõigetel joonistatakse iga kihi alumine serv katkendjoonena ja {{ui:Sõidutee kihid: kogused}} loetleb iga kihi plaanipindala ja mahu (pindala koridori kaudu oma lõigetest, maht = pindala × paksus). IFC-eksport kirjutab iga kihi oma elemendina koos paksuse ja materjaliga (vaata [IFC-eksport ja -import](topic:ifc)). Paksus, mille sisestad, on sinu oma: CivilCraft ei dimensioneeri sõiduteid.

## Mida ei ole veel koostatud

Päevavalguse kalde sihid ei ole veel saadaval. Koridori puhul, mis muutub mööda teed ning kus vasak ja parem on eraldi, kasuta [Koridori malle](topic:corridor-templates). Vaata [Pole veel koostatud](topic:not-built-yet).
