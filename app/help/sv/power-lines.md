---
title: Arbetsytan Kraftledningar
summary: Luftledningar och underjordiska kablar på din plats, med egna bibliotek, hängning och spänning under dina lastfall, kontroller av fri höjd och hållfasthet, uppspänningstabeller, mängder, blad och GIS-export.
keywords: kraftledning, luftledning, elektrisk, distribution, stolpar, stöd, lina, hängning, spänning, uppspänning, fri höjd, underjordisk kabel, kabelgrav, arbetsyta, nät
from: 638dd856
---

Arbetsytan Kraftledningar placerar luftledningar och underjordiska kablar på den CivilCraft-plats du redan har: samma mätpunkter, samma mark, samma projektfil.

:::warning
Ett konstruktionsstöd. Arbetsytan räknar ut hängning, spänning, fria höjder och laster utifrån **dina** lastfall och gränsvärden; ingen lands standard är inbyggd. En ingenjör kontrollerar varje resultat mot den standard som gäller innan något byggs.
:::

## Öppna den

Välj {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Kraftledningar}}, eller **Kraftledningar** under Arbetsyta. Verktygsfältet visar sedan en grupp **Kraftledningar**; grupperna Design och GIS träder åt sidan. Välj **Civil** under Arbetsyta för att gå tillbaka. CivilCraft kommer ihåg den arbetsyta du använde sist på den här datorn.

Den vänstra panelen får två avsnitt överst:

- **Kraftledningar**: dina lastfall och gränsvärden, linjerna och kablarna i projektet samt **Kontroller**, alltid uppdaterade. Klicka på en kontroll för att markera det den gäller.
- **Bibliotek**: dina egna linor, kablar, stöd, utrustning och kabelgravtyper. Se [Ditt bibliotek för kraftledningar](topic:power-line-library).

## Vad som finns i gruppen Kraftledningar

| Verktyg | Vad det gör | Ämne |
|---|---|---|
| **Linje** | En luftledning: klicka på varje stöd | [Rita en luftledning](topic:overhead-line) |
| **Stöd** | Lägg till ett stöd på ett spann | [Rita en luftledning](topic:overhead-line) |
| **Kabel** | En underjordisk kabelrutt i en kabelgrav | [Underjordiska kablar](topic:underground-cables) |
| **Utrustning** | Ett skåp, en transformator, en skarv eller källan som nätet matas från | [Underjordiska kablar](topic:underground-cables) |
| **Hinder** | Något en linje korsar: en väg, en byggnad, en annan linje | [Kontroller](topic:power-line-checks) |
| **Profil** | Linjeprofilen: mark, stöd och linan vid varje lastfall | [Rita en luftledning](topic:overhead-line#the-line-profile) |
| **Mer** | Lastfall och gränsvärden, uppspänningstabeller, mängder, blad och rapport, GIS, studiefiler | [Hängning och spänning](topic:sag-and-tension), [Resultat](topic:power-line-outputs), [Studiefiler](topic:power-line-study-file) |

Allt du lägger till är ett ångra-steg, sparas i projektfilen och ritas i planen på lager med namnen `C-POWR-…`, så att DXF-, DWG- och PDF-exporten också innehåller det.
