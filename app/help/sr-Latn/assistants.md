---
title: Neka AI pomoćnik radi sa vašom lokacijom
summary: Uključite pomoćnike u Podešavanjima da pomoćnik na vašem računaru može da čita otvorenu lokaciju (tačke, površine, zapremine, profile, parcele), dodaje geodetske tačke, čuva i izvozi LandXML ili DWG, preko CadCraft Studio. Isključeno dok ga ne uključite.
keywords: ai, pomoćnik, mcp, skripta, automatizacija, studio, tačke, visinska kota, stacionaža, odstupanje, trasa, zapremina, iskop, nasip, profil, parcela, landxml, dwg, usd, fascikle, dozvole, prekid veze, aktivnost
from: d0356582
---

## Šta ćete naučiti

Kako da pustite AI pomoćnika (bilo koji pomoćnik koji govori MCP) da radi sa lokacijom koju imate otvorenu, šta sme, a šta ne sme da radi, i kako da ga zaustavite.

## Šta pomoćnik može da radi u CivilCraft-u

| Traži | Dobija | Potrebno je |
|---|---|---|
| Lokaciju | Naziv, jedinice, koordinatni sistem, grupe tačaka, trase, površine, platoe, parcele i cevi | Čitanje |
| Geodetske tačke | Broj, istok, sever, kota i opis, po grupi, po opisu ili unutar okvira | Čitanje |
| Visinske kote površine | Postojeći teren (ili nivelisana površina) u bilo kojim tačkama koje navede | Čitanje |
| Stacionaže i odstupanja | Stacionaža i odstupanje tačaka duž trase, ili koordinate i visinska kota terena stacionaža | Čitanje |
| Profil | Visinske kote terena, projektnog profila i nivelisane površine duž trase, na svakih toliko stopa ili metara | Čitanje |
| Iskop i nasip | Zapremine između postojećeg terena i nivelisane površine (svakog platoa i koridora takođe), ili između terena i nivoa | Čitanje |
| Parcele | Temena, površina (sa akrima ili hektarima), obim i pravni opis | Čitanje |
| Izbor | Tačke koje navede biće izabrane na planu, kao da ste ih vi izabrali | Izmena |
| Nove geodetske tačke | Tačke dodate sa brojevima koje da, ili sledećim slobodnim. Svaki poziv je jedan korak koji možete poništiti | Izmena |
| Čuvanje | {{ui:Sačuvaj}} CivilCraft-a | Čuvanje |
| LandXML ili DWG | Iste datoteke kao dugmad {{ui:LandXML}} i {{ui:DWG}} | Izvoz |
| Lokacija u 3D | OpenUSD (.usdz, .usda ili .usdc) terena, nivelisane površine, platoa i cevi, kako je 3D prikaz izvozi | Izvoz |
| Biljke i spisak biljaka | Biljke nađene na spisku biljaka po bilo kom nazivu, i brojevi sa spiska biljaka | Čitanje |
| Sadnja i nivelisanje | Biljke, gredica ili živa ograda postavljeni, ili plato, nasip, plitki jarak ili područje nivelisanja dodati, svaki kao jedan korak koji možete poništiti, sa svojim iskopom i nasipom | Izmena |
| Provera navodnjavanja | Protok svake zone, pritisak potreban na njenom ventilu i na dovodu, najgori slučaj pritiska, vremena rada, problemi i spisak materijala, kao pomoćno izračunavanje koje projektant navodnjavanja proverava | Čitanje |

Radi sa lokacijom koja je otvorena. U Studio-u može i da čuva i izvozi u fascikle koje izaberete (ispod); bez fascikle njegove datoteke se preuzimaju kao što to rade dugmad.

## Uključivanje

Pomoćnici dolaze do CivilCraft-a preko CadCraft Studio-a na vašem računaru; običan pregledač nema pristup.

1. Otvorite {{ui:Podešavanja}} i izaberite karticu **CivilCraft**.
2. Pod **Pomoćnici** štiklirajte **Dozvoli AI pomoćnicima i skriptama da koriste CivilCraft**.
3. **Čitanje** je štiklirano za vas. Štiklirajte **Izmena**, **Čuvanje** ili **Izvoz** samo kada pomoćniku trebaju.
4. Da biste mu dozvolili da čuva i izvozi u fasciklu, izaberite {{ui:Dodaj fasciklu…}} pod **Fascikle koje sme da koristi** i izaberite fasciklu u Studio-ovom dijalogu. {{ui:Ukloni}} mu odmah oduzima pristup; svaka druga putanja se odbija.
5. Povežite pomoćnika u Studio-u (Studio prikazuje adresu i podešavanja koja treba nalepiti u njega).

## Dok je pomoćnik povezan

Napomena na vrhu desnog panela kaže koji je pomoćnik povezan i šta može. Kliknite {{ui:Prekini vezu}} da odmah završite njegovu sesiju; mora ponovo da se poveže da bi nastavio.

**Aktivnost**, pod **Pomoćnici** u Podešavanjima, navodi svaki poziv koji je pomoćnik napravio, najnoviji prvi, sa oznakom da li je uspeo.

:::tip
Pitajte običnim rečima, na primer „kolika je visinska kota terena na svakih 50 stopa duž Glavne ulice?“, „koliki iskop i nasip trebaju platoi?“ ili „dodaj kontrolnu tačku na ove koordinate“. Pomoćnik čita lokaciju i odgovara, ili pravi promenu kao jedan korak koji možete poništiti.
:::

## Bez otvaranja CivilCraft-a

Server datoteka CadCraft-a za pomoćnike (`npx @getcadcraft/mcp`) i komandna linija `cadcraft` otvaraju sačuvane CivilCraft projekte (`.civilcraft.json`) i datoteke tačaka pomoću sopstvenog koda CivilCraft-a, bez prozora: isti alati za čitanje, dodavanje tačaka, čuvanje projekta, LandXML i lokacija u 3D kao OpenUSD. `cadcraft convert site.civilcraft.json site.xml` ispisuje LandXML iz komandne linije. Otvaranje LandXML-a, izvoz DWG-a i alati radnog prostora Landscape i dalje traže prozor CivilCraft-a.

## Isključivanje

Isključite **Dozvoli AI pomoćnicima i skriptama da koriste CivilCraft**. Svaki pomoćnik se odmah prekida, a podešavanje se čuva za sledeći put.

## Vidi takođe

- [Recepti za AI pomoćnike](common:assistants-recipes): radni primeri, svaki sa alatima koje poziva.
- [Iscrtajte horizontalnu trasu](topic:alignment)
- [Izgradite i doradite površinu](topic:build-surface)
- [Izaberite, kopirajte i nalepite geodetske tačke](topic:copy-paste-points)
- [Podešavanja CivilCraft-a](topic:settings)
