---
title: Plan- og længdeprofilark
summary: Plot et tracé som et sæt plan- og længdeprofilark i én PDF, med matchlinjer mellem dem.
keywords: plan og længdeprofil, ark, plot, pdf, matchlinje, planproduktion, vejplaner, profilplot, vertikal overdrivelse, arksæt
from: 34b4ec78
---

Plan- og længdeprofilark er den måde, vejplaner normalt tegnes på: hvert ark viser en strækning af vejen to gange, planen øverst og længdeprofilet nedenunder, i samme vandrette målestok, så en station ligger det samme sted i begge.

## Lav arkene

1. Vælg tracéet. Klik på {{ui:Plan- og længdeprofilark}} under **Egenskaber**.
2. Vælg **Papir**, **Planmålestok** og **Profiloverdrivelse** (hvor mange gange højere profilet tegnes, end det er langt; 10× at starte med). Dialogen siger, hvor mange ark det giver, og hvor meget af tracéet hvert ark viser.
3. Hvis du vil plotte en del af tracéet, skal du ændre **Fra station** og **Til station**.
4. Klik på {{ui:Download PDF}}. PDF'en har én side pr. ark.

## Hvad er på et ark

| Del | Hvad den viser |
|---|---|
| Plan | Alt på planen (højdekurver, opmålingspunkter, tracéet og dets stationering, korridorer, byggeplateauer, feature-linjer, rør, snitlinjer), drejet, så denne strækning løber hen over arket, med en nordpil drejet tilsvarende |
| Matchlinjer | En streg-prik-linje vinkelret på tracéet i hver ende, der fortsætter på et andet ark, mærket »Matchlinje sta 5+50.00, se ark 2« |
| Længdeprofil | Det eksisterende terræn (stiplet), det projekterede længdeprofil (rødt), faldet på hver ret linje og hver lodret kurves PVI, kote, L og K; stationer langs bunden, koter på begge sider |
| Titelstrimmel | Projektnavnet, tracéet og dets stationsinterval, »Ark 1 af 3«, de vandrette og lodrette målestoksforhold og overdrivelsen |

Strækningen pr. ark er så lang, som planvinduet tillader ved målestoken, afrundet nedad til en hel 50 ft (20 m) på lange strækninger eller en hel 10 ft (5 m) på korte.

:::note
Hvis profilets koter ikke ville passe i den overdrivelse, du valgte, tegner CivilCraft alle ark med den største af 10×, 5×, 4×, 2× og 1×, der passer, og statuslinjen siger det. Et buet tracé drejes efter retningen fra start til slut for hver strækning, så vejen kan løbe lidt op eller ned på arket.
:::
