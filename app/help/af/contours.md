---
title: Lees kontoere, hoogtes en hellings
summary: Stel die kontoerinterval en hoofkontoere, wys hoogtebande, helling-pyltjies en driehoeke, en lees grondhoogtes onder die wyser af.
keywords: kontoere, kontoerinterval, hoofkontoere, etikette, hoogtebande, helling-pyltjies, driehoeke, puntuele hoogte, oppervlakanalise, hoogteanalise, hellinganalise
from: 585e500a
---

Die oppervlak word met kontoere gewys sodra dit bestaan. Alles in hierdie onderwerp word onder **Vertoon** in die linkerpaneel ingestel. Vertooninstellings verander net wat jy sien (en wat jy uitvoer); hulle is nie ontdoenstappe nie.

## Stel die kontoerinterval

1. Onder **Vertoon**, kies 'n waarde in **Kontoere elke**.
   - In feet: 0.25, 0.5, 1, 2, 5, 10 of 20 ft.
   - In meter: 0.1, 0.25, 0.5, 1, 2, 5 of 10 m.
2. Kies **Hoofkontoer elke**: die 2de, 4de, 5de of 10de kontoer.
   Hoofkontoere word dikker geteken en met hul hoogte benoem. Hulle val op heelveelvoude van die hoofspasiëring (met 1 ft kontoere en elke 5de hoofkontoer: 245, 250, 255 …).
3. Skakel {{ui:Kontoerlynetikette}} af as die etikette 'n klein plan oorvol maak.

'n Nuwe projek begin met 1 eenheid, met elke 5de kontoer as hoofkontoer. Kontoere buig by breeklyne; as hulle reguit oor 'n vloeilyn of rante sny, is daardie lyn nog nie 'n breeklyn nie (sien [Bou en verfyn die oppervlak](topic:build-surface)).

:::note
Kontoere word net geteken as daar nie meer as 2,000 vlakke tussen die laagste en hoogste punt is nie. Op 'n terrein met baie reliëf en 'n baie klein interval wys die plan glad geen kontoere nie: kies 'n groter interval.
:::

## Gladmaak die kontoere

Kontoere word as reguit stukkies getrek, een oor elke driehoek van die oppervlak, so hulle draai 'n klein hoekie by elke driehoekrand. **Kontoergladmaking** onder **Vertoon** rond daardie hoekies af:

- **Geen (reguit stukke)**: die getrekte lyne soos hulle is. Dit is wat 'n nuwe of ouer tekening wys.
- **Lig**: hoekies effens afgerond. 'n Lyn beweeg nooit meer as 10% van die pad na die volgende kontoer nie, en nooit verder van sy reguit stuk as een sesde van daardie stuk se lengte nie.
- **Sterk**: 'n vloeiende kromme. 'n Lyn beweeg nooit meer as 25% van die pad na die volgende kontoer nie, en nooit verder van sy reguit stuk as een derde van daardie stuk se lengte nie.

Met albei keuses sny 'n gladgemaakte kontoer steeds elke driehoekrand op dieselfde punt as die getrekte een, bly binne die driehoek wat elke stuk sny, en kan dus nooit 'n ander kontoer sny of raak nie. Waar 'n kontoer 'n breeklyn of die grens sny, behou dit sy skerp draai. Die gladgemaakte lyne is dié wat geplot en uitgevoer word (DXF, DWG, PDF, GIS en 3D), met meer hoekpunte as die getrekte lyne.

Gladmaking verander net die getekende lyne. Hoogtes, volumes, profiele en snitte word steeds uit die oppervlak self gelees. 'n Kontoer wat presies deur opmetingspunte gaan (’n punt op 250.00 op die 250-kontoer) behou 'n klein hoekie by elke so punt.

## Hoe die oppervlak agter die kontoere gemaak word

