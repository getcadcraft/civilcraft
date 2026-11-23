---
title: WaterCraft: potražnje, protupožarni protok, ispadi i starost vode
summary: S dodatkom WaterCraft pretvorite korisnike u potražnje na vodovodnoj mreži, provjerite protok dostupan na svakom hidrantu, pogledajte koji ispad magistrale najviše šteti te pratite starost vode i klor kroz dan.
keywords: watercraft, raspodjela vode, potražnje, korisnici, faktor vršnog opterećenja, obrazac potražnje, protupožarni protok, hidrant, preostali tlak, kritičnost, ispad, dionica s ventilima, starost vode, klor, preostalo, praćenje izvora, slijepi kraj, csv, dodatak
from: 066fb17a
---

WaterCraft je dodatak koji radi na vodovodnoj mreži koju ste već nacrtali alatima za vodovodne cijevi. Dodaje karticu u desni panel s četiri odjeljka.

:::warning
Samo pomoćno sredstvo za proračun. Provjereno je na izmišljenim mrežama, a ne na stvarnom modelu komunalnog poduzeća. Inženjer za vodu mora provjeriti svaki rezultat. Scenariji, pravila upravljanja, ventili i terenska očitanja imaju vlastite teme, „Scenariji“ i „Studije“, u pomoći dodatka WaterCraft.
:::

## Što ćete raditi

- Stavite korisnike na mrežu kao potražnje.
- Pronađite hidrante koji ne dosežu potrebni protok.
- Pronađite cijevi čiji gubitak najviše važi.
- Pronađite staru vodu i nizak klor.

## Koraci

1. Otvorite {{ui:Postavke}} › {{ui:Dodaci}} i uključite {{ui:WaterCraft (distribucija vode)}}. Kartica {{ui:WaterCraft}} pojavljuje se u desnom panelu.
2. Prvo nacrtajte spremnik, čvorove i cijevi alatima za vodovodne cijevi (vidi [Vodovodne cijevi](topic:water-mains)). Bez mreže kartica vam to kaže.
3. Pod {{ui:Potražnje}} zalijepite jednog korisnika po retku: id, x, y, vrsta, količina. Odaberite {{ui:Faktor vršnog opterećenja}} i satni obrazac (stambeni dan, poslovni dan, ravnomjerno ili zadrži obrazac kakav jest). Pritisnite {{ui:Provjeri}} da vidite gdje svaki korisnik pada (najbliži čvor), zatim {{ui:Stavi u mrežu}}. Poništavanje vraća potražnje.
4. Pod {{ui:Protupožarni protok}} postavite potrebni protok i preostali tlak, odaberite drži li se preostali tlak {{ui:Samo na hidrantu}} ili {{ui:Svugdje u sustavu (strože)}}, i pritisnite {{ui:Dužina}}. Svaki hidrant navodi se od najlošijeg, kao zadovoljava ili manjak.
5. Pod {{ui:Koja cijev je najvažnija}} odaberite {{ui:jedna po jedna cijev}} ili {{ui:jedna po jedna dionica s ventilima}} i pritisnite {{ui:Dužina}}. Svaki ispad pokazuje odsječenu potražnju, odsječene čvorove, čvorove koji su novi ispod minimalnog tlaka i najniži preostali tlak.
6. Pod {{ui:Starost vode i klor}} odaberite što pratiti (starost vode, klor ili praćenje izvora), postavite broj sati i granice koje želite te pritisnite {{ui:Dužina}}. Čvorovi izvan vaših granica su navedeni.
7. Pritisnite {{ui:Spremi kao CSV}} pod bilo kojom tablicom da je zadržite.

## Napomene

- Potrebni protok za gašenje i potrošnja po kući ili po hektaru su početne vrijednosti, a ne norme. Upotrijebite vlastite brojke komunalnog poduzeća.
- Cijev koju ventil djelomično siječe zatvara se cijela, pa je prikazani ispad malo gori od stvarnog.
- Pokrenite dio o kvaliteti vode dovoljno dugo da se dnevni obrazac ponovi prije nego što pročitate zadnji dan.
- {{ui:Zaustavi}} prekida dugo izvođenje; popis tada prikazuje samo ono što je učinjeno.
- Vaša mreža ostaje u ovom projektu i na ovom računalu. Ništa se nigdje ne šalje.
