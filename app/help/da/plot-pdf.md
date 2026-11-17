---
title: Plot planen til PDF
summary: Plot alt eller den aktuelle visning til en vektor-PDF på et standardark i en teknisk eller metrisk målestok, i lagfarver eller sort.
keywords: plot, udskriv, pdf, ark, målestok, papirstørrelse, planark, udgiv, tegningshoved, nordpil, skalabjælke
from: 9af396ca
---

{{ui:PDF}} plotter planen til en vektor-PDF på ét ark, med en titelstrimmel, en nordpil og en skalabjælke. PDF'en laves i browseren og downloades; den går ikke gennem browserens udskriftsdialog.

## Plot

1. Opsæt planen under **Visning**: den viste overflade, højdekurveintervallet og hvilke ting der er tændt. Plottet følger disse indstillinger.
2. Hvis du kun vil have en del af området, skal du zoome og panorere planen til den.
3. Klik på {{ui:PDF}} i gruppen **Eksport**, eller tryk på {{key:Mod+P}}.
   Dialogen **Plot planen til PDF** åbnes.
4. Vælg **Område**: {{ui:Alt}} eller {{ui:Det, der er på skærmen}}.
5. Vælg **Papir**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 eller A1. Et projekt i fod starter på Tabloid, et projekt i meter på A3. Ark er altid liggende.
6. Vælg **Målestok**. Listen markerer den største målestok, der passer, med »(passer)« og vælger den.
   - Fod: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Vælg **Blæk**: {{ui:Lagfarver}} eller {{ui:Sort}}.
8. Læs linjen under valgene. Den angiver områdets størrelse på papiret og arkstørrelsen, fx »Området er 297 × 222 mm ved 1" = 40' på et 432 × 279 mm ark (liggende).«
9. Klik på {{ui:Download PDF}}.
   Browseren downloader `<name>.pdf`. Statuslinjen siger »Plottet <name>.pdf ved 1" = 40'.«

Hvis området er større end arket ved den målestok, du valgte, centreres plottet, og kanterne skæres af. Vælg målestoken markeret »(passer)« eller et større ark.

## Hvad der er på arket

- Planen, centreret i tegneområdet, som ægte vektorer: højdekurver, etiketter, tracéer med stationering, korridorer, byggeplateauer og skæringslinjer, rør, punkter.
- Linjetykkelser efter lag: tracéer, byggeplateauer og rør tykkere; trekanter og mindre højdekurver fine.
- En titelstrimmel langs bunden med projektets **Navn**, målestoken, en note om højdekurveintervallet og hvilken overflade (eksisterende eller planeret), samt dato og version til højre.
- En nordpil i øverste højre hjørne (plan-nord er op) og en skalabjælke i titelstrimlen.
- Kortlagene under planen (et billede, kortfliser eller en kortservice), når **Kortlag under planen** er afkrydset: de tegnes som ét billede af hele tegneområdet ved 150 dpi under linjearbejdet, og et korts kildeangivelse kommer i titelstrimlen. CivilCraft venter op til 8 sekunder på kortbilleder, der stadig er på vej; mangler nogle, siger statuslinjen det.

Tekst bruger PDF'ens indbyggede Helvetica. Tegn uden for det vesteuropæiske sæt (Windows-1252) udskrives som »?«, og statusmeddelelsen tæller dem.

## Hvad der ikke plottes

- Kotebånd.
- Længdeprofilvisningen. Plot af profiler er endnu ikke tilgængeligt.
- Mere end ét ark (for et tracé, brug [plan- og længdeprofilark](topic:plan-profile-sheets)), viewports, en brugerdefineret titelblok eller stående ark.

:::note
Dialogen siger, at skråningspile kun vises på skærmen. I denne version plottes skråningspile, der er tændt under **Visning**, (og eksporteres til DXF). Slå dem fra før plot, hvis du ikke ønsker dem.
:::

## Udskrivning på papir

Åbn den downloadede PDF i en hvilken som helst PDF-fremviser, og udskriv den i 100 % (faktisk størrelse), så målestoken forbliver korrekt. »Tilpas til side« ændrer målestoken.
