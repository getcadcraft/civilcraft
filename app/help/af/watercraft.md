---
title: WaterCraft: vraag, brandvloei, uitvalle en waterouderdom
summary: Met die WaterCraft-byvoeging verander jy kliënte in vraag op jou waterhoofpype, kontroleer die vloei beskikbaar by elke brandkraan, sien watter hoofpyp-uitval die meeste skade doen, en volg waterouderdom en chloor deur 'n dag.
keywords: watercraft, waterverspreiding, vraag, kliënte, piekfaktor, vraagpatroon, brandvloei, brandkraan, reswaterdruk, kritikaliteit, uitval, kleppen-afdeling, waterouderdom, chloor, residu, bronspoor, doodloop, csv, byvoeging
from: 066fb17a
---

WaterCraft is 'n byvoeging wat werk op die waternetwerk wat jy reeds met die Waterhoofpyp-gereedskap geteken het. Dit voeg 'n oortjie by die regterpaneel by met vier afdelings.

:::warning
Net 'n berekeningshulpmiddel. Dit is nagegaan teen handantwoorde op verdigte netwerke, nie op 'n werklike nutsmodel nie. 'n Wateringenieur moet elke resultaat nagaan. Scenario's, beheerreëls, kleppe en veldlesings het hul eie onderwerpe, "Scenario's" en "Studies", in die WaterCraft-byvoeging se hulp.
:::

## Wat jy gaan doen

- Plaas kliënte op die netwerk as vraag.
- Vind die brandkrane wat kort kom van die vloei wat jy nodig het.
- Vind die hoofpype waarvan die verlies die meeste saak maak.
- Vind oud water en lae chloor.

## Stappe

1. Open {{ui:Instellings}} › {{ui:Byvoegings}} en skakel {{ui:WaterCraft (waterverspreiding)}} aan. 'n {{ui:WaterCraft}}-oortjie verskyn in die regterpaneel.
2. Teken eers 'n reservoir, aansluitings en pype met die Waterhoofpyp-gereedskap (sien [Waterhoofpype](topic:water-mains)). Sonder 'n netwerk sê die oortjie vir jou om dit te doen.
3. Onder {{ui:Vraag}}, plak een kliënt per reël: id, x, y, soort, hoeveelheid. Kies die {{ui:Piekfaktor}} en die {{ui:Uurpatroon}} (woondag, handelsdag, plat, of hou die patroon soos dit is). Druk {{ui:Kontroleer}} om te sien waar elke kliënt beland (die naaste aansluiting), dan {{ui:Plaas in die netwerk}}. Ontdoen haal die vraag terug.
4. Onder {{ui:Brandvloei}}, stel die nodige vloei en die reswaterdruk in, kies of die residu {{ui:Net by die brandkraan}} gehou word of {{ui:Oral in die stelsel (strenger)}}, en druk {{ui:Loop}}. Elke brandkraan word die ergste eerste gelys, as voldoen of kort.
5. Onder {{ui:Watter hoofpyp maak die meeste saak}}, kies {{ui:een pyp op 'n slag}} of {{ui:een klepafdeling op 'n slag}} en druk {{ui:Loop}}. Elke uitval wys die vraag wat afgesny is, die aansluitings wat afgesny is, die aansluitings wat nuut onder die minimum druk val en die laagste druk wat oorbly.
6. Onder {{ui:Waterouderdom en chloor}}, kies wat om te volg (waterouderdom, chloor of 'n bronspoor), stel die ure om te loop en die limiete wat jy wil hê in, en druk {{ui:Loop}}. Aansluitings buite jou limiete word gelys.
7. Druk {{ui:Stoor as CSV}} onder enige tabel om dit te hou.

## Notas

- Die nodige brandvloei en die gebruik per huis of per akker is beginwaardes, nie standaarde nie. Gebruik jou nutsdiens se eie syfers.
- 'n Pyp wat deels deur 'n klep gesny word, word heeltemal gesluit, so die getoonde uitval is effens erger as 'n werklike een.
- Laat die waterkwaliteitafdeling lank genoeg loop sodat die daaglikse patroon herhaal voordat jy die laaste dag lees.
- {{ui:Stop}} beëindig 'n lang lopie vroeg; die lys wys dan net wat gedoen is.
- Jou netwerk bly in hierdie projek en op hierdie rekenaar. Niks word enige plek gestuur nie.
