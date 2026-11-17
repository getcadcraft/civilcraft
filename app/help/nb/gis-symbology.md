---
title: Stil et layer etter en egenskap
summary: Farg objektene i et GIS-layer etter verdiene i et felt (én farge per verdi, eller etter tallintervaller), størrelse på punkter etter et tall, tone polygoner og vis en tegnforklaring på planen.
keywords: symbologi, stil, farge, kategorisert, gradert, unike verdier, lik intervall, kvantil, naturlige brudd, jenks, fargeskala, fargeblind, tegnforklaring, størrelse, punkter, koropleth, klasser, gis
from: a3a69add
---

Åpne et layers **tre prikker**-meny i GIS-layerlisten og velg {{ui:Stil etter egenskap…}}.

## Tre stiler

- **Enkelt symbol:** layerets farge, som før.
- **Kategorisert:** én farge per ulik verdi i et hvilket som helst felt. Opptil åtte verdier får de åtte Okabe-Ito-fargene (valgt for å holde seg adskilt ved vanlige typer fargeblindhet); med flere verdier får de syv vanligste hver sin farge, og resten deler en grå klasse **Annet**. Objekter uten verdi er grå.
- **Gradert:** et tallfelt deles i 2 til 9 intervaller, hver med en farge fra en skala. En verdi på et skillepunkt havner i det nedre intervallet.

## Slik deles intervallene

| Metode | Brudd |
|---|---|
| Lik intervall | Området fra minste til største verdi, delt i like brede deler. Verdiene 0 til 30 i tre intervaller: 0, 10, 20, 30. |
| Kvantil | Omtrent like mange objekter i hvert intervall. Bruddene leses fra de sorterte verdiene med vanlig rettlinjet interpolasjon: for 1 til 10 i to intervaller er bruddet 5,5. |
| Naturlige brudd (Jenks) | Skjæringspunktene som gir minst spredning inne i hvert intervall, slik at klynger av like verdier holder seg sammen. Ved mer enn 1 500 verdier arbeider den med 1 500 jevnt fordelte av dem, og sier det. |

## Farger

Viridis og Cividis går fra mørk til lys med en jevn endring i lysstyrke, så rekkefølgen på intervallene kan leses selv i gråtone eller ved fargeblindhet. Blues går fra lys til mørk. Rød til blå er en toveis skala for verdier rundt en midtverdi. **Reverser fargene** snur hvilken som helst av dem. Dialogen lister intervallene og antall objekter i hver før du bruker den.

## Størrelse, fyll og tegnforklaring

- **Punktstørrelse etter** et tallfelt gjør hvert punkts kvadrat større jo større verdien er, mellom de to størrelsene du gir (halv sidelengde, i millimeter på papir).
- **Tone innsiden av polygoner** fyller hvert polygon i sin klasses farge (hull forblir tomme). Tonen vises på skjermen; plott og DXF/DWG viser de fargede konturene.
- Vis tegnforklaring på planen tegner klassene, antallene og størrelsesområdet nederst til venstre på planen. Tegnforklaringen er på skjermen; den er ikke med i et plott.
- For å merke objekter med et felt, bruk **Merk med** i samme meny.

Stilen lagres i prosjektfilen. En versjon som ikke kjenner stiler, åpner filen med layerets farge. Plott, DXF og DWG bærer klassene som egne layere, navngitt etter layeret og klassen, i den nærmeste av de ni grunnleggende CAD-fargene. Et layer med mer enn 200 000 objekter tegnes i én farge.
