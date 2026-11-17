---
title: Putanje vozila
summary: Vozi vozilo s do tri prikolice duž linije karakteristike ili osi trase, naprijed ili unazad, i vidi površinu koju prelazi, tragove točkova, upravljanje i mjesto gdje se prikolica savija.
keywords: putanja vozila, putanja skretanja, praćenje vozila, šablon skretanja, projektno vozilo, kamion, autobus, prikolica, poluprikolica, vožnja unazad, unazad, savijanje prikolice, zglob, ograničenje upravljanja, odstupanje traga, trag točka, utovarna rampa, radijus skretanja
from: 8caafb8a
---

Putanja vozila vozi vozilo duž linije i pokazuje tlo preko kojeg prolazi njegovo tijelo. Koristite je da provjerite može li kamion skrenuti za ugao, doći do utovarne rampe ili unazad uvući prikolicu na mjesto bez izlaska s kolovoza.

## Vozi vozilo duž linije

1. Nacrtaj liniju koju vozilo prati, u smjeru kretanja: liniju karakteristike (lukovi su u redu: pritisni {{key:C}} dok je crtaš, vidi [Linije karakteristika](topic:feature-lines)) ili osu trase.
2. Odaberi je i klikni {{ui:Putanja vozila…}} u njenim **Svojstvima**.
3. Pod **Počni od**, odaberi vozilo, pa postavi njegove dimenzije prema svom projektnom vozilu: širina, prednji prepust, međuosovinski razmak, zadnji prepust, trag i **Ograničenje upravljanja**. Dodaj do tri prikolice, svaku s mjestom kačenja, dužinom od kuke do osovine, svojim prepustima i svojim **Najvećim zglobom**.
4. Odaberi **Vožnja**: naprijed ili unazad. Klikni {{ui:Vozi ga}}.

:::warning
Vozila od kojih se počinje su privremene vrijednosti, a ne standard. Postavi dimenzije prema projektnom vozilu koje vaš projekat koristi.
:::

## Naprijed i unazad

| Vožnja | Šta prati liniju | Šta CivilCraft računa |
|---|---|---|
| **Naprijed** | Centar prednje osovine | Gdje idu zadnja osovina i svaka prikolica, ugao upravljanja i zglob |
| **Unazad** | Centar zadnje osovine (zadnji dio prikolice) | Gdje ide svaka jedinica ispred, i upravljanje koje kabina treba da postavi prikolicu tamo |

Vožnja unazad je način provjere manevra unazad: reci gdje prikolica treba da ide, a CivilCraft kaže može li kabina to uraditi.

## Pročitaj rezultat

Putanja vozila je nacrtana na planu narandžasto: njen obris i, isprekidano, putanje najvanjskijih točkova. Odaberi je (klikni unutar nje) da vidiš u **Svojstvima**:

- **Pređena dužina**, najveći ugao **Upravljanja** i **Zgloba** u odnosu na njihove granice, i **Površina putanje**.
- Svaki problem duž linije, s udaljenosti: upravljanje preko ograničenja, ili prikolica koja skreće preko granice zgloba (savija se).
- **Vozilo duž linije**: pomjeri klizač da vidiš vozilo u bilo kojoj tački, s njegovim upravljanjem i zglobom tu.

Promijeni liniju i putanja vozila prati je. {{ui:Uredi vozilo…}} mijenja dimenzije; **Vožnja** prebacuje između naprijed i unazad. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava. {{key:Delete}} briše odabranu putanju vozila (linija ostaje).

Obris i putanje točkova idu u PDF, DXF i DWG na sloju C-ROAD-SWPT.

## Kako se računa

Svaka jedinica se okreće oko linije svoje zadnje osovine i vuče je tačka ispred nje (prednja osovina ili kuka), model malih brzina bez klizanja koji koriste provjere putanje vozila. Površina putanje je zbir obrisa tijela na svakoj poziciji. Ne modeluje brzinu, klizanje guma, vrijeme koje upravljanje treba da se okrene, upravljane prikolice ni razmak ispod tijela.
