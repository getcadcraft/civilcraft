---
title: Ange ett polygontåg och justera det med kompassregeln
summary: Skriv in vinklar eller riktningsvinklar och avstånd, kontrollera vinkel- och längdmisslutningen samt precisionen, justera med kompassregeln och lägg till stationerna som punkter eller slingan som fastighet.
keywords: polygontåg, slutet polygontåg, slinga, högervinklar, bakåtsikt, riktningsvinklar, avstånd, misslutning, precision, kompassregeln, bowditch, justering, mätning
from: 56ce5a8c
---

Ett polygontåg är en följd av uppmätta sträckor: vid varje station en vinkel (eller en riktningsvinkel) och ett avstånd till nästa. Klicka på **Ange ett polygontåg** under **Polygontåg** i högerpanelen när inget är markerat.

## Var det börjar och slutar

1. **Start vid punkt**: dess nummer. Eller skriv in ett nordvärde och ett östvärde.
2. **Sträckor som**: **Högervinklar och avstånd**, eller **Riktningsvinklar och avstånd**.
3. Med vinklar anger du var de börjar: en **bakåtsiktspunkt**, eller **dess azimut** (från första stationen mot bakåtsikten, medurs från norr).
4. **Slut**: **tillbaka vid start (en slinga)**, eller **på punkt** och dess nummer (ett öppet polygontåg mellan kända punkter).

## Skriv in sträckorna

En sträcka per rad: först vinkeln, sedan avståndet och sist, om du vill, ett namn på stationen den når:

- Högervinklar, medurs vid stationen sträckan lämnar, från stationen bakom till nästa: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` och `270.0028` fungerar också.
- Riktningsvinklar: `N 45°30'15" E 125.50 B`, eller en azimut som ett ord: `AZ 45-30-15 125.50 B`.
- I en slinga med vinklar avslutar du med `close` och vinkeln vid start igen, vriden från sista stationen till den andra: `close 270°00'05"`. Det är den som kontrollerar vinklarna.

Rader som inte kan läsas listas med sina radnummer. "feet", kommatecken och `#`-kommentarsrader godkänns.

## Läs misslutningen

Medan du skriver visar dialogrutan:

- **Vinkelmisslutning**: hur långt vinklarna är från att sluta, och den andel varje vinkel får. Utan en avslutande vinkel kontrolleras inte vinklarna, och eventuella fel i dem syns i längdmisslutningen.
- **Längdmisslutning**: hur långt från där polygontåget borde sluta det faktiskt slutar, och i vilken riktning.
- **Precision**: polygontågets längd delat med längdmisslutningen: 1 : 10,000 betyder 1 ft på 10,000 ft.
- Stationerna efter justeringen, och hur långt var och en flyttades.

## Justeringen

Först fördelas vinkelmisslutningen jämnt över vinklarna. Sedan fördelas längdmisslutningen över sträckorna med kompassregeln (Bowditch): varje station flyttas mot misslutningen i proportion till den längd som färdats för att nå den, så att polygontåget slutar exakt där det ska.

:::note
Kompassregeln är en standardjustering, inte en minsta kvadrat-justering, och den väger inte vinklar mot avstånd. Om precisionen är tillräckligt god är en fråga för dina egna standarder och din jurisdiktions.
:::

## Använd resultatet

- **Lägg till som punkter**: de justerade stationerna blir punkter med de namn du angav (annars nästa lediga nummer), beskrivningen `TRAV` och ingen höjd. En slings sista station är dess start, så den läggs inte till två gånger. Ett steg: {{key:Mod+Z}} ångrar det.
- **Lägg till som fastighet** (slingor): de justerade stationerna blir en [fastighet](topic:parcels), med dess etiketter och fastighetsbeteckning.
- **Rapport (CSV)**: misslutningsraderna, sedan varje stations riktning, avstånd, koordinater före och efter justering samt korrigeringar.
