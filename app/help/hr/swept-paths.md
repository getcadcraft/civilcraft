---
title: Prijeđene putanje vozila
summary: Vozite vozilo s do tri prikolice duž značajne linije ili osi trase, naprijed ili unatrag, i pogledajte površinu koju prelazi, putanje kotača, upravljanje i mjesto gdje se prelama.
keywords: prijeđena putanja, putanja skretanja, praćenje vozila, predložak skretanja, projektno vozilo, kamion, autobus, prikolica, poluprikolica, vožnja unatrag, prelamanje, zglob, zaključavanje upravljača, odstupanje, putanja kotača, istovarna rampa, radijus skretanja
from: 8caafb8a
---

Prijeđena putanja vozi vozilo duž linije i prikazuje tlo preko kojeg mu prolazi karoserija. Koristite je da provjerite može li kamion skrenuti za zavoj, doći do istovarne rampe ili unatrag ubaciti prikolicu na mjesto bez izlaska s kolnika.

## Vozite vozilo duž linije

1. Nacrtajte liniju kojom vozilo ide, u smjeru vožnje: značajnu liniju (lukovi su u redu: pritisnite {{key:C}} dok je crtate, vidi [Značajne linije](topic:feature-lines)) ili os trase.
2. Odaberite je i kliknite {{ui:Prijeđena putanja…}} u njezinim **Svojstvima**.
3. Pod **Početak od**, odaberite vozilo, zatim postavite njegove dimenzije prema vašem projektnom vozilu: širinu, prednji prevjes, međuosovinski razmak, stražnji prevjes, trag i **Zaključavanje upravljača**. Dodajte do tri prikolice, svaku s mjestom spajanja, duljinom od spojne točke do osovine, svojim prevjesima i **Najvećim zglobom**.
4. Odaberite **Vožnja**: naprijed ili unatrag. Kliknite {{ui:Provezi}}.

:::warning
Vozila s kojih se polazi su privremena, a ne standard. Postavite dimenzije prema projektnom vozilu koje vaš projekt koristi.
:::

## Naprijed i unatrag

| Vožnja | Što prati liniju | Što CivilCraft izračunava |
|---|---|---|
| **Naprijed** | Središte prednje osovine | Kamo idu stražnja osovina i svaka prikolica, kut upravljanja i zglob |
| **Unatrag** | Središte zadnje osovine (stražnji dio prikolice) | Kamo ide svaka jedinica ispred, i upravljanje koje kabini treba da prikolicu postavi tamo |

Vožnja unatrag je način na koji se provjerava manevar unatrag: recite gdje prikolica treba ići, a CivilCraft kaže može li kabina to izvesti.

## Pročitajte rezultat

Prijeđena putanja je na tlocrtu nacrtana narančasto: njezin obris i, isprekidano, putanje vanjskih kotača. Odaberite je (kliknite unutar nje) da u **Svojstvima** vidite:

- **Prijeđenu duljinu**, najveći kut **Upravljanja** i **Zgloba** u odnosu na njihove granice, te **Prijeđenu površinu**.
- Svaki problem duž linije, s njegovom udaljenošću: upravljanje iznad zaključavanja ili prikolica koja skreće preko granice zgloba (prelama se).
- **Vozilo duž linije**: pomaknite klizač da vidite vozilo u bilo kojoj točki, s njegovim upravljanjem i zglobom tamo.

Promijenite liniju i prijeđena putanja slijedi. {{ui:Uredi vozilo…}} mijenja dimenzije; **Vožnja** prebacuje između naprijed i unatrag. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava. {{key:Delete}} briše odabranu prijeđenu putanju (linija ostaje).

Obris i putanje kotača idu u PDF, DXF i DWG na sloj C-ROAD-SWPT.

## Kako se računa

Svaka jedinica se okreće oko linije svoje stražnje osovine i vuče je točka ispred nje (prednja osovina ili spojna točka), model male brzine bez klizanja koji koriste provjere prijeđenih putanja. Prijeđena površina je zbroj obrisa karoserije na svakom položaju. Ne modelira se brzina, klizanje guma, vrijeme koje upravljanje treba za okretanje, upravljane prikolice ni razmak ispod karoserije.
