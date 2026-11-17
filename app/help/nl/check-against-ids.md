---
title: De IFC-export toetsen aan de IDS van een opdrachtgever
summary: Laad het .ids-bestand dat een opdrachtgever of wegbeheerder u gaf en zie in Problemen elk geëxporteerd element dat er niet aan voldoet.
keywords: ids, information delivery specification, buildingsmart, eisen, oplevering, controle, validatie, kwaliteitsborging, ifc-export, ifc 4.3, tracé, weg, aanbesteding
from: 183d9a0e
---

## Wat u gaat doen

Een IDS (Information Delivery Specification, een buildingSMART-norm) is de lijst van wat een IFC moet bevatten. Bij overheidsaanbestedingen wordt er vaak een bij de opdracht meegestuurd. CivilCraft controleert de IFC die dit project exporteert, in de IFC-versie die u voor de export koos, aan de hand daarvan en somt elk element op dat tekortschiet.

## Stappen

1. Open uw project.
2. Klik op {{ui:IFC}} in de groep Exporteren van de werkbalk. Kies in het dialoogvenster de IFC-versie die u gaat opleveren.
3. Klik op {{ui:Toetsen aan IDS…}}.
4. Klik op {{ui:Een .ids-bestand laden…}} en kies het bestand. Er wordt niets geüpload.
5. Lees het resultaat: elke specificatie met {{ui:Voldoet}} of {{ui:Voldoet niet}} en hoeveel elementen ze betreft.
6. Open Problemen ({{key:Ctrl+Shift+M}}) en klik op een fout om het tracé, de plaat, de leiding, het kunstwerk of de bouwmassa waar ze vandaan komt te selecteren.

## Wat u zou moeten zien

- Eén waarschuwing per geëxporteerd element en eis die het mist, met de naam van de specificatie, wat de IDS vraagt en wat de export heeft.
- Het controlerapport (in Problemen) begint met de IDS: de titel, versie, auteur en de aantallen per specificatie.

## Goed om te weten

- De IDS wordt in het projectbestand bewaard, dus wordt ze opnieuw gecontroleerd wanneer u het project opent. Laden of vergeten ervan is één stap die u ongedaan kunt maken.
- Elke wijziging wordt even later opnieuw gecontroleerd. Grote terreinen kosten meer tijd om weg te schrijven, dus wacht de controle dan iets langer tussen de runs.
- De controle gebruikt hetzelfde bestand dat de export {{ui:IFC}} schrijft, in de laatst gekozen versie daar (IFC 4.3 wanneer u er geen heeft gekozen).
- Getallen worden vergeleken in SI-eenheden: een project in ft wordt eerst naar meter omgerekend.

- Patronen in de IDS worden als de hele waarde gelezen. Een `^` aan het begin en een `$` aan het einde worden ook als "de hele waarde" opgevat, zoals de meeste IDS-bestanden ze bedoelen.

## Volgende

- [IFC exporteren](topic:ifc)
