---
title: Načrtovanje namakanja
summary: Pomožno orodje za izračune, ne potrjena zasnova — glave, odcepi, glavni vod, ventili in kapljični vodi na lokaciji; cone, najdene iz cevi; izguba tlaka po Hazen–Williams, najslabša glava, pretok in tlak glede na dovod, stopnje padavin, časi zalivanja, pokritost in kosovnica.
keywords: namakanje, pršilnik, pršilniki, razpršilo, rotor, rotacijska šoba, mehurčni namakalnik, kapljično, kapljični vod, oddajnik, ventil, cona, postaja, krmilnik, glavni vod, odcep, priključna točka, oskrba z vodo, tlak, psi, kpa, pretok, gpm, izguba zaradi trenja, hazen williams, stopnja padavin, čas zalivanja, pokritost, glava na glavo, kosovnica
from: 7d6342c1
---

:::warning
To je pomožno orodje za izračune, ne žigosana zasnova: načrtovalec namakanja preveri vsak rezultat, preden se kaj zgradi.
:::

## Postavite sistem

1. V razdelku **Namakanje** na levi izberite **Glavo**, njen **Lok** in kje se lok začne, ter velikosti cevi za odcepe in glavni vod.
2. {{ui:Namakanje}} › {{ui:Priključna točka}}: kliknite, kjer se vodni dovod priključi. V **Lastnostih** nastavite njegov **tlak**, **razpoložljivi pretok** ter izgubo na števcu in povratnem ventilu.
3. {{ui:Namakanje}} › {{ui:Ventil}}: kliknite, kjer gre ventil vsake cone. Ventil začne cono.
4. {{ui:Namakanje}} › {{ui:Glava}}: kliknite za postavitev glav; vsak klik postavi eno.
5. {{ui:Namakanje}} › {{ui:Stranska cev}}: kliknite od ventila skozi njegove glave in pritisnite {{key:Enter}}. {{ui:Glavni vod}}: od priključne točke do vsakega ventila.

Konci cevi se prilepijo na glave, ventile, dovod in na druge konce cevi, zato se omrežje poveže. Cona je vse, kar je dosegljivo od njenega ventila po odcepih; glavni vod hkrati nosi eno cono.

## Kapljično

{{ui:Namakanje}} › {{ui:Kapljični vod}}: kliknite vzdolž voda, začnite tam, kjer se napaja (na koncu odcepa ali ventila). V **Lastnostih** nastavite **pretok oddajnika** in **razmik**; njegov pretok je vsota oddajnikov vzdolž njega.

## Preverjanje

{{ui:Namakanje}} › {{ui:Preveri sistem …}} našteje vsako cono:

| Stolpec | Kako se izračuna |
|---|---|
| Pretok | Vsota pretokov glav (in kapljičnih vodov) |
| Na ventilu | Delovni tlak najslabše glave plus izgube v cevi do nje (Hazen–Williams, notranji premer cevi, sprememba višine) in izguba skozi ventil |
| Na dovodu | Enako plus izguba glavnega voda, ki nosi to cono, ter izguba na števcu in povratnem ventilu |
| Padavine | Pretok glav, deljen s površino, ki jo zalivajo pri razmiku glava na glavo |
| Minut na teden | Za uporabo nastavitve **Zalivanje na teden** |
| Težave | Hitrost nad mejo, glava zunaj svojega tlačnega območja, pršilniki in rotorji na enem ventilu, premalo tlaka ali pretoka na dovodu, glave brez cone, zanke |

Izberite ventil, da na tlorisu vidite številke njegove cone in njegovo najslabšo glavo, obkroženo. Kosovnica šteje glave po vrsti in loku, cevi po velikosti, ventile, kapljični vod in oddajnike ter postaje krmilnika. **Shrani kot CSV** shrani oboje.

Nastavitve v razdelku Namakanje: **Hazen–Williams C** (150 za novo plastično cev), **največja hitrost pretoka** v cevi (1.5 m/s), **izguba skozi ventil** in **Zalivanje na teden**. Označene so kot privzete vrednosti.

## Pokritost

{{ui:Namakanje}} › {{ui:Pokaži pokritost}} pove, kolikšen del površine glave pustijo suh, kolikšen del pokrijeta dve ali več glav in katere glave ne segajo do sosednje (razmik glava na glavo).

## Glave

Navedene glave so **splošne** vrste, ki jih CadCraft zapiše iz projektnih stopenj padavin (fiksni pršilniki, rotacijske šobe, zobniški rotorji, mehurčni namakalniki, mikro-pršilniki, oddajniki), ne izdelkov nobenega proizvajalca. **Dodaj glave iz datoteke…** prebere vaše lastne glave (seznam v formatu JSON z dosegom, pretokom ali stopnjo padavin in območjem tlaka vsake glave); shranijo se skupaj s projektom. Objavljeni podatki proizvajalca se vnesejo samo z zapisanim dovoljenjem tega proizvajalca.

Pod splošnimi glavami ima seznam **tipične glave** (njihova imena se končajo z „typical values“): velikosti šob fiksnih pršilnikov, rotacijskih šob in zobniških rotorjev, mikro-pršilnikov, mehurčnih namakalnikov in oddajnikov, z radijem, pretokom in območjem tlaka. CadCraft jih izračuna iz objavljene matematike (enačba odprtine za pretok, skaliranje dometa curka za radij) in nazivnih razredov pretoka, samo iz odprtih virov; nobena tabela proizvajalca ni kopirana. Izberite eno in izbirnik pokaže njeno osnovo in licenco. Projekt, ki jo uporablja, v datoteki projekta hrani glavo in njen vir. Namenjene so načrtovanju: pred gradnjo preverite podatke prave glave.
