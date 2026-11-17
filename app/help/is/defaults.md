---
title: Upphafsgildi og staðgenglar
summary: Hvert gildi sem CivilCraft byrjar með, fyrir ný verkefni, birtingu, veglínur, palla, ganga, pípunet, rúmmál og prentun, og hver þeirra eru staðgenglar sem á að skipta út.
keywords: sjálfgildi, stillingar, upphafsgildi, staðgenglar, hönnunarviðmið, staðlar, reglur, forsendur
from: fbfc7432
---

CivilCraft er hvorki með stillingaglugga né sniðmát. Þetta eru gildin sem hlutir byrja með. Gildi sem merkt eru **staðgengill** eru ekki tekin úr neinum staðli: skiptu þeim út fyrir viðmið verkefnisins áður en þú treystir athugun eða magni.

## Nýtt verkefni

| Stilling | Gildi |
|---|---|
| Heiti | Ónefnt svæði (heiti fyrstu punktaskrárinnar kemur í staðinn) |
| Einingar | US feet |
| Heiti yfirborðs | Núverandi land |
| Punktahópar | Sérhver hópur byrjar sem {{ui:Punktar}} |
| Lengsta ytri brún | 0 (halda hverjum þríhyrningi) |
| Afturköllunarskref geymd | 200 |

## Birting

| Stilling | Gildi |
|---|---|
| Yfirborð | {{ui:Núverandi land}} |
| Hæðarlínur á | 1 (ft eða m) |
| Stórar hæðarlínur á | 5. hverri hæðarlínu |
| Bil | 8 |
| Kveikt | Hæðarlínur, merkingar hæðarlína, punktar, brotlínur, jaðar yfirborðs, pípur |
| Slökkt | Þríhyrningar, hæðarbil, hallaörvar, merkingar punkta |

## Veglínur og langsnið

| Stilling | Gildi |
|---|---|
| Heiti | Veglína 1, Veglína 2 … |
| Upphafsstöð | 0+00 |
| Radíus beygju á hverjum innri PI | 100 ft eða 30 m, minni ef hann kemst ekki í helming hvers beins kafla |
| Hönnunarlengdarsnið | Ekkert fyrr en þú byrjar á einu; {{ui:Byrja á landinu}} setur PVI á landinu í hvorum enda |
| Lengd lóðréttrar beygju | 0 (engin beygja) þar til þú slærð inn eina |

## Pallar

| Stilling | Gildi |
|---|---|
| Heiti | Pallur 1, Pallur 2 … |
| Hæð | Landið á miðju palls, námundað í 0.1 (0 ef miðjan er utan yfirborðsins) |
| Halli í skurði | 2 : 1 (staðgengill) |
| Halli í fyllingu | 3 : 1 (staðgengill) |

## Samsetning gangs (staðgenglar)

| Stilling | US feet | Metrar |
|---|---|---|
| Breidd akreinar | 12 ft | 3.6 m |
| Halli akreinar | 2% | 2% |
| Breidd axlar | 4 ft | 1.2 m |
| Halli axlar | 4% | 4% |
| Halli í skurði | 2 : 1 | 2 : 1 |
| Halli í fyllingu | 3 : 1 | 3 : 1 |
| Þversnið á hverjum | 10 ft | 5 m |

## Pípunet

| Stilling | US feet | Metrar |
|---|---|---|
| Heiti og gerð | Regnvatn, regnvatn | Regnvatn, regnvatn |
| Minnsti halli (staðgengill) | 0.50% | 0.50% |
| Minnsta yfirdekk (staðgengill) | 2 ft | 0.6 m |
| Fall í brunnum (staðgengill) | 0.10 ft | 0.03 m |
| Þvermál nýs brunns | 48 in | 1200 mm |
| Þvermál nýrrar pípu | 12 in | 300 mm |
| Dýpt sökkvis | 0 | 0 |
| Brún | Frá yfirborðinu | Frá yfirborðinu |

Pípunet sem er opnað úr LandXML notar þessar reglur líka, því LandXML geymir þær ekki.

## Rúmmál

| Stilling | Gildi |
|---|---|
| Aðferð | Reitur, sýnt í miðjum reitum innan hæðarlínubandanna |
| Reitastærð | Valin þannig að umlykjandi rétthyrningur mótaða flatarins hafi um 250,000 reiti (1, 2 eða 5 sinnum veldi af tíu) |
| Þensla og rýrnun | Engin |

## Prentun

| Stilling | Gildi |
|---|---|
| Svæði | {{ui:Allt}} |
| Pappír | Tabloid 11 × 17 in (fetaverkefni), ISO A3 (metraverkefni); alltaf lárétt |
| Mælikvarði | Stærsti skráði mælikvarðinn sem passar |
| Blek | {{ui:Litir laga}} |

Texti DXF-merkinga er stærður fyrir þann mælikvarða þar sem allt passar á Tabloid (fet) eða A3 (metrar).
