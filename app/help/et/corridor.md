---
title: Teekoridori trassi mööda ehitamine
summary: Lülita trassi jaoks koridor sisse, määra sõidurea, ääriala ja külgnõlvade väärtused ning loe sellest tekkivaid lõikeid, päevavalguse jooni ja pinnasetöid.
keywords: ristmik, ristumine, tee ja tee kohtumine, kõrvaltee, T-ristmik, ristumine, platvormi kõrgus, ühendamine, sidumine, ülekallutus, ülekallutus, kallutus, üleminek, tasanduspikkus, mõõtetabel, põikkalle, pöörlemine, koridor, koostis, tüüpristlõige, tee, sõidurada, ääriala, põikkalle, külgnõlv, päevavalgus, kaevand, täide, lõiked, sihik, laiussihik, kõrgussihik, nihkesihik, laiendamine, sõiduteekatte serv, teise koridori järgimine
from: 6dcb92b3
---

Koridor lõikab ühe lihtsa tüüpristlõike (koostise) mööda trassi ja selle projekteeritud pikiprofiili, planeerib selle olemasoleva maapinna järgi ja lisab tulemuse projekteeritud pinnale. Ühel trassil võib olla mitu koridori erinevatel jaamavahemikel ning koridori saab ehitada korduvkasutatavate mallide järgi jaamade kaupa ([Koridori mallid](topic:corridor-templates)). Allpool olev lihtne koostis on mõlemal pool sama; et igal pool oma osad oleksid, vaata [Ehita iga pool osadest](topic:corridor#build-each-side-from-parts).

## Koostis

Keskjoonest väljapoole, igal pool:

1. **sõidurada** antud laiusega, langedes keskjoonest **sõidurea kalde** võrra
2. **ääriala** antud laiusega **ääriala kalde** järgi
3. **külgnõlv** ääriala servast kuni maapinnani: **kaevandi nõlv**, kui maapind on kõrgemal, ja **täitenõlv**, kui maapind on madalamal

Algväärtused on kohatäited, mitte projekteerimisnorm:

| Väärtus | US feet | Meetrid |
|---|---|---|
| Sõidurea laius | 12 ft | 3.6 m |
| Sõidurea kalle | 2% | 2% |
| Ääriala laius | 4 ft | 1.2 m |
| Ääriala kalle | 4% | 4% |
| Kaevandi nõlv | 2 : 1 | 2 : 1 |
| Täitenõlv | 3 : 1 | 3 : 1 |
| Lõige iga | 10 ft | 5 m |

Külgnõlvade kalded on horisontaalsed ja vertikaalsed (H:V): 3 : 1 tähendab 3 ühikut horisontaalselt 1 vertikaalse ühiku kohta.

## Koridori ehitamine

Vajad vigadeta trassi ja projekteeritud pikiprofiili, millel on vähemalt kaks PVI-d ja ei ole vigu.

1. Vali trass.
2. Paremas paneelis jaotises **Koridor** märgi **Pühi koost mööda projekteeritud pikiprofiili**. Väljad ilmuvad ja koridor ehitatakse kohe. Plaanil näed sõidurea ja ääriala servi ning päevavalguse jooni; kui jaotises **Kuva** on valitud {{ui:Projekteeritud (planeeritud)}}, näitavad kõrgusjooned uut maapinda.
3. Muuda mis tahes väärtust: **Sõidurea laius**, **Sõidurea kalle**, **Ääriala laius**, **Ääriala kalle**, **Kaevandi nõlv**, **Täitenõlv**, **Lõige iga**. Pärast igat vajuta {{key:Enter}}. Kaevandi nõlv, täitenõlv ja lõigu samm peavad olema suuremad kui 0.
4. Loe väljade all olevat rida, näiteks „39 lõiget jaamast 0+00.00 kuni jaamani 3+86.36; kaevand 240.2 cu yd, täide 556.0 cu yd.“

Lõiked lõigatakse igal **Lõige iga** sammul, otstes ning iga horisontaal- ja vertikaalkõvera alguses ja lõpus. Iga lõige ja neid läbivad jooned (keskjoon, sõidurea ja ääriala servad, päevavalgus) saavad projekteeritud pinna murdjoonteks.

Koridori väljalülitamiseks eemalda märge. Selle väärtused jäävad järgmiseks korraks alles.

## Kui see ei ehitu

Punane kast väljade all ütleb, miks:

| Teade | Mida teha |
|---|---|
| „Koridor vajab vigadeta projekteeritud pikiprofiili.“ | Lisa PVI-d või paranda kattuvad vertikaalkõverad (vt [Projekteeritud pikiprofiili koostamine](topic:profile)). |
| „Projekteeritud pikiprofiil ei kattu trassiga.“ | Liiguta PVI-d trassi jaamavahemikule. |
| „Koridor vajab pinnal vähemalt kahte lõiget.“ | Suurem osa koridorist on olemasolevast maapinnast väljas. |
| „4 külgnõlva jooksevad pinnast välja enne maapinnani jõudmist.“ | Pinna servas ei jõua nõlv maapinnani. Hoia tee pinna servast eemal või langeta seal täite- või kaevandikõrgust. |
| „Koridori päevavalgusjooned ristuvad (lõiked kattuvad, näiteks terava kõvera sisemisel küljel). Kasuta suuremat raadiust või kitsamat koostist.“ | Terava kõvera sisemise külje lõiked kattuvad. Suurenda raadiust või kitsenda koostist. |

Probleemiga koridori ei planeerita sisse ega arvata pinnasetöödesse.

## Koridorid ja platvormid koos

Projekteeritud pind ehitatakse järjekorras: esmalt kõik koridorid, seejärel kõik platvormid. Kui platvormi planeering kattub koridoriga, võidab platvorm. Kui hilisem objekt kattub teega, asendatakse tee osast ainult see, mis jääb hilisema objekti päevavalgusjoone sisse; ülejäänud tee ja iga maapinna murdjoon, mida tee läbib, säilitavad oma kuju. Mahud arvutatakse kõigi päevavalgusjoonte sees koos; vt [Pinnasetöömahud](topic:volumes).

## Ülekallutus

Kõvera läbimisel võib tee kalduda sisepoole, nii et liiklust surutakse väljapoole vähem. Märgi trassi **Atribuutides** jaotises **Ülekallutus** märge **Ülekalluta kõverad**:

- Iga ringkõver saab mõõtetabelist määra **e**: esimese rea, mille raadiuse kõver ulatub (rida tühja määraga säilitab tavapärase kumeruse). Tabel ja **Maksimaalne suhteline kalle** (algselt 0.5 %) on kohatäited, mitte standard: määra need oma projekteerimisnõuete järgi. Lisa või eemalda ridu vastavalt vajadusele.
- Sõidurajad pöörlevad keskjoone ümber. Enne kõverat lameneb väljapoolne sõidurada üle **tasanduspikkuse** (tavapärane kumerus ÷ e × üleminek), seejärel üle **ülemineku** (sõidurea laius × e ÷ kalle) pöördub väljapoolne sõidurada edasi, kuni kogu tee kaldub e võrra sisepoole; kaks kolmandikku ülemineku pikkusest jääb enne kõverat ja üks kolmandik kõvera peale. Pärast kõverat toimub sama vastupidises järjekorras.
- Madalal poolel olev ääriala ei ole kunagi lamedam kui oma sõidurada; kõrgemal poolel säilitab ta oma kalde (ta veereb üle).
- Selle all olev tabel loetleb iga kõvera raadiuse, määra, ülemineku ja tasanduspikkuse ning kohad, kus täielik ülekallutus algab ja lõpeb. **Ülekallutuse diagramm** joonistab mõlema sõidurea ristkalded jaamade kaupa (vasak sõidurada tahkjoonena, parem katkendjoonena).
- Liiga lühike kõver täieliku ülekallutuse saavutamiseks või kaks kõverat, mille üleminekud kattuvad, on öeldud kastis tabeli kohal.

Lõiked, mahud, 3D-vaade ja joonised näitavad kõik kallutatud teed. Iga muudatus on üks samm: {{key:Mod+Z}} võtab selle tagasi.

## Sihikud

Sihik viib tee ühe külje ühe punkti joonele: **Sõiduteekatte serv** või **Ääriala serv**, **Vasakul** või **Paremal**. Iga lõige kohtub joonega risti keskjoonega, minnes välja ainult sel küljel, nii et parema poole sihik ei liiguta kunagi vasakut külge.

| Määrab | Mis juhtub, kui lõige kohtub joonega |
|---|---|
| **Laius** | Punkt asub joonel: sõidurada (või ääriala) laieneb või kitseneb sinnani, säilitades oma ristkalde. |
| **Kõrgus** | Punkt võtab sealsel joonel kõrguse oma nihkel: sõidurea (või ääriala) ristkalle järgib seda. |

Joon võib olla tunnusjoon (mis tahes oma **Kasutusega**) või teise koridori joon: selle keskjoon, sõiduteekatte servad, ääriala servad või päevavalgusjooned. Koridori joon järgib seda koridori: muuda teist teed ja see järgib. CivilCraft ehitab esmalt teise koridori; kaks koridori, mis sihiksid teineteist ringis, lükatakse ühel küljel tagasi ja tabel ütleb, kumb.

1. Vali trass ja lülita selle koridor sisse.
2. Jaotises **Sihikud** klõpsa {{ui:Lisa sihik}}.
3. Vali **Pool**, **Punkt**, mida ta **Määrab** ja **Joonele**. Iga muudatus on üks tagasivõtmise samm.

**Tulemus** ütleb, mitmel lõikel joonele jõuti. Lõiked, mis joonele ei jõua (selle otstest mööda või seal, kus see on keskjoonest taga), säilitavad koostise väärtused. Kustutatud joon jätab koridori sellisena nagu enne sihikut ja tabel ütleb seda. Ühel küljel võib olla iga punkti kohta üks laiussihik ja üks kõrgussihik.

## Iga pool osadest

Lülita koridori seadistuste all sisse **Ehita iga pool osadest**. Iga poolel on siis oma loend keskjoonest väljapoole: sõidurajad, ääriala, vihmaveerenn, äärekivi, haljasriba, kõnnitee ja viimasena külgnõlv maapinnani (oma kaevandi- ja täitekordajatega). Alusta jaotisest {{ui:Maantee}} või {{ui:Linnatänav}}, lisa ja eemalda osi, liiguta neid nooltega ning {{ui:Kopeeri}} ühe poole teisele. Iga muudatus on üks tagasivõtmise samm.

Ristkalle on kalle tee eemale, nii et tee suunas kallutav kõnnitee on negatiivne. Äärekivi on antud kõrgusega tahk, antud laiusega pealispind ja valikuline tagumine langus. Ülekallutus pöörab kõik sõidurajad esimeses reas; vihmaveerenn, äärekivi, haljasriba ja kõnnitee rippuvad ehitatud sõidurea servast. Sihikud liigutavad ikka veel sõiduridade lõppu ja viimast osa. Ristlõiked märgivad vihmaveerenni voolujoont, äärekivi pealis- ja tagaserva ning ülejäänu. Kõveral, kus on spiraalid, on üleminek spiraal: tasane kumerus TS-punktis, täielik ülekallutus SC-punktis.

## Katendi kihid

Sõidurajal, ääriala, vihmaveerennil, haljasribal või kõnniteel võib olla oma kihtide kiht: osa all {{ui:Lisa kiht}} lisab kihi nime, materjali, paksuse ja liigi (pealmine, sidekiht, alus, alusealus, kaitsekiht või muu), ülevalt alla. Kihid ei nihuta tee pinda (selle pealispind on projekteeritud pind); iga kiht asub oma osa all ja selle sügavus mõõdetakse otse allapoole. Ristlõiked joonistavad iga kihi alumise serva katkendjoonena ja {{ui:Sõidutee kihid: kogused}} loetleb iga kihi plaanipinna ja mahu (pindala mööda koridori tema lõigetest, maht = pindala × paksus). IFC eksport kirjutab iga kihi oma elemendina koos paksuse ja materjaliga (vt [IFC eksport ja import](topic:ifc)). Paksus, mille sisestad, on sinu: CivilCraft ei dimensioneeri katendeid.

## Kus teed kohtuvad teede, platvormide ja radadega

Kui {{ui:Ühenda teed ja platvormid, millega see kohtub}} on sees (see on sees iga koridori puhul), ühendab CivilCraft koridori sellega, millega ta plaanil kohtub:

- **Tee, mis lõpeb teisel teel** (selle trassi lõpp jääb teisele teele või umbes poole oma sõiduteekatte laiuse piiresse selle tee servast) on ristmiku kõrvaltee. Tee, millega ta kohtub, avab oma serva kõrvaltee sõiduteekatte jaoks: suudme ulatuses paigutatakse ääriala, äärekivi, riba ja kõnnitee sõidurea ristkalde järgi ning joonistatakse katendina. Kõrvatee paigutatakse peamise tee pinnale seal, kus nad kattuvad, ja tõstetakse või lastakse lähenemisel sellele järele.
- **Kaks ristuvat teed** ühendatakse mõlemal küljel samamoodi. Tee, mis on trasside loendis esimesena, on läbiv tee; teine järgib selle pinda üle ristumise.
- **Tee, mis lõpeb platvormil** (selle sees või umbes poole sõiduteekatte laiuse piires selle servast), jõuab platvormi tasemele ja lastakse sellele lähenemisel järele.
- **Rada** (Haljastus › Kõvad pinnad) peatub tee välisserval, sama kõrguse juures, mis on seal kõnnitee või ääriala tase, selle asemel et lasta sellel tee peal olla. Rada, mis ristub teega, muutub kaheks tükiks. Lõpp, mis on joonistatud veidi lühikeseks teest (raja laiuse kahekordses kauguses), viiakse tee servani.

Atribuudid ütlevad, mida iga koridor ühendas, kui palju seal tõsteti või langetati ja mis pikkusel. See pikkus on suurem kahest: 10 m (30 ft) ja kakskümmend korda muutus, ega ole kunagi rohkem kui 45% koridorist. **Projekteeritud pikiprofiili ei muudeta**: pikiprofiilivaade näitab endiselt joonistatud kalde joont, aga lõiked, projekteeritud pind, mahud ja 3D-vaade näitavad teed nii, nagu see on ühendatud. Et ühendus oleks projektis täpne, liiguta viimane PVI tasemele, mille atribuudid näitavad.

Lülita koridori lüliti välja, et jätta see täpselt sellisena, nagu tema profiil ja koostis ütlevad; siis ei võta ta osa ühestki ristmikust, ei kõrvateena ega läbiva teena. Peaaegu ühel joonel kohtuvad teed (alla umbes 20°) jäetakse puutumata, nagu ka rajad.

Mida ristmik veel ei tee: nurgakõveraid ei ole (nurgad on ristkülikukujulised), pöörderadu ja saari ei ole, kõrvatee lõpp lõigatakse ristkülikuna oma trassi suhtes ning malli järgi ehitatud koridor avab oma serva samuti lihtsalt (ots, kraav või sein, mis on lõpus, tasandatakse suudme ulatuses, ilma kulvertita). Plaani nurgakõverate, nähtavuskolmnurkade ja markeeringute kohta vt [Pinnased, teed, mõõdistus, kaevandused ja lingid](topic:soils-roads-survey-mines-links).

## Veel valmimata

Päevavalguse nõlva sihikud pole veel saadaval. Koridori puhul, mis muutub mööda teed, vasaku ja parema küljega eraldi, kasuta [Koridori mallid](topic:corridor-templates). Vt [Veel valmis pole](topic:not-built-yet).
