---
title: WaterCraft: potrošnja, protok za gašenje požara, prekidi i starost vode
summary: Uz dodatak WaterCraft pretvorite potrošače u potrošnju na vašim vodovodnim magistralama, proverite protok dostupan na svakom hidrantu, vidite koji prekid magistrale najviše šteti i pratite starost vode i hlor tokom dana.
keywords: watercraft, distribucija vode, potrošnja, potrošači, faktor vršnog opterećenja, obrazac potrošnje, protok za gašenje požara, hidrant, rezidualni pritisak, kritičnost, prekid, deonica sa ventilom, starost vode, hlor, rezidual, praćenje izvora, slepi kraj, csv, dodatak
from: 76809f01
---

WaterCraft je dodatak koji radi na vodovodnoj mreži koju ste već nacrtali alatkama za vodovodne magistrale (Water mains). Dodaje karticu u desni panel sa četiri odeljka.

:::warning
Samo pomoćno sredstvo za proračun. Proveren je na ručno izračunatim odgovorima za izmišljene mreže, a ne na pravom modelu vodovodnog preduzeća. Inženjer za vodu mora da proveri svaki rezultat. Još nema crpnih stanica, razgradnje drugog reda ni scenarija.
:::

## Šta ćete raditi

- Postavite potrošače na mrežu kao potrošnju.
- Pronađite hidrante kojima nedostaje protok koji vam je potreban.
- Pronađite magistrale čiji gubitak najviše znači.
- Pronađite staru vodu i nizak nivo hlora.

## Koraci

1. Otvorite {{ui:Settings}} › {{ui:Add-ons}} i uključite {{ui:WaterCraft (water distribution)}}. U desnom panelu pojaviće se kartica {{ui:WaterCraft}}.
2. Prvo nacrtajte rezervoar, čvorove i cevi alatkama za vodovodne magistrale (pogledajte [Vodovodne magistrale](topic:water-mains)). Bez mreže kartica vam to kaže.
3. Pod {{ui:Demands}} nalepite jednog potrošača po redu: id, x, y, vrsta, količina. Izaberite {{ui:Peaking factor}} i {{ui:Hourly pattern}} (dnevni obrazac stambenog tipa, poslovni dan, ravan ili zadržite postojeći obrazac). Pritisnite {{ui:Check}} da vidite gde svaki potrošač pada (najbliži čvor), pa zatim {{ui:Put into the network}}. Opozovi vraća potrošnju.
4. Pod {{ui:Fire flow}} zadajte potreban protok i rezidualni pritisak, izaberite da li se rezidual drži {{ui:At the hydrant only}} ili {{ui:Everywhere in the system (stricter)}}, i pritisnite {{ui:Run}}. Svaki hidrant je naveden od najlošijeg, kao „zadovoljava“ ili „nedostaje“.
5. Pod {{ui:Which main matters most}} izaberite {{ui:one pipe at a time}} ili {{ui:one valved section at a time}} i pritisnite {{ui:Run}}. Svaki prekid prikazuje odsečenu potrošnju, odsečene čvorove, čvorove koji su tek pali ispod minimalnog pritiska i najniži pritisak koji ostaje.
6. Pod {{ui:Water age and chlorine}} izaberite šta pratite (starost vode, hlor ili praćenje izvora), zadajte sate za računanje i granice koje želite, i pritisnite {{ui:Run}}. Čvorovi van vaših granica su navedeni.
7. Pritisnite {{ui:Save as CSV}} ispod bilo koje tabele da je sačuvate.

## Napomene

- Potreban protok za gašenje požara i potrošnja po kući ili po acre su početne vrednosti, a ne standardi. Koristite sopstvene podatke vašeg vodovodnog preduzeća.
- Cev koju delimično zatvara ventil računa se kao potpuno zatvorena, pa je prikazani prekid malo gori od stvarnog.
- Pustite odeljak kvaliteta vode dovoljno dugo da se dnevni obrazac ponovi pre nego što pročitate poslednji dan.
- {{ui:Stop}} prekida dugo izračunavanje pre vremena; lista tada prikazuje samo ono što je urađeno.
- Vaša mreža ostaje u ovom projektu i na ovom računaru. Ništa se nigde ne šalje.
