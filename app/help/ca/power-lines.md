---
title: L'espai de treball de línies elèctriques
summary: Línies aèries i cables subterranis al vostre emplaçament, amb biblioteques pròpies, fletxa i tensió segons els vostres casos de càrrega, comprovacions de franquia i de resistència, taules de tesat, quantitats, fulls i exportació a SIG.
keywords: línia elèctrica, línia aèria, elèctric, distribució, pals, suports, conductor, fletxa, tensió, tesat, franquia, cable subterrani, rasa, espai de treball, companyia de subministrament
from: 638dd856
---

L'espai de treball de línies elèctriques posa les línies aèries i els cables subterranis sobre l'emplaçament de CivilCraft que ja teniu: els mateixos punts topogràfics, el mateix terreny, el mateix fitxer de projecte.

:::warning
Eina d'ajuda al disseny. L'espai de treball calcula la fletxa, la tensió, les franquies i les càrregues a partir dels **vostres** casos de càrrega i límits; no hi ha integrada la normativa de cap país. Un enginyer comprova cada resultat amb la normativa que sigui aplicable abans que es construeixi res.
:::

## Obriu-lo

Trieu {{ui:Superfície}} › {{ui:Més}} › {{ui:Espai de treball de línies elèctriques}}, o **Línies elèctriques** sota Espai de treball. La barra d'eines mostra llavors un grup **Línies elèctriques**; els grups Disseny i SIG queden amagats. Trieu **Civil** sota Espai de treball per tornar. CivilCraft recorda l'últim espai de treball que vau fer servir en aquest ordinador.

El panell de l'esquerra guanya dues seccions a dalt:

- **Línies elèctriques**: els vostres casos de càrrega i límits, les línies i els cables del projecte, i **Comprovacions**, sempre al dia. Feu clic en una comprovació per seleccionar allò a què es refereix.
- **Biblioteca**: els vostres conductors, cables, suports, equips i tipus de rasa. Vegeu [La vostra biblioteca de línies elèctriques](topic:power-line-library).

## Què hi ha al grup Línies elèctriques

| Eina | Què fa | Tema |
|---|---|---|
| **Línia** | Una línia aèria: feu clic a cada suport | [Dibuixa una línia aèria](topic:overhead-line) |
| **Suport** | Afegeix un suport en un van | [Dibuixa una línia aèria](topic:overhead-line) |
| **Cable** | Un traçat de cable subterrani en una rasa | [Cables subterranis](topic:underground-cables) |
| **Equip** | Un armari, un transformador, una unió, o la font de la xarxa | [Cables subterranis](topic:underground-cables) |
| **Obstacle** | Alguna cosa que travessa una línia: una carretera, un edifici, una altra línia | [Comprovacions](topic:power-line-checks) |
| **Perfil** | El perfil de la línia: terreny, suports i conductor a cada cas de càrrega | [Dibuixa una línia aèria](topic:overhead-line#the-line-profile) |
| **Més** | Casos de càrrega i límits, taules de tesat, quantitats, fulls i informe, SIG, fitxers d'estudi | [Fletxa i tensió](topic:sag-and-tension), [Sortides](topic:power-line-outputs), [Fitxers d'estudi](topic:power-line-study-file) |

Tot el que afegiu és un sol pas per desfer, es desa al fitxer del projecte i es dibuixa a la planta en capes anomenades `C-POWR-…`, de manera que les exportacions DXF, DWG i PDF també el porten.
