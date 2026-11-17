---
title: CivilCraft-instellings
summary: Kies die kolomvolgorde vir gekopieerde en geplakte puntrye en vir die raai van 'n lêer se kolomme, hoe geplakte punte genommer word, wat puntetikette wys, die hoekwyser, die 3D-vertikale oordrywing, hoe breedte- en lengtegrade wys, en of kaartlae van die internet kom.
keywords: instellings, voorkeure, pnezd, penzd, kolomvolgorde, puntrye, hernommer, puntnommers, beginnommer, puntetikette, etikette, beskrywing, hoogte, aansigkubus, asikoon, hoekwyser, kompas, vertikale oordrywing, 3d, breedtegraad, lengtegraad, dms, desimale grade, kaartlae, internet, privaatheid
from: 64b9cb92
---

Open {{ui:Instellings}} met die rat in die programbalk of {{key:Mod+,}}. Die eerste oortjie, {{ui:CivilCraft}}, hou die instellings wat by hierdie program hoort; {{ui:Algemeen}} hou die wat elke CadCraft-program deel (tema, werkbalk, paneel). CivilCraft se instellings bestaan net in die program: jy verander hulle hier, en hierdie blaaier onthou hulle. {{ui:Stel CivilCraft-instellings terug}} stel elke instelling terug na sy begin.

## Puntrye

**P, N, E, Z, D** (die begin) of **P, E, N, Z, D**: punt, noord, oos, hoogte, beskrywing, of oos voor noord. Dit word op drie plekke gebruik:

- **Kopieer**: die rye wat CivilCraft op die stelselklembord sit vir 'n sigblad.
- **Plak**: rye wat uit 'n sigblad of 'n teksleêr geplak word wat geen koplyn het nie.
- **Invoer**: die raai in die **Voer punte in**-dialoog wanneer 'n lêer geen koplyn het nie ('n lêer met vier kolomme lees as PENZ, drie as ENZ). Sien [Puntlêerformate](topic:point-file-formats).

'n Kopreël wat sy kolomme noem, wen altyd, en so ook 'n keuse in die invoerdialoog se **Kolomme**-lys.

## Getalle vir geplakte punte

- **Hou vrye getalle** (die begin): 'n geplakte punt hou sy nommer wanneer geen punt dit het nie; net botsende punte kry nuwe nommers.
- **Altyd nuwe getalle**: elke geplakte punt kry 'n nuwe nommer, selfs as sy eie vry is.

**Nuwe getalle begin by**: laat dit leeg om te tel vanaf een meer as die hoogste nommer in gebruik. Tik 'n getal, byvoorbeeld 5000, om nuwe punte nommers vanaf 5000 te gee; getalle wat reeds in gebruik is, word oorgeslaan. Twee punte deel nooit 'n nommer nie, op albei maniere. Sien [Kies, kopieer en plak opmetingspunte](topic:copy-paste-points#point-numbers-never-clash).

## Puntetikette

Wat 'n puntetiket wys wanneer {{ui:Puntetikette}} onder **Vertoon** aan is: **Nommer**, **Nommer en hoogte**, of **Nommer, hoogte en beskrywing** (die begin). Die DXF-, DWG- en PDF-uitvoere wys dieselfde etikette as die skerm.

## Hoekwyser

Wat in die hoek van die plan en die 3D-aansig sit: **Aansigkubus** (die begin), **Asikoon** of **Geen**.

- **Aansigkubus** (regs bo). Op die plan wys hy die bokant, met die kompasring: N is rooster-noord (op in die plan). Klik enige ander kant, rand of hoek van die kubus, of sleep hom, en die [3D-aansig](topic:site-3d) open kyk van daar af. {{ui:Tuis}} op die plan se kubus pas die plan.
- In die 3D-aansig draai die kubus met die aansig: klik 'n kant, rand of hoek om van daar af te kyk, sleep die kubus om te wentel, sleep die kompasring om om die vertikale te draai, klik 'n letter om van daardie kant af te kyk, en gebruik {{ui:Tuis}} vir die iso-aansig van die hele terrein. Wanneer jy reguit na 'n kant kyk, skuif klein pyltjies na die volgende kant en krul pyltjies draai die aansig 'n kwartslag.
- **Asikoon** (links onder): 'n klein X (oos) en Y (noord) merker op die plan, X, Y en Z (op) in 3D.

## 3D-vertikale oordrywing

Hoeveel die 3D-aansig hoogtes rek: **1×**, **2×** (die begin), **3×**, **5×** of **10×**. Die lys op die 3D-aansig se balk is dieselfde instelling, so as jy een verander, verander albei. Volumes, profiele en 3D-uitvoere bly op ware skaal.

## Breedtegraad en lengtegraad

Hoe die statusbalk die wyser se breedtegraad en lengtegraad wys wanneer die projek 'n koördinaatstelsel het: **grade, minute en sekondes** (die begin, byvoorbeeld `30°18′00.00″ N`) of **desimale grade** (`30.300000° N`). Sien [Stel die projek se koördinaatstelsel](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kaartlae van die internet

**Af** (die begin) of **Aan**. Wanneer aan, vra CivilCraft die kaartbedieners wat jy byvoeg vir prente van die gebied op die skerm. Jou tekening bly op hierdie rekenaar; die bediener sien die gebied en jou internetadres. Terwyl dit af is, word geen kaartbediener iets gevra nie, selfs nie wanneer 'n projek wat jy oopmaak een noem nie; 'n georefereerde prent uit 'n lêer werk in albei gevalle. Sien [Wys kaartlae onder die plan](topic:map-layers).


## Assistente

**Laat KI-assistente en skripte CivilCraft gebruik** (af aan die begin) laat 'n assistent op jou rekenaar die oop terrein bereik deur CadCraft Studio: **Lees** beskryf die terrein en gee punte, oppervlakhoogtes, stasies, profiele, volumes en erwe; **Wysig** laat dit opmetingspunte kies en byvoeg; **Stoor** en **Uitvoer** laat dit die projek stoor of LandXML of DWG skryf. **Vouers wat dit mag gebruik** (in Studio) is waar dit mag stoor en uitvoer. **Aktiwiteit** lys sy oproepe. Sien [Laat 'n KI-assistent met jou terrein werk](topic:assistants).
