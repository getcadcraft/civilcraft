---
title: Beregeningsontwerp
summary: Een rekenhulp, geen gewaarmerkt ontwerp: sproeikoppen, zijleidingen, hoofdleiding, afsluiters en druppelleidingen op het terrein; zones afgeleid uit de leidingen; drukverlies volgens Hazen–Williams, de ongunstigste sproeikop, debiet en druk ten opzichte van de toevoer, neerslagsnelheden, looptijden, bereik en een materiaallijst.
keywords: beregening, sproeier, sproeiers, besproeiing, sproeikop, rotor, roterend mondstuk, bubbler, druppel, druppelleiding, emitter, afsluiter, zone, station, besturing, hoofdleiding, zijleiding, aansluitpunt, watertoevoer, druk, psi, kpa, debiet, gpm, wrijvingsverlies, hazen williams, neerslagsnelheid, looptijd, bereik, kop-tegen-kop, materiaallijst
from: 7d6342c1
---

:::warning
Dit is een rekenhulp, geen gewaarmerkt ontwerp: een beregeningsontwerper controleert elk resultaat voordat iets wordt aangelegd.
:::

## Het systeem uitzetten

1. Kies in de sectie **Beregening** links de **Kop**, zijn **Boog** en waar de boog begint, en de leidingdiameters voor zijleidingen en de hoofdleiding.
2. {{ui:Beregening}} › {{ui:Aansluitpunt}}: klik waar de watertoevoer aansluit. Stel de **druk**, het **beschikbare debiet** en het verlies van de meter en de terugslagklep in Eigenschappen in.
3. {{ui:Beregening}} › {{ui:Afsluiter}}: klik waar de afsluiter van elke zone komt. Een afsluiter start een zone.
4. {{ui:Beregening}} › {{ui:Kop}}: klik om sproeikoppen te plaatsen; elke klik plaatst er één.
5. {{ui:Beregening}} › {{ui:Zijleiding}}: klik vanaf een afsluiter door zijn sproeikoppen en druk op {{key:Enter}}. {{ui:Hoofdleiding}}: van het aansluitpunt naar elke afsluiter.

Leidingeinden klikken vast op sproeikoppen, afsluiters, de toevoer en andere leidingeinden, zodat het netwerk aansluit. Een zone is alles dat vanaf zijn afsluiter via zijleidingen wordt bereikt; de hoofdleiding voert één zone tegelijk.

## Druppel

{{ui:Beregening}} › {{ui:Druppelleiding}}: klik langs de lijn, beginnend waar hij wordt gevoed (een zijleidingeinde of een afsluiter). Stel het **emitterdebiet** en de **afstand** in Eigenschappen in; zijn debiet is het aantal emitters langs hem.

## De controle

{{ui:Beregening}} › {{ui:Systeem controleren…}} toont elke zone:

| Kolom | Hoe het wordt berekend |
|---|---|
| Debiet | De debieten van de sproeikoppen (en druppelleidingen) opgeteld |
| Bij de afsluiter | De werkdruk van de ongunstigste sproeikop plus de leidingverliezen tot daar (Hazen–Williams, de binnendiameter van de leiding, het hoogteverschil) en het verlies door de afsluiter |
| Bij de toevoer | Hetzelfde plus het verlies van de hoofdleiding die die zone draagt, en het verlies van de meter en de terugslagklep |
| Neerslag | Het debiet van de sproeikoppen over het oppervlak dat ze bevloeien bij kop-tegen-kop-afstand |
| Minuten per week | Om de instelling **Water per week** toe te passen |
| Problemen | Snelheid boven de grens, een sproeikop buiten zijn drukbereik, sproeiers en rotors op één afsluiter, te weinig druk of debiet bij de toevoer, sproeikoppen zonder zone, lussen |

Selecteer een afsluiter om de cijfers van zijn zone te zien, en zijn ongunstigste sproeikop op het plan omcirkeld. De materiaallijst telt sproeikoppen per soort en boog, leidingen per maat, afsluiters, druppelleiding en emitters, en de stations van de besturing. **Opslaan als CSV** bewaart beide.

Instellingen in de sectie Beregening: **Hazen–Williams C** (150 voor nieuwe kunststof leidingen), de **hoogste stroomsnelheid** in een leiding (1.5 m/s), het **verlies door een afsluiter** en **Water per week**. Ze zijn gelabelde standaardwaarden.

## Bereik

{{ui:Beregening}} › {{ui:Bereik tonen}} zegt hoeveel van het gebied de sproeikoppen droog laten, hoeveel er door twee of meer sproeikoppen wordt bevloeid, en welke sproeikoppen een buur niet bereiken (kop-tegen-kop-afstand).

## Sproeikoppen

De getoonde sproeikoppen zijn **generieke** soorten die CadCraft opstelde uit ontwerpneerslagsnelheden (vaste sproeiers, roterende mondstukken, tandwielrotors, bubblers, microsproeiers, emitters), niet de producten van een fabrikant. **Sproeikoppen uit een bestand toevoegen…** leest uw eigen sproeikoppen (een JSON-lijst met elke worp, elk debiet of elke neerslagsnelheid, en het drukbereik); ze worden met het project opgeslagen. Gepubliceerde gegevens van een fabrikant worden alleen opgenomen met de vastgelegde toestemming van die fabrikant.

Onder de generieke sproeikoppen bevat de lijst **typische sproeikoppen** (hun namen eindigen op "typical values"): mondstukmaten van vaste sproeiers, roterende mondstukken en tandwielrotors, microsproeiers, bubblers en emitters, met een straal, een debiet en een drukbereik. CadCraft berekent ze uit gepubliceerde wiskunde (de openingsvergelijking voor het debiet, de worpschaling voor de straal) en nominale debietklassen, uitsluitend uit open bronnen; er is geen tabel van een fabrikant overgenomen. Kies er een en de kiezer toont de basis en de licentie. Een project dat er een gebruikt, bewaart de sproeikop en zijn bron in het projectbestand. Ze zijn bedoeld voor planning: controleer de eigen gegevens van de echte sproeikop voordat u bouwt.
