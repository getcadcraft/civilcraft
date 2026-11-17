---
title: Uvoz tačaka premera
summary: Otvori CSV ili tekstualnu datoteku sa tačkama, proveri redosled kolona u dijalogu Uvoz tačaka, popravi redove koji se ne mogu pročitati i razvrstaj tačke u grupe.
keywords: uvoz tačaka, csv, txt, pnezd, penzd, datoteka sa tačkama, premer, cogo tačke, grupe tačaka, kolone, sever istok
from: ad33d88a
---

Datoteka sa tačkama je tekstualna datoteka sa jednom tačkom po redu: broj tačke, sever, istok, kota i opis u nekom redosledu, odvojeni zarezima, tabulatorima, tačka-zarezima ili razmacima. CivilCraft je čita u pregledaču i odmah od nje pravi površ.

## Pre nego što počneš

- Znaj redosled kolona ako možeš (PNEZD i PENZD računaru izgledaju isto).
- Znaj njene jedinice. CivilCraft ne pretvara: postavi **Jedinice** u levom panelu da odgovaraju datoteci (vidi [Jedinice, stacionaže i formati brojeva](topic:units-and-stations)).
- Koordinate mogu biti velike (koordinate u državnoj projekciji sa severima i istocima u milionima su u redu).

## Uvezi datoteku

1. Klikni {{ui:Otvori}} na traci sa alatkama ili pritisni {{key:Mod+O}} i izaberi datoteku. Možeš je i prevući na plan.
   Otvara se dijalog **Uvoz tačaka** sa nazivom datoteke, listom **Kolone** postavljenom na {{ui:Otkrij}}, redom sa sažetkom i prvih šest tačaka.
2. Pročitaj red sa sažetkom. Kaže koliko je tačaka pročitano, u kom redosledu kolona, kako je taj redosled pronađen i šta razdvaja kolone. Tri načina na koja se redosled pronalazi:
   - „iz reda zaglavlja“: prvi red imenuje svoje kolone (Tačka, Sever, Istok, Kota, Opis, ili X, Y, Z …). Ovo je najbezbednije.
   - „kako je izabrano“: izabrao si redosled u **Kolone**.
   - „pogođeno iz broja kolona i podešavanja reda tačaka (PNEZD) — proveri da sever i istok nisu zamenjeni“: nije bilo upotrebljivog zaglavlja. Ako su tvoje datoteke obično prvo istok, postavi **Redovi tačaka** na P, E, N, Z, D u [podešavanjima CivilCraft-a](topic:settings).
3. Proveri tabelu pregleda. Njene kolone su uvek **Tačka**, **Sever**, **Istok**, **Kota**, **Opis**, bez obzira na redosled datoteke. Severi i istoci stvarnog lokaliteta su obično jasno različitih veličina: ako izgledaju zamenjeni, pogađanje je bilo pogrešno.
4. Ako je redosled pogrešan, izaberi tačan u **Kolone** (na primer {{ui:PENZD — tačka, istok, sever, kota, opis}}). Sažetak i pregled se odmah ažuriraju.
5. Pogledaj ispod pregleda za **Redovi koji nisu pročitani**. Svaki red navodi broj reda u datoteci, razlog i početak reda. Vidi [Redovi koji nisu pročitani](topic:import-points#rows-that-are-not-read).
6. Klikni {{ui:Uvoz}}.
   Tačke se pojavljuju na planu, prikaz se uvećava na njih i površ se gradi. Statusna traka kaže, na primer, „Uvezeno je 276 tačaka iz site.csv; površ: 546 trouglova.“

Ako projekat još nema ime, uzima ime datoteke.

## Proveri grupe

Svaka tačka pripada grupi nazvanoj po **prvoj reči njenog opisa**, velikim slovima: „GRD“, „FL 12“ i „fl“ su grupe GRD, FL i FL. Tačke bez opisa idu u „(bez opisa)“.

1. Pogledaj tabelu pod **Tačke** u levom panelu: grupa, broj tačaka i izbor **Površ**.
2. Svaka grupa počinje kao {{ui:Tačke}}. Promeni linije toka, ivice kolovoza, vrhove i nožice kosina, grebene i slične kodirane linije u {{ui:Linija loma}}. Grupe koje ne bi trebalo da oblikuju teren (kontrolne tačke, vrhovi drveća, stubovi komunalija snimljeni na vrhu) postavi na {{ui:Izostavljeno}}.
3. Klikni tačku na planu (sa {{ui:Izaberi}}) da u desnom panelu vidiš njen broj, koordinate, kotu, opis i grupu.

:::warning
Grupa linije loma spaja **sve** svoje tačke u **jednu** liniju, po redosledu brojeva tačaka. To radi kad je svaka kodirana linija snimljena po redu sa svojom šifrom. Dve odvojene linije toka, obe kodirane „FL“, postaju jedna linija koja cik-cak ide između njih. Ako su tvoje šifre zajedničke, koristi alat {{ui:Linija loma}} da klikneš tačke svake linije (vidi [Izrada i doterivanje površi](topic:build-surface)).
:::

## Redovi koji nisu pročitani

| Prikazani razlog | Šta znači | Šta da uradiš |
|---|---|---|
| „sever ili istok nije broj“ | Kolona koordinate sadrži tekst | Proveri redosled kolona, ili slučajan red teksta usred datoteke |
| „kota nije broj“ | Kolona kote sadrži tekst | Pogrešan redosled kolona, ili opis u koloni kote |
| „nema broja tačke“ | Kolona tačke je prazna | Dodeli broj tački, ili izaberi redosled bez P (NEZD, NEZ …): tačke se tada broje 1, 2, 3 … |
| „tačka 12 se javlja dva puta (prva je zadržana)“ | Dva reda dele broj | Preimenuj jedan u datoteci ako su oba prava snimanja |
| „3 kolone, očekivano 5 (PNEZD)“ | Red je kratak | Prekinut red, ili pogrešan redosled kolona |

Tačka sa praznom kotom se zadržava, ali se ne koristi u površi. Podaci o **Tačkama** pokazuju koliko tačaka ima kotu.

Redovi koji počinju sa `#`, `;` ili `//` su komentari i preskaču se. Prazni redovi se preskaču.

## Zameni ili dodaj tačke

Ponovni uvoz **zamenjuje** sve tačke; ne dodaje im. Tvoje trase, platoi, cevovodi, nacrtane linije loma i granica ostaju. Istorija opozivanja se briše, pa sačuvaj projekat pre nego što pomisliš da ti trebaju stare tačke. Da spojiš dve datoteke, spoji ih u uređivaču teksta ili tabelarnom programu pre uvoza (pazi na ponovljene brojeve tačaka).

Tačke se još ne mogu pomerati, menjati ili brisati unutar CivilCraft-a. Popravi ih u datoteci i uvezi ponovo.

## Povezano

- [Formati datoteka sa tačkama](topic:point-file-formats): svi redosledi kolona i kako se prepoznaju zaglavlja.
- [Izrada i doterivanje površi](topic:build-surface).
