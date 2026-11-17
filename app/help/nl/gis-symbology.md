---
title: Een laag stijlen op basis van een attribuut
summary: De objecten van een GIS-laag kleuren op basis van de waarden van een veld (één kleur per waarde, of per getalbereik), punten vergroten op basis van een getal, vlakken tinten en een legenda op het plan tonen.
keywords: symboliek, stijl, kleur, gecategoriseerd, gegradueerd, unieke waarden, gelijke intervallen, quantiel, natuurlijke breuken, jenks, verloop, kleurenblindheid, legenda, grootte, punten, choropleet, klassen, gis
from: a3a69add
---

Open het **drie puntjes**-menu van een laag in de lijst GIS-lagen en kies {{ui:Opmaak op basis van attribuut…}}.

## Drie stijlen

- **Enkel symbool:** de kleur van de laag, zoals voorheen.
- **Gecategoriseerd:** één kleur per verschillende waarde van elk veld. Tot acht waarden krijgen de acht Okabe-Ito-kleuren (gekozen zodat ze uit elkaar blijven bij de gangbare vormen van kleurenblindheid); bij meer waarden krijgen de zeven meest voorkomende elk een kleur, en delen de rest een grijze klasse **Overig**. Objecten zonder waarde zijn grijs.
- **Gegradueerd:** een getalveld wordt verdeeld in 2 tot 9 bereiken, elk met een kleur uit een verloop. Een waarde op een grens gaat in het lagere bereik.

## Hoe de bereiken worden verdeeld

| Methode | Grenzen |
|---|---|
| Gelijke intervallen | Het bereik van de kleinste tot de grootste waarde, verdeeld in gelijke breedtes. Waarden 0 tot 30 in drie bereiken: 0, 10, 20, 30. |
| Quantiel | Ongeveer evenveel objecten per bereik. De grenzen worden uit de gesorteerde waarden gelezen met de gebruikelijke rechte-lijninterpolatie: voor 1 tot 10 in twee bereiken is de grens 5.5. |
| Natuurlijke breuken (Jenks) | De snijpunten die de minste spreiding binnen elk bereik laten, zodat groepjes gelijke waarden bij elkaar blijven. Bij meer dan 1,500 waarden werkt het op 1,500 gelijkmatig verdeelde waarden, en het zegt dat. |

## Kleuren

Viridis en Cividis lopen van donker naar licht met een gelijkmatige verandering in lichtheid, zodat de volgorde van de bereiken ook in grijs of bij kleurenblindheid te lezen is. Blues loopt van licht naar donker. Rood naar blauw is een tweerichtingsverloop voor waarden rond een middelpunt. **Kleuren omkeren** draait elk ervan om. De dialoog toont de bereiken en het aantal objecten in elk, voordat u toepast.

## Grootte, vulling en legenda

- **Puntgrootte op basis van** een getalveld maakt het vierkantje van elk punt groter naarmate de waarde groter is, tussen de twee maten die u opgeeft (de halve zijde, in millimeter op papier).
- **Vlakken van binnen tinten** vult elk vlak in zijn klassekleur (gaten blijven leeg). De tint is op het scherm; plots en DXF/DWG tonen de gekleurde contouren.
- **Een legenda op het plan tonen** tekent de klassen, hun aantallen en het groottebereik linksonder op het plan. De legenda staat op het scherm; ze staat niet in een plot.
- Om objecten met een veld te labelen, gebruikt u **Labelen met** in hetzelfde menu.

De stijl wordt opgeslagen in het projectbestand. Een build die stijlen niet kent, opent het bestand met de kleur van de laag. Plots, DXF en DWG dragen de klassen als afzonderlijke lagen, genoemd naar de laag en de klasse, in de dichtstbijzijnde van de negen basis-CAD-kleuren. Een laag met meer dan 200,000 objecten wordt in één kleur getekend.
