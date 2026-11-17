---
title: Uvoz geodetskih točaka
summary: Otvorite CSV ili tekstualnu datoteku točaka, provjerite redoslijed stupaca u dijaloškom okviru Uvoz točaka, ispravite retke koji se ne mogu pročitati i razvrstajte točke u skupine.
keywords: uvoz točaka, csv, txt, pnezd, penzd, datoteka točaka, geodetska mjerenja, cogo točke, skupine točaka, stupci, sjever istok
from: ad33d88a
---

Datoteka točaka je tekstualna datoteka s jednom točkom po retku: broj točke, sjever, istok, visina i opis, poredani nekim redom, odvojeni zarezima, tabulatorima, točkama sa zarezom ili razmacima. CivilCraft je čita u pregledniku i odmah iz nje gradi površinu.

## Prije početka

- Znajte redoslijed stupaca ako možete (PNEZD i PENZD računalu izgledaju isto).
- Znajte jedinice. CivilCraft ih ne pretvara: postavite **Jedinice** u lijevoj ploči da odgovaraju datoteci (vidi [Jedinice, stacionaže i formati brojeva](topic:units-and-stations)).
- Koordinate mogu biti velike (koordinate sjevera i istoka u državnom koordinatnom sustavu u milijunima su u redu).

## Uvoz datoteke

1. Kliknite {{ui:Otvori}} na alatnoj traci ili pritisnite {{key:Mod+O}} i odaberite datoteku. Možete je i povući na tlocrt.
   Otvara se dijaloški okvir **Uvoz točaka** s nazivom datoteke, popisom **Stupci** postavljenim na {{ui:Prepoznaj}}, retkom sažetka i prvih šest točaka.
2. Pročitajte redak sažetka. Kaže koliko je točaka pročitano, kojim redoslijedom stupaca, kako je taj redoslijed pronađen i što razdvaja stupce. Tri načina na koja se redoslijed pronalazi:
   - „iz retka zaglavlja”: prvi redak imenuje stupce (Točka, Sjever, Istok, Visina, Opis ili X, Y, Z …). Ovo je najsigurnije.
   - „kako je odabrano”: odabrali ste redoslijed u **Stupci**.
   - „pogođeno iz broja stupaca i postavke redaka točaka (PNEZD) — provjerite nisu li sjever i istok zamijenjeni”: nije bilo upotrebljivog zaglavlja. Ako su vaše datoteke obično prvo istok, postavite **Redci točaka** na P, E, N, Z, D u [postavkama CivilCraft-a](topic:settings).
3. Provjerite tablicu pregleda. Njeni su stupci uvijek **Točka**, **Sjever**, **Istok**, **Visina**, **Opis**, bez obzira na redoslijed u datoteci. Sjever i istok stvarnog lokaliteta obično su jasno različitih veličina: ako izgledaju zamijenjeno, pogađanje je bilo krivo.
4. Ako je redoslijed krivi, odaberite ispravan u **Stupci** (npr. {{ui:PENZD — točka, istok, sjever, visina, opis}}). Sažetak i pregled odmah se ažuriraju.
5. Ispod pregleda potražite **Reci koji nisu pročitani**. Svaki redak navodi broj retka datoteke, razlog i početak retka. Vidi [Reci koji nisu pročitani](topic:import-points#rows-that-are-not-read).
6. Kliknite {{ui:Uvezi}}.
   Točke se pojavljuju na tlocrtu, prikaz se zumira na njih i površina se gradi. Statusna traka kaže, na primjer, „Uvezeno 276 točaka iz site.csv; površina: 546 trokuta.“

Ako projekt još nema naziv, preuzima naziv datoteke.

## Provjerite skupine

Svaka točka pripada skupini nazvanoj prema **prvoj riječi njenog opisa**, velikim slovima: „GRD”, „FL 12” i „fl” pripadaju skupinama GRD, FL i FL. Točke bez opisa idu u „(bez opisa)”.

1. Pogledajte tablicu pod **Točke** u lijevoj ploči: skupina, broj točaka i izbor **Površina**.
2. Svaka skupina počinje kao {{ui:Točke}}. Promijenite linije tokova, rubove kolnika, vrhove i nožice nagiba, grebene i slične kodirane linije u {{ui:Prijelomnica}}. Skupine koje ne smiju oblikovati teren (kontrolne točke, vrhovi stabala, komunalni stupovi snimljeni na vrhu) postavite na {{ui:Izostavljeno}}.
3. Kliknite točku na tlocrtu (s {{ui:Odaberi}}) da u desnoj ploči vidite njen broj, koordinate, visinu, opis i skupinu.

:::warning
Skupina prijelomnice spaja **sve** svoje točke u **jednu** liniju, po redoslijedu brojeva točaka. To radi kad je svaka kodirana linija snimljena redom s vlastitom šifrom. Dvije odvojene linije toka, obje kodirane „FL”, postaju jedna linija koja zigzaguje između njih. Ako su vaše šifre zajedničke, koristite alat {{ui:Prijelomnica}} da kliknete točke svake linije (vidi [Izrada i dorada površine](topic:build-surface)).
:::

## Reci koji nisu pročitani

| Prikazani razlog | Što znači | Što učiniti |
|---|---|---|
| „sjever ili istok nije broj” | Stupac koordinate sadrži tekst | Provjerite redoslijed stupaca ili zalutali tekstualni redak usred datoteke |
| „visina nije broj” | Stupac visine sadrži tekst | Pogrešan redoslijed stupaca ili opis u stupcu visine |
| „nema broja točke” | Stupac točke je prazan | Numerirajte točku ili odaberite redoslijed bez P (NEZD, NEZ …): točke se tada broje 1, 2, 3 … |
| „točka 12 se pojavljuje dvaput (prva se zadržava)” | Dva retka dijele broj | Preimenujte jedan od njih u datoteci ako su oba stvarna snimanja |
| „Stupaca: 3, očekivano: 5 (PNEZD)” | Redak je kratak | Prekinuta linija ili krivi redoslijed stupaca |

Točka s praznom visinom se zadržava, ali se ne koristi u površini. Pokazatelji **Točke** pokazuju koliko točaka ima visinu.

Retci koji počinju s `#`, `;` ili `//` su komentari i preskaču se. Prazni retci se također preskaču.

## Zamijeni ili dodaj točke

Ponovni uvoz **zamjenjuje** sve točke; ne dodaje im. Vaše osi trase, platoi, cijevi, nacrtane prijelomnice i granica ostaju. Povijest poništavanja se briše, pa spremite projekt prije ako biste možda htjeli stare točke natrag. Za spajanje dviju datoteka spojite ih u uređivaču teksta ili tablici prije uvoza (pazite na ponovljene brojeve točaka).

Točke se još ne mogu pomicati, uređivati ni brisati unutar CivilCraft-a. Ispravite ih u datoteci i ponovno uvezite.

## Povezano

- [Formati datoteka točaka](topic:point-file-formats): svi redoslijedi stupaca i kako se prepoznaju zaglavlja.
- [Izrada i dorada površine](topic:build-surface).
