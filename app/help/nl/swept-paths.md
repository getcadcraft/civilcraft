---
title: Draaibanen van voertuigen
summary: Rijd een voertuig met maximaal drie aanhangers langs een elementlijn of een tracé, vooruit of achteruit, en zie het gebied dat het doorkruist, zijn wielbanen, zijn stuurbeweging en waar het inklapt.
keywords: draaibaan, draaipad, voertuigtracking, draaisjabloon, ontwerpvoertuig, vrachtwagen, bus, aanhanger, oplegger, achteruitrijden, inklappen, articulatie, stuuranslag, uitzwaaien, wielbaan, laaddok, draairadius
from: 8caafb8a
---

Een draaibaan laat een voertuig langs een lijn rijden en toont de grond die het voertuig doorkruist. Gebruik het om te controleren of een vrachtwagen een hoek kan nemen, een laaddok kan bereiken of een aanhanger op zijn plaats kan achteruitrijden zonder de verharding te verlaten.

## Een voertuig langs een lijn laten rijden

1. Teken de lijn die het voertuig volgt, in de rijrichting: een elementlijn (bogen zijn toegestaan: druk op {{key:C}} tijdens het tekenen, zie [Elementlijnen](topic:feature-lines)) of een tracé.
2. Selecteer die en klik in het **Eigenschappen**-venster op {{ui:Draaibaan…}}.
3. Kies onder **Starten vanaf** een voertuig en stel daarna de afmetingen in van uw eigen ontwerpvoertuig: breedte, voor-overstek, wielbasis, achter-overstek, spoorbreedte en **Stuuranslag**. Voeg tot drie aanhangers toe, elk met de plaats van de koppeling, zijn lengte van koppeling tot as, zijn overstekken en zijn **Grootste articulatie**.
4. Kies de **Rijrichting**: vooruit of achteruit. Klik op {{ui:Laat het rijden}}.

:::warning
De voertuigen waarmee u start zijn tijdelijke waarden, geen norm. Stel de afmetingen in op basis van het ontwerpvoertuig dat uw project gebruikt.
:::

## Vooruit en achteruit

| Rijrichting | Wat de lijn volgt | Wat CivilCraft berekent |
|---|---|---|
| **Vooruit** | Het middelpunt van de vooras | Waar de achteras en elke aanhanger naartoe gaan, de stuurhoek en de articulatie |
| **Achteruit** | Het middelpunt van de laatste as (de achterkant van de aanhanger) | Waar elk deel ervoor naartoe gaat, en de stuurbeweging die de cabine nodig heeft om de aanhanger daar te plaatsen |

Achteruitrijden is hoe een achteruitmanoeuvre wordt gecontroleerd: geef aan waar de aanhanger moet komen, en CivilCraft zegt of de cabine dat kan.

## Het resultaat lezen

De draaibaan wordt in oranje op het plan getekend: de omtrek en, gestreept, de banen van de buitenste wielen. Selecteer de draaibaan (klik erin) om in **Eigenschappen** te zien:

- **Gereden lengte**, de grootste **Stuurhoek** en **Articulatie** tegen hun grenzen, en het **Doorkruist gebied**.
- Elk probleem langs de lijn, met de afstand: de stuurhoek voorbij de stuuranslag, of een aanhanger die verder draait dan zijn articulatiegrens (hij klapt in).
- **Het voertuig langs de lijn**: verschuif de schuifregelaar om het voertuig op elk punt te zien, met zijn stuurhoek en articulatie daar.

Wijzig de lijn en de draaibaan volgt. {{ui:Het voertuig bewerken…}} wijzigt de afmetingen; **Rijrichting** schakelt tussen vooruit en achteruit. Elke wijziging is één stap: {{key:Mod+Z}} maakt ze ongedaan. {{key:Delete}} verwijdert de geselecteerde draaibaan (de lijn blijft staan).

De omtrek en de wielbanen gaan naar de PDF, DXF en DWG op laag C-ROAD-SWPT.

## Hoe het wordt berekend

Elk deel draait om de lijn van zijn achteras en wordt gesleept door het punt ervoor (de voorste as, of de koppeling), het model bij lage snelheid zonder slip dat ook voor draaibaancontroles wordt gebruikt. Het doorkruiste gebied is de omtrek van de carrosserie op elke positie samen. Het modelleert geen snelheid, bandenslip, de tijd die het sturen nodig heeft om te draaien, stuurbare aanhangers of de vrije ruimte onder de carrosserie.
