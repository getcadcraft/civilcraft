---
title: Beregn solens timer på en grund
summary: Vælg en dag (eller en årstid) og en tidszone, og se timerne med direkte sol på hver væg på hver masse og på jorden rundt om dem, med jorden tegnet på planen og tallene som CSV.
keywords: sol, soltimer, skygge, solforhold, dagslystimer, facade, væg, årstid, solhverv, jævndøgn, tidszone, sommertid, breddegrad, længdegrad, CSV, raster
from: 4e32a314
---

**Soltimer** tæller de timer med direkte sol, der rammer hver væg på hver bygningsmasse og jorden rundt om dem, på en dag du vælger, eller som et gennemsnit over en årstid. Massene og selve jorden kaster skygge; intet andet gør (ingen træer, ingen naboer du ikke har tegnet). Himmellys, der ikke er direkte sol, tælles ikke med.

## Før du går i gang

Solens placering kommer fra grundens breddegrad og længdegrad, som kommer fra projektets **koordinatsystem**. Et projekt uden et afvises med en besked: angiv det først (**Koordinater** i GIS-gruppen). En breddegrad og længdegrad skrevet i hånden ville være et gæt, så der er ingen felter til dem.

## Beregn det

I **Egenskaber** under **Bygningsmasser**, **Soltimer**:

1. Vælg **Dag**. Den starter på den dag, hvor solen står lavest dér, hvor du er (21. december, eller 21. juni på den sydlige halvkugle). For en årstid sætter du flueben i **Over en årstid**, vælger **Sidste dag** og hvor mange dage der skal være mellem prøverne.
2. Skriv **Tidszone**: et navn som `America/Mexico_City`, eller en forskel fra UTC som `-6`. Et navn følger den zones regler for sommertid den dag; en forskel, du skriver, bruges præcis som skrevet, så brug den, der gælder den dag. Linjen under feltet fortæller dig, hvilken forskel det fandt.
3. Vælg hvor ofte solen placeres (hvert 5, 10, 15 eller 30 minut), og klik derefter på **Beregn soltimerne**. En årstid køres i baggrundsprocesser; **Stop** annullerer den.

## Det får du

- En tabel pr. masse: den **dårligste væg**, **gennemsnittet** og den **bedste væg**, i timer pr. dag, og en tabel over hver væg med den vej, den vender, og dens timer etage for etage.
- Jorden rundt om massene, tegnet på planen fra mørk (ingen sol) til gul (det mest, nogen celle får), med en forklaring. Celler under en masse efterlades tomme. **Vis jorden på planen** slår den fra.
- **Vægge som CSV** og **Jord som CSV** gemmer tallene.

For en årstid er tallene gennemsnittet pr. dag over de prøvede dage. Intet gemmes i projektet: resultatet er til at se på, og hvis du kører det igen, laves det igen.

## Godt at vide

- En væg tæller et øjeblik som solrig kun, når den vender mod solen, og intet står i vejen. En væg, der vender væk, får ingenting.
- Jorden prøves på et gitter, der afhænger af grundens størrelse, og solens placering midt i hvert tidstrin, så timerne er rigtige til nogenlunde det trin, du valgte.
- Solens placering er en offentliggjort astronomisk formel, nøjagtig til omkring en bueminut.
