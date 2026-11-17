---
title: Huisplateaus op hellende terreinen
summary: Een plaat op een helling egaliseren: keerwanden als plaatranden, de kaart van ontgraving en ophoging gearceerd naar diepte met hoogtepunten (plan en 3D), een vrije doorsnede over het maaiveld en het ontwerp, en hellingbanen of hellende platen voor opritten.
keywords: plateau, plaat, huisplaat, hellend terrein, helling, keermuur, ontgraving en ophoging, ontgravingskaart, hoogtepunten, vrije doorsnede, doorsnedelijn, gemeentetekeningen, oprit, hellingbaan, hellende plaat, grading, zwelfactor, grondverzet
from: daa08a3f
---

Een huisplateau is een **plaat** (**Ontwerp** › {{ui:Plaat}}): een vlakke veelhoek op één niveau, ingepast in het maaiveld. Vier dingen helpen op een helling.

## Keerwanden als plaatranden

Selecteer de plaat en zet een zijde op {{ui:Verticaal (keerwand)}} in plaats van een helling (**Eigenschappen** › {{ui:Zijden en keerwanden}}, of {{ui:Verticaal: keerwanden}} voor alle zijden tegelijk). De hoogte van de wand wordt afgelezen van het maaiveld langs hem: bovenkant op het maaiveld, onderkant op de plaat, aan beide uiteinden en op zijn hoogste punt op het plan getoond, met een waarschuwing als hij hoger is dan de grens die u instelt. Wanden en hellingen kunnen naast elkaar worden gecombineerd.

## De kaart van ontgraving en ophoging

Vink {{ui:Kaart van ontgraving en ophoging}} aan onder **Weergave**. Het plan wordt gearceerd naar hoe diep de ontgraving of ophoging is, in gelijke stappen (ontgraving warm, ophoging blauw, bijna vlak licht) met een legenda. **Hoogtepunten** worden op de plaat afgedrukt: de niveauverandering op punten van een raster, en de diepste ontgraving en de hoogste ophoging gemarkeerd met ▲. De cellen zijn dezelfde als die van de grondverzetvolumes, zodat de kaart en de getallen altijd overeenkomen.

In de 3D-weergave kiest u **Ontgraving en ophoging** uit de kleurenlijst om dezelfde kleuren over het maaiveld en het ontwerp te leggen.

Een zwel- of krimpfactor staat in het massabalansgereedschap (**Ontwerp** › {{ui:Massaverplaatsing}}); hij wordt niet toegepast op de volumes van een plaat.

## Een vrije doorsnede

Onder **Terrein** › {{ui:Meer}} kiest u {{ui:Vrije doorsnede}}, klikt u de punten van de doorsnedelijn waar u wilt (ze mag buigen) en drukt u op {{key:Enter}}. Een dialoogvenster tekent de doorsnede: het bestaande maaiveld, het ontworpen maaiveld (gestreept) en de ontgraving en ophoging ertussen, gearceerd, met hun oppervlakten (het ontwerp telt alleen binnen de platen en wegen). {{ui:Verticale overhoging}} staat standaard zo dat de tekening past. {{ui:Opslaan als SVG}} en {{ui:Opslaan als CSV}} geven u een tekening voor de gemeente en de getallen.

## Hellingbanen en hellende platen

Onder **Terrein** › {{ui:Meer}} kiest u {{ui:Hellingbaan of hellend plateau}}, klikt u het lage uiteinde en daarna het hoge uiteinde, drukt u op {{key:Enter}}, en geeft u de breedte, het niveau aan het lage uiteinde en de helling. De plaat is een strook waarvan de hoeken die niveaus dragen (de rand tussen twee hoeken loopt op een constante helling), en hij past zich in het maaiveld aan zoals elke plaat. De hoeken van elke plaat kunnen ook hun eigen niveaus dragen, zodat een oprit, een hellingbaan of een schuin terras een plaat is met een niveau op elke hoek.
