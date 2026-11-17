---
title: Kalkylblad: scheman kopplade till objekten
summary: Sparade kalkylblad med rader från växter, planterade ytor, beläggning, murar, trappsteg, markmodifierare eller alla mängder; egna kolumner och formler, grupper och summor; CSV, XLSX och en tabell på bladen, alltid uppdaterade.
keywords: kalkylblad, förteckning, växtförteckning, förteckning över hårdgjorda ytor, mängder, kolumner, formel, summa, antal, grupp, filter, csv, xlsx, kalkylark, tabell på blad
from: 11bc1bac
---

{{ui:Kalkylblad}} (Landskap › Mer) öppnar projektets kalkylblad. Första gången görs **växtförteckningen** och **förteckningen över hårdgjorda ytor och areor** åt dig. Ett kalkylblad räknas ut från objekten varje gång det visas, skrivs ut eller läggs på ett blad: ändrar du en bädd ändras dess antal överallt.

- **Rader från**: växter (en rad per art, sort och storlek), planterade ytor, beläggning, murar, trappsteg, markmodifierare (schakt och fyllning) eller alla mängder.
- **Kolumner**: ett fält (`qty`, `area`, `botanical`, eller ett namn inom hakparenteser som `[Net area]`) eller en formel: `+ - * / ^ %`, `&` för att foga ihop text, `= <> < <= > >=`, och `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. En formel som inte går att räkna ut visar `#ERR` (eller `#DIV/0`) i sin cell. Formler läses av CadCraft:s egen tolkare; ingenting i dem körs som kod.
- **Summa** per kolumn (summa, antal, medelvärde, minsta, största), **Gruppera efter** (delsummor per grupp) och **Bara rader där**.
- {{ui:Spara som CSV}}, {{ui:Spara som XLSX}} och **Lägg det här kalkylbladet på bladen** (Blad › Kalkylblad ritar det som en tabell, över så många blad som behövs).

Etiketter på växter och ytor använder samma fältnamn (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
