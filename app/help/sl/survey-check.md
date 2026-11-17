---
title: Preverjanje geodetskega načrta pri uvozu
summary: Kote, zapisane kot besedilo ali v atributih blokov, preberite kot geodetske točke, preverite DWG ali DXF glede napačnih enot, manjkajočega koordinatnega sistema, oddaljenega izhodišča, ravnih plastnic, nenavadnih kot in podvojenih točk, preden iz njega zgradite teren.
keywords: preverjanje geodetskega načrta, preverjanje uvoza, geodetske kote, kotne točke, kote kot besedilo, atributi, enote, koordinatni sistem, daleč od izhodišča, plastnice pri ničli, osamelci, podvojene točke, težave, krajinski arhitekt, geodetski načrt
from: d46acd24
---

Geodetski načrt je lahko videti pravilen in je vseeno napačen za teren: njegove enote so lahko uganjene, njegove plastnice so lahko ravne na višini 0 ali pa so kote zapisane kot besedilo, ki sploh ni geometrija. Oddelek **Geodetske kote in preverjanje** v pogovornem oknu {{ui:Črtovje}} (glejte [Odpiranje DWG ali DXF kot črtovja](topic:open-dwg-dxf)) prebere te kote in pove, kaj je videti narobe, preden se kaj doda.

## Kote, zapisane kot besedilo ali v atributih

Mnogi geodetski načrti podajo kotno točko kot majhno besedilo ob križcu, na primer `104.37` ali `EL 104.37`, ali kot atribut točkovnega bloka. To niso črte, zato jih bralnik črtovja izpusti. Oddelek navede, koliko jih je našel, in omogoča, da jih vzamete kot **geodetske točke**:

1. Označite **Vzemi … kote kot geodetske točke**. Na začetku niso označene, ker ni vsaka številka v načrtu višina.
2. Besedilo se prebere, kadar je kota sama zase: število z decimalnim delom (`104.37`, `+104,37`, `-3.50`), ali število za `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ali `LEVEL`, z neobveznim `m`, `ft` ali `'` za njim. Samo celo število (`12`) se prebere kot številka parcele ali lista, ne kot kota; besedilo, kot sta `GATE 3` ali datum, se nikoli ne prebere. Kode za oblikovanje besedila se prezrejo.
3. Pri atributih blokov izberite **Atribut bloka, ki vsebuje kote**. CivilCraft sam najde oznako ELEV, Z, LEVEL, RL ali podobno; če risba uporablja svojo, izberite drugo s seznama. Izbira se za to ime datoteke na tem računalniku shrani, zato jo ob ponovnem odprtju začne z isto oznako. Oznaka, ki jo izberete, sprejme kot kote tudi cela števila.
4. Kliknite {{ui:Dodaj}}. Točke se oštevilčijo za najvišjo številko v projektu, vsaka točka je opisana s svojim slojem (ali svojim blokom), višine pa se pretvorijo v enote projekta kot ostali del risbe. Vse skupaj je en korak: {{key:Mod+Z}} odstrani točke.

Besedilo stoji na svoji vstavitveni točki (ali na točki poravnave, če jo ima). Besedilo znotraj blokov se ne prebere, risba pa se nikoli ne spremeni.

## Preverjanje

Preverjanje teče na tem, kar boste uvozili, in navede, kar najde, po eno vrstico za vsako vrsto težave:

| Sporočilo | Pomen |
|---|---|
| **Enote niso navedene** | Risba ne pove, kakšne so njene enote, zato se njene številke berejo kot enote projekta. Preverite eno razdaljo, ki jo poznate. |
| **Enote pretvorjene** | Enote risbe se razlikujejo od enot projekta in so preračunane (opomba, ne napaka). |
| **Podatki segajo … km** ali **… m** | Obseg je večji od 200 km ali manjši od pol metra, kar ponavadi pomeni napačno enoto (milimetri prebrani kot metri ali obratno). |
| **Ni koordinatnega sistema** | Projekt ga nima. Je opozorilo, kadar so podatki daleč od ničle, kot so državne ravninske ali državne koordinatne mreže. Glejte [Koordinatni sistemi](topic:coordinate-systems). |
| **Daleč od izhodišča** | Podatki so več kot 100 km od ničle. Daleč od ničle 3D pogledi in izvozi izgubijo natančnost in se tresejo. |
| **Sloj plastnic … nima višine** | Sloj, imenovan kot plastnice (TOPO, CONT, CNTR, CONTOUR), vsebuje črte na višini 0, zato bi bil iz njih zgrajen teren raven. |
| **Kote točno 0** | Nekatere kote so 0, medtem ko je tipična kota daleč od tega: verjetno manjkajo višine. |
| **Kote daleč od ostalih** | Nekatere kote so daleč zunaj drugih (ugotovljeno glede na sredino vseh kot, zato strmo mesto s širokim razponom ni označeno), ali nad 9,000 m ali pod -11,000 m. |
| **Točke na drugi točki** | Dve točki na istem mestu z isto koto ali z različnimi kotami. |

Ko kliknete {{ui:Dodaj}}, iste vrstice gredo v **Težave**, po ena za vsako vrsto, z imenom datoteke, da se lahko kasneje vrnete k njim. Preverjanje presoja risbo; ničesar v njej ne spremeni in vam ne preprečuje, da bi jo uporabili.

:::tip
Kadar preverjanje pove, da so plastnice ravne pri 0 in da so kote zapisane kot besedilo, vzemite kote kot geodetske točke: pogosto nosijo prave višine, ki jim plastnicam manjkajo.
:::

## Kar se ne preverja

Preverjanje ne primerja načrta z drugim geodetskim posnetkom in ne more ugotoviti, v katerem koordinatnem sistemu je risba: pove le, da nobeden ni nastavljen.
