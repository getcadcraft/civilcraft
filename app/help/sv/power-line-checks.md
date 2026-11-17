---
title: Kontroller för kraftledningar
summary: Vad CivilCraft kontrollerar på varje lina och kabel, alltid uppdaterat: fri höjd, avstånd, utsving, uppåtlyft, last på stöd och dimensionering, beslag, stag, grunder, saknade data, anslutningar, överlast och spänningsfall.
keywords: kontroller, fri höjd, hinder, korsning, fasavstånd, isolatorutsving, uppåtlyft, last på stöd, nominell last, dimensionering, grund, stag, barduner, beslag, tvärarm, spänningsfall, överlast, saknade data, frånkopplad
from: e6a0da47
---

**Kontroller** i avsnittet Kraftledningar listar varje problem, rött för det som inte klarar kravet och gult för varningar. Klicka på ett för att markera linan, stödet, kabeln eller utrustningen det gäller; stöd och spann som inte klarar kraven ringas in i rött i planen medan arbetsytan är öppen.

:::warning
Ett konstruktionsstöd: det här är kontroller av din konstruktion mot dina egna regler, inte ett intyg.
:::

## Fri höjd

Linans lägsta fas följs längs varje spann vid varje lastfall. Dess lägsta fria höjd över marken måste nå linjens **Regel för fri höjd**. Där ett spann korsar ett **hinder** (ritat med {{ui:Hinder}}: en punkt eller en linje, med sin höjd över marken och sin egen regel för fri höjd), kontrolleras den fria höjden över hindrets topp på samma sätt.

**Det som arbetsytan Landskap placerar ovanför marken räknas också.** Enskilda växter (deras krona vid full utbredning och höjd), häckar och planteringsbäddar (den högsta arten i dem) och murar (deras överkant) är hinder under en lina, utan att ritas om. De behåller reglerna som anges i {{ui:Lastfall och gränser…}}: **Landskapsväxter under en lina** (exempeluppsättningarna använder *Träd och växter*, 3 m) och **Landskapsmurar under en lina** (*Byggnad*); välj **Kontrolleras inte** för att utesluta dem. Den fria höjden mäts rakt upp från växtens eller murens överkant till linan där spannet korsar den; avståndet i sidled till en krona bredvid linan kontrolleras inte. Att flytta ett träd eller höja en mur ändrar kontrollerna direkt.

Dina regler för fri höjd är dina egna: öppna dem med **Regler…** bredvid en **Regel för fri höjd** (eller {{ui:Lastfall och gränser…}}) för att lägga till, byta namn på, ändra eller ta bort dem.

## Avstånd och utsving

- Nödvändigt **fasavstånd**: k·√(hängning + isolatorlängd) + U/150, med hängningen i det varma lastfallet och spänningen U i kV (en vanlig form; k hämtas från din regeluppsättning). Jämförs med tvärarmens fasavstånd.
- **Isolatorutsving** på bärstöd, i vindlastfallet: atan(tvärlast ÷ vertikal last), jämförs med regeluppsättningens största utsving.
- **Uppåtlyft**: ett bärstöd som är lägre än sina grannar kan dras uppåt i kyla; det flaggas.

## Laster på stöd och dimensionering

För varje stöd och lastfall, med alla linor i linjen:

- **Tvärgående**: vind per meter × vindspannet (halva av de två spannen), plus 2·H·sin(vinkel ÷ 2) vid en vinkel.
- **Längs linjen**: skillnaden mellan spänningarna på de två sidorna vid en ändstolpe eller vinkel; vid ett bärstöd endast under is på ena sidan (varje spann räknas för sig, vilket hamnar på den säkra sidan).
- **Vertikal**: vertikal last per meter × viktspannet (mellan de lägsta punkterna på vardera sidan) plus utrustningen.

Den horisontella lasten förs till stödets nominella punkt (ekvivalent last = last × fästhöjd ÷ höjd för den nominella punkten) och jämförs med dess **nominella last** × regeluppsättningens faktor. När den är för svag föreslås det minsta stödet av samma material i ditt bibliotek som klarar den. Ett stöd med ett **stag** överför den horisontella lasten till staget, som bär last ÷ sin(stagvinkel) och kontrolleras mot sitt eget värde.

**Beslag** (klämmor, isolatorer, tvärarmar) kontrolleras mot sin märklast: ett förankringsbeslag bär linans spänning, ett bärbeslag sin andel av den vertikala och tvärgående lasten. **Grunden** som visas är stödets djup i marken och ett hål som är något bredare än dess fot.

## Data, anslutningar och ström

- Ett objekt med ett nödvändigt fält tomt, eller en nyckel som inte finns i biblioteket.
- Ett kabelrutts slut, eller utrustning, som inte är anslutet till något.
- **Spänningsfall** och **ström** från varje källa (utrustning markerad som källa) till lasterna (kW och effektfaktor på utrustningen), längs luftledningsspann och kablar: √3·I·L·(R cos φ + X sin φ), med R vid 20 °C. Mer än kabelns strömvärde, eller mer spänningsfall än regeluppsättningen tillåter, flaggas.
