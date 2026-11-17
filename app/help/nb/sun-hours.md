---
title: Beregn soltimene på en tomt
summary: Velg en dag (eller en årstid) og en tidssone, og se timene med direkte sol på hver vegg i hver bygningsmasse og på terrenget rundt dem, med terrenget tegnet i planen og tallene som CSV.
keywords: sol, soltimer, skygge, solforhold, dagslystimer, fasade, vegg, årstid, solverv, jevndøgn, tidssone, sommertid, breddegrad, lengdegrad, CSV, raster
from: 4e32a314
---

**Soltimer** teller timene med direkte sol som når hver vegg i hver bygningsmasse og terrenget rundt dem, på en dag du velger eller som et gjennomsnitt over en årstid. Massene og terrenget selv kaster skygge; ingenting annet gjør det (ingen trær, ingen naboer du ikke har tegnet). Himmellys som ikke er direkte sol, telles ikke.

## Før du begynner

Solens plassering kommer fra stedets breddegrad og lengdegrad, som hentes fra prosjektets **koordinatsystem**. Et prosjekt uten et får en melding om at det avvises: sett det først (**Koordinater** i GIS-gruppen). En breddegrad og lengdegrad skrevet inn for hånd ville være en gjetning, så det finnes ingen boks for dem.

## Beregn det

I **Egenskaper**, under **Bygningsmasser**, **Soltimer**:

1. Velg **Dag**. Den starter på dagen solen står lavest der du er (21. desember, eller 21. juni på den sørlige halvkule). For en årstid, kryss av **Over en årstid**, velg **Siste dag** og hvor mange dager fra hverandre det skal prøves.
2. Skriv inn **Tidssone**: et navn som `America/Mexico_City`, eller en forskyvning fra UTC som `-6`. Et navn følger den sonens sommertidsregler for dagen; en forskyvning du skriver inn, brukes nøyaktig slik du skriver den, så bruk den som gjelder den dagen. Linjen under boksen forteller hvilken forskyvning den fant.
3. Velg hvor ofte solen plasseres (hvert 5, 10, 15 eller 30 minutt), og trykk deretter **Beregn soltimene**. En årstid kjøres i bakgrunnsprosesser; **Stopp** avbryter den.

## Hva du får

- En tabell per masse: den **verste veggen**, **gjennomsnittet** og den **beste veggen**, i timer per dag, og en tabell over hver vegg med retningen den vender og timene etasje for etasje.
- Terrenget rundt massene, tegnet i planen fra mørkt (ingen sol) til gult (det mest noen celle får), med en tegnforklaring. Celler under en masse er tomme. **Vis terrenget i planen** slår det av.
- **Vegger som CSV** og **Terreng som CSV** lagrer tallene.

For en årstid er tallene gjennomsnittet per dag over dagene som ble prøvd. Ingenting lagres i prosjektet: resultatet er til å se på, og kjøres det på nytt, lages det på nytt.

## Godt å vite

- En vegg teller et øyeblikk som solrikt bare når den vender mot solen og ingenting står i veien. En vegg som vender bort, får ingenting.
- Terrenget samples på et rutenett som avhenger av størrelsen på tomten, og solens plassering midt i hvert tidssteg, så timene er riktige til nærmeste steg du valgte.
- Solens plassering er en publisert astronomisk formel, nøyaktig til omtrent ett bueminutt.
