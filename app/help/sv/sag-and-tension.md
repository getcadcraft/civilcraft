---
title: Hängning och dragkraft
summary: Dina lastfall (temperatur, vind, is) och gränser för dragkraft, hur CivilCraft räknar ut varje sektions dragkraft och uppspänningstabellerna.
keywords: hängning, dragkraft, lastfall, temperatur, vind, is, asymmetrisk islast, avgörande spännvidd, ekvivalent spännvidd, tillståndsändring, kedjelinje, uppspänningstabell, brottstyrka, vardagsspänning
from: f8876c35
---

## Lastfall och gränser

{{ui:Mer}} › {{ui:Lastfall och gränser…}} redigerar reglerna som varje ledning i projektet följer.

- **Lastfall**: en temperatur, ett vindtryck på ledaren (Pa) och radiell is (mm, med dess densitet). Det första fallet är referensen.
- **Gränser för dragkraft**: en andel av ledarens brottstyrka, på den horisontella dragkraften eller på den största dragkraften vid en stolpe, i ett lastfall. Eller ange den horisontella dragkraften själv.
- **Fria höjder**: den fria höjd ledaren håller över marken, en väg, en byggnad och så vidare. Lägg till, byt namn på och ta bort dem: de är dina. Under dem väljer du reglerna för **Växtlighet under en ledning**, **Murar under en ledning** och **Underjordiska korsningar**.
- **Fall som kontrollerna använder**: vilket fall som ger största hängningen (varmt), isolatorns svängning (vind), is och is på ena sidan av en stolpe.
- **Faktorer**: fasavståndsfaktor k, största isolatorsvängning, en faktor på stolp- och kopplingslaster, vinkelvärdena som avgör vilka stolpar som är vinkel- och ändstolpar, minsta täckning över nedgrävda kablar och det största spänningsfallet.

## Paket: regler och ett bibliotek för ett land

Inga lands regler är inbyggda i CivilCraft. Ett **paket** håller en regeluppsättning och ett bibliotek ihop i en fil (`.cclinepack.json`), för ett land, en nätoperatör eller ett företag:

- **Spara som paket…** i {{ui:Lastfall och gränser…}} skriver den visade regeluppsättningen och ditt bibliotek (eller, när ditt bibliotek ännu är tomt, de objekt projektet använder). Skriv in **Land eller region** först.
- **Öppna en regeluppsättning eller ett paket…** läser ett paket, en regelfil eller en biblioteksfil. Ett pakets regler visas i dialogen (klicka på **Verkställ** för att använda dem), och dess objekt går in i ditt bibliotek.
- Paket som andra delar listas på tilläggssidan under **Kraftledningspaket**. Två exempelpaket visar formatet; de är inte något lands regler.

Varje paket kontrolleras när det öppnas, som vilken fil som helst. Kontrollera varje värde mot den gällande standarden innan något byggs.

Det finns två exempelregeluppsättningar att utgå från: **Exempel: kallt klimat** och **Exempel: milt klimat**. Deras värden kommer från ingen standard: ange de värden din standard ger. {{ui:Spara regler}} och {{ui:Öppna regler…}} delar en regeluppsättning som en fil.

## Så räknas dragkraften ut

För varje sektion mellan ändstolpar:

1. Den **avgörande spännvidden** är √(ΣL³ ÷ ΣL) av dess spännvidder.
2. Varje gräns görs om till en horisontell dragkraft i referensfallet genom **tillståndsändringsekvationen** på den avgörande spännvidden: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Den mest begränsande sätter dragkraften.
3. Varje lastfalls dragkraft följer av den, och varje spännvidds form är den exakta **kedjelinjen** genom dess två fästpunkter (även spännvidder i en lutning): hängning från korden, längd och dragkraften i varje ände.

Lasten per meter i ett fall: vikten plus is (islyta × densitet × g) vertikalt; vindtryck × den isbelagda diametern horisontellt.

## Uppspänningstabeller

{{ui:Mer}} › {{ui:Uppspänningstabeller…}} listar för varje sektion den horisontella dragkraften och varje spännvidds hängning vid varje temperatur i regeluppsättningen (−5 °C till 40 °C med 5 °C steg att börja med), i stilla luft. Spara dem, och stolptabellen, som CSV.

Inte medräknat: ledarens krypning över åren, och töjningen hos en ny ledare. Lägg till dem genom de temperaturer du spänner vid.
