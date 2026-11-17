---
title: Vinnublöð: töflur tengdar hlutunum
summary: Vistuð vinnublöð með línum úr plöntum, gróðursettum svæðum, hellulögn, veggjum, þrepum, landmótunarbreytingum eða öllum magntölum; eigin dálkar og formúlur, hópar og samtölur; CSV, XLSX og tafla á blöðunum, alltaf uppfærð.
keywords: vinnublað, tafla, plöntulisti, harðyfirborðslisti, magntölur, dálkar, formúla, samtala, talning, hópur, sía, csv, xlsx, töflureiknir, tafla á blaði
from: 11bc1bac
---

{{ui:Vinnublöð}} (Landslag › Meira) opnar vinnublöð þessa verkefnis. Í fyrsta skipti eru plöntulistinn og listinn yfir harðyfirborð og svæði búnir til fyrir þig. Vinnublað er reiknað út frá hlutunum í hvert skipti sem það er sýnt, skrifað út eða sett á blað: breyttu beði og talningar þess breytast alls staðar.

- **Línur úr**: plöntum (ein lína fyrir hverja tegund, yrki og stærð), gróðursettum svæðum, hellulögn, veggjum, þrepum, landmótunarbreytingum (skurður og fylling) eða öllum magntölum.
- **Dálkar**: reitur (`qty`, `area`, `botanical`, eða heiti í hornklofum eins og `[Net area]`) eða formúla: `+ - * / ^ %`, `&` til að tengja texta, `= <> < <= > >=`, og `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formúla sem ekki er hægt að reikna sýnir `#ERR` (eða `#DIV/0`) í reitnum sínum. Formúlur eru lesnar af eigin þáttara CadCraft; ekkert í þeim er keyrt sem kóði.
- **Samtala** fyrir hvern dálk (summa, fjöldi, meðaltal, minnsta, stærsta), **Hópa eftir** (undirsamtölur fyrir hvern hóp) og **Aðeins línur þar sem**.
- {{ui:Vista sem CSV}}, {{ui:Vista sem XLSX}} og **Settu þetta vinnublað á blöðin** (Blöð › Vinnublöð teiknar það sem töflu, yfir eins mörg blöð og þörf er).

Merki á plöntum og svæðum lesa sömu reitaheiti (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
