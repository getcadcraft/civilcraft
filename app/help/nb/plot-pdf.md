---
title: Plott planen til PDF
summary: Plott alt eller gjeldende visning til en vektor-PDF på et standardark i ingeniør- eller metrisk målestokk, i layerfarger eller svart.
keywords: plott, utskrift, pdf, ark, målestokk, papirstørrelse, planark, publisering, tegningshode, nordpil, målestokklinje
from: 9af396ca
---

{{ui:PDF}} plotter planen til en vektor-PDF på ett ark, med tegningshode, nordpil og målestokklinje. PDF-en lages i nettleseren og lastes ned; den går ikke via nettleserens utskriftsdialog.

## Plott

1. Sett opp planen under **Visning**: flaten som vises, høydekurvintervallet og hva som er på. Plottet følger disse innstillingene.
2. Hvis bare en del av tomten skal med, zoom og panorer planen til den.
3. Klikk {{ui:PDF}} i gruppen **Eksporter**, eller trykk {{key:Mod+P}}.
   Dialogboksen **Plott planen til PDF** åpnes.
4. Velg **Område**: {{ui:Alt}} eller {{ui:Det som er på skjermen}}.
5. Velg **Papir**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 eller A1. Et prosjekt i fot starter på Tabloid, et prosjekt i meter på A3. Ark er alltid liggende.
6. Velg **Målestokk**. Listen merker den største målestokken som passer med «(passer)», og velger den.
   - Fot: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Velg **Farge**: {{ui:Layerfarger}} eller {{ui:Svart}}.
8. Les linjen under valgene. Den viser størrelsen på området på papir og arkstørrelsen, for eksempel «Området er 297 × 222 mm ved 1" = 40' på et ark på 432 × 279 mm (liggende)."
9. Klikk {{ui:Last ned PDF}}.
   Nettleseren laster ned `<name>.pdf`. Statuslinjen sier «Plottet <name>.pdf ved 1" = 40'».

Hvis området er større enn arket i valgt målestokk, sentreres plottet og kantene kuttes av. Velg målestokken merket «(passer)» eller et større ark.

## Hva som er på arket

- Planen, sentrert i tegneområdet, som ekte vektorer: høydekurver, etiketter, veglinjer med profilnummer, korridorer, byggeplater og dagslinjer, ledninger, punkter.
- Linjevekt etter layer: veglinjer, byggeplater og ledninger tykkere; trekanter og mindre høydekurver tynne.
- Et tegningshode langs bunnen med prosjektets **Navn**, målestokken, en merknad om høydekurvintervallet og hvilken flate (eksisterende eller formet), og dato og versjon til høyre.
- En nordpil øverst til høyre (plan-nord er opp) og en målestokklinje i tegningshodet.
- Kartlagene som vises under planen (et bilde, karfliser eller en karttjeneste), når **Kartlag under planen** er avkrysset: de tegnes som ett bilde av hele tegneområdet med 150 punkter per tomme, under linjetegningen, og kildehenvisningen til kartet legges i tegningshodet. CivilCraft venter inntil 8 sekunder på kartbilder som fortsatt kommer; mangler noen, sier statuslinjen fra om det.

Tekst bruker PDF-ens innebygde Helvetica. Tegn utenfor det vesteuropeiske settet (Windows-1252) skrives ut som «?», og statusmeldingen teller dem.

## Hva som ikke plottes

- Høydebånd.
- Profilvisningen. Plotting av profiler er ikke bygget ennå.
- Mer enn ett ark (for en veglinje, bruk [plan- og profilark](topic:plan-profile-sheets)), visningsområder, egen tegningshode eller stående ark.

:::note
Dialogboksen sier at fallpiler bare vises på skjermen. I denne versjonen plottes fallpiler som er slått på under **Visning** (og eksporteres til DXF). Slå dem av før plotting hvis de ikke skal være med.
:::

## Utskrift på papir

Åpne den nedlastede PDF-en i en hvilken som helst PDF-leser og skriv den ut med 100 % (faktisk størrelse), slik at målestokken stemmer. «Tilpass til side» endrer målestokken.
