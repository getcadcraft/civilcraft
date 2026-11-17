---
title: Uvoz tačaka premjera
summary: Otvorite CSV ili tekstualnu datoteku tačaka, provjerite redoslijed kolona u dijalogu Uvoz tačaka, popravite redove koji se ne mogu pročitati i razvrstajte tačke u grupe.
keywords: uvoz tačaka, csv, txt, pnezd, penzd, datoteka tačaka, premjer, cogo tačke, grupe tačaka, kolone, sjever, istok
from: ad33d88a
---

Datoteka tačaka je tekstualna datoteka sa jednom tačkom po redu: broj tačke, sjever, istok, kota i opis, nekim redom, odvojeni zarezima, tabulatorima, tačka-zarezima ili razmacima. CivilCraft je čita u pregledaču i odmah od nje izrađuje površinu.

## Prije početka

- Znajte redoslijed kolona datoteke ako možete (PNEZD i PENZD računaru izgledaju isto).
- Znajte njene jedinice. CivilCraft ne pretvara: postavite **Jedinice** u lijevom panelu da odgovaraju datoteci (pogledajte [Jedinice, stacionaže i formati brojeva](topic:units-and-stations)).
- Koordinate mogu biti velike (ravninski državni sjever i istok u milionima su u redu).

## Uvoz datoteke

1. Kliknite {{ui:Otvori}} na traci sa alatima, ili pritisnite {{key:Mod+O}}, i izaberite datoteku. Možete je i prevući na plan.
   Otvara se dijalog **Uvoz tačaka** sa nazivom datoteke, listom **Kolone** postavljenom na {{ui:Prepoznaj}}, redom sažetka i prvih šest tačaka.
2. Pročitajte red sažetka. Kaže koliko je tačaka pročitano, kojim redoslijedom kolona, kako je taj redoslijed pronađen i šta razdvaja kolone. Tri načina na koja se redoslijed pronalazi:
   - "iz reda zaglavlja": prvi red imenuje kolone (Point, Northing, Easting, Elevation, Description, ili X, Y, Z …). Ovo je najsigurnije.
   - "kako je izabrano": izabrali ste redoslijed u **Kolone**.
   - "pogođeno prema broju kolona i postavci **Redovi tačaka** (PNEZD) — provjerite da sjever i istok nisu zamijenjeni": nije bilo upotrebljivog zaglavlja. Ako su vaše datoteke obično prvo istočne, postavite **Redovi tačaka** na P, E, N, Z, D u [Postavke CivilCraft](topic:settings).
3. Provjerite tabelu pregleda. Njene kolone su uvijek **Tačka**, **Sjever**, **Istok**, **Kota**, **Opis**, bez obzira na redoslijed u datoteci. Sjever i istok stvarnog terena obično su jasno različitih veličina: ako izgledaju zamijenjeni, pogađanje je bilo pogrešno.
4. Ako je redoslijed pogrešan, izaberite ispravan u **Kolone** (na primjer {{ui:PENZD — tačka, istok, sjever, kota, opis}}). Sažetak i pregled se odmah ažuriraju.
5. Pogledajte ispod pregleda **Redovi koji nisu pročitani**. Svaki red navodi broj reda u datoteci, razlog i početak reda. Pogledajte [Redovi koji se ne čitaju](topic:import-points#rows-that-are-not-read).
6. Kliknite {{ui:Uvezi}}.
   Tačke se pojavljuju na planu, prikaz se zumira na njih i površina se izrađuje. Statusna traka kaže, na primjer, "Uvezeno 276 tačaka iz site.csv; površina: 546 trouglova."

Ako projekat još nema naziv, preuzima naziv datoteke.

## Provjera grupa

Svaka tačka pripada grupi nazvanoj po **prvoj riječi njenog opisa**, velikim slovima: "GRD", "FL 12" i "fl" su grupe GRD, FL i FL. Tačke bez opisa idu u "(bez opisa)".

1. Pogledajte tabelu ispod **Tačke** u lijevom panelu: grupa, broj tačaka i izbor **Površ**.
2. Svaka grupa počinje kao {{ui:Tačke}}. Promijenite linije toka, ivice kolovoza, vrhove i nožice nagiba, grebene i slične šifrirane linije u {{ui:Prelomna linija}}. Grupe koje ne bi trebale oblikovati teren (kontrolne tačke, vrhovi drveća, stubovi komunalnih instalacija snimljeni na vrhu) postavite na {{ui:Izostavljeno}}.
3. Kliknite tačku na planu (sa {{ui:Odaberi}}) da vidite njen broj, koordinate, kotu, opis i grupu u desnom panelu.

:::warning
Grupa prelomne linije spaja **sve** svoje tačke u **jednu** liniju, redom po broju tačke. To radi kada je svaka šifrirana linija snimljena redom sa svojom šifrom. Dvije odvojene linije toka, obje šifrirane kao "FL", postaju jedna linija koja cik-caka između njih. Ako su vaše šifre zajedničke, umjesto toga upotrijebite alat {{ui:Prelomna linija}} da kliknete tačke svake linije (pogledajte [Izrada i dorada površine](topic:build-surface)).
:::

## Redovi koji se ne čitaju

| Prikazani razlog | Šta znači | Šta raditi |
|---|---|---|
| "sjever ili istok nije broj" | Kolona koordinate sadrži tekst | Provjerite redoslijed kolona, ili red sa tekstom usred datoteke |
| "kota nije broj" | Kolona kote sadrži tekst | Pogrešan redoslijed kolona, ili opis u koloni kote |
| "nema broja tačke" | Kolona tačke je prazna | Numerišite tačku, ili izaberite redoslijed bez P (NEZD, NEZ …): tačke se tada numerišu 1, 2, 3 … |
| "tačka 12 se pojavljuje dva puta (zadržava se prva)" | Dva reda imaju isti broj | Promijenite broj jednom od njih u datoteci ako su oba stvarna snimanja |
| "3 kolone, očekivano 5 (PNEZD)" | Red je kratak | Prekinut red, ili pogrešan redoslijed kolona |

Tačka s praznom kotom se zadržava, ali se ne koristi u površini. Podaci o **Tačkama** pokazuju koliko tačaka ima kotu.

Redovi koji počinju sa `#`, `;` ili `//` su komentari i preskaču se. Prazni redovi se preskaču.

## Zamjena ili dodavanje tačaka

Ponovni uvoz **zamjenjuje** sve tačke; ne dodaje ih. Vaše trase, platoi, cjevovodi, nacrtane prelomne linije i granica ostaju. Historija poništavanja se briše, pa prvo sačuvajte projekat ako biste možda željeli stare tačke nazad. Da spojite dvije datoteke, povežite ih u uređivaču teksta ili tabelarnoj datoteci prije uvoza (pazite na ponovljene brojeve tačaka).

Tačke se još ne mogu pomjerati, uređivati niti brisati unutar CivilCraft-a. Popravite ih u datoteci i ponovo uvezite.

## Povezano

- [Formati datoteka tačaka](topic:point-file-formats): svaki redoslijed kolona i kako se zaglavlja prepoznaju.
- [Izrada i dorada površine](topic:build-surface).
