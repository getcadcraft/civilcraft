---
title: WaterCraft: potrošnja, protupožarni protok, prekidi i starost vode
summary: Uz dodatak WaterCraft pretvorite korisnike u potrošnju na vodovodnim cijevima, provjerite protok koji je dostupan na svakom hidrantu, pronađite prekid koji najviše šteti i pratite starost vode i klor tijekom dana.
keywords: watercraft, distribucija vode, potrošnja, korisnici, faktor vršnog opterećenja, uzorak potrošnje, protupožarni protok, hidrant, preostali tlak, kritičnost, prekid, sekcija s ventilom, starost vode, klor, rezidual, praćenje izvora, slijepi kraj, csv, dodatak
from: 76809f01
---

WaterCraft je dodatak koji radi na vodovodnoj mreži koju ste već nacrtali alatima za vodovodne cijevi. Dodaje karticu u desnu ploču s četiri odjeljka.

:::warning
Samo pomoćno sredstvo za izračun. Provjereno je na ručno izračunatim odgovorima na izmišljenim mrežama, a ne na stvarnom modelu komunalnog poduzeća. Vodoprivredni inženjer mora provjeriti svaki rezultat. Crpne stanice, razgradnja drugog reda i scenariji još nisu dostupni.
:::

## Što ćete raditi

- Stavite korisnike na mrežu kao potrošnju.
- Pronađite hidrante koji ne zadovoljavaju protok koji vam treba.
- Pronađite glavne cijevi čiji prekid najviše šteti.
- Pronađite staru vodu i nizak klor.

## Koraci

1. Otvorite {{ui:Postavke}} › {{ui:Dodaci}} i uključite {{ui:WaterCraft (distribucija vode)}}. Kartica {{ui:WaterCraft}} pojavit će se u desnoj ploči.
2. Prvo nacrtajte spremnik, čvorove i cijevi alatima za vodovodne cijevi (vidi [Vodovodne cijevi](topic:water-mains)). Bez mreže kartica vas na to upućuje.
3. Pod {{ui:Potrošnja}} zalijepite jednog korisnika po retku: id, x, y, vrsta, količina. Odaberite {{ui:Faktor vršnog opterećenja}} i {{ui:Satni uzorak}} (stambeni dan, poslovni dan, ravnomjerno ili zadrži uzorak kakav jest). Pritisnite {{ui:Provjeri}} da vidite gdje se svaki korisnik nalazi (najbliži čvor), zatim {{ui:Stavi u mrežu}}. {{ui:Poništi}} vraća potrošnju.
4. Pod {{ui:Protupožarni protok}} postavite potreban protok i preostali tlak, odaberite drži li se preostali tlak {{ui:Samo na hidrantu}} ili {{ui:Svugdje u sustavu (strože)}}, i pritisnite {{ui:Dužina}}. Svaki hidrant navodi se od najgoreg, kao zadovoljava ili manjka.
5. Pod {{ui:Koja glavna cijev je najvažnija}} odaberite {{ui:jedna cijev odjednom}} ili {{ui:jedna sekcija s ventilom odjednom}} i pritisnite {{ui:Dužina}}. Svaki prekid prikazuje odsječenu potrošnju, odsječene čvorove, čvorove koji su tek pali ispod najmanjeg tlaka i najniži tlak koji ostaje.
6. Pod {{ui:Starost vode i klor}} odaberite što pratiti (starost vode, klor ili praćenje izvora), postavite broj sati i granice koje želite, pa pritisnite {{ui:Dužina}}. Čvorovi izvan vaših granica navode se u popisu.
7. Pod bilo kojom tablicom pritisnite {{ui:Spremi kao CSV}} da je zadržite.

## Napomene

- Potrebni protok za gašenje požara te potrošnja po kućanstvu ili po akru polazne su vrijednosti, a ne standardi. Koristite vlastite podatke komunalnog poduzeća.
- Cijev koju ventil dijelom presijeca zatvara se u cijelosti, pa je prikazani prekid malo gori od stvarnog.
- Pokrenite odjeljak o kvaliteti vode dovoljno dugo da se dnevni uzorak ponovi prije nego što čitate posljednji dan.
- {{ui:Zaustavi}} prekida dugi izračun ranije; popis tada prikazuje samo ono što je učinjeno.
- Vaša mreža ostaje u ovom projektu i na ovom računalu. Ništa se nigdje ne šalje.
