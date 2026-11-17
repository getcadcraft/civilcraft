---
title: Hlutir úr línum, haldið tengdum
summary: Búðu til lagningu, gróðursvæði, beð, limgerði, stíg, vegg, kantstein, þrep, rampa, pall, skurð eða einkennalínu úr línu; hluturinn fylgir þegar línan hreyfist, þar til þú rýfur tenginguna.
keywords: úr línu, línur, DWG, DXF, tenging, tengt, fylgja, endurbyggja, rjúfa tengingu, einkennalína, einkennalína úr línum, innflutt lag, útlína, supercad studio, teikningarlína
from: eb67a0c6
---

{{ui:Lína úr línu}} (Landslag › {{ui:Meira}}): smelltu á einkennalínu, eða línu eða útlínu innflutts DWG/DXF-lags. Lokuð lína getur búið til lagningu, grasflöt, gróðurbeð, engi, þekju, beð eða pall; opin lína stíg, vegg, kantstein, þrep (fyrsti og síðasti punktur þess), rampa, limgerði eða skurð. Hvor tegundin sem er getur búið til **einkennalínu**, nema einkennalína sjálf.

## Einkennalína úr línu

Einkennalína sem er búin til úr línu tekur punkta hennar, lokaða ef línan var lokuð. Hæðir hennar eru lagðar á núverandi land (0 þar sem það er ekki enn til), og notkun hennar er **Slökkt**: hún mótar ekkert land fyrr en þú velur notkun og setur hæðir hennar í Eiginleikum sínum. Þegar línan hreyfist heldur einkennalína með sama fjölda punkta hverri hæð sem þú stillir; þegar línan fær punkta eða missir þá eru hæðirnar lagðar aftur á landið. Sjá [Einkennalínur](topic:feature-lines).

Nýi hluturinn heldur **tengingu** við línu sína. Þegar línan hreyfist (þú dregur punkta hennar, eða teikningin er færð eða lesin aftur), tekur hluturinn nýja lögun í sama afturköllunarskrefi, og í gegnum mótunarbreytingar fylgir fyrirhugað land því. Eiginleikar segja hvað hann er tengdur við; {{ui:Rjúfa tengingu}} gerir hann frjálsan.

Línur eru athugaðar fyrst: lína þarf að minnsta kosti 2 punkta (3 fyrir útlínu), í mesta lagi 5000, raunverulegar tölur, og útlína þarf að vera lokuð og má ekki skerast sjálf. Lína sem fellur er ekki notuð: hluturinn helst eins og hann var og Vandamálaspjaldið segir hvers vegna. Ef línan er eydd helst hluturinn og Vandamálaspjaldið tekur það fram.

## Í SuperCad Studio

Opnaðu svæðið og 2D-teikninguna í sama verkefni. Veldu eina línu eða fjöllínu í 2D-teikningunni, ýttu á Ctrl+K og keyrðu {{ui:Landslagshlutur úr völdu teikningarlínunni}}: CivilCraft spyr hvað eigi að búa til, eins og hér að ofan, og hluturinn helst tengdur við þá línu teikningarinnar. Eftir að þú breytir línum í teikningunni lætur Ctrl+K {{ui:Uppfæra landslagið úr teikningunni}} hlutina fylgja, með einu afturköllunarskrefi fyrir hverja línu. Tengiskrá verkefnisins skráir hvaða hlutur fylgir hvaða línu. Hjálp SuperCad Studio hefur sinn eigin kafla um Landslag.
