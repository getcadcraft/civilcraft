---
title: Projektovanje navodnjavanja
summary: Pomoćni proračun, a ne overeni projekat: raspršivači, bočne cevi, glavni vod, ventili i linije kap po kap na lokaciji; zone pronađene iz cevi; gubitak pritiska po Hazen–Williams, raspršivač u najnepovoljnijem slučaju, protok i pritisak prema vodovodu, intenzitet padavina, trajanja rada, pokrivenost i spisak materijala.
keywords: navodnjavanje, prskalica, prskalice, sprej, rotor, rotacioni mlaznik, bubler, kap po kap, linija kap po kap, emiter, ventil, zona, stanica, kontroler, glavni vod, bočna cev, tačka priključka, vodovod, pritisak, psi, kpa, protok, gpm, gubitak trenjem, hazen williams, intenzitet padavina, trajanje rada, pokrivenost, glava do glave, spisak materijala
from: 7d6342c1
---

:::warning
Ovo je pomoćni proračun, a ne overeni projekat: projektant navodnjavanja proverava svaki rezultat pre nego što se bilo šta izgradi.
:::

## Postavi sistem

1. U odeljku **Navodnjavanje** na levoj strani izaberi **Raspršivač**, njegov **Luk** i gde luk počinje, i prečnike cevi za bočne cevi i glavni vod.
2. {{ui:Navodnjavanje}} › {{ui:Tačka priključka}}: klikni gde se vodovod priključuje. Podesi njegov **pritisak**, **raspoloživi protok** i gubitak na brojilu i nepovratnom ventilu u Svojstvima.
3. {{ui:Navodnjavanje}} › {{ui:Ventil}}: klikni gde ide ventil svake zone. Ventil počinje zonu.
4. {{ui:Navodnjavanje}} › {{ui:Raspršivač}}: klikni da postaviš raspršivače; svaki klik postavlja jedan.
5. {{ui:Navodnjavanje}} › {{ui:Bočna cev}}: klikni od ventila kroz njegove raspršivače i pritisni {{key:Enter}}. {{ui:Glavni vod}}: od tačke priključka do svakog ventila.

Krajevi cevi se hvataju za raspršivače, ventile, vodovod i druge krajeve cevi, pa se mreža spaja. Zona je sve što se dosegne od njenog ventila duž bočnih cevi; glavni vod nosi jednu zonu u jednom trenutku.

## Kap po kap

{{ui:Navodnjavanje}} › {{ui:Linija kap po kap}}: klikni duž linije, počevši od mesta gde se hrani (kraj bočne cevi ili ventil). Podesi **protok emitera** i **razmak** u Svojstvima; njen protok je zbir emitera duž nje.

## Provera

{{ui:Navodnjavanje}} › {{ui:Proveri sistem…}} navodi svaku zonu:

| Kolona | Kako se računa |
|---|---|
| Protok | Zbir protoka raspršivača (i linija kap po kap) |
| Na ventilu | Radni pritisak raspršivača u najnepovoljnijem slučaju plus gubici u cevima do njega (Hazen–Williams, unutrašnji prečnik cevi, promena kote) i gubitak kroz ventil |
| Na vodovodu | Isto plus gubitak glavnog voda koji nosi tu zonu, i gubitak na brojilu i nepovratnom ventilu |
| Padavine | Protok raspršivača podeljen površinom koju zalivaju pri razmaku glava do glave |
| Minuta nedeljno | Da se primeni podešavanje **Zalivanje nedeljno** |
| Problemi | Brzina iznad granice, raspršivač van svog opsega pritiska, sprejevi i rotori na jednom ventilu, nedovoljan pritisak ili protok na vodovodu, raspršivači bez zone, petlje |

Izaberi ventil da vidiš brojke njegove zone i njen raspršivač u najnepovoljnijem slučaju, obeležen krugom na planu. Spisak materijala broji raspršivače po vrsti i luku, cevi po prečniku, ventile, linije kap po kap i emitere, i stanice kontrolera. **Sačuvaj kao CSV** čuva oba.

Podešavanja u odeljku Navodnjavanje: **Hazen–Williams C** (150 za nove plastične cevi), **najveći protok** u cevi (1.5 m/s), **gubitak kroz ventil** i **zalivanje nedeljno**. Označene su kao podrazumevane vrednosti.

## Pokrivenost

{{ui:Navodnjavanje}} › {{ui:Prikaži pokrivenost}} kaže koliko površine raspršivači ostavljaju suvom, koliko je zalivaju dva ili više, i koji raspršivači ne dosežu suseda (razmak glava do glave).

## Raspršivači

Navedeni raspršivači su **opšte** vrste koje je CadCraft napravio iz projektovanih intenziteta padavina (fiksni sprejevi, rotacioni mlaznici, zupčasti rotori, bubleri, mikro-sprejevi, emiteri), a ne proizvodi nijednog proizvođača. **Dodaj raspršivače iz datoteke…** čita tvoje sopstvene (JSON spisak sa dometom, protokom ili intenzitetom padavina i opsegom pritiska za svaki); čuvaju se uz projekat. Objavljeni podaci proizvođača unose se samo uz zabeleženu dozvolu tog proizvođača.

Ispod opštih raspršivača spisak ima **tipične raspršivače** (njihova imena se završavaju sa „typical values“): veličine mlaznica fiksnih sprejeva, rotacionih mlaznika i zupčastih rotora, mikro-sprejeva, bubler i emitera, sa poluprečnikom, protokom i opsegom pritiska. CadCraft ih računa iz objavljenih matematičkih modela (jednačina otvora za protok, skaliranje dometa mlaza za poluprečnik) i nominalnih klasa protoka, samo iz otvorenih izvora; nijedna tabela proizvođača nije kopirana. Izaberi jedan i birač prikazuje njegovu osnovu i licencu. Projekat koji ga koristi čuva raspršivač i njegov izvor u datoteci projekta. Namenjeni su planiranju: proveri sopstvene podatke stvarnog raspršivača pre gradnje.
