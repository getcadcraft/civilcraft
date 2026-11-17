---
title: WaterCraft: potrošnja, protok za gašenje požara, prekidi i starost vode
summary: Uz dodatak WaterCraft pretvorite korisnike u potrošnju na vašim vodovodnim cijevima, provjerite protok dostupan na svakom hidrantu, vidite koji prekid cijevi najviše šteti i pratite starost vode i hlor kroz jedan dan.
keywords: watercraft, distribucija vode, potrošnja, korisnici, faktor vršnosti, obrazac potrošnje, protok za gašenje požara, hidrant, preostali pritisak, kritičnost, prekid, dionica sa ventilom, starost vode, hlor, ostatak, praćenje izvora, slijepi kraj, csv, dodatak
from: 76809f01
---

WaterCraft je dodatak koji radi na vodovodnoj mreži koju ste već nacrtali alatima za [Vodovodne cijevi](topic:water-mains). Dodaje karticu u desnom panelu sa četiri odjeljka.

:::warning
Samo pomoćno sredstvo za proračun. Provjereno je na ručno izračunatim odgovorima na izmišljenim mrežama, a ne na stvarnom modelu komunalnog preduzeća. Inženjer za vodu mora provjeriti svaki rezultat. Još nema crpnih stanica, razgradnje drugog reda ni scenarija.
:::

## Šta ćete raditi

- Postavite korisnike na mrežu kao potrošnju.
- Pronađite hidrante kojima nedostaje protok koji vam treba.
- Pronađite cijevi čiji gubitak najviše važi.
- Pronađite staru vodu i nizak nivo hlora.

## Koraci

1. Otvorite {{ui:Postavke}} › {{ui:Dodaci}} i uključite {{ui:WaterCraft (distribucija vode)}}. Kartica {{ui:WaterCraft}} se pojavljuje u desnom panelu.
2. Prvo nacrtajte rezervoar, čvorove i cijevi alatima za vodovodne cijevi (vidi [Vodovodne cijevi](topic:water-mains)). Bez mreže kartica vam to kaže.
3. Pod {{ui:Potrošnja}} nalijepite jednog korisnika po redu: id, x, y, vrsta, količina. Izaberite {{ui:Faktor vršnosti}} i {{ui:Satni obrazac}} (stambeni dan, poslovni dan, ravan, ili zadržite postojeći obrazac). Pritisnite {{ui:Provjeri}} da vidite na koji čvor se svaki korisnik oslanja (najbliži čvor), zatim {{ui:Stavi u mrežu}}. {{ui:Poništi}} vraća potrošnju.
4. Pod {{ui:Protok za gašenje požara}} postavite potrebni protok i preostali pritisak, izaberite da li se preostali pritisak drži {{ui:Samo na hidrantu}} ili {{ui:Svuda u sistemu (strože)}}, i pritisnite {{ui:Dužina kraka}}. Svaki hidrant je naveden od najgoreg, kao zadovoljava ili nedostaje.
5. Pod {{ui:Koja cijev je najvažnija}} izaberite {{ui:jednu cijev po jednu}} ili {{ui:jednu dionicu sa ventilom po jednu}} i pritisnite {{ui:Dužina kraka}}. Svaki prekid prikazuje isključenu potrošnju, isključene čvorove, čvorove koji su novo pali ispod minimalnog pritiska i najniži pritisak koji ostaje.
6. Pod {{ui:Starost vode i hlor}} izaberite šta pratiti (starost vode, hlor ili praćenje izvora), postavite sate izvođenja i granice koje želite, i pritisnite {{ui:Dužina kraka}}. Čvorovi izvan vaših granica su navedeni.
7. Pritisnite {{ui:Spasi kao CSV}} ispod bilo koje tabele da je sačuvate.

## Napomene

- Potrebni protok za gašenje požara i potrošnja po kući ili po akru su početne vrijednosti, a ne standardi. Koristite vlastite podatke vašeg komunalnog preduzeća.
- Cijev koju ventil dijelom presijeca zatvara se cijela, pa je prikazani prekid malo gori od stvarnog.
- Pokrenite dio o kvaliteti vode dovoljno dugo da se dnevni obrazac ponovi prije nego što pročitate posljednji dan.
- {{ui:Zaustavi}} prekida dugo izvođenje ranije; lista tada pokazuje samo ono što je urađeno.
- Vaša mreža ostaje u ovom projektu i na ovom računaru. Ništa se nigdje ne šalje.
