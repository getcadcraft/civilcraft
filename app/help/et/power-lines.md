---
title: Elektriliinide tööruum
summary: Õhuliinid ja maa-alused kaablid sinu objektil, sinu enda teekidega, ripe ja pinge sinu koormusjuhtude all, kontrollid vabaruumide ja tugevuse üle, paigaldustabelid, kogused, lehed ja GIS-eksport.
keywords: elektriliin, õhuliin, elektriline, jaotus, postid, toed, juht, ripe, pinge, paigaldus, vabaruum, maa-alune kaabel, kaevik, tööruum, utiliit
from: 638dd856
---

Elektriliinide tööruum paneb õhuliinid ja maa-alused kaablid sinu olemasolevale CivilCraft'i objektile: samad mõõdistuspunktid, sama maapind, sama projektifail.

:::warning
Kujundusabi. Tööruum arvutab ripe, pinget, vabaruume ja koormusi **sinu** koormusjuhtude ja piirangute järgi; ühtegi riigi standardit pole sisse ehitatud. Insener kontrollib iga tulemust enne ehitamist kohaldatava standardi järgi.
:::

## Ava see

Vali {{ui:Pind}} › {{ui:Veel}} › {{ui:Elektriliinide tööruum}} või **Elektriliinid** jaotises Tööruum. Tööriistariba näitab siis gruppi **Elektriliinid**; Projekteerimise ja GIS-i grupid jäävad kõrvale. Vali **Tsiviil** jaotises Tööruum, et naasta. CivilCraft mäletab viimati kasutatud tööruumi selles arvutis.

Vasakpoolsele paneelile lisanduvad üleval kaks jaotist:

- **Elektriliinid**: sinu koormusjuhud ja piirangud, projekti liinid ja kaablid ning **Kontrollid**, alati ajakohased. Kliki kontrollile, et valida, mida see puudutab.
- **Teek**: sinu enda juhid, kaablid, toed, seadmed ja kaevikutüübid. Vaata [Sinu elektriliinide teek](topic:power-line-library).

## Mis on elektriliinide grupis

| Tööriist | Mida see teeb | Teema |
|---|---|---|
| **Liin** | Õhuliin: kliki igale toele | [Õhuliini joonistamine](topic:overhead-line) |
| **Toe** | Lisa toe vahemikule | [Õhuliini joonistamine](topic:overhead-line) |
| **Kaabel** | Maa-aluse kaabli marsruut kaevikus | [Maa-alused kaablid](topic:underground-cables) |
| **Seade** | Kapp, trafo, muff või allikas, millest võrk toidetakse | [Maa-alused kaablid](topic:underground-cables) |
| **Takistus** | Midagi, mida liin ületab: tee, hoone, teine liin | [Kontrollid](topic:power-line-checks) |
| **Pikiprofiil** | Liini profiil: maapind, toed ja juht igal koormusjuhul | [Õhuliini joonistamine](topic:overhead-line#the-line-profile) |
| **Veel** | Koormusjuhud ja piirangud, paigaldustabelid, kogused, lehed ja aruanne, GIS, uuringufailid | [Ripe ja pinge](topic:sag-and-tension), [Väljundid](topic:power-line-outputs), [Uuringufailid](topic:power-line-study-file) |

Kõik, mida lisad, on üks tagasivõtmise samm, salvestub projektifaili ja joonistub plaanil kihtidele nimega `C-POWR-…`, nii et DXF-, DWG- ja PDF-eksport kannavad seda samuti.