Kontoere volg die oppervlak, en die oppervlak volg die **Kontoeringsmetode** onder **Oppervlak** in die linkerpaneel. Die verstek, **Triangulasie met lineêre interpolasie**, verbind jou punte in driehoeke en hou elke punt en breeklyn presies. Die ander metodes pas eers 'n reguit rooster op die punte (kriging, minimum kromming, natuurlike buur, omgekeerde afstand en ander), wat rondere kontoere tussen punte gee, maar nie presies deur elke punt gaan nie; die oppervlakverslag onder **Oppervlak** sê hoe ver die resultaat by jou punte af is.

**ABOS (benadering gebaseer op gladmaking)** is een van die roostermetodes. Dit het twee eie instellings: **Gladheid** (0.5 by die begin; laer is gladder) en **Akkuraatheid** (1 by die begin: die oppervlak word binne 1% van die terrein se hoogtebereik by jou punte gebring; tik 'n kleiner getal vir 'n nouer passing). As dit nie die akkuraatheid op die rooster wat dit het kan bereik nie, sê die oppervlakverslag dit: tik 'n kleiner **Rooster-afstand**.

## Lees 'n hoogte enige plek

Beweeg die wyser oor die plan. Die statusbalk wys:

- **E** en **N** onder die wyser
- **Grond** en die bestaande grondhoogte daar, geïnterpoleer op die driehoek onder die wyser
- **Gegradeer** en die voorgestelde hoogte, waar 'n plataform of koridor die grond verander het
- "Buite die oppervlak" as dit buite die oppervlak is

Om 'n opmetingspunt presies te lees, kies {{ui:Kies}} en klik die punt: die regterpaneel wys sy nommer, oos-koördinaat, noord-koördinaat, hoogte, beskrywing en groep.

## Wys hoogtebande

1. Merk {{ui:Hoogtebande}}.
   Die oppervlak word met kleur gevul, van laag (blougroen) tot hoog (oker-bruin). 'n Legenda onder die merkblokkies lys elke band se hoogtebereik.
2. Kies hoeveel bande in **Bande**: 5, 8, 10 of 12. Die bande verdeel die bereik van die laagste tot die hoogste hoogte in gelyke stappe.

Bande is net om na te kyk. Hulle word nie na DXF uitgevoer of na PDF geplot nie.

## Wys helling-pyltjies

Merk {{ui:Helling-pyltjies}}. 'n Kort pyltjie op elke driehoek wat groot genoeg is om een te hou, wys af-helling. Plat driehoeke kry geen pyltjie nie. Pyltjies is 'n vinnige nagaan van dreineringsrigting; die hellingswaarde self word nog nie benoem nie.

## Wys driehoeke, punte en rande

- {{ui:Driehoeke}} teken die TIN se rande. Skakel dit aan om na te gaan hoe die oppervlak die punte verbind, veral langs breeklyne en aan die buitekant.
- {{ui:Punte}} teken elke opmetingspunt; {{ui:Puntetikette}} voeg sy nommer, hoogte en beskrywing by (of minder: sien **Puntetikette** in [CivilCraft-instellings](topic:settings)).
- {{ui:Breeklyne}} teken breeklyne (en die grens) in oranje.
- {{ui:Oppervlakrand}} teken die buitelyn van die oppervlak.

## Bestaande of voorgestelde

Sodra 'n plataform of koridor sonder probleme gradeer, bied **Oppervlak** onder **Vertoon** {{ui:Voorgestelde (gegradeer)}} aan. Die kontoere, bande en pyltjies wys dan die gegradeerde oppervlak, sodat jy die nuwe grond en die daglig daaromheen kan sien. Skakel terug na {{ui:Bestaande grond}} om die opmeting te sien.

## Wat uitgevoer word

DXF- en PDF-uitvoer volg hierdie instellings: wat jy afgeskakel het, word nie geskryf nie, en die kontoere is dié van die oppervlak wat gewys word. Hoogtebande word nooit uitgevoer nie.
