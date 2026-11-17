---
title: Terrein opbouwen en verfijnen
summary: Hoe CivilCraft het bestaande maaiveld trianguleert, en hoe u het vormt met breeklijngroepen, getekende breeklijnen, een buitenbegrenzing en de langste buitenrand.
keywords: tin, terrein, triangulatie, breeklijn, begrenzing, bestaand maaiveld, eg, terrein aanmaken, delaunay, driehoeken, maximale rand, buitenbegrenzing
from: b9eea3f3
---

CivilCraft heeft per project één bestaand maaiveldterrein. Het is een TIN (getrianguleerd onregelmatig netwerk) dat uit uw punten wordt opgebouwd, en het wordt automatisch opnieuw opgebouwd telkens wanneer een invoer verandert. Er is geen opdracht "opnieuw opbouwen" en geen verouderd terrein.

## Wat in het terrein gaat

- Elk punt met een hoogte in een groep die op {{ui:Punten}} staat.
- Elke groep die op {{ui:Breeklijn}} staat, verbonden in volgorde van puntnummer.
- Elke breeklijn die u tekent met het gereedschap {{ui:Breeklijn}}.
- De buitenbegrenzing, als u er een tekent.
- De instelling **Langste buitenrand**.

Driehoeken kruisen nooit een breeklijn: het terrein wordt gedwongen die te volgen en daarna zo gelijkmatig mogelijk eromheen gemaakt (Delaunay overal elders).

## Gecodeerde lijnen omzetten in breeklijnen

1. Zoek in het linkerpaneel onder **Punten** de groep (bijvoorbeeld FL).
2. Zet de keuze **Terrein** van die groep op {{ui:Breeklijn}}.
   Het terrein wordt opnieuw opgebouwd, de lijn wordt in oranje getekend (met {{ui:Breeklijnen}} aan onder **Weergave**), en **Breeklijnen** in de terreingegevens gaat met één omhoog.
3. Controleer de lijn op het plan. Ze moet punt voor punt lopen, in de volgorde waarin de lijn is ingemeten. Als ze zigzagt, bevat de groep meer dan één lijn, of zijn de punten niet in volgorde genummerd: zet de groep terug op {{ui:Punten}} en teken de lijnen met de hand (volgende sectie).

## Een breeklijn door punten tekenen

1. Druk op {{key:B}}, of klik op {{ui:Breeklijn}} in de groep **Terrein**.
   De hint luidt "Breeklijn: klik meetpunten in volgorde (het neemt hun hoogten over). Enter beëindigt."
2. Beweeg de aanwijzer naar een punt. Een klein oranje vierkantje markeert het punt dat het zal nemen.
3. Klik de punten van de lijn een voor een aan. Elke klik noemt het punt en zijn hoogte in de statusbalk.
4. Druk op {{key:Enter}} om te beëindigen.
   In de statusbalk staat "Breeklijn 1 toegevoegd; het terrein is opnieuw opgebouwd."

Klikken moeten op een meetpunt met een hoogte terechtkomen; een klik ergens anders wordt geweigerd met "Klik op een meetpunt met een hoogte: een breeklijn neemt de hoogten van de punten over." {{key:Backspace}} laat het laatste punt vallen; {{key:Esc}} annuleert de hele lijn.

:::warning
Beëindig met {{key:Enter}}. Dubbelklikken beëindigt ook, maar in deze versie vervalt het punt waarop u dubbelklikte. Klik het laatste punt eenmaal aan en druk daarna op {{key:Enter}}.
:::

Om alle getekende breeklijnen tegelijk te verwijderen, klikt u op {{ui:Getekende breeklijnen verwijderen}} in de sectie **Terrein**. Om alleen de laatste te verwijderen, gebruikt u {{key:Mod+Z}}. Getekende breeklijnen kunnen nog niet één voor één worden geselecteerd of bewerkt.

## De buitenbegrenzing tekenen

