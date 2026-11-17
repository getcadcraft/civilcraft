---
title: Reovee projektvoolude arvutamine ja kanalisatsiooni kontroll
summary: Sisesta inimesed ja pindala, mis siseneb reovee võrgu igasse kaevu; CivilCraft liidab need allavoolu kokku, arvutab tippvoolu tipufaktori ja infiltratsiooniga ning kontrollib iga toru läbilaskevõimet ja kiirust.
keywords: reovesi, reoveekanalisatsioon, kanalisatsioon, projektvool, tippvool, tipufaktor, Harmon, Babbitt, infiltratsioon, elanikkond, inimese kohta, täituvusprotsent, isepuhastuv, kiirus, toru mõõtmine, projektileht
from: 73ba197a
---

Reovee projektvoolud töötavad [torustikul](topic:pipe-network), kui selle {{ui:Type}} on {{ui:Sanitary}}. Kui midagi pole valitud, näitab parem paneel siis **Reovee projektvoolud**, kus sademevee võrgu puhul näidatakse sademevee äravoolu.

## Sisesta, mis siseneb

1. Vali kaev. Jaotises **Reovee projektvoolud** sisesta {{ui:People entering here}} ja {{ui:Area entering here}} (hektarit meetri-projektis, aakrit jala-projektis).
2. Kaubanduse-, kontori- või tööstuspindade jaoks sisesta samaväärsed inimesed: pindala korda inimesed hektari (või aakri) kohta, mida sinu amet kasutab. Pindala loetakse infiltratsiooni jaoks igal juhul.
3. Korda iga kaevu kohta, kuhu ühineb tänav või krunt. Kaev, kuhu midagi ei ühine, jääb mõlemaks 0.

Iga toru kannab kõike, mis siseneb tema ülemisse kaevu ja kõrgemalt. Vali kaev, et näha, mis seda läbib.

## Seaded

| Seade | Mida see tähendab |
|---|---|
| {{ui:Flow per person}} | inimese keskmine päevane vool: liitrites (meetri-projekt) või USA gallonites (jala-projekt) |
| {{ui:Infiltration}} | põhjavesi, mis lekib sisse: liitrit sekundis hektari kohta või gallonit päevas aakri kohta |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), või Babbitt, 5 / P^0.2, kus P on elanikkond tuhandetes |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | tegur hoitakse nende kahe vahel |
| {{ui:Manning n}} | läbilaskevõime ja kiiruse jaoks |
| {{ui:Least velocity}} / {{ui:Most velocity}} | tippvoolu enda sügavusel torus |
| {{ui:Most of full capacity}} | kui täis tohib toru tipus töötada, protsendina sellest, mida ta kannab täisvoolul |

Algväärtused on kohatäited, mitte standard. Kasuta väärtusi, mille sinu amet avaldab.

## Mida see arvutab

Iga toru kohta voolujärjekorras:

- tippvool = inimesed × vool inimese kohta × tipufaktor + pindala × infiltratsioon
- täisvoolu läbilaskevõime (Manningi valem toru kalde järgi) ja see, kui täis tipp selle teeb
- tippvoolu normaalsügavus ja kiirus seal

Tabel **Reovee tulemused** loetleb iga toru inimesed, tipufaktori, tippvoolu (l/s või gpm ja kuupjalga sekundis), täituvusprotsendi ja kiiruse. Probleemid on selle all loetletud: toru on lubatust täitem, aeglasem kui väikseim kiirus (ei pruugi ise puhastuda), kiirem kui suurim või kalde puudumine. {{ui:Size the pipes for these flows}} valib iga toru kohta väikseima standardse suuruse (200 mm või 8 tolli ja suurem), mis kannab selle tippvoolu piirangu piires; üks {{key:Mod+Z}} võtab selle tagasi.

:::note
See on püsiv tippvool, mida projektileht arvutab, ja see on kontrollitud trükitud projektilehe vastu kuni selle trükitud ümardamiseni. See ei ole mudel kanalisatsioonist ajas: hüdrograafe, mahuteid, pumpasid ega ülevoolusid ei ole. Vt [Veel pole valmis](topic:not-built-yet).
:::

Kiirused kasutavad Manningi valemit sama n-iga igal sügavusel. Mõne ameti osaliselt täidetud diagrammid lubavad n-l sügavusega muutuda, mis annab 60 kuni 70 protsenti täis torus veidi madalama kiiruse (umbes 3 protsenti vähem).
