---
title: WaterCraft: aanvraag, brandvloei, onderbrekings en waterouderdom
summary: Met die WaterCraft-byvoeging verander jy kliënte in aanvraag op jou waterhoofpype, kontroleer jy die vloei wat by elke brandkraan beskikbaar is, sien jy watter hoofpyponderbreking die meeste skade doen, en volg jy waterouderdom en chloor deur 'n dag.
keywords: watercraft, waterverspreiding, aanvraag, kliënte, piekfaktor, aanvraagpatroon, brandvloei, brandkraan, reswaardedruk, kritiekheid, onderbreking, afsluitbare afdeling, waterouderdom, chloor, reswaarde, bronspoor, doodloopeinde, csv, byvoeging
from: 76809f01
---

WaterCraft is 'n byvoeging wat werk op die waternetwerk wat jy reeds met die Waterhoofpype-gereedskap geteken het. Dit voeg 'n oortjie by die regterpaneel met vier afdelings.

:::warning
Net 'n berekeningshulp. Dit is nagegaan teen handberekeninge op verdigte netwerke, nie op 'n regte munisipale model nie. 'n Wateringenieur moet elke resultaat nagaan. Daar is nog geen verhoogpompstasies, geen tweede-orde verval en geen scenario's nie.
:::

## Wat jy sal doen

- Plaas kliënte op die netwerk as aanvraag.
- Vind die brandkrane wat onder die vloeival wat jy nodig het.
- Vind die hoofpype waarvan die verlies die meeste saak maak.
- Vind ou water en lae chloor.

## Stappe

1. Maak {{ui:Instellings}} › {{ui:Byvoegings}} oop en skakel {{ui:WaterCraft (waterverspreiding)}} aan. 'n {{ui:WaterCraft}}-oortjie verskyn in die regterpaneel.
2. Teken eers 'n reservoir, knooppunte en pype met die Waterhoofpype-gereedskap (sien [Waterhoofpype](topic:water-mains)). Sonder 'n netwerk sê die oortjie vir jou om dit te doen.
3. Onder {{ui:Aanvraag}}, plak een kliënt per reël: id, x, y, soort, hoeveelheid. Kies die {{ui:Piekfaktor}} en die {{ui:Uurlikse patroon}} (residensiële dag, kommersiële dag, plat, of hou die patroon soos dit is). Druk {{ui:Kontroleer}} om te sien waar elke kliënt val (die naaste knooppunt), en dan {{ui:Plaas in die netwerk}}. Ontdoen haal die aanvraag weer terug.
4. Onder {{ui:Brandvloei}}, stel die nodige vloei en die reswaardedruk, kies of die reswaarde {{ui:Net by die brandkraan}} of {{ui:Oral in die stelsel (strenger)}} gehou word, en druk {{ui:Loop}}. Elke brandkraan word gelys, die ergste eerste, as voldoen of kort.
5. Onder {{ui:Watter hoofpyp maak die meeste saak}}, kies {{ui:een pyp op 'n slag}} of {{ui:een afsluitbare afdeling op 'n slag}} en druk {{ui:Loop}}. Elke onderbreking wys die aanvraag wat afgesny word, die knooppunte wat afgesny word, die knooppunte wat nuut onder die minimumdruk val en die laagste druk wat oorbly.
6. Onder {{ui:Waterouderdom en chloor}}, kies wat jy wil volg (waterouderdom, chloor of 'n bronspoor), stel die ure om te loop en die perke wat jy wil hê, en druk {{ui:Loop}}. Knooppunte buite jou perke word gelys.
7. Druk {{ui:Stoor as CSV}} onder enige tabel om dit te hou.

## Notas

- Die nodige brandvloei en die gebruik per huis of per akker is beginwaardes, nie standaarde nie. Gebruik jou munisipaliteit se eie syfers.
- 'n Pyp wat gedeeltelik deur 'n klep afgesluit is, word heeltemal gesluit, so die onderbreking wat gewys word is effens erger as 'n werklike een.
- Laat die waterkwaliteitafdeling lank genoeg loop dat die daaglikse patroon kan herhaal voordat jy die laaste dag lees.
- {{ui:Stop}} beëindig 'n lang loop vroeg; die lys wys dan net wat gedoen is.
- Jou netwerk bly in hierdie projek en op hierdie rekenaar. Niks word êrens gestuur nie.