Een begrenzing snijdt het terrein bij tot het gebied dat u vertrouwt, bijvoorbeeld de meetgrenzen, zodat lange driehoeken over onopgemeten hoeken verdwijnen.

1. Druk op {{key:O}}, of klik op {{ui:Begrenzing}}.
2. Klik de hoeken in volgorde rond het gebied. Een stippellijn toont de vorm.
3. Druk op {{key:Enter}}.
   In de statusbalk staat "Begrenzing ingesteld; driehoeken buiten de begrenzing zijn verwijderd." **Begrenzing** in de terreingegevens zegt "Ja" en het aantal hoeken.

Let op:

- Er is één begrenzing. Een nieuwe tekenen vervangt de vorige. {{ui:De begrenzing verwijderen}} neemt haar weg.
- Een begrenzing kan alleen wegnemen: een begrenzing die voorbij de punten reikt, wordt teruggesneden tot hun omtrek, met de melding "De begrenzing reikt voorbij de punten; ze is teruggesneden tot hun omtrek."
- De hoeken ervan nemen hun hoogten van het terrein over, zodat de rand precies het maaiveld volgt.
- Binnenbegrenzingen (verborgen) zijn nog niet beschikbaar.

## Lange buitendriehoeken bijsnijden

Zonder begrenzing vult het terrein de hele omtrek van de punten, inclusief lange dunne driehoeken over holle randen.

1. Typ in **Terrein** een lengte bij **Langste buitenrand** en druk op {{key:Enter}}. Begin met ongeveer twee tot drie keer uw gebruikelijke meetafstand.
2. Buitendriehoeken waarvan de buitenrand langer is dan dat, worden verwijderd, stap voor stap naar binnen tot elke buitenrand kort genoeg is. Een rand die een breeklijn is, wordt nooit afgepeld.
3. Typ 0 om elke driehoek weer te behouden.

## Het terreinrapport lezen

Onder de terreingegevens toont een vak wat de bouwer deed. Met een okerkleurige balk aan de linkerkant is het informatie; met een rode balk bevat het een fout en is er geen terrein.

| Melding | Betekenis |
|---|---|
| "3 punten lagen op dezelfde plek als een ander en zijn daarmee samengevoegd." | Punten die in plan dichter dan 0.0001 bij elkaar liggen, werden één hoekpunt (het eerste bleef behouden). |
| "2 plaatsen hebben twee verschillende hoogten …" | Punten boven elkaar, of kruisende breeklijnen, lopen in hoogte uiteen. De hoogte van de breeklijn wint, daarna de eerste. |
| "1 breeklijnstuk kon niet in het terrein worden geforceerd." | Een heel kort of bijna overlappend breeklijnstuk paste niet; controleer die plek. |
| "Een terrein heeft minstens drie punten met hoogten nodig." | Te weinig punten: controleer de kolomvolgorde en de groepen. |
| "De punten liggen allemaal op één lijn: geen driehoeken." | De punten hebben geen breedte, bijvoorbeeld één polygoonlijn. |
| "De begrenzing overlapt de punten niet." | De begrenzing staat ergens anders, vaak een verwarring van eenheden of coördinaten. |
| "Er zijn geen driehoeken meer binnen de begrenzing." | De begrenzing is te klein of verkeerd geplaatst. |

## Een terrein gelezen uit LandXML

Wanneer u LandXML opent, wordt het eerste TIN-terrein ervan gebruikt zoals het is: de kop **Terrein** zegt "Terrein (uit LandXML)" en **Langste buitenrand** is grijs. Zolang dat terrein in gebruik is, veranderen breeklijngroepen, getekende breeklijnen en een nieuwe begrenzing het niet. Om het terrein uit de punten van het bestand op te bouwen, klikt u op {{ui:Het terrein opnieuw opbouwen uit de punten}}. {{key:Mod+Z}} brengt het LandXML-terrein terug.

## Gerelateerd

- [Contourlijnen, hoogten en hellingen lezen](topic:contours).
- [Meetpunten importeren](topic:import-points).
