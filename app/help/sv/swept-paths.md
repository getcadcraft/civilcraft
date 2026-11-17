---
title: Fordons svepytor
summary: Kör ett fordon med upp till tre släpvagnar längs en funktionslinje eller en linjeföring, framåt eller bakåt, och se den yta det sveper över, dess hjulspår, styrningen och var det viker ihop sig.
keywords: svepyta, fordonsspårning, svängmall, dimensionerande fordon, lastbil, buss, släpvagn, påhängsvagn, backning, backa, knäckning, leddvinkel, styrlås, spårutvidgning, hjulspår, lastkaj, svängradie
from: 8caafb8a
---

En svepyta kör ett fordon längs en linje och visar marken som dess kaross passerar över. Använd den för att kontrollera att en lastbil kan ta en kurva, nå en lastkaj eller backa in en släpvagn utan att lämna beläggningen.

## Kör ett fordon längs en linje

1. Rita linjen som fordonet följer, i färdriktningen: en funktionslinje (bågar går bra: tryck på {{key:C}} medan du ritar den, se [Funktionslinjer](topic:feature-lines)) eller en linjeföring.
2. Markera den och klicka på {{ui:Svepyta…}} i dess **Palett**.
3. Under **Börja från** väljer du ett fordon och ställer sedan in dess mått utifrån ditt eget dimensionerande fordon: bredd, framöverhäng, axelavstånd, baköverhäng, spårvidd och **Styrlås**. Lägg till upp till tre släpvagnar, var och en med var den kopplas, dess längd från kopplingen till sin axel, dess överhäng och dess **Största leddvinkel**.
4. Välj **Körning**: framåt eller bakåt. Klicka på {{ui:Kör det}}.

:::warning
Fordonen att starta från är platshållare, inte en standard. Ange måtten utifrån det dimensionerande fordon som ditt projekt använder.
:::

## Framåt och bakåt

| Körning | Vad som följer linjen | Vad CivilCraft räknar ut |
|---|---|---|
| **Framåt** | Framaxelns mitt | Var bakaxeln och varje släpvagn hamnar, styrvinkeln och leddvinkeln |
| **Bakåt** | Sista axelns mitt (släpvagnens bakkant) | Var varje enhet framför hamnar, och den styrning hytten behöver för att få släpvagnen dit |

Backning är hur en backningsrörelse kontrolleras: säg var släpvagnen ska hamna, och CivilCraft säger om hytten klarar det.

## Läs resultatet

Svepytan ritas på planen i orange: dess kontur och, streckat, spåren för de yttersta hjulen. Markera den (klicka inuti den) för att se i **Palett**:

- **Körd längd**, den största **Styrvinkeln** och **Leddvinkeln** mot deras gränser, och **Svepad yta**.
- Varje problem längs linjen, med dess avstånd: styrningen förbi låset, eller en släpvagn som vrider sig förbi dess leddvinkelgräns (den viker ihop sig).
- **Fordonet längs linjen**: flytta reglaget för att se fordonet var som helst längs linjen, med dess styrning och leddvinkel där.

Ändrar du linjen följer svepytan med. {{ui:Redigera fordonet…}} ändrar måtten; **Körning** växlar mellan framåt och bakåt. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den. {{key:Delete}} tar bort den markerade svepytan (linjen finns kvar).

Konturen och hjulspåren skrivs till PDF, DXF och DWG på lager C-ROAD-SWPT.

## Så beräknas den

Varje enhet vrider sig kring sin bakaxels linje och dras av punkten framför den (framaxeln eller dragkopplingen), den lågfartsmodell utan glidning som svepkontroller använder. Svepytan är varje positions karosskontur lagd ihop. Den modellerar inte hastighet, däckglidning, den tid styrningen tar att vridas, styrda släpvagnar eller fri höjd under karossen.
