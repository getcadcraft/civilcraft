---
title: Izvoz tlorisa v DXF
summary: Zapiše črte tlorisa kot R12 DXF na imenovanih slojih, s plastnicami na njihovih kotah in prelomnicami v 3D, za katerikoli CAD program.
keywords: dxf, dwg, cad, izvoz, r12, 2000, 2004, 2007, 2010, 2013, 2018, sloji, plastnice, izmenjava risb, osnovna karta, podlaga, črte
from: f2d8ede9
---

{{ui:DXF}} zapiše, kar tloris prikazuje, kot datoteko DXF v obliki R12, različici, ki jo odpre vsak CAD program. Če ste uporabljali AutoCAD ali Civil 3D, jo odprite ali vstavite enako kot katero koli datoteko DXF.

## Izvoz

1. Pripravite tloris, kakor želite risbo: pod **Prikaz** izberite površje (obstoječe ali načrtovano), interval plastnic in, kaj naj bo vklopljeno (plastnice, oznake, točke, oznake točk, trikotniki, prelomnice, rob površja, cevi, puščice naklona).
2. Kliknite {{ui:DWG/DXF}} v skupini **Izvoz** in izberite {{ui:DXF (R12, besedilo) — navadna izmenjevalna datoteka}}, nato {{ui:Prenesi}}.
3. Brskalnik prenese `<name>.dxf`. Vrstica stanja pove na primer: "Izvoz R12 DXF: 2,140 objektov; oznake velikosti za 1" = 40'. Pasovi višin niso izvoženi."

Koordinate se zapišejo v enotah vašega projekta, v svojih dejanskih vrednostih (koordinate državne ravninske projekcije ostanejo take, kakršne so). Nič se ne skalira ali premakne.

## Kaj je v datoteki

| Element | Entiteta DXF | Sloj |
|---|---|---|
| Manjše in glavne plastnice | 2D polilinije na svoji koti | C-TOPO-MINR, C-TOPO-MAJR |
| Oznake plastnic | Besedilo | C-TOPO-TEXT |
| Trikotniki | Polilinije | C-TOPO-TINN |
| Prelomnice in meja | 3D polilinije | C-TOPO-BRKL |
| Rob površja | Polilinije | C-TOPO-BNDY |
| Puščice naklona | Polilinije | C-TOPO-SLOP |
| Geodetske točke in njihove oznake | Točke (z koto), besedilo | V-NODE, V-NODE-TEXT |
| Črte iz kod črt | 3D polilinije | V-NODE-LINE |
| Osi trase | Črte in loki | C-ROAD-CNTR |
| Oznake stacionaže in napisi | Polilinije, besedilo | C-ROAD-STAN |
| Robovi koridorja | Polilinije | C-ROAD-CORR |
| Vzorčne črte | Polilinije | C-ROAD-SCTN |
| Platoji, črte izkopa in nasipa, črte naklona | Polilinije | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Karakteristične črte | 3D polilinije (loki kot kosi znotraj 0.01; glejte [Karakteristične črte](topic:feature-lines)) | C-GRAD-FEAT |
| Obračalne poti | Polilinije, besedilo | C-ROAD-SWPT |
| Cevi, objekti, oznake | Polilinije, besedilo | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Cevi in objekti s težavami | Polilinije | C-STRM-PROB |

Vsak sloj ima barvo. Celoten seznam je v [Sloji tlorisa](topic:plan-layers).

## Velikost oznak

Besedilo mora imeti velikost v enotah risbe. CivilCraft določi velikost oznak za merilo, pri katerem celoten tloris ustreza listu Tabloid (čevlji) ali listu A3 (metri), in v vrstici stanja pove, za katero merilo gre. Če tiskate pri drugem merilu v svojem CAD programu, besedilo tam skalirajte.

## Kaj ni izvoženo

- Pasovi višin (samo na zaslonu).
- Pogled profila. Profili gredo ven kot LandXML, ne kot risba.
- Samo površje kot 3D objekt. Za TIN uporabite LandXML ali vklopite {{ui:Trikotniki}}, da dobite njegove robove kot črte.
- Vse, kar ste izklopili pod **Prikaz**.

## DWG

{{ui:DWG/DXF}} zapiše enake črte tudi kot risbo DWG. Njeno pogovorno okno zahteva obliko: DXF ali DWG 2000, 2004, 2007, 2010, 2013 ali 2018. Obliko 2000 odpre skoraj vsak CAD program, starega in novega; izberite novejšo, kadar tisti, ki prejme risbo, to zahteva. Vaša izbira se shrani v tem brskalniku.

1. Kliknite {{ui:DWG}} v skupini **Izvoz**.
2. Izberite **Obliko** in kliknite **Prenesi DWG**.
3. Brskalnik prenese `<name>.dwg`. Vrstica stanja pove, kaj je bilo vključeno, na primer "Izvoz DWG (oblika 2018): 12 polilinij, 40 oznak na 9 slojih".

DWG ima iste sloje, barve, plastnice (kot polilinije na svoji koti), 3D prelomnice, oznake in točke kot DXF, v istih koordinatah. Imena slojev, ki jih DWG ne more shraniti, se spremenijo, in vrstica stanja to pove. CivilCraft zapisuje DWG s svojo kodo, zato nič ne zapusti vašega računalnika.

### Kartni sloji v DWG

Risba DWG ne more hraniti slike znotraj sebe: programi CAD prikažejo sliko, ki stoji ob risbi. Kadar so kartni sloji prikazani, pogovorno okno ponudi **Kartni sloji kot slika ob risbi**. Ko je to označeno, je prenos datoteka `.zip`, ki vsebuje `<name>.dwg`, `<name>-map.png` (kartni sloji čez celotno risbo, do 4,096 pikslov široko) in `<name>-map.pgw` (njeno svetovno datoteko za programe GIS). Risba prikaže sliko kot sliko na sloju G-MAP-IMAG, na mestu. Datoteke razpakirajte v eno mapo in jih imejte skupaj.
