---
title: Stil et lag efter en attribut
summary: Farvelæg objekterne i et GIS-lag efter værdierne i et felt (én farve pr. værdi eller efter talintervaller), gør punkter større efter et tal, farvetone polygoner og vis en signaturforklaring på planen.
keywords: symbologi, stil, farve, color, kategoriseret, graduleret, unikke værdier, lige interval, kvantil, naturlige brud, jenks, farveskala, farveblindhed, signaturforklaring, størrelse, punkter, choropleth, klasser, gis
from: a3a69add
---

Åbn et lags **tre prikker**-menu i listen over GIS-lag, og vælg {{ui:Stil efter attribut…}}.

## Tre stilarter

- **Enkelt symbol:** lagets farve, som før.
- **Kategoriseret:** én farve pr. særskilt værdi i et hvilket som helst felt. Op til otte værdier får de otte Okabe-Ito-farver (valgt, så de forbliver adskilte for de almindelige former for farveblindhed); med flere værdier får de syv hyppigste hver en farve, og resten deler en grå klasse **Andet**. Objekter uden værdi er grå.
- **Graduleret:** et talfelt skæres i 2 til 9 intervaller, hver med en farve fra en skala. En værdi på et brud går ind i det nedre interval.

## Sådan skæres intervallerne

| Metode | Brud |
|---|---|
| Lige interval | Intervallet fra den mindste til den største værdi deles i lige brede dele. Værdierne 0 til 30 i tre intervaller: 0, 10, 20, 30. |
| Kvantil | Omtrent det samme antal objekter i hvert interval. Bruddene læses fra de sorterede værdier med den sædvanlige lineære interpolation: for 1 til 10 i to intervaller er bruddet 5.5. |
| Naturlige brud (Jenks) | De snit, der efterlader mindst spredning inde i hvert interval, så klumper af ens værdier holdes sammen. Ved mere end 1,500 værdier arbejder den med 1,500 jævnt fordelte og siger det. |

## Farver

Viridis og Cividis går fra mørk til lys med en jævn ændring i lysstyrke, så rækkefølgen af intervallerne kan læses, selv i gråt eller ved farveblindhed. Blues går fra lys til mørk. Rød til blå er en tosidet skala for værdier omkring en midte. **Vend farverne** vender enhver af dem om. Dialogen lister intervallerne og antallet af objekter i hvert, før du anvender den.

## Størrelse, udfyldning og signaturforklaring

- **Punktstørrelse efter** et talfelt gør hvert punkts kvadrat større, jo større værdien er, mellem de to størrelser du angiver (halv sidelængde, i millimeter på papir).
- **Farvetone inde i polygoner** udfylder hvert polygon i dets klassefarve (huller forbliver tomme). Toningen er på skærmen; plots og DXF/DWG viser de farvede konturer.
- **Vis en signaturforklaring på planen** tegner klasserne, deres antal og størrelsesintervallet nederst til venstre på planen. Signaturforklaringen er på skærmen; den er ikke med i et plot.
- For at mærke objekter med et felt, brug **Mærk med** i samme menu.

Stilen gemmes i projektfilen. En version, der ikke kender stilarter, åbner filen med lagets farve. Plots, DXF og DWG bærer klasserne som separate lag, navngivet efter laget og klassen, i den nærmeste af de ni grundlæggende CAD-farver. Et lag med mere end 200,000 objekter tegnes i én farve.
