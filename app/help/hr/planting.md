---
title: Planovi sadnje i popisi
summary: Postavljanje pojedinačnih biljaka, gredica za sadnju popunjenih prema razmaku biljaka s mješavinom biljaka po postotku te živica; označavanje i brojanje u popisu biljaka za proračunsku tablicu ili TakeoffCraft.
keywords: plan sadnje, popis biljaka, gredica za sadnju, masovna sadnja, živica, stablo, grm, pokrovnica, razmak, trokutasti razmak, broj biljaka, količine, oznake, krošnja, simboli biljaka, ifc, takeoff
from: ab49eab5
---

## Postavljanje biljaka

1. Na lijevoj strani odaberite biljku u **Biljkama**.
2. Kliknite {{ui:Biljka}}, zatim kliknite na tlocrt: svaki klik postavlja jednu biljku. Pritisnite {{key:Esc}} za zaustavljanje.

Simbol biljke crta se prema njezinoj širini u zrelosti; Više › {{ui:Prikaži u veličini sadnje}} crta svaku biljku u veličini u kojoj se sadi. Stabla stoje na tlu ispod njih: kad kasnije planirate lokaciju, prate ga. Da biljku fiksirate na određenoj koti, upišite je u **Kota** u Svojstvima.

## Gredice za sadnju

1. Odaberite glavnu biljku, kliknite {{ui:Gredica}} i kliknite kutove gredice. Pritisnite {{key:Enter}} (ili ponovno kliknite prvi kut) za zatvaranje.
2. Gredica se popunjava tom biljkom prema njezinom razmaku, u **trokutastom** uzorku (uobičajenom: svaka biljka jednako je udaljena od šest drugih), pola razmaka od ruba.
3. U Svojstvima, **Dodaj biljku** umiješa biljku odabranu na lijevoj strani. Postavite **Udio %** za svaku biljku: gredica uzima točno toliko svake, raspoređeno kroz nju. **Ponovno pomiješaj** promiješa mjesta na kojima su.

Ako **Razmak** ostane prazan, koristi se razmak samih biljaka (ponderiran njihovim udjelima); upišite jedan da ga koristi svaka biljka. **Uzorak** može biti kvadratni, a **Retci pod kutom** okreće retke.

## Živice

Odaberite biljku za živicu, kliknite {{ui:Živica}}, kliknite duž živice i pritisnite {{key:Enter}}. Biljke idu duž linije prema svom razmaku, centrirane tako da oba kraja imaju jednaku marginu. Živica može biti **u dva reda, naizmjenično**, na zadanom razmaku.

## Oznake

Pojedinačne biljke označuju se postavkom oznake (zadano `{name}`); za jednu biljku svoju oznaku upišite u Svojstvima. Gredice se označuju brojem biljaka, živice svojim brojem. Više › {{ui:Oznake biljaka}} uključuje i isključuje oznake. Polja oznake: `{name}`, `{botanical}`, `{size}` (posuda), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Popis biljaka

Više › {{ui:Popis biljaka…}} broji svaku biljku po vrsti, zajedno iz pojedinačnih biljaka, gredica i živica, s njihovom veličinom pri sadnji. Spremite ga kao **CSV** ili **XLSX**, ili **Pošalji u TakeoffCraft**: datoteka s količinama koju TakeoffCraft otvara za procjenu cijene biljaka (uz količine tvrdog krajobraza i navodnjavanja pokraj njih).

## IFC

Više › {{ui:Izvezi IFC krajobraza}} sprema krajobraz kao IFC datoteku (IFC 4.3) koju BIM model može sadržavati: svaka biljka je `IfcGeographicElement` tipa VEGETATION, tipizirana prema vrsti sa svojstvima biljke (botanički naziv, veličine, otpornost, voda, svjetlost), svaka gredica i živica jedan element s vlastitim brojevima, na lokaciji. BimCraft ga otvara uz zgradu.
