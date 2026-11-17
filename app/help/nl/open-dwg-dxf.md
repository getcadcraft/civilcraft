---
title: Een DWG of DXF als lijnwerk openen
summary: Open het lijnwerk van een tekening op het plan, laag voor laag, gebruik de hoogtelijnen, 3D-polylijnen en gesloten omtrekken voor het oppervlak, en zet de puntblokken om in meetpunten.
keywords: meetcontrole, tekst-hoogten, dwg, dxf, cad, tekening, lijnwerk, hoogtelijnen, breeklijnen, grens, polylijn, 3d-polylijn, lagen, achtergrondkaart, topo, meettekening, blokken, blokverwijzingen, meetpunten uit blokken, attributen, puntblokken, invoegpunt
from: da0f4c58
---

Een topografische opmeting komt vaak als tekening binnen: hoogtelijnen als polylijnen op hun hoogte, breeklijnen als 3D-polylijnen, de terreinomtrek als gesloten polylijn. CivilCraft opent de **modelruimte** van de tekening als lagen op het plan, en kan die lijnen rechtstreeks in het oppervlak omzetten.

## De tekening openen

1. Klik op {{ui:Lijnwerk}} in de groep **Oppervlak** (of op {{ui:Openen}}, of zet het bestand op het plan) en kies een `.dwg`- of `.dxf`-bestand. De tekening wordt op deze computer gelezen; er wordt niets geüpload. DWG van 2000 tot 2018 en ASCII-DXF worden gelezen.
2. Het dialoogvenster **Lijnwerk** toont de lagen van de tekening die lijnen, gesloten vormen of punten bevatten, en of ze **hoogten** hebben. Lagen die in de tekening uit staan, beginnen niet aangevinkt. Tekst, arceringen, maatvoering en andere objecten die geen lijnwerk zijn, worden geteld en weggelaten (het dialoogvenster zegt welke).
3. Controleer **Tekeneenheden**. Wanneer de tekening zijn eenheden vermeldt, zet CivilCraft ze om naar die van het project (mm naar m, m naar ft, in naar ft). Een tekening in ft wordt gelezen als US survey-ft zonder schaling: de twee verschillen 2 delen per miljoen, en het schalen van state plane-coördinaten met die factor zou ze met ft verschuiven. Wanneer de tekening zijn eenheden niet vermeldt, worden de getallen in de eenheden van het project gelezen; kies in de lijst de juiste eenheden als dat niet klopt.
4. Kies bij **Gebruiken voor het oppervlak** wat elke laag aan het oppervlak geeft (of laat **Alleen tonen** staan). Lagen met een naam zoals hoogtelijnen (TOPO, CONT, CNTR) die hoogten hebben, beginnen als breeklijnen.
5. Klik op {{ui:Toevoegen}}. De lagen verschijnen onder **GIS-lagen** in het linkerpaneel; elk gebruik wordt in het oppervlak gezet. Elk onderdeel is een eigen stap: {{key:Mod+Z}} neemt ze één voor één terug.

## Wat elk soort laag kan geven

| De laag bevat | Gebruiken voor het oppervlak |
|---|---|
| Hoogtelijnen (polylijnen op een hoogte) | Breeklijnen op de eigen hoogte van de lijnen, of op het veld ELEV |
| 3D-polylijnen | Breeklijnen op hun eigen hoogten |
| Een gesloten omtrek | De grens van het oppervlak (de grootste gesloten vorm, of die u hebt gekozen) |
| Punten met een hoogte | Meetpunten, beschreven met de naam van de laag |
| Lijnen op hoogte 0 (lijnwerk op het plan) | Niets: het blijft op het plan als basistekening |

Een tekening die CivilCraft heeft geschreven, bevat zijn featurelijnen als 3D-polylijnen die hun bogen onthouden. Het dialoogvenster toont dan **Featurelijnen**: laat het aangevinkt om ze terug te brengen als featurelijnen met hun bogen en gebruik (één ongedaan-maakstap), of vink het uit om ze als gewoon lijnwerk te lezen, zoals elke andere laag.

Later gebruikt u {{ui:Gebruiken voor het oppervlak}} in het menu van de laag onder **GIS-lagen** om hetzelfde te doen voor een laag die u alleen hebt getoond.

## Meetpunten uit blokken

Meettekeningen dragen hun punten vaak als blokken: een klein symbool bij elke meting, met attributen voor het puntnummer, de beschrijving en de hoogte. Wanneer de tekening blokverwijzingen heeft, heeft het dialoogvenster een sectie **Meetpunten uit blokken**:

1. Vink de blokken aan die u wilt nemen (de tabel toont hoeveel verwijzingen elk heeft, op welke lagen, en welke attributen), of vink lagen aan om elke blokverwijzing erop te nemen.
2. Kies waar het **nummer**, de **beschrijving** en de **hoogte** van elk punt vandaan komen: een attribuut, de naam van het blok of de laag, de eerstvolgende vrije nummers, of de Z van het invoegpunt. CivilCraft begint bij de waarschijnlijke attributen (PT, DESC, ELEV en dergelijke), en neemt de hoogte uit een attribuut alleen wanneer de blokken op nul staan.
3. Vink de lijnwerklagen uit als u alleen de punten wilt, en klik daarna op {{ui:Toevoegen}}.

Elke verwijzing wordt één meetpunt op zijn invoegpunt. Alleen verwijzingen in de modelruimte tellen; blokken die in andere blokken zijn genest, niet. Nummers die al in het project staan, of twee keer in de tekening gebruikt, krijgen nieuwe nummers na het hoogste, en een hoogteattribuut dat geen getal is, laat dat punt zonder hoogte; de statusbalk telt beide. De tekening wordt nooit gewijzigd, en elk punt onthoudt zijn blok: de Eigenschappen tonen **Uit blok** met het blok, de laag en de handle. Het toevoegen van de punten is één stap, dus {{key:Mod+Z}} neemt ze allemaal weg.

## Hoogten als tekst en de controle

Hoogtepunten die als tekst zijn geschreven (of in een blokattribuut dat geen meetpuntblok is), zijn geen lijnwerk. De sectie **Meethoogten en controle** kan ze als meetpunten overnemen, en somt op wat er mis lijkt met de tekening: eenheden, coördinatenstelsel, afstand tot nul, vlakke hoogtelijnen, rare hoogten, dubbele punten. Zie [Een meettekening controleren bij het importeren](topic:survey-check).

## Hoe de tekening wordt gelezen

- Bogen, cirkels, ellipsen, bolle polylijnsegmenten en splines worden korte rechte stukken (elke 5° hoogstens).
- Blokverwijzingen worden getekend waar ze zijn geplaatst, ook genestelde blokken; wat een blok op laag 0 bevat, krijgt de laag van de verwijzing.
- Objecten die in een ander vlak zijn getekend (een andere extrusierichting) worden in wereldcoördinaten geplaatst.
- Elk object krijgt drie velden: LAYER, TYPE (het objecttype) en ELEV (zijn hoogte wanneer alle punten er één delen).
- Coördinaten worden overgenomen zoals ze zijn: de tekening moet dezelfde coördinaten gebruiken als het project (bijvoorbeeld dezelfde state plane-zone). Gekoppelde tekeningen (xrefs) worden niet geopend: open ze afzonderlijk.

:::tip
Een hoogtelijntekening geeft het beste oppervlak met enkele hoogtepunten op heuvelruggen en in laagten, waar hoogtelijnen alleen vlakke driehoeken laten. Voeg ze toe als meetpunten, of vanuit een puntenlaag in de tekening.
:::
