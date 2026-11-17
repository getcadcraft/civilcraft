---
title: Voertuig-swaaipaaie
summary: Ry 'n voertuig met tot drie aanhangers langs 'n kenlyn of 'n belyning, vorentoe of agteruit, en sien die oppervlak wat dit swaai, sy wielpaaie, sy stuur en waar dit knak.
keywords: swaaipad, draaipad, voertuigspoor, draaisjabloon, ontwerpvoertuig, vragmotor, bus, aanhanger, oplegger, agteruit, agteruitry, knak, geleding, stuurslot, buitespoor, wielpad, laaidok, draairadius
from: 8caafb8a
---

'n Swaaipad ry 'n voertuig langs 'n lyn en wys die grond wat sy liggaam oor gaan. Gebruik dit om te kontroleer dat 'n vragmotor 'n hoek kan neem, 'n laaidok kan bereik of 'n aanhanger op sy plek kan agteruit ry sonder om van die plaveisel af te gaan.

## Ry 'n voertuig langs 'n lyn

1. Teken die lyn wat die voertuig volg, in die rigting van beweging: 'n kenlyn (boë is goed: druk {{key:C}} terwyl jy dit teken, sien [Kenlyne](topic:feature-lines)) of 'n belyning.
2. Kies dit en klik {{ui:Swaaipad…}} in sy **Eienskappe**.
3. Onder **Begin vanaf**, kies 'n voertuig, en stel dan sy groottes volgens jou eie ontwerpvoertuig: breedte, voorhang, wielbasis, agterhang, spoor en **Stuurslot**. Voeg tot drie aanhangers by, elk met waar dit gekoppel is, sy lengte vanaf die koppelpunt tot sy as, sy hange en sy **Grootste geleding**.
4. Kies **Ry**: vorentoe of agteruit. Klik {{ui:Ry dit}}.

:::warning
Die voertuie om van te begin is plekhouers, nie 'n standaard nie. Stel die groottes volgens die ontwerpvoertuig wat jou projek gebruik.
:::

## Vorentoe en agteruit

| Ry | Wat die lyn volg | Wat CivilCraft bereken |
|---|---|---|
| **Vorentoe** | Die vooras se middelpunt | Waar die agteras en elke aanhanger gaan, die stuurhoek en die geleding |
| **Agteruit** | Die laaste as se middelpunt (die agterkant van die aanhanger) | Waar elke eenheid voor hom gaan, en die stuur wat die kop nodig het om die aanhanger daar te kry |

Agteruit ry is hoe 'n agteruitbeweging nagegaan word: sê waar die aanhanger moet gaan, en CivilCraft sê of die kop dit kan doen.

## Lees die resultaat

Die swaaipad word op die plan in oranje geteken: sy omtrek en, gestippeld, die paaie van die buitenste wiele. Kies dit (klik binne-in) om in **Eienskappe** te sien:

- **Gery lengte**, die grootste **Stuur**-hoek en **Geleding** teen hulle grense, en die **Swaaioppervlak**.
- Enige probleem langs die lyn, met sy afstand: die stuur verby die slot, of 'n aanhanger wat sy geledingsgrens oorskry (dit knak).
- **Die voertuig langs die lyn**: skuif die skuifbalk om die voertuig op enige punt te sien, met sy stuur en geleding daar.

Verander die lyn en die swaaipad volg. {{ui:Wysig die voertuig…}} verander die groottes; **Ry** skakel tussen vorentoe en agteruit. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit. {{key:Delete}} skrap die gekose swaaipad (die lyn bly).

Die omtrek en die wielpaaie gaan na die PDF, DXF en DWG op laag C-ROAD-SWPT.

## Hoe dit bereken word

Elke eenheid draai om die lyn van sy agteras en word gesleep deur die punt voor hom (die vooras, of die koppelpunt), die lae-spoed, sonder-slip-model wat swaaipad-kontroles gebruik. Die swaaioppervlak is al die liggaamsomtrekke van elke posisie saamgevoeg. Dit modelleer nie spoed, bandslip, die tyd wat die stuur neem om te draai, stuuraanhangers of die speling onder die liggaam nie.
