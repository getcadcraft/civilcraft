---
title: Izračunaj protoke oborinskih voda, dimenzije cijevi i hidrauličku nagibnu liniju
summary: Nacrtaj slivna područja koja se slijevaju u svaki objekat, zbroji protoke kroz mrežu racionalnom metodom, odredi dimenzije cijevi Manningovom jednačinom i vidi gdje hidraulička nagibna linija teče punim presjekom ili dostiže površinu.
keywords: oborinska odvodnja, slivno područje, racionalna metoda, koeficijent otjecanja, vrijeme koncentracije, intenzitet padavina, idf, manning, dimenzioniranje cijevi, hidraulička nagibna linija, hgl, linija energije, egl, preopterećenje, poplava, nizvodni vodostaj
from: e44872ec
---

Oborinska odvodnja radi na [mreži cijevi](topic:pipe-network): prvo nacrtajte mrežu, pa područja koja se u nju slijevaju. Sve se pojavljuje pod **Oborinska odvodnja** u desnom panelu kada ništa nije odabrano.

## Nacrtaj slivno područje

1. Klikni **Nacrtaj slivno područje** pod **Oborinska odvodnja**.
2. Klikni uglove područja koje se slijeva u jedan objekat. {{key:Enter}} ili dvostruki klik završava; {{key:Backspace}} poništava posljednji ugao, {{key:Esc}} zaustavlja.
3. Slivno područje se slijeva u objekat unutar njega, inače u najbliži. Otvaraju se njegova **Svojstva**: postavi naziv, **Koeficijent otjecanja C** (udio kiše koji otječe, od 0 do 1), **Vrijeme koncentracije** u minutama i koji objekat **Slijeva se u**.

**Nacrtaj još jedno slivno područje** u njegovim Svojstvima pokreće sljedeće. Klikni unutar slivnog područja na planu da ga odabereš; {{key:Delete}} ga uklanja. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Postavi projektnu oluju

Intenzitet padavina je i = a ÷ (tc + b) na potenciju c, u inčima po satu za projekat u stopama i milimetrima po satu za projekat u metrima. Prilagodi **Intenzitet a**, **b** i **c** svojoj krivulji intenzitet–trajanje–učestalost za povratni period za koji projektujete.

:::warning
Početna krivulja intenziteta, Manningov n (0.013) i gubitak na spoju (0.5) su privremene vrijednosti, a ne standard. Postavi ih prema svojim podacima o padavinama i projektnim kriterijima.
:::

- **Najkraće vrijeme koncentracije**: nijedna cijev se ne računa za kraće vrijeme (na početku 10 minuta).
- **Manning n**: hrapavost cijevi.
- **Gubitak na spoju**: visina izgubljena u svakom objektu, kao udio brzinske visine V²/2g cijevi koja iz njega izlazi.
- **Nivo vode na izlazu**: nizvodni vodostaj, gdje se posljednja cijev prazni. Ostavi prazno kada izlaz slobodno ističe.

## Kako se protoke zbrajaju

Svaka cijev nosi sva slivna područja iznad nje. Q = C × i × A, gdje se C × A zbraja niz mrežu, a i je intenzitet pri najdužem vremenu koncentracije dolazeće vode: vlastito vrijeme slivnog područja, ili vrijeme od uzvodnog slivnog područja plus vrijeme proticanja kroz cijevi (dužina ÷ brzina punim presjekom). Q je u kubnim stopama po sekundi (A u akrima) ili kubnim metrima po sekundi (A u hektarima).

## Dimenzioniraj cijevi

Tabela ispod **Protoke i nagibne linije** prikazuje za svaku cijev protok, koliko nosi punim presjekom na svom nagibu, brzinu, hidraulički nagib na svom vrhu i dnu, te koliko je duboko teče.

**Dimenzioniraj cijevi za ove protoke** daje svakoj cijevi najmanju standardnu dimenziju koja nosi njen protok na njenom nagibu (12 do 72 in, ili 300 do 1800 mm). Ovo je jedan korak. Dna cijevi ostaju gdje jesu: ako se dimenzije promijene, koristi **Postavi sva dna iz pravila** da zadržiš pokrivenost, pa ponovo provjeri tabelu.

## Čitaj nagibne linije

Hidraulička nagibna linija (HGL) računa se od izlaza uzvodno:

- Cijev koja teče djelimično punim presjekom ima HGL na nivou vode: dno plus normalna dubina.
- Kada je voda ispod, ili kada cijev nosi više nego što može punim presjekom, cijev teče punim presjekom (preopterećena) i njen HGL raste za nagib trenja na svojoj dužini.
- Na svakom objektu HGL je gornji HGL izlazne cijevi plus gubitak na spoju.
- Linija energije (EGL) je HGL plus brzinska visina.

Cijev koja teče punim presjekom se navodi, kao i svaki objekat na kojem je HGL iznad oboda: voda tamo dopire do površine, a objekat je na planu označen crvenim prstenom. Odaberi cijev ili objekat da vidiš njen protok, dubinu, brzinu i obje nagibne linije u njegovim Svojstvima.

## Provedi oluju

Racionalna metoda daje jedan vrh za svaku cijev. {{ui:Provedi oluju}} (ispod rezultata, u Svojstvima mreže) umjesto toga računa cijelu oluju: otjecanje svakog slivnog područja kroz vrijeme, sprovedeno niz cijevi s njihovim vremenom proticanja i akumulacijom, i zbrojeno gdje se sastaju.

1. Ostavi {{ui:Kiša traje}} i {{ui:Intenzitet kiše}} prazno da koristiš najduže vrijeme koncentracije i krivulju padavina iznad, ili upiši svoje.
2. Pritisni {{ui:Provedi oluju}}. Tabela navodi za svaku cijev najveći ulazni i izlazni protok, koliko je niži izlazni vrh, koliki dio pune kapacitet cijevi koristi i minut u kojem dostiže vrh.
3. Svaki izlaz dobija mali grafikon protoka kroz vrijeme i {{ui:Preuzmi hidrogram (CSV)}}.

Slivno područje ispušta kišu usrednjenu kroz svoje vrijeme koncentracije, pa oluja kraća od toga dostiže niži vrh nego C × i × A. Svaka cijev se sprovodi Muskingum–Cunge metodom, koristeći dubinu toka koju je racionalna metoda već našla. Dvije grane s različitim vremenima koncentracije ne dostižu vrh zajedno, pa je njihov zbir niži od zbira njihovih vrhova.

Ovo ne modeluje preopterećenje, povratni uticaj vode, akumulaciju u objektima ni poplavu. Cijev čiji sprovedeni vrh premašuje njen puni kapacitet navodi se, a njena voda se prosljeđuje kao da stane. Koristi ovo da vidiš vrijeme i prigušenje, a ne da dimenzioniraš cijev. To je pomoćno sredstvo za proračun: inženjer ga provjerava.

## Sačuvano u projektu

Slivna područja i postavke oluje čuvaju se u datoteci projekta. Još nisu u PDF crtežu, DWG ili DXF, ili LandXML: vidi [Još nije izrađeno](topic:not-built-yet).
