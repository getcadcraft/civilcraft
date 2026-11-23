---
title: WaterCraft: potražnje, protivpožarni protok, prekidi i starost vode
summary: Uz dodatak WaterCraft, pretvori korisnike u potražnje na svojim vodovodnim magistralama, proveri protok dostupan na svakom hidrantu, vidi koji prekid magistrale najviše šteti i prati starost vode i hlor kroz dan.
keywords: watercraft, distribucija vode, potražnje, korisnici, faktor vršnog opterećenja, obrazac potražnje, protivpožarni protok, hidrant, preostali pritisak, kritičnost, prekid, sekcija sa ventilom, starost vode, hlor, ostatak, praćenje izvora, slepi kraj, csv, dodatak
from: 066fb17a
---

WaterCraft je dodatak koji radi na vodovodnoj mreži koju si već nacrtao alatima za vodovodne magistrale. Dodaje karticu u desni panel sa četiri odeljka.

:::warning
Samo pomoć u proračunu. Proveravano je na izmišljenim mrežama prema ručnim rezultatima, a ne na pravom modelu komunalnog preduzeća. Inženjer za vodu mora proveriti svaki rezultat. Scenariji, pravila upravljanja, ventili i očitavanja na terenu imaju sopstvene teme, „Scenariji“ i „Studije“, u pomoći dodatka WaterCraft.
:::

## Šta ćeš raditi

- Postavljaš korisnike na mrežu kao potražnje.
- Nalaziš hidrante kojima nedostaje potrebni protok.
- Nalaziš magistrale čiji gubitak najviše znači.
- Nalaziš staru vodu i nizak hlor.

## Koraci

1. Otvori {{ui:Podešavanja}} › {{ui:Dodaci}} i uključi {{ui:WaterCraft (distribucija vode)}}. Kartica {{ui:WaterCraft}} se pojavljuje u desnom panelu.
2. Prvo nacrtaj rezervoar, čvorove i cevi alatima za vodovodne magistrale (pogledaj [Vodovodne magistrale](topic:water-mains)). Bez mreže kartica ti to kaže.
3. Pod {{ui:Potražnje}} nalepi jednog korisnika po redu: id, x, y, vrsta, količina. Izaberi {{ui:Faktor vršnog opterećenja}} i {{ui:Satni obrazac}} (stambeni dan, poslovni dan, ravan, ili zadrži obrazac kakav jeste). Pritisni {{ui:Proveri}} da vidiš gde svaki korisnik pada (najbliži čvor), pa {{ui:Dodaj u mrežu}}. Opozivanje vraća potražnje.
4. Pod {{ui:Protok za gašenje požara}} postavi potrebni protok i preostali pritisak, izaberi da li se preostali pritisak drži {{ui:Samo na hidrantu}} ili {{ui:Svuda u sistemu (strože)}}, i pritisni {{ui:Dužina kraka}}. Svaki hidrant je naveden od najlošijeg, kao zadovoljava ili nedovoljno.
5. Pod {{ui:Koja magistrala je najvažnija}} izaberi {{ui:jedna cev u isto vreme}} ili {{ui:jedna sekcija sa ventilom u isto vreme}} i pritisni {{ui:Dužina kraka}}. Svaki prekid pokazuje potražnju koja je odsečena, čvorove koji su odsečeni, čvorove koji su tek sada ispod minimalnog pritiska i najniži pritisak koji ostaje.
6. Pod {{ui:Starost vode i hlor}} izaberi šta pratiš (starost vode, hlor ili praćenje izvora), postavi sate rada i granice koje želiš, i pritisni {{ui:Dužina kraka}}. Čvorovi van tvojih granica su navedeni.
7. Pritisni {{ui:Sačuvaj kao CSV}} pod bilo kojom tabelom da je sačuvaš.

## Napomene

- Potrebni protivpožarni protok i potrošnja po domaćinstvu ili po acre su početne vrednosti, a ne standardi. Koristi sopstvene brojke komunalnog preduzeća.
- Cev koju delimično preseče ventil zatvara se cela, pa je prikazani prekid malo gori od pravog.
- Pusti odeljak kvaliteta vode dovoljno dugo da se dnevni obrazac ponovi pre nego što pročitaš poslednji dan.
- {{ui:Zaustavi}} prekida dugo izvršavanje; spisak tada prikazuje samo ono što je urađeno.
- Tvoja mreža ostaje u ovom projektu i na ovom računaru. Ništa se nigde ne šalje.
