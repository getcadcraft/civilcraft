---
title: Projektiranje navodnjavanja
summary: Pomoćno sredstvo za izračun, a ne ovjereni projekt: mlaznice, sekundarne cijevi, glavni vod, ventili i kapajuće cijevi na lokaciji; zone pronađene iz cijevi; gubitak tlaka po Hazen–Williamsu, najnepovoljnija mlaznica, protok i tlak prema dovodu, intenzitet oborina, vremena rada, pokrivenost i popis materijala.
keywords: navodnjavanje, prskalice, sprinkler, raspršivač, rotor, rotacijska mlaznica, pojilica, kapanje, kapajuća cijev, kapaljka, ventil, zona, stanica, upravljačka jedinica, glavni vod, sekundarna cijev, točka priključka, opskrba vodom, tlak, psi, kpa, protok, gpm, gubitak trenja, hazen williams, intenzitet oborina, vrijeme rada, pokrivenost, razmak glava do glave, popis materijala
from: 7d6342c1
---

:::warning
Ovo je pomoćno sredstvo za izračun, a ne ovjereni projekt: projektant navodnjavanja provjerava svaki rezultat prije nego što se išta izgradi.
:::

## Postavite sustav

1. U odjeljku **Navodnjavanje** lijevo odaberite **Mlaznicu**, njen **Luk** i mjesto gdje luk počinje, te promjere cijevi za sekundarne cijevi i glavni vod.
2. {{ui:Navodnjavanje}} › {{ui:Točka priključka}}: kliknite mjesto gdje se dovod vode spaja. Postavite njegov **tlak**, **raspoloživi protok** te gubitak na vodomjeru i povratnom ventilu u Svojstvima.
3. {{ui:Navodnjavanje}} › {{ui:Ventil}}: kliknite mjesto gdje ide ventil svake zone. Ventil počinje zonu.
4. {{ui:Navodnjavanje}} › {{ui:Mlaznica}}: kliknite za postavljanje mlaznica; svaki klik postavlja jednu.
5. {{ui:Navodnjavanje}} › {{ui:Sekundarna cijev}}: kliknite od ventila kroz njegove mlaznice i pritisnite {{key:Enter}}. {{ui:Glavni vod}}: od točke priključka do svakog ventila.

Krajevi cijevi se pripijaju na mlaznice, ventile, dovod i druge krajeve cijevi, pa se mreža spaja. Zona je sve što se doseže od njenog ventila kroz sekundarne cijevi; glavni vod nosi jednu zonu u jednom trenutku.

## Kapanje

{{ui:Navodnjavanje}} › {{ui:Kapajuća cijev}}: kliknite duž linije, počevši od mjesta gdje se hrani (kraj sekundarne cijevi ili ventil). Postavite **protok kapaljke** i **razmak** u Svojstvima; njen protok je zbroj kapaljki uz nju.

## Provjera

{{ui:Navodnjavanje}} › {{ui:Provjeri sustav…}} navodi svaku zonu:

| Stupac | Kako se računa |
|---|---|
| Protok | Zbroj protoka mlaznica (i kapajućih cijevi) |
| Na ventilu | Radni tlak najnepovoljnije mlaznice plus gubici cijevi do nje (Hazen–Williams, unutarnji promjer cijevi, promjena visine) i gubitak kroz ventil |
| Na dovodu | Isto plus gubitak glavnog voda koji nosi tu zonu te gubitak na vodomjeru i povratnom ventilu |
| Oborine | Protok mlaznica podijeljen s površinom koju zalijevaju pri razmaku glava do glave |
| Minuta tjedno | Za primjenu postavke **Voda tjedno** |
| Problemi | Brzina iznad granice, mlaznica izvan svog raspona tlaka, prskalice i rotori na jednom ventilu, premalo tlaka ili protoka na dovodu, mlaznice bez zone, petlje |

Odaberite ventil da vidite podatke njegove zone i njegovu najnepovoljniju mlaznicu označenu na tlocrtu. Popis materijala broji mlaznice po vrsti i luku, cijevi po promjeru, ventile, kapajuću cijev i kapaljke te postaje upravljačke jedinice. **Spremi kao CSV** čuva oba.

Postavke u odjeljku Navodnjavanje: **Hazen–Williams C** (150 za nove plastične cijevi), **najveća brzina protoka** u cijevi (1.5 m/s), **gubitak kroz ventil** i **voda tjedno**. To su označene zadane vrijednosti.

## Pokrivenost

{{ui:Navodnjavanje}} › {{ui:Prikaži pokrivenost}} kaže koliko površine mlaznice ostavljaju suhom, koliko je zalijevaju dvije ili više, i koje mlaznice ne dosežu susjeda (razmak glava do glave).

## Mlaznice

Navedene mlaznice su **generičke** vrste koje CadCraft izrađuje iz projektnih intenziteta oborina (fiksne prskalice, rotacijske mlaznice, zupčani rotori, pojilice, mikroprskalice, kapaljke), a ne proizvodi nijednog proizvođača. **Dodaj mlaznice iz datoteke…** čita vaše vlastite (JSON popis sa svakim dometom, protokom ili intenzitetom oborina te rasponom tlaka); spremaju se s projektom. Objavljeni podaci nekog proizvođača unose se samo uz zabilježeno dopuštenje tog proizvođača.

Ispod generičkih mlaznica popis ima **tipične mlaznice** (njihovi nazivi završavaju s „typical values”): veličine mlaznica fiksnih prskalica, rotacijske mlaznice i zupčasti rotori, mikroprskalice, pojilice i kapaljke, s radijusom, protokom i rasponom tlaka. CadCraft ih izračunava iz objavljene matematike (jednadžba otvora za protok, skaliranje dometa mlaza za radijus) i nazivnih klasa protoka, samo iz otvorenih izvora; nijedna tablica proizvođača nije preuzeta. Odaberete li jednu, birač prikazuje njezinu osnovu i licencu. Projekt koji je koristi zadržava mlaznicu i njen izvor u datoteci projekta. Namijenjene su planiranju: prije gradnje provjerite vlastite podatke stvarne mlaznice.
