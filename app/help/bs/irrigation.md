---
title: Projektovanje navodnjavanja
summary: Pomoćni alat za proračun, a ne ovjereni projekat — raspršivači, bočne cijevi, glavni vod, ventili i linije kapanja na terenu; zone pronađene iz cijevi; gubitak pritiska po Hazen–Williams formuli, najnepovoljniji raspršivač, protok i pritisak u odnosu na dovod, intenzitet padavina, vrijeme rada, pokrivenost i spisak materijala.
keywords: navodnjavanje, prskalica, prskalice, sprej, rotor, rotacioni mlaznik, bubler, kap, linija kapanja, emiter, ventil, zona, stanica, kontroler, glavni vod, bočna cijev, tačka priključka, vodovod, pritisak, psi, kpa, protok, gpm, gubitak trenjem, hazen williams, intenzitet padavina, vrijeme rada, pokrivenost, glava do glave, spisak materijala
from: 7d6342c1
---

:::warning
Ovo je pomoćni alat za proračun, a ne ovjereni projekat: projektant navodnjavanja provjerava svaki rezultat prije nego se bilo šta izgradi.
:::

## Postavljanje sistema

1. U odjeljku **Navodnjavanje** lijevo izaberite **Raspršivač**, njegov **Luk** i gdje luk počinje, te promjere cijevi za bočne cijevi i glavni vod.
2. {{ui:Navodnjavanje}} › {{ui:Tačka priključka}}: kliknite gdje se vodovod spaja. Postavite njegov **pritisak**, **raspoloživi protok** i gubitak na vodomjeru i povratnom toku u Svojstvima.
3. {{ui:Navodnjavanje}} › {{ui:Ventil}}: kliknite gdje ide ventil svake zone. Ventil počinje zonu.
4. {{ui:Navodnjavanje}} › {{ui:Raspršivač}}: kliknite da postavite raspršivače; svaki klik postavlja jedan.
5. {{ui:Navodnjavanje}} › {{ui:Bočna cijev}}: kliknite od ventila kroz njegove raspršivače i pritisnite {{key:Enter}}. {{ui:Glavni vod}}: od tačke priključka do svakog ventila.

Krajevi cijevi se pričvršćuju na raspršivače, ventile, dovod i druge krajeve cijevi, pa se mreža spaja. Zona je sve što se dosegne od njenog ventila duž bočnih cijevi; glavni vod nosi jednu zonu u jednom trenutku.

## Kapanje

{{ui:Navodnjavanje}} › {{ui:Linija kapanja}}: kliknite duž linije, počevši od mjesta gdje se napaja (kraj bočne cijevi ili ventil). Postavite **protok emitera** i **razmak** u Svojstvima; njen protok je zbir emitera duž nje.

## Provjera

{{ui:Navodnjavanje}} › {{ui:Provjeri sistem…}} prikazuje svaku zonu:

| Kolona | Kako se računa |
|---|---|
| Protok | Zbir protoka raspršivača (i linija kapanja) |
| Na ventilu | Radni pritisak najnepovoljnijeg raspršivača plus gubici u cijevima do njega (Hazen–Williams, unutrašnji prečnik cijevi, promjena visine) i gubitak kroz ventil |
| Na dovodu | Isto plus gubitak glavnog voda koji nosi tu zonu, te gubitak na vodomjeru i povratnom toku |
| Intenzitet padavina | Protok raspršivača po površini koju zalijevaju pri razmaku glava do glave |
| Minuta sedmično | Da se primijeni postavka **Zalijevanje sedmično** |
| Problemi | Brzina iznad granice, raspršivač izvan svog opsega pritiska, prskalice i rotori na jednom ventilu, nedovoljan pritisak ili protok na dovodu, raspršivači bez zone, petlje |

Odaberite ventil da vidite brojke njegove zone i njegov najnepovoljniji raspršivač zaokružen na planu. Spisak materijala broji raspršivače po vrsti i luku, cijevi po promjeru, ventile, liniju kapanja i emitere, te stanice kontrolera. {{ui:Spasi kao CSV}} čuva oboje.

Postavke u odjeljku Navodnjavanje: **Hazen–Williams C** (150 za nove plastične cijevi), **najveća brzina vode u cijevi** (1.5 m/s), **gubitak kroz ventil** i **zalijevanje sedmično**. Označene su kao zadane vrijednosti.

## Pokrivenost

{{ui:Navodnjavanje}} › {{ui:Prikaži pokrivenost}} kaže koliki dio površine raspršivači ostavljaju suhim, koliki dio zalijevaju dva ili više raspršivača, i koji raspršivači ne dosežu susjeda (razmak glava do glave).

## Raspršivači

Navedeni raspršivači su **generičke** vrste koje je CadCraft napisao iz projektnih intenziteta padavina (fiksne prskalice, rotacioni mlaznici, zupčasti rotori, bubleri, mikro-prskalice, emiteri), a ne proizvodi bilo kog proizvođača. **Dodaj raspršivače iz datoteke…** čita vaše raspršivače (JSON lista sa dometom, protokom ili intenzitetom padavina svakog raspršivača i opsegom pritiska); oni se čuvaju uz projekat. Objavljeni podaci proizvođača unose se samo uz zabilježenu dozvolu tog proizvođača.

Ispod generičkih raspršivača lista ima **tipične raspršivače** (njihovi nazivi se završavaju sa „typical values“): veličine mlaznica fiksnih prskalica, rotacionih mlaznika i zupčastih rotora, mikro-prskalica, bublera i emitera, sa poluprečnikom, protokom i opsegom pritiska. CadCraft ih izračunava iz objavljene matematike (jednačina otvora za protok, skaliranje dometa mlaza za poluprečnik) i nominalnih klasa protoka, samo iz otvorenih izvora; nijedna tabela proizvođača nije prepisana. Izaberete li jedan, birač prikazuje njegovu osnovu i licencu. Projekat koji ga koristi čuva raspršivač i njegov izvor u datoteci projekta. Namijenjeni su planiranju: prije izgradnje provjerite sopstvene podatke stvarnog raspršivača.
