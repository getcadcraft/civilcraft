---
title: Planovi sadnje i spiskovi
summary: Postavite pojedinačne biljke, gredice sadnje popunjene na razmaku biljaka s mješavinom biljaka po procentu, i živice; označite ih i prebrojite u spisku biljaka za tabelarni program ili TakeoffCraft.
keywords: plan sadnje, spisak biljaka, gredica sadnje, masovna sadnja, živica, stablo, grm, pokrivač tla, razmak, trouglasti razmak, broj biljaka, količine, oznake, krošnja, simboli biljaka, ifc, predmjer
from: ab49eab5
---

## Postavljanje biljaka

1. Odaberite biljku u **Biljke** s lijeve strane.
2. Kliknite {{ui:Plant}}, pa kliknite na plan: svaki klik postavlja jednu biljku. Pritisnite {{key:Esc}} za prekid.

Simbol biljke crta se po njenoj širini pri zrelosti; More › {{ui:Show at planting size}} crta svaku biljku u veličini u kojoj se sadi. Stabla stoje na terenu ispod njih: kad kasnije nivelišete lokaciju, prate teren. Da biste biljku fiksirali na određenoj koti, upišite je u **Kota** u Svojstvima.

## Gredice sadnje

1. Odaberite glavnu biljku, kliknite {{ui:Bed}} i kliknite uglove gredice. Pritisnite {{key:Enter}} (ili ponovo kliknite prvi ugao) da je zatvorite.
2. Gredica se popuni tom biljkom na njenom razmaku, u **trouglastom** obrascu (uobičajenom: svaka biljka je jednako udaljena od šest drugih), pola razmaka uvučeno od ivice.
3. U Svojstvima, **Dodaj biljku** miješa biljku odabranu lijevo. Postavite **Udio %** svake biljke: gredica uzima tačno toliko svake, raspoređeno kroz nju. **Ponovo pomiješaj** mijenja mjesta na kojima su.

**Razmak** ostavljen prazan koristi vlastite razmake biljaka (ponderisane njihovim udjelima); upišite jedan da ga koristite za svaku biljku. **Obrazac** može biti kvadratni, a **Redovi pod** okreće redove.

## Živice

Odaberite biljku za živicu, kliknite {{ui:Hedge}}, kliknite duž živice i pritisnite {{key:Enter}}. Biljke se postavljaju duž linije na svom razmaku, centrirane tako da oba kraja imaju istu marginu. Živica može biti **dva reda, naizmjenično**, na zadatoj udaljenosti.

## Oznake

Pojedinačne biljke se označavaju postavkom oznake (`{name}` zadano); upišite svoju oznaku za jednu biljku u Svojstvima. Gredice se označavaju brojem svake biljke, živice svojim brojem. More › {{ui:Plant labels}} uključuje i isključuje oznake. Polja oznake: `{name}`, `{botanical}`, `{size}` (kontejner), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Spisak biljaka

More › {{ui:Plant schedule…}} broji svaku biljku po vrsti, iz pojedinačnih biljaka, gredica i živica zajedno, s veličinom sadnje. Spremite ga kao **CSV** ili **XLSX**, ili kao **Pošalji u TakeoffCraft**: datoteku količina koju TakeoffCraft otvara da bi odredio cijenu biljaka (uz količine popločanja i navodnjavanja pored njih).

## IFC

More › {{ui:Export landscape IFC}} sprema pejzaž kao IFC datoteku (IFC 4.3) koju BIM model može sadržavati: svaka biljka je `IfcGeographicElement` tipa VEGETATION, tipizirana po vrsti sa svojstvima biljke (botaničko ime, veličine, otpornost, voda, svjetlo), a svaka gredica i živica je jedan element sa svojim brojevima, na lokaciji. BimCraft ga otvara uz zgradu.
