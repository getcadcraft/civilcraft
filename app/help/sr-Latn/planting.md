---
title: Planovi sadnje i spiskovi
summary: Postavite pojedinačne biljke, gredice popunjene biljkama po razmaku i mešane po procentu, i živice; označite ih; izbrojite ih u spisku biljaka za tabelarni program ili TakeoffCraft.
keywords: plan sadnje, spisak biljaka, gredica, masovna sadnja, živica, drvo, žbun, pokrivač tla, razmak, trougaoni razmak, broj biljaka, količine, oznake, krošnja, simboli biljaka, ifc, predmer
from: ab49eab5
---

## Postavljanje biljaka

1. Izaberite biljku u odeljku **Biljke** levo.
2. Kliknite {{ui:Biljka}}, pa kliknite na plan: svaki klik postavlja jednu biljku. Pritisnite {{key:Esc}} da zaustavite.

Simbol biljke crta se po njenoj širini pri zrelosti; More › {{ui:Prikaži u veličini sadnje}} crta svaku biljku u veličini u kojoj se sadi. Drveće leži na terenu ispod sebe: kada kasnije oblikujete teren, ono ga prati. Da biljku fiksirate na neku visinsku kotu, upišite je u **Visinsku kotu** u Svojstvima.

## Gredice sa biljkama

1. Izaberite glavnu biljku, kliknite {{ui:Gredica}} i kliknite uglove gredice. Pritisnite {{key:Enter}} (ili ponovo kliknite prvi ugao) da je zatvorite.
2. Gredica se popunjava tom biljkom na njenom razmaku, u **trougaonom** obrascu (uobičajenom: svaka biljka je jednako daleko od šest drugih), na pola razmaka od ivice.
3. U Svojstvima, **Dodaj biljku** meša biljku izabranu levo. Postavite **Udeo %** svake biljke: gredica uzima tačno toliko od svake, raspoređeno kroz nju. **Ponovo pomešaj** menja mesta na kojima su raspoređene.

**Razmak** prazan koristi sopstveni razmak biljaka (ponderisan njihovim udelima); upišite jedan da ga koristite za svaku biljku. **Obrazac** može biti **kvadratni**, a **Redovi pod uglom** okreću redove.

## Živice

Izaberite biljku za živicu, kliknite {{ui:Živica}}, kliknite duž živice i pritisnite {{key:Enter}}. Biljke idu duž linije na svom razmaku, centrirane tako da oba kraja imaju istu marginu. Živica može biti u **dva reda, naizmenično**, na zadatom rastojanju.

## Oznake

Pojedinačne biljke se označavaju podešavanjem oznake (`{name}` podrazumevano); upišite svoju oznaku za jednu biljku u Svojstvima. Gredice se označavaju brojem svake biljke, a živice svojim brojem. More › {{ui:Oznake biljaka}} uključuje i isključuje oznake. Polja oznake: `{name}`, `{botanical}`, `{size}` (kontejner), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Spisak biljaka

More › {{ui:Spisak biljaka…}} broji svaku biljku po vrsti, iz pojedinačnih biljaka, gredica i živica zajedno, sa njihovom veličinom pri sadnji. Sačuvajte ga kao **CSV** ili **XLSX**, ili **Pošalji u TakeoffCraft**: datoteku količina koju TakeoffCraft otvara da bi obračunao cenu biljaka (uz količine tvrdih elemenata i navodnjavanja pored njih).

## IFC

More › {{ui:Izvezi IFC za uređenje}} čuva uređenje kao IFC datoteku (IFC 4.3) koju BIM model može da sadrži: svaka biljka je `IfcGeographicElement` tipa VEGETATION, tipizovan svojom vrstom, sa svojstvima biljke (botanički naziv, veličine, otpornost, voda, svetlo); svaka gredica i živica je jedan element sa svojim brojevima, na lokaciji. BimCraft ga otvara uz zgradu.
