---
title: Skedarët e studimit për një program tjetër linjash (.DON)
summary: Ruaj një linjë ajrore si skedar studimi .DON, ose lexo mbajtëset e një linje në një linjë të re. I pa testuar me programin që i lexon.
keywords: don, .don, skedar studimi, xml, eksporto, importo, program linjash ajrore, shtrirje, canton
from: 1abc4d07
---

Disa programe linjash ajrore mbajnë një studim në një skedar `.DON` (tekst XML). CivilCraft mund të shkruajë një linjë si një skedar të tillë dhe të lexojë mbajtëset e një skedari.

:::warning
**I pa testuar.** E ndërtuam këtë nga një listë emrash fushash të formatit, të ndarë nga një përdorues, jo nga një skedar real, dhe nuk i kemi hapur skedarët tanë në programin që i lexon. Hape skedarin atje dhe kontrollo çdo vlerë para se të mbështetesh në të. Nëse mund të ndash një skedar `.DON` (me të dhënat e klientit të hequra), na ndihmon ta bëjmë këtë saktë.
:::

## Ruaj një skedar studimi

1. Jepi linjës një përçues dhe sigurohu që ka rezultate (pa "nuk është llogaritur" te Vetitë e saj).
2. {{ui:Më shumë}} › {{ui:Ruaj një skedar studimi (.DON)…}}, zgjidh linjën, shto një përshkrim dhe një numër pune.
3. {{ui:Ruaj skedarin e studimit}}.

Skedari mban mbajtëset e linjës (koordinatat, toka, lartësitë, rolet, traversa, mbajtësja e mbajtur ose e sugjeruar, ngarkesat për rast ngarkese, themeli), një seksion për çdo pjesë ndërmjet mbajtëseve fundore (përçuesi, tensioni, shtrirja e rregullt, shtrirjet, tensioni dhe parametri katenar, tensioni më i madh për rast ngarkese) dhe tabelat e shtrirjes. Gjatësitë janë në metra dhe forcat në daN; teksti shkruhet në Latin-1, kështu që një karakter jashtë tij bëhet `?`.

## Lexo një skedar studimi

{{ui:Më shumë}} › {{ui:Hap një skedar studimi (.DON)…}} lexon mbajtëset në një linjë të re. Përçuesi, mbajtëset dhe traversat përputhen me bibliotekën tënde sipas emrit; çdo gjë që nuk gjendet mbetet për t'u zgjedhur nga ti te Vetitë.
