---
title: Pusti AI asistenta da radi s tvojom lokacijom
summary: Uključi asistente u Postavkama da asistent na tvom računaru može čitati otvorenu lokaciju (tačke, površine, zapremine, profile, parcele), dodavati tačke geodetskog snimanja, spašavati i izvoziti LandXML ili DWG, preko CadCraft Studija. Isključeno dok ga ne uključiš.
keywords: ai, asistent, mcp, skripta, automatizacija, studio, tačke, kota, stacionaža, odstupanje, trasa, zapremina, iskop, nasip, profil, parcela, landxml, dwg, usd, folderi, dozvole, prekini vezu, aktivnost
from: d0356582
---

## Šta ćeš naučiti

Kako pustiti AI asistenta (bilo koji asistent koji govori MCP) da radi s lokacijom koju imaš otvorenu, šta može i ne može, i kako ga zaustaviti.

## Šta asistent može da radi u CivilCraftu

| Traži | Šta dobija | Treba mu |
|---|---|---|
| Lokaciju | Naziv, jedinice, koordinatni sistem, grupe tačaka, trase, površine, platoe, parcele i cijevi | Čitanje |
| Tačke geodetskog snimanja | Broj, istok, sjever, kota i opis, po grupi, po opisu ili unutar okvira | Čitanje |
| Kote površine | Postojeći teren (ili izravnata površina) u bilo kojim tačkama koje navede | Čitanje |
| Stacionaže i odstupanja | Stacionaža i odstupanje tačaka duž trase, ili koordinate i kota terena stacionaža | Čitanje |
| Profil | Kote terena, projektnog profila i izravnate površine duž trase, svakih toliko stopa ili metara | Čitanje |
| Iskop i nasip | Zapremine između postojećeg terena i izravnate površine (svakog platoa i koridora takođe), ili između terena i nivoa | Čitanje |
| Parcele | Uglovi, površina (u akrima ili hektarima), obim i pravni opis | Čitanje |
| Izbor | Tačke koje navede izabrane su na planu, kao da si ih ti odabrao | Uređivanje |
| Nove tačke geodetskog snimanja | Tačke dodate sa brojevima koje da, ili sljedećim slobodnim. Svaki poziv je jedan korak koji možeš poništiti | Uređivanje |
| Spašavanje | CivilCraftovo vlastito {{ui:Spasi}} | Spašavanje |
| LandXML ili DWG | Iste datoteke kao dugmad {{ui:LandXML}} i {{ui:DWG}} | Izvoz |
| Lokacija u 3D | OpenUSD (.usdz, .usda ili .usdc) terena, izravnate površine, platoa i cijevi, kako ih 3D prikaz izvozi | Izvoz |
| Biljke i spisak biljaka | Biljke nađene u spisku biljaka po bilo kom nazivu, i brojevi iz spiska biljaka | Čitanje |
| Sadnja i izravnavanje | Biljke, gredica ili živica postavljena, ili platforma, nasip, jarak ili područje izravnavanja dodano, svaki korak koji možeš poništiti, sa svojim iskopom i nasipom | Uređivanje |
| Provjera navodnjavanja | Protok svake zone, pritisak potreban na njenom ventilu i na dovodu, najgori pritisak, vremena rada, problemi i spisak materijala, kao pomoć pri računanju koju projektant navodnjavanja provjerava | Čitanje |

Radi s otvorenom lokacijom. U Studiju može i spašavati i izvoziti u foldere koje izabereš (ispod); bez foldera njegove datoteke se preuzimaju kao što to rade dugmad.

## Uključi ga

Asistenti dolaze do CivilCraft-a preko CadCraft Studija na tvom računaru; obični pregledač nema put unutra.

1. Otvori {{ui:Postavke}} i izaberi karticu **CivilCraft**.
2. Pod **Asistenti**, označi **Dozvoli AI asistentima i skriptama da koriste CivilCraft**.
3. **Čitanje** je označeno za tebe. Označi **Uređivanje**, **Spašavanje** ili **Izvoz** samo kad asistent to treba.
4. Da mu dozvoliš da spašava i izvozi u folder, izaberi {{ui:Dodaj folder…}} pod **Folderi koje može koristiti** i izaberi folder u Studijevom dijalogu. {{ui:Ukloni}} ga odmah vraća; svaka druga putanja se odbija.
5. Poveži asistenta u Studiju (Studio prikazuje adresu i postavke koje treba nalijepiti u njega).

## Dok je asistent povezan

Napomena na vrhu desnog panela kaže koji je asistent povezan i šta može. Klikni {{ui:Prekini vezu}} da odmah okončaš njegovu sesiju; mora se ponovo povezati da nastavi.

**Aktivnost**, pod **Asistenti** u Postavkama, navodi svaki poziv koji je asistent napravio, najnoviji prvi, sa tim je li uspio.

:::tip
Pitaj običnim riječima, na primjer „kolika je visina terena svakih 50 stopa duž ulice Main?”, „koliko iskopa i nasipa trebaju platoi?” ili „dodaj kontrolnu tačku na ovim koordinatama”. Asistent čita lokaciju i odgovara, ili pravi promjenu kao jedan korak koji možeš poništiti.
:::

## Bez otvaranja CivilCraft-a

CadCraft server datoteka za asistente (`npx @getcadcraft/mcp`) i naredbena linija `cadcraft` otvaraju spremljene CivilCraft projekte (`.civilcraft.json`) i datoteke tačaka sa CivilCraftovim vlastitim kodom, bez prozora: isti alati za čitanje, dodavanje tačaka, spašavanje projekta, LandXML i lokaciju u 3D kao OpenUSD. `cadcraft convert site.civilcraft.json site.xml` piše LandXML iz naredbene linije. Otvaranje LandXML-a, DWG izvoz i alati radnog prostora Landscape i dalje trebaju prozor CivilCraft-a.

## Isključi ga

Odznači **Dozvoli AI asistentima i skriptama da koriste CivilCraft**. Svaki asistent se odmah odjavljuje, a postavka se čuva za sljedeći put.

## Vidi i

- [Recepti za AI asistente](common:assistants-recipes): primjeri rada, svaki sa alatima koje poziva.
- [Iscrtavanje horizontalne trase](topic:alignment)
- [Izgradnja i dorada površine](topic:build-surface)
- [Odaberi, kopiraj i zalijepi tačke geodetskog snimanja](topic:copy-paste-points)
- [Postavke CivilCraft-a](topic:settings)
