---
title: Preverite mase glede na omejitve prostorske ureditve, ki jih vpišete
summary: Vpišite odmike parcele po vrsticah, omejitev višine, ravnino odprtosti neba, faktor izrabe in zazidanost, poglejte gradbeno ovojnico na tlorisu ter preberite, katera masa krši katero omejitev.
keywords: prostorska ureditev, zoning, odmik, odmiki, sprednji, stranski, zadnji, ovojnica, gradbena površina, omejitev višine, ravnina odprtosti neba, faktor izrabe, FAR, zazidanost, parcela, lot, odlok, preverjanje predpisov
from: 3e267b31
---

**CivilCraft nima vgrajenih prostorskih predpisov.** Ne pozna pravil nobenega mesta in ne ponuja knjižnice takih pravil. Vsako število na tej strani vpišete sami iz svojega odloka, vsak rezultat pa pove, da je merjen glede na vpisane omejitve. Gre za način, kako videti, kako omejitve parcele oblikujejo stavbo, ne za odločitev, ali je načrt dovoljen.

## Vpišite omejitve

V **Lastnostih**, pod **Gradbene mase**, izberite **Parcelo** (ali izberite maso: omejitve njene parcele se prikažejo pod njo). Nato izpolnite, kar velja; prazno polje pomeni »brez omejitve«:

- **Ulična meja**: parcelna meja ob ulici. **Sprednji odmik** se nanaša nanjo, **Zadnji odmik** na mejo, ki je najbolj nasproti njej, **Stranski odmik** pa na preostale.
- **Omejitev višine**.
- **Ravnina odprtosti neba**: začne se na določeni višini ob parcelni meji in se za vsak 1 vodoravne dolžine navznoter dvigne za vpisani znesek, merjeno od ulične meje ali od vsake parcelne meje (2 pomeni 2 proti 1). Dovoljena višina nad točko je najnižja med ravnino in omejitvijo višine.
- **Faktor izrabe** (bruto tlorisna površina mas na parceli, deljena s površino parcele) in **Zazidanost** (njihove tlorisne površine, deljene s površino parcele, vpisane v odstotkih).

## Ovojnica

Označite **Pokaži ovojnico na tlorisu**, da jo narišete na sloju `A-MASS-ENVL`. Ovojnica je parcela, zmanjšana od vsake parcelne meje za odmik te meje, pri čemer se odmične črte srečajo v poševno zrezanih vogalih. Parcelna meja, sestavljena iz krivulje, se vzame kot kratke tetive znotraj 0.01 od krivulje. Delujeta tako konveksne kot konkavne parcele. Če se odmiki prepognejo čez sebe (globok odmik na ozki ali zelo konkavni parceli), ovojnice ni in Lastnosti to povedo; poskusite manjše razdalje.

## Rezultat

Pod polji ima vsaka masa in vsaka omejitev svojo vrstico s kljukico ali križcem:

- **odmiki**: površina mase, ki leži zunaj ovojnice;
- **višina**: višina mase proti največji dovoljeni vrednosti nad njeno tlorisno površino (prizma ene višine je omejena z najnižjo dovoljeno višino v katerem koli njenem oglišču);
- **faktor izrabe** in **zazidanost**: vse mase na parceli, seštete.
