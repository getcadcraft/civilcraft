---
title: Import zameraných bodov
summary: Otvorte súbor bodov CSV alebo text, skontrolujte poradie stĺpcov v dialógu Import bodov, opravte riadky, ktoré sa nedajú načítať, a roztriedťe body do skupín.
keywords: import bodov, csv, txt, pnezd, penzd, súbor bodov, zameranie, geodetické body, skupiny bodov, stĺpce, sever, východ
from: ad33d88a
---

Súbor bodov je textový súbor s jedným bodom na riadku: číslo bodu, X (sever), Y (východ), výška a popis v ľubovoľnom poradí, oddelené čiarkami, tabulátormi, bodkočiarkami alebo medzerami. CivilCraft ho číta v prehliadači a hneď z neho zostaví povrch.

## Pred začatím

- Poznajte poradie stĺpcov, ak ho viete zistiť (PNEZD a PENZD vyzerajú pre počítač rovnako).
- Poznajte jeho jednotky. CivilCraft ich neprevádza: nastavte **Jednotky** v ľavom paneli tak, aby zodpovedali súboru (pozri [Jednotky, staničenie a formáty čísel](topic:units-and-stations)).
- Súradnice môžu byť veľké (súradnice štátnej roviny v miliónoch sú v poriadku).

## Import súboru

1. Kliknite na {{ui:Otvoriť}} na paneli nástrojov alebo stlačte {{key:Mod+O}} a vyberte súbor. Môžete ho aj pretiahnuť na pôdorys.
   Otvorí sa dialóg **Import bodov** s názvom súboru, zoznamom **Stĺpce** nastaveným na {{ui:Zistiť}}, riadkom so súhrnom a prvými šiestimi bodmi.
2. Prečítajte si riadok so súhrnom. Hovorí, koľko bodov sa načítalo, v akom poradí stĺpcov, ako sa toto poradie zistilo a čím sú stĺpce oddelené. Tri spôsoby, ako sa poradie zistí:
   - „z riadku hlavičky“: prvý riadok pomenúva stĺpce (Point, Northing, Easting, Elevation, Description, alebo X, Y, Z …). Je to najbezpečnejšie.
   - „podľa vybraného“: poradie ste zvolili v **Stĺpce**.
   - „odhadnuté z počtu stĺpcov a nastavenia riadkov bodov (PNEZD) — skontrolujte, či nie sú sever a východ zamenené“: nebola použiteľná hlavička. Ak sú vaše súbory zvyčajne s východom na prvom mieste, nastavte **Riadky bodov** na P, E, N, Z, D v [nastaveniach CivilCraft](topic:settings).
3. Skontrolujte náhľadovú tabuľku. Jej stĺpce sú vždy **Bod**, **X (sever)**, **Y (východ)**, **Výška**, **Popis**, nech poradie v súbore je akékoľvek. Sever a východ skutočnej lokality sú zvyčajne zreteľne rôzne veľké: ak vyzerajú zamenené, odhad bol zlý.
4. Ak je poradie zlé, vyberte správne v **Stĺpce** (napríklad {{ui:PENZD — bod, Y (východ), X (sever), výška, popis}}). Súhrn a náhľad sa hneď aktualizujú.
5. Pod náhľadom hľadajte **Riadky, ktoré sa nenačítali**. Každý riadok uvádza číslo riadku v súbore, dôvod a začiatok riadku. Pozri [Riadky, ktoré sa nenačítajú](topic:import-points#rows-that-are-not-read).
6. Kliknite na {{ui:Importovať}}.
   Body sa objavia na pôdoryse, zobrazenie sa k nim priblíži a povrch sa zostaví. Stavový riadok hovorí napríklad: „Importovaných 276 bodov zo súboru site.csv; povrch: 546 trojuholníkov.“

Ak projekt ešte nemal názov, prevezme názov súboru.

## Skontrolujte skupiny

Každý bod patrí do skupiny pomenovanej podľa **prvého slova jeho popisu** veľkými písmenami: „GRD“, „FL 12“ a „fl“ sú skupiny GRD, FL a FL. Body bez popisu sú v „(bez popisu)“.

1. Pozrite sa na tabuľku pod **Body** v ľavom paneli: skupina, počet bodov a voľba **Povrch**.
2. Každá skupina začína ako {{ui:Body}}. Čiary spádu, hrany spevnených plôch, päty a vrcholy svahov, hrebene a podobné kódované čiary zmeňte na {{ui:Hrana zlomu}}. Skupiny, ktoré nemajú tvarovať povrch (kontrolné body, vrchy stromov, stĺpy inžinierskych sietí zamerané na vrchu), nastavte na {{ui:Vynechané}}.
3. Kliknite na bod na pôdoryse (nástrojom {{ui:Výber}}), aby ste v pravom paneli videli jeho číslo, súradnice, výšku, popis a skupinu.

:::warning
Skupina hrán zlomu spojí **všetky** svoje body do **jednej** čiary, v poradí podľa čísla bodu. To funguje, keď bola každá kódovaná čiara zameraná v poradí so svojím vlastným kódom. Dve samostatné čiary spádu označené „FL“ sa stanú jednou čiarou kľukatiacou sa medzi nimi. Ak sú vaše kódy spoločné, použite nástroj {{ui:Hrana zlomu}} a kliknite na body každej čiary (pozri [Vytvorenie a spresnenie povrchu](topic:build-surface)).
:::

## Riadky, ktoré sa nenačítajú

| Zobrazený dôvod | Čo to znamená | Čo robiť |
|---|---|---|
| „northing or easting is not a number“ | Súradnicový stĺpec obsahuje text | Skontrolujte poradie stĺpcov alebo náhodný textový riadok uprostred súboru |
| „elevation is not a number“ | Stĺpec výšky obsahuje text | Zlé poradie stĺpcov alebo popis v stĺpci výšky |
| „no point number“ | Stĺpec bodu je prázdny | Očíslujte bod, alebo zvoľte poradie bez P (NEZD, NEZ …): body sa potom očíslujú 1, 2, 3 … |
| „point 12 appears twice (the first one is kept)“ | Dva riadky zdieľajú číslo | Preočíslujte jeden z nich v súbore, ak sú oba skutočné merania |
| „3 columns, expected 5 (PNEZD)“ | Riadok je krátky | Prerušený riadok alebo zlé poradie stĺpcov |

Bod s prázdnou výškou sa zachová, ale v povrchu sa nepoužije. Údaje o bodoch ukazujú, koľko bodov má výšku.

Riadky začínajúce `#`, `;` alebo `//` sú komentáre a preskakujú sa. Prázdne riadky sa tiež preskakujú.

## Nahradiť alebo pridať body

Opätovný import **nahradí** všetky body; nepridá k nim. Vaše osi trás, plošiny, potrubia, nakreslené hrany zlomu a hranica zostanú. História späť sa vymaže, takže ak možno budete chcieť staré body späť, najprv projekt uložte. Ak chcete spojiť dva súbory, spojte ich v textovom editore alebo tabuľkovom procesore pred importom (dávajte pozor na opakujúce sa čísla bodov).

Body sa zatiaľ v CivilCraft nedajú presúvať, upravovať ani mazať. Opravte ich v súbore a importujte znova.

## Súvisiace

- [Formáty súborov bodov](topic:point-file-formats): každé poradie stĺpcov a ako sa rozpoznávajú hlavičky.
- [Vytvorenie a spresnenie povrchu](topic:build-surface).
