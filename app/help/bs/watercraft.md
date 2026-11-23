---
title: WaterCraft: potrošnja, protok za gašenje požara, prekidi i starost vode
summary: Uz dodatak WaterCraft, pretvori kupce u potrošnju na svojim vodovodnim magistralama, provjeri protok dostupan na svakom hidrantu, vidi koji prekid magistrale najviše šteti, i prati starost vode i hlor kroz dan.
keywords: watercraft, distribucija vode, potrošnja, kupci, faktor vršnosti, obrazac potrošnje, protok za gašenje požara, hidrant, rezidualni pritisak, kritičnost, prekid, dionica s ventilom, starost vode, hlor, rezidual, praćenje izvora, slijepi kraj, csv, dodatak
from: 066fb17a
---

WaterCraft je dodatak koji radi na vodovodnoj mreži koju si već nacrtao alatima Vodovodne magistrale. Dodaje karticu u desni panel s četiri odjeljka.

:::warning
Samo pomoć pri proračunu. Provjerena je prema ručno dobijenim odgovorima na izmišljenim mrežama, a ne na stvarnom modelu komunalnog preduzeća. Inženjer za vodu mora provjeriti svaki rezultat. Scenariji, pravila upravljanja, ventili i terenska očitavanja imaju svoje teme, „Scenariji“ i „Studije“, u pomoći dodatka WaterCraft.
:::

## Šta ćeš raditi

- Postavi kupce na mrežu kao potrošnju.
- Pronađi hidrante kojima nedostaje protok koji ti treba.
- Pronađi magistrale čiji prekid najviše znači.
- Pronađi staru vodu i nizak hlor.

## Koraci

1. Otvori {{ui:Postavke}} › {{ui:Dodaci}} i uključi {{ui:WaterCraft (distribucija vode)}}. Kartica {{ui:WaterCraft}} se pojavljuje u desnom panelu.
2. Prvo nacrtaj rezervoar, čvorove i cijevi alatima Vodovodne magistrale (pogledaj [Vodovodne magistrale](topic:water-mains)). Bez mreže kartica ti to kaže da uradiš.
3. Pod {{ui:Potrošnja}}, zalijepi jednog kupca po redu: id, x, y, vrsta, količina. Izaberi {{ui:Faktor vršnosti}} i {{ui:Satni obrazac}} (stambeni dan, poslovni dan, ravan, ili zadrži obrazac kakav jeste). Pritisni {{ui:Provjeri}} da vidiš gdje svaki kupac pada (najbliži čvor), zatim {{ui:Stavi u mrežu}}. Poništavanje vraća potrošnju.
4. Pod {{ui:Protok za gašenje požara}}, postavi potrebni protok i rezidualni pritisak, izaberi da li se rezidual održava {{ui:Samo na hidrantu}} ili {{ui:Svuda u sistemu (strože)}}, i pritisni {{ui:Dužina kraka}}. Svaki hidrant je naveden od najgoreg, kao zadovoljava ili manjka.
5. Pod {{ui:Koja magistrala je najvažnija}}, izaberi {{ui:jedna cijev u isto vrijeme}} ili {{ui:jedna dionica s ventilom u isto vrijeme}} i pritisni {{ui:Dužina kraka}}. Svaki prekid prikazuje potrošnju koja je odsječena, čvorove koji su odsječeni, čvorove koji su novo pali ispod minimalnog pritiska i najniži preostali pritisak.
6. Pod {{ui:Starost vode i hlor}}, izaberi šta pratiti (starost vode, hlor ili praćenje izvora), postavi sate rada i granice koje želiš, i pritisni {{ui:Dužina kraka}}. Čvorovi van tvojih granica se navode.
7. Pritisni {{ui:Spasi kao CSV}} ispod bilo koje tabele da je sačuvaš.

## Napomene

- Potrebni protok za gašenje požara i potrošnja po kući ili po akru su početne vrijednosti, a ne standardi. Koristi sopstvene podatke svog komunalnog preduzeća.
- Cijev koju ventil djelimično presijeca zatvara se u cijelosti, pa je prikazani prekid malo gori od stvarnog.
- Pusti odjeljak kvaliteta vode dovoljno dugo da se dnevni obrazac ponovi prije nego što pročitaš posljednji dan.
- {{ui:Zaustavi}} rano završava dugi proces; spisak tada prikazuje samo ono što je urađeno.
- Tvoja mreža ostaje u ovom projektu i na ovom računaru. Ništa se nigdje ne šalje.
