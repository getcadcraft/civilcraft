---
title: Læs højdekurver, koter og fald
summary: Angiv højdekurveintervallet og hovedkurver, vis kotebånd, faldpile og trekanter, og læs terrænkoter under markøren.
keywords: højdekurver, højdekurveinterval, hovedkurver, etiketter, kotebånd, faldpile, trekanter, koteangivelse, overfladeanalyse, kotenanalyse, faldanalyse
from: 585e500a
---

Overfladen vises med højdekurver, så snart den findes. Alt i dette emne indstilles under **Visning** i venstre panel. Visningsindstillinger ændrer kun det, du ser (og det, du eksporterer); de er ikke trin, du kan fortryde.

## Angiv højdekurveintervallet

1. Under **Visning** vælger du en værdi i **Højdekurver hver**.
   - I fod: 0.25, 0.5, 1, 2, 5, 10 eller 20 ft.
   - I meter: 0.1, 0.25, 0.5, 1, 2, 5 eller 10 m.
2. Vælg **Hovedkurve hver**: hver 2., 4., 5. eller 10. højdekurve.
   Hovedkurver tegnes tykkere og mærkes med deres kote. De ligger på hele multipla af hovedafstanden (med 1 ft-kurver og hver 5. som hovedkurve: 245, 250, 255 …).
3. Slå {{ui:Kurveetiketter}} fra, hvis etiketterne fylder for meget på et lille plot.

Et nyt projekt starter med 1 enhed og med hver 5. højdekurve som hovedkurve. Højdekurver bøjer ved brudlinjer; hvis de skærer tværs over en flowlinje eller en kam, er linjen endnu ikke en brudlinje (se [Byg og finjuster overfladen](topic:build-surface)).

:::note
Højdekurver tegnes kun, når der er højst 2,000 niveauer mellem det laveste og det højeste punkt. På et areal med meget højdeforskel og et meget lille interval viser planen slet ingen højdekurver: vælg et større interval.
:::

## Udglat højdekurverne

Højdekurver tegnes som rette stykker, ét over hver trekant i overfladen, så de drejer en lille vinkel ved hver trekantkant. **Kurveudglatning** under **Visning** runder disse hjørner af:

- **Ingen (rette stykker)**: de optegnede linjer, som de er. Det er det, en ny eller ældre tegning viser.
- **Let**: hjørner rundet lidt af. En linje flytter sig aldrig mere end 10 % af vejen mod næste højdekurve og aldrig længere fra sit rette stykke end en sjettedel af stykkets længde.
- **Kraftig**: en flydende kurve. En linje flytter sig aldrig mere end 25 % af vejen mod næste højdekurve og aldrig længere fra sit rette stykke end en tredjedel af stykkets længde.

Med begge valg krydser en udglattet højdekurve stadig hver trekantkant i samme punkt som den optegnede, forbliver inden for den trekant, hvert stykke krydser, og kan derfor aldrig krydse eller røre en anden højdekurve. Hvor en højdekurve krydser en brudlinje eller randen, beholder den sin skarpe bøjning. De udglattede linjer er dem, der plottes og eksporteres (DXF, DWG, PDF, GIS og 3D), og de har flere hjørnepunkter end de optegnede linjer.

Udglatning ændrer kun de tegnede linjer. Koter, volumener, profiler og snit læses stadig fra selve overfladen. En højdekurve, der går præcis gennem målepunkter (et punkt på 250.00 på kurve 250), beholder et lille hjørne ved hvert sådant punkt.

## Sådan dannes overfladen bag højdekurverne

Højdekurver følger overfladen, og overfladen følger **Metode for højdekurver** under **{{ui:Overflade}}** i venstre panel. Standardmetoden, **Triangulering med lineær interpolation**, forbinder dine punkter til trekanter og bevarer hvert punkt og hver brudlinje præcist. De øvrige metoder tilpasser først et regulært gitter til punkterne (kriging, minimal krumning, naturlig nabo, invers afstand og flere). Det giver rundere højdekurver mellem punkterne, men resultatet går ikke præcis gennem alle punkter; overfladerapporten under **{{ui:Overflade}}** siger, hvor langt resultatet ligger fra i dine punkter.

**ABOS (approximation based on smoothing)** er en af de gitterbaserede metoder. Den har to egne indstillinger: **Glathed** (0.5 at starte med; lavere er glattere) og **Nøjagtighed** (1 at starte med: overfladen bringes inden for 1 % af områdets højdeinterval i dine punkter; skriv et mindre tal for en tættere tilpasning). Hvis den ikke kan nå nøjagtigheden på det gitter, den har, siger overfladerapporten det: skriv en mindre **Gitterafstand**.

## Læs en kote hvor som helst

Flyt markøren hen over planen. Statuslinjen viser:

- **E** og **N** under markøren
- **Terræn** og den eksisterende terrænkote der, interpoleret i trekanten under markøren
- **Planeret** og den projekterede kote, hvor et byggeplateau eller en korridor har ændret terrænet
- »Uden for overfladen« uden for overfladen

For at læse et målepunkt nøjagtigt skal du vælge {{ui:Vælg}} og klikke på punktet: højre panel viser dets nummer, øst, nord, kote, beskrivelse og gruppe.

## Vis kotebånd

1. Sæt kryds i {{ui:Kotebånd}}.
   Overfladen fyldes med farve fra lav (blå-grøn) til høj (okker-brun). En forklaring under afkrydsningsfelterne viser hvert bånds højdeinterval.
2. Vælg, hvor mange bånd der skal vises i **Bånd**: 5, 8, 10 eller 12. Båndene deler intervallet fra laveste til højeste kote op i lige store trin.

Bånd er kun til visning. De eksporteres ikke til DXF og plottes ikke til PDF.

## Vis faldpile

Sæt kryds i {{ui:Faldpile}}. En kort pil på hver trekant, stor nok til at rumme én, peger nedad ad bakke. Flade trekanter får ingen pil. Pilene er et hurtigt tjek af afløbsretningen; selve faldværdien vises endnu ikke med tal.

## Vis trekanter, punkter og kanter

- {{ui:Trekanter}} tegner TIN'ens kanter. Slå den til for at kontrollere, hvordan overfladen forbinder punkterne, især langs brudlinjer og ved kanten.
- {{ui:Punkter}} tegner hvert målepunkt; {{ui:Punktetiketter}} tilføjer dets nummer, kote og beskrivelse (eller mindre: se **Punktetiketter** i [CivilCraft-indstillinger](topic:settings)).
- {{ui:Brudlinjer}} tegner brudlinjer (og randen) i orange.
- {{ui:Overfladekant}} tegner overfladens omrids.

## Eksisterende eller projekteret

Når et byggeplateau eller en korridor er planeret uden problemer, tilbyder **Overflade** under **Visning** {{ui:Projekteret (planeret)}}. Højdekurverne, kotebåndene og pilene viser så den planerede overflade, så du kan se det nye terræn og skæringen i terrænet omkring det. Skift tilbage til {{ui:Eksisterende terræn}} for at se målingen.

## Hvad der eksporteres

DXF- og PDF-output følger disse indstillinger: det, du har slået fra, skrives ikke, og højdekurverne er dem for den viste overflade. Kotebånd eksporteres aldrig.
