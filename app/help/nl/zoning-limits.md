---
title: Massa's controleren aan de bouwgrenzen die u intypt
summary: Typ de bouwafstanden van een perceel regel voor regel, een hoogtegrens, een hemelvlak, een vloeroppervlakteratio en een bebouwingsgraad, zie de bouwbare envelop op het plan, en lees welke massa's welke grens overschrijden.
keywords: zonering, bouwafstand, bouwafstanden, voor, zij, achter, envelop, bouwbaar oppervlak, hoogtegrens, hemelvlak, vloeroppervlakteratio, FAR, bebouwingsgraad, perceel, erf, verordening, bouwtoets
from: 3e267b31
---

**CivilCraft bevat geen bouwverordening.** Het kent de regels van geen enkele gemeente en bevat geen bibliotheek met die regels. Elk getal op deze pagina is een getal dat u intypt, overgenomen uit uw eigen verordening, en elk resultaat zegt dat het is gemeten aan de grenzen die u hebt ingetypt. Het is een manier om te zien hoe de grenzen van een perceel een gebouw vormgeven, geen uitspraak over de vraag of een ontwerp is toegestaan.

## De grenzen intypen

Kies in **Eigenschappen**, onder **Massa's**, een **Perceel** (of selecteer een massa: de grenzen van het perceel worden eronder getoond). Vul dan in wat van toepassing is; laat een vak leeg voor "geen grens":

- **Straatgrens**: de perceelsgrens aan de straat. De **Voorafstand** geldt daarvoor, de **Achterafstand** voor de grens die daar het verst vandaan ligt, en de **Zijafstand** voor de rest.
- **Hoogtegrens**.
- **Hemelvlak**: het begint op een hoogte bij de perceelsgrens en stijgt met het bedrag dat u intypt voor elke 1 horizontale afstand naar binnen, gemeten vanaf de straatgrens of vanaf elke perceelsgrens (2 betekent 2 op 1). De toegestane hoogte boven een punt is de laagste van het vlak en de hoogtegrens.
- **Vloeroppervlakteratio** (bruto vloeroppervlak van de massa's op het perceel gedeeld door de oppervlakte van het perceel) en **Bebouwingsgraad** (hun voetafdrukken gedeeld door de oppervlakte van het perceel, intypt in procenten).

## De envelop

Vink **Toon de envelop op het plan** aan om hem op de laag `A-MASS-ENVL` te tekenen. De envelop is het perceel, ingesneden vanaf elke perceelsgrens met de eigen bouwafstand van die grens, waarbij de verschoven lijnen in geknikte hoeken samenkomen. Een perceelsgrens die uit een boog bestaat, wordt benaderd met korte koorden binnen 0,01 van de boog. Zowel convexe als concave percelen werken. Als de bouwafstanden over elkaar heen vouwen (een diepe bouwafstand op een smal of sterk concaaf perceel), is er geen envelop, en Eigenschappen zegt dat; probeer kleinere afstanden.

## Het resultaat

Onder de vakken krijgt elke massa en elke grens een regel, met een vinkje of een kruis:

- **bouwafstanden**: de oppervlakte van de massa die buiten de envelop ligt;
- **hoogte**: de hoogte van de massa afgezet tegen de hoogste toegestane hoogte boven de voetafdruk (een prisma van één hoogte wordt begrensd door de laagste toegestane hoogte op een van zijn hoeken);
- **vloeroppervlakteratio** en **bebouwingsgraad**: alle massa's op het perceel samen opgeteld.
