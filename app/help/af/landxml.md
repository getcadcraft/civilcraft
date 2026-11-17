---
title: Ruil LandXML uit
summary: Maak LandXML van ander siviele sagteware oop as 'n nuwe projek, voer punte, oppervlaktes, belynings, lengteprofiele en die pypnetwerk uit as LandXML 1.2, en weet wat nie die reis maak nie.
keywords: landxml, xml, invoer, uitvoer, uitruil, tin, oppervlak, belyning, lengteprofiel, pypnetwerk, interoperabiliteit, data-uitruil
from: 870d5ece
---

LandXML is die oop uitruilformaat wat die meeste siviele programme lees en skryf. CivilCraft lees en skryf LandXML 1.2. As jy Civil 3D gebruik het, is sy LandXML-invoer- en uitvoerdialoë die naaste ooreenkoms; hier is daar geen keuses om te maak nie, en die notas vertel jou wat weggelaat is.

## Maak 'n LandXML-lêer oop

1. Klik {{ui:Maak oop}} (of druk {{key:Mod+O}}) en kies die `.xml`- of `.landxml`-lêer, of sleep dit op die plan.
2. As die huidige projek ongestoorde veranderinge het, vra CivilCraft eers. Kies {{ui:Stoor 'n kopie}}, {{ui:Moenie stoor nie}} of {{ui:Kanselleer}}.
3. 'n **Nuwe projek** word gemaak. Die statusbalk sê wat gelees is, byvoorbeeld "Oopgemaak site.xml: 412 punte, 2 oppervlaktes, 3 belynings."
4. Kyk na die blokkie onder die **Oppervlak**-feite. Dit lys alles wat oorgeslaan of verander is, byvoorbeeld:
   - "Net die eerste oppervlak ("EG") is oopgemaak; die lêer het 1 meer."
   - "Belyning "Ramp A" het elemente wat CivilCraft nog nie kan teken nie (nie lyne, boë of klotoïde-spirale nie); dit is oorgeslaan."
   - "Pypnetwerkreëls was nie in die lêer nie; die plekhouers word gebruik — stel joune onder Projek."

Wat word wat:

| In die lêer | In CivilCraft |
|---|---|
| Eenhede (Imperial of Metric) | Die projek se **Eenhede** (voet of meter) |
| Projeknaam | Die projek se **Naam** |
| CgPoints | Die projek se punte; die beskrywing (of kode) gee die groep |
| Die eerste TIN-oppervlak | Die bestaande grond, soos dit is ("Oppervlak (uit LandXML)") |
| Elke belyning van lyne, boë en klotoïde-spirale | 'n Belyning met sy PI's, radiusse en spiraallengtes, herbou uit die kurwes |
| Die eerste ontwerpprofiel van elke belyning | Sy ontwerpprofiel, met parabolies vertikale kurwes |
| Die eerste pypnetwerk | Die pypnetwerk, met sy rande, sumpe en inverts |
| Kenlyn-planfeatures van lyne en boë | Kenlyne, boë behou; uit ander programme begin hulle as **Slegs getekend** |

Die volledige lys elemente en eienskappe is in [LandXML: wat gelees en geskryf word](topic:landxml-reference).

:::note
'n Oppervlak wat uit LandXML gelees is, word nie herbou wanneer jy puntgroepe verander of breeklyne teken nie. Klik {{ui:Bou die oppervlak weer uit die punte}} in die afdeling **Oppervlak** om dit in plaas daarvan uit die punte te bou ({{key:Mod+Z}} bring die LandXML-oppervlak terug).
:::

## Voer LandXML uit

1. Klik {{ui:LandXML}} in die **Uitvoer**-groep.
2. Die blaaier laai `<name>.xml` af. Die statusbalk sê wat ingegaan het, byvoorbeeld "LandXML 1.2 uitgevoer: 276 punte, 2 oppervlaktes, 1 belyning, die pypnetwerk. Bouplatforms is nie hier deel van LandXML nie; die gegradeerde oppervlak is."

Die lêer bevat:

- **Eenhede**: Amerikaanse opmetingsvoet of meter.
- **CgPoints**: elke punt met sy nommer as die naam, sy beskrywing en sy groep as die kode.
- **Oppervlaktes**: die bestaande grond as 'n TIN, met sy breeklyne en buitegrens as brondata; en, wanneer bouplatforms of korridors gradeer, 'n tweede TIN-oppervlak genoem "Proposed".
- **Belynings**: lyne, boë en klotoïde-spirale met hul stasies, elk met 'n profiel wat die bestaande grond langs dit gemonster bevat, en die ontwerpprofiel (PVI's en parabolies vertikale kurwes) wanneer dit ten minste twee PVI's het.
- **PipeNetworks**: strukture met hul rande, sumpe en invert per pyp, en die pype met deursnee, lengte en helling.
- **PlanFeatures**: elke kenlyn as lyne en boë met die hoogte by elke einde, en waarvoor dit gebruik word.

## Wat nie die reis maak nie

- Bouplatforms en korridors as voorwerpe. Hul resultaat is in die "Proposed"-oppervlak.
- Belynings met foute (byvoorbeeld oorvleuelende kurwes): weggelaat, en in die statusboodskap getel.
- Pype sonder albei inverts, en netwerke met minder as twee strukture.
- 'n Rand wat uit die oppervlak geneem word, word as 'n vaste rand geskryf. Wanneer dit weer oopgemaak word, hou die struktuur daardie getal, selfs as die oppervlak verander.
- Netwerkreëls (kleinste helling, dekking, val): LandXML het nie 'n plek daarvoor nie.
- Vertoninginstellings en puntgroepe se oppervlakkeuses: stoor 'n CivilCraft-projek vir daardie.

Wanneer dit oopmaak, lees CivilCraft nie spirale anders as klotoïde nie, roosteroppervlaktes, punte wat net na ander punte verwys, persele, spirale in planfeatures, wegstelsels of opmetingsdata nie. Elk word in die notas genoem, nooit geraai nie.

## Heen en weer

Om werk aan iemand te gee wat ander siviele sagteware gebruik en dit terug te kry, voer LandXML uit, laat hulle wysig, en maak hul LandXML as 'n nuwe projek oop. Hou ook jou eie `.civilcraft.json`: dit is die enigste lêer wat alles hou wat CivilCraft weet.
