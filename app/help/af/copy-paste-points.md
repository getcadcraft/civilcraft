---
title: Kies, kopieer en plak opmetingspunte
summary: Kies opmetingspunte met 'n klik, Shift en 'n boks, of almal tegelyk; kopieer, sny, plak, plak op dieselfde plek, dupliseer en skrap hulle met nuwe puntnommers wat nooit bots nie; plak puntrye na en van 'n sigblad.
keywords: kopieer, plak, sny, dupliseer, skrap punte, kies punte, kies alles, boksseleksie, venster, klembord, sigblad, csv, hernommer, puntnommers, plak op dieselfde plek, kloon, afpen
from: 78a6aea7
---

Opmetingspunte kan binne 'n projek gekopieer en geplak word, tussen projekte in twee blaaiertabs, en na en van 'n sigblad. Elke verandering is een ontdoenstap, en die oppervlak word dadelik uit die nuwe punte herbou.

## Kies punte

Met {{ui:Kies}} ({{key:V}}):

- **Klik** 'n punt om dit te kies (en net dit). Die nommers daarvan wys onder **Eienskappe**.
- {{key:Shift}} en **klik** voeg 'n punt by die keuse, of haal dit uit.
- {{key:Shift}} en **sleep** trek 'n boks: die punte binne dit word by die keuse gevoeg. Sleep eerder om die punte en dit word 'n lasso; sien [Lassoseleksie van opmetingspunte](topic:lasso-selection). Sleep sonder {{key:Shift}} skuif die aansig, soos altyd.
- {{key:Mod+A}} (of {{ui:Meer}} › {{ui:Kies alle punte}}) kies elke punt.
- {{key:Esc}} (of {{ui:Meer}} › {{ui:Kies niks}}) maak die keuse leeg.

Gekose punte het 'n ring. Met meer as een gekies, wys **Eienskappe** hoeveel, hul nommers, hul hoogtebereik en hul groepe.

## Kopieer, sny en skrap

- {{ui:Kopieer}} of {{key:Mod+C}} kopieer die gekose punte. CivilCraft hou die kopie, en plaas dit ook op die stelselklembord as puntrye, sodat jy dit direk in 'n sigblad of teksleer kan plak.
- {{ui:Meer}} › {{ui:Sny}} of {{key:Mod+X}} kopieer hulle en skrap hulle, in een stap.
- {{ui:Meer}} › {{ui:Skrap}} of {{key:Delete}} skrap hulle. {{key:Mod+Z}} bring hulle terug.

Die rye is punt, noord, oos, hoogte, beskrywing (P,N,E,Z,D), geskei deur kommas, met drie desimale. Om oos voor noord te kry, stel **Puntrye** in [CivilCraft-instellings](topic:settings). 'n Beskrywing wat 'n sigblad as 'n formule sou behandel (begin met =, +, - of @) kry 'n apostrof voor, sodat dit teks bly.

## Plak

1. Druk {{key:Mod+V}} of klik {{ui:Plak}}. Die punte volg die wyser as klein kruisies, met 'n stippellyn terug na waar hulle vandaan gekom het.
2. Klik waar hulle moet gaan. Die middel van die gekopieerde punte val op die klik.
3. Of druk {{key:Enter}} om hulle op hul eie koördinate te plaas, of {{key:Esc}} om te kanselleer.

{{ui:Meer}} › {{ui:Plak op dieselfde plek}} of {{key:Mod+Shift+V}} plak dadelik op die punte se eie koördinate. Die geplakte punte is daarna gekies, sodat jy hulle weer kan kopieer, skuif of skrap.

:::note
Die klik op {{ui:Plak}} in die nutsbalk lees die stelselklembord. Die eerste keer kan die blaaier vra of CivilCraft die klembord mag sien. As jy weier, plak die nutsbalkknoppie net CivilCraft se eie kopie; {{key:Mod+V}} plak steeds rye uit 'n sigblad sonder om te vra.
:::

## Puntnommers bots nooit nie

Twee punte deel nooit 'n nommer nie. Wanneer jy plak:

- 'n Geplakte punt behou sy nommer wanneer geen punt in die projek dit het nie. So, na **Sny**, plak die punte terug met hul eie nommers, en punte wat uit 'n ander projek gekopieer is, behou hul nommers waar hulle vry is.
- 'n Geplakte punt wie se nommer geneem is, kry 'n nuwe heelgetal: een meer as die hoogste nommer in gebruik, verder opwaarts getel.
- Die statusbalk sê wat gebeur het, byvoorbeeld "1 kept its number; 9 got new numbers: 10–18 became 277–285".

In [CivilCraft-instellings](topic:settings) kan jy **Altyd nuwe nommers** kies, en 'n nommer waarmee nuwe nommers begin, byvoorbeeld 5000 vir ontwerppunte.

:::warning
Puntgroepe wat die oppervlak as 'n **breeklyn** bou, verbind hul punte in nommervolgorde. Geplakte kopieë van breeklynpunte (byvoorbeeld FL-skote) kry nuwe, hoër nommers en voeg by die einde van daardie breeklyn, moontlik met 'n lang sprong. Kyk na die plan ná die plak van sulke punte, of stel hul groep op {{ui:Punte}}.
:::

## Dupliseer

{{ui:Meer}} › {{ui:Dupliseer}} of {{key:Mod+D}} maak 'n kopie van die gekose punte wat die wyser volg: klik waar dit moet gaan. Die kopieë kry altyd nuwe nommers, en CivilCraft se klembord bly soos dit was.

## Uit 'n sigblad of 'n teksleer

Kies rye punte in 'n sigblad (punt, noord, oos, hoogte, beskrywing) en kopieer hulle. Druk in CivilCraft {{key:Mod+V}} en klik waar hulle moet gaan, of druk {{key:Mod+Shift+V}} om hulle op hul eie koördinate te plaas, wat gewoonlik is wat jy wil hê vir werklike opmetingsdata.

Die rye word presies gelees soos 'n [puntlêer](topic:point-file-formats): kommas, tabs of spasies, 'n opskriftreeks as daar een is. Sonder 'n opskrif kom die kolomvolgorde van **Puntrye** in [CivilCraft-instellings](topic:settings).

As albei daar is, besluit CivilCraft volgens wat nuwer is: rye op die stelselklembord wat van CivilCraft se laaste kopie verskil, is later gekopieer, so hulle word geplak. Teks wat geen punte bevat nie, word geïgnoreer, en CivilCraft se eie kopie word eerder geplak.

## Tussen projekte en tabs

Die kopie word in hierdie blaaier gehou, so 'n tweede CivilCraft-tab kan dit plak, selfs nadat die eerste tab toemaak. Punte wat in 'n meterprojek gekopieer en in 'n voetprojek geplak word, behou hul nommers soos hulle is: niks word omgeskakel nie, en die statusbalk sê so.

## Wat nie gekopieer word nie

Net opmetingspunte word vir nou gekopieer. Belynings, plataforms, pyp­netwerke, breeklyne en grense kan nog nie gekopieer of geplak word nie. Plak kan bestaande punte nie skuif nie: gebruik {{ui:Sny}} en plak, of skuif een punt op 'n slag ([Wysig 'n opmetingspunt](topic:edit-points)).
