---
title: Om met CivilCraft te begin
summary: Wat CivilCraft doen, hoe om dit oop te maak, en 'n eerste tien minute met die voorbeeldterrein, van punte tot kontoerlyne, 'n pad en 'n gestoorde projek.
keywords: begin, eerste lopie, voorbeeldterrein, inleiding, vinnige begin, handleiding, nuwe projek
from: c9b6dd8e
---

CivilCraft is die burgerlike en terreinontwerp-program van die CadCraft-familie. Dit neem opmetingspunte en verander dit in 'n oppervlak (’n TIN) met kontoerlyne, en laat jou dan belynings met ontwerplengteprofiele uitlê, 'n eenvoudige padkoridor vee, boukavelplataforms tot by die daglig gradeer, 'n swaartekrag-pypnetwerk teen jou reëls nagaan en snit- en vulvolumes sien. Dit lees en skryf LandXML, voer die plan uit as DXF en plot dit na PDF.

As jy al met Civil 3D gewerk het, sal die idees bekend voorkom: punte, puntegroepe, breeklyne, belynings volgens PI, profiele volgens PVI, koridors, gradering, pypnetwerke. Die manier waarop jy werk is anders, en baie kleiner: daar is geen opdragreël, geen style en geen tekenlêer nie. Lees [Van ander burgerlike sagteware af](topic:coming-from) een keer voor jou eerste regte werk.

## Wat jy nodig het

- 'n Onlangse rekenaarblaaier: Chrome, Edge, Firefox of Safari. Sien [Blaaiers](common:browsers).
- 'n Muis of raakpaneel en 'n sleutelbord, of 'n aanraakskerm: tekening het daar op-skerm-knoppies {{ui:Voltooi}}, {{ui:Ontdoen punt}} en {{ui:Kanselleer}} (sien [Muis, raakpaneel en aanraking](topic:keyboard#mouse-trackpad-and-touch)).
- Die plan teken in 2D op die blaaier se canvas. Die [3D-aansig](topic:site-3d) gebruik die blaaier se WebGL-grafika; as dit nie kan begin nie, sê die statusbalk waarom en werk die plan steeds.
- Geen rekening en geen oplaai nie. Lêers maak oop op jou rekenaar en word as aflaaie gestoor. Sien [Jou lêers](common:your-files).

:::note
CivilCraft loop vandag as 'n vroeë blaaierweergawe wat nog gemaak word. Rekenaarweergawes en wolkstoring is nog nie beskikbaar nie. Alles wat jy maak, bly op jou rekenaar totdat jy dit stoor of uitvoer.
:::

## Maak CivilCraft oop

1. Maak CivilCraft in jou blaaier oop.
2. Wag tot die skerm vul: 'n nutsbalk oor die bokant, 'n paneel aan die linkerkant, die plan in die middel en 'n **Eienskappe**-paneel aan die regterkant.
3. Op 'n leë plan sien jy 'n kassie met die titel **Begin met opmetingspunte**. Dit lys die eerste stappe en het 'n skakel, {{ui:Maak die voorbeeldterrein oop}}.

Om CivilCraft later sonder enige verbinding te gebruik, klik op {{ui:Stoor vir vanlyn}} in die programbalk en wag vir {{ui:Vanlyn gereed}}. Dit sluit hierdie hulp, die voorbeeldterrein en die 3D- en GIS-biblioteke in. Sien [Vanlyn](common:offline). Druk {{key:F1}} of klik enige tyd op {{ui:Hulp}} om hierdie hulp langs die program oop te maak.

## Jou eerste tien minute: die voorbeeldterrein

Die voorbeeldterrein is 'n klein opmeting in Amerikaanse voet: 276 punte in staatsvlakkoördinate, 'n rug, 'n greppel met 'n vloedlyn en twee oewerkruine. Dit kom saam met die program, so jy kan volg sonder 'n lêer van jou eie.

1. Klik op {{ui:Maak die voorbeeldterrein oop}} in die kassie op die plan.
   Die dialoog **Punte invoer** maak oop. Dit sê "276 punte gelees as PNEZD (uit die opskrifreël), geskei deur kommas." en wys die eerste rye.
