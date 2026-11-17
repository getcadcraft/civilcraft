---
title: Athugaðu massa á móti skipulagsmörkum sem þú slærð inn
summary: Sláðu inn fjarlægðir lóðar línu fyrir línu, hæðarmörk, himinflöt, nýtingarhlutfall og þekju, sjáðu byggingarsvæðið á uppdrættinum og lestu hvaða massar brjóta hvaða mörk.
keywords: skipulag, byggingarfjarlægð, byggingarfjarlægðir, framhlið, hlið, bak, umslag, byggingarsvæði, hæðarmörk, himinflötur, nýtingarhlutfall, FAR, þekja, lóð, samþykkt, athugun á reglum
from: 3e267b31
---

**CivilCraft hefur enga skipulagsreglugerð innbyggða.** Það þekkir ekki reglur neinnar borgar og fylgir ekki safni af þeim. Hver tala á þessari síðu er sú sem þú slærð inn úr þinni eigin samþykkt, og sérhver niðurstaða segir að hún sé mæld á móti þeim mörkum sem þú slóst inn. Þetta er leið til að sjá hvernig mörk lóðar móta byggingu, ekki úrskurður um hvort hönnun sé leyfð.

## Sláðu inn mörkin

Í **Eiginleikar**, undir **Byggingarmassar**, veldu **Lóð** (eða veldu massa: mörk lóðar hans birtast undir honum). Fylltu síðan inn það sem á við; skildu reit eftir auðan fyrir „engin mörk“:

- **Götulína**: lóðarlínan við götuna. **Framfjarlægð** á við um hana, **Bakfjarlægð** á línuna sem er andspænis henni, og **Hliðarfjarlægð** á hinar.
- **Hæðarmörk**.
- **Himinflötur**: hann byrjar í hæð við lóðarlínuna og hækkar um þá tölu sem þú slærð inn fyrir hvern 1 af lengd inn á við, mældur frá götulínunni eða frá hverri lóðarlínu (2 þýðir 2 á móti 1). Leyfð hæð yfir punkti er sú lægsta af fletinum og hæðarmörkunum.
- **Nýtingarhlutfall** (brúttógólfflötur massa á lóðinni deilt með flatarmáli lóðarinnar) og **Þekja** (grunnflötur þeirra deilt með flatarmáli lóðarinnar, sleginn inn í prósentum).

## Byggingarsvæðið

Hakaðu við **Sýna byggingarsvæðið á uppdrættinum** til að teikna það á lagið `A-MASS-ENVL`. Byggingarsvæðið er lóðin skorin inn frá hverri lóðarlínu um fjarlægð þeirrar línu, og útfærslulínurnar mætast í skáskornum hornum. Lóðarlína sem er bogi er tekin sem stuttar strengjar innan 0.01 frá boganum. Kúptar og íhvolfar lóðir virka báðar. Ef fjarlægðirnar falla saman á sjálfar sig (djúp fjarlægð á mjórri eða mjög íhvolfri lóð) er ekkert byggingarsvæði og Eiginleikar segja það; prófaðu minni fjarlægðir.

## Niðurstaðan

Undir reitunum fær hver massi og hvert mark línu, með hakmerki eða krossi:

- **Byggingarfjarlægðir**: flatarmál massans sem liggur utan byggingarsvæðisins;
- **Hæð**: hæð massans miðað við mesta leyfða hæð yfir grunnfleti hans (prisma af einni hæð takmarkast af lægstu leyfðu hæð á einhverju horna hans);
- **Nýtingarhlutfall** og **þekja**: allir massar á lóðinni lagðir saman.
