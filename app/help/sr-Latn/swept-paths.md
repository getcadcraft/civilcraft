---
title: Putanje zamaha vozila
summary: Vozi vozilo sa do tri prikolice duž linije oblika ili trase, napred ili unazad, i vidi površinu koju prelazi, putanje točkova, upravljanje i mesto gde se prikolica prelama.
keywords: putanja zamaha, putanja zaokretanja, praćenje vozila, šablon zaokretanja, projektno vozilo, kamion, autobus, prikolica, poluprikolica, vožnja unazad, prelamanje, zglob, blokada upravljača, odstupanje na krivini, putanja točka, rampa za utovar, poluprečnik zaokretanja
from: 8caafb8a
---

Putanja zamaha vozi vozilo duž linije i prikazuje površinu tla preko koje prolazi njegovo telo. Koristite je da proverite da kamion može da skrene u uglu, dođe do rampe za utovar ili unazad uvuče prikolicu na mesto bez napuštanja popločanja.

## Vozi vozilo duž linije

1. Nacrtajte liniju koju vozilo prati, u smeru kretanja: liniju oblika (lukovi su u redu: pritisnite {{key:C}} dok je crtate, videti [Linije oblika](topic:feature-lines)) ili trasu.
2. Izaberite je i kliknite {{ui:Swept path…}} u njenim **Svojstvima**.
3. Pod **Polazi od** izaberite vozilo, pa podesite njegove mere iz vašeg projektnog vozila: širinu, prednji previs, međuosovinsko rastojanje, zadnji previs, trag i **Blokadu upravljača**. Dodajte do tri prikolice, svaka sa mestom gde je zakačena, svojom dužinom od tačke vezivanja do osovine, svojim previsima i svojim **Najvećim uglom zgloba**.
4. Izaberite **Vožnju**: napred ili unazad. Kliknite {{ui:Drive it}}.

:::warning
Vozila od kojih se polazi su privremena, a ne standard. Podesite mere prema projektnom vozilu koje vaš projekat koristi.
:::

## Napred i unazad

| Vožnja | Šta prati liniju | Šta CivilCraft računa |
|---|---|---|
| **Napred** | Središte prednje osovine | Gde idu zadnja osovina i svaka prikolica, ugao upravljanja i zglob |
| **Unazad** | Središte poslednje osovine (zadnji deo prikolice) | Gde ide svaka jedinica ispred, i upravljanje koje kabina treba da bi tamo postavila prikolicu |

Unazad se proverava ulazak u mesto unazad: recite gde prikolica treba da bude, a CivilCraft kaže da li kabina to može.

## Čitanje rezultata

Putanja zamaha se crta na planu narandžasto: njen obrub i, isprekidano, putanje najspoljnijih točkova. Izaberite je (kliknite unutar nje) da biste u **Svojstvima** videli:

- **Dužinu vožnje**, najveći ugao **Upravljanja** i **Zgloba** u odnosu na njihove granice i **Površinu zamaha**.
- Svaki problem duž linije, sa njegovom udaljenošću: upravljanje preko blokade, ili prikolica koja se okreće preko granice zgloba (savija se, zaglavi se).
- **Vozilo duž linije**: pomerite klizač da vidite vozilo u bilo kojoj tački, sa njegovim upravljanjem i zglobom na tom mestu.

Promenite liniju i putanja zamaha prati. {{ui:Edit the vehicle…}} menja mere; **Vožnja** prebacuje između napred i unazad. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva. {{key:Delete}} briše izabranu putanju zamaha (linija ostaje).

Obrub i putanje točkova idu u PDF, DXF i DWG na sloju C-ROAD-SWPT.

## Kako se računa

Svaka jedinica se okreće oko linije svoje zadnje osovine i vuče je tačka ispred nje (prednja osovina ili zakačna tačka), što je model male brzine bez klizanja koji koriste provere putanja zamaha. Površina zamaha je spoj obrisa tela u svakom položaju. Ne modeluje se brzina, klizanje guma, vreme koje upravljanje treba da se okrene, upravljane prikolice ni razmak ispod karoserije.