2. Klik op {{ui:Voer in}}.
   Die plan vul met punte, kontoerlyne en die oppervlakrand. Die statusbalk onderaan sê die punte is ingevoer en hoeveel driehoeke die oppervlak het (546).
3. Kyk na die linkerpaneel onder **Punte**. Die punte is gegroepeer volgens die eerste woord van hul beskrywing: CP, FL, GRD, RIDGE, TBN, TBS en TREE.
4. In die **Oppervlak**-kolom van daardie tabel, stel **FL**, **RIDGE**, **TBN** en **TBS** op {{ui:Breeklyn}}.
   Die oppervlak herbou onmiddellik. Die **Oppervlakfeite** sê nou "Breeklyne: 4", en die kontoerlyne buig skerp langs die vloedlyn en die rug in plaas van daaroor te sny.
5. Beweeg die wyser oor die plan. Die statusbalk wys die oos- en noordkoördinate onder die wyser en die grondhoogte daar.
6. Onder **Vertoning**, stel {{ui:Kontoere elke}} op 0.5 ft en skakel {{ui:Hoogtebande}} aan. 'n Kleurreeks verskyn met 'n legenda onder die merkhokkies. Skakel die bande weer af wanneer jy klaar is.

Jy het nou 'n bestaande grondoppervlak. Volgende, 'n pad.

## Lê 'n kort pad uit

1. Druk {{key:A}} (of klik op {{ui:Belyning}} in die **Ontwerp**-groep).
2. Klik drie punte oor die terrein, een na die ander. 'n Rooi lyn volg die wyser en wys die lengte en rigting van die volgende raaklyn.
3. Druk {{key:Enter}} om klaar te maak.
   Die belyning verskyn met stasionering. Die regterpaneel wys **Belyning**: sy lengte, die PI-tabel en die kromme by die middel-PI (100 ft-radius, of kleiner as 100 ft nie pas nie).
4. Klik in die regterpaneel onder **Ontwerpprofiel** op {{ui:Begin vanaf die grond}}.
   Die profielaansig maak onder die plan oop met die bestaande grond en 'n reguit ontwerpgradiënt van begin tot einde.
5. Druk {{key:I}} om {{ui:Voeg PVI's by}} aan te skakel, en klik dan een keer in die profielaansig naby die middel. 'n PVI verskyn.
6. In die PVI-tabel regs, tik 'n kromlengte (byvoorbeeld 100) in die **Kromme L**-blokkie van die middel-PVI en druk {{key:Enter}}. Die profiel het nou 'n vertikale kromme, met sy K-waarde benoem.
7. Onder **Koridor**, merk **Vee 'n samestelling langs die ontwerpprofiel**.
   Die pad word in die grond gegradeer: bane, skouers en kanthellings tot by die daglig. Die **Grondwerk**-blok wys snit en vul.

Moenie bekommerd wees oor presiese waardes nie. Elke getal kan in die regterpaneel verander word, en {{key:Mod+Z}} ontdoen die laaste verandering.

## Stoor jou werk

1. Tik 'n naam in **Naam** bo-aan die linkerpaneel.
2. Druk {{key:Mod+S}} (of klik op {{ui:Stoor}}).
   Die blaaier laai 'n lêer af wat na die terrein genoem is en op `.civilcraft.json` eindig. Dit hou die punte, die oppervlakinstellings, belynings, profiele, koridors, plataforms en pype.
3. Om later voort te gaan, klik op {{ui:Maak oop}} (of druk {{key:Mod+O}}) en kies daardie lêer, of sleep dit op die plan.

:::warning
Daar is geen outomatiese stoor nie. As jy die oortjie met nie-gestoorde veranderinge sluit, vra die blaaier of jy wil weggaan; as jy weggaan, is die veranderinge weg. Stoor gereeld.
:::

## Waarheen om daarna te gaan

- [Voer opmetingspunte in](topic:import-points) met jou eie lêers.
- [Bou en verfyn die oppervlak](topic:build-surface) met breeklyne en 'n grens.
- [Die skerm, deel vir deel](topic:workspace).
- [Sleutels en muis](topic:keyboard).
