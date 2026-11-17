---
title: Vnesite poligonski vlak in ga prilagodite s pravilom kompasa
summary: Vpišite kote ali smeri in razdalje, preverite kotno in linearno zaprtje ter natančnost, prilagodite s pravilom kompasa in postaje dodajte kot točke izmere ali zanko kot parcelo.
keywords: poligonski vlak, zaprt poligonski vlak, zanka, koti desno, vzvratni pogled, smeri, razdalje, zaprtje, odstopanje zaprtja, natančnost, pravilo kompasa, bowditch, prilagoditev, zemljiška izmera
from: 56ce5a8c
---

Poligonski vlak je niz izmerjenih odsekov: na vsaki postaji sta podana kot (ali smer) in razdalja do naslednje. Kliknite **Vnesite poligonski vlak** pod **Poligonski vlak** v desnem podoknu, kadar nič ni izbrano.

## Kje se začne in konča

1. **Začetek pri točki izmere**: njena številka. Ali vpišite severno in vzhodno koordinato.
2. **Odseki kot**: **Koti desno in razdalje** ali **Smeri in razdalje**.
3. Pri kotih povejte, od kod merijo: **Vzvratna točka izmere** ali **njen azimut** (od prve postaje proti vzvratni točki, v smeri urinega kazalca od severa).
4. **Konec**: **nazaj na začetku (zanka)** ali **na točki izmere** in njena številka (odprti poligonski vlak med znanimi točkami).

## Vpišite odseke

En odsek v eni vrstici, nato razdalja in po želji ime postaje, ki jo doseže:

- Koti desno, merjeni v smeri urinega kazalca na postaji, s katere odsek izhaja, od postaje zadaj do naslednje: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` in `270.0028` prav tako delujejo.
- Smeri: `N 45°30'15" E 125.50 B`, ali azimut kot ena beseda: `AZ 45-30-15 125.50 B`.
- Pri zanki s koti končajte z `close` in kotom na začetku, merjenim od zadnje postaje do druge: `close 270°00'05"`. Šele tako se preverijo koti.

Vrstice, ki jih ni mogoče prebrati, so navedene s številkami vrstic. Beseda feet, vejice in vrstice komentarjev s `#` so dovoljene.

## Preberite zaprtje

Med vpisovanjem pogovorno okno prikazuje:

- **Kotno odstopanje zaprtja**: za koliko se koti ne zapirajo in delež, ki ga dobi vsak kot. Brez zapiralnega kota se koti ne preverjajo, vsaka napaka v njih pa se pokaže v linearnem odstopanju.
- **Linearno odstopanje zaprtja**: za koliko se poligonski vlak konča mimo mesta, kjer bi se moral končati, in v kateri smeri.
- **Natančnost**: dolžina poligonskega vlaka, deljena z linearnim odstopanjem zaprtja: 1 : 10,000 pomeni 1 ft na 10,000 ft.
- Postaje po prilagoditvi in za koliko se je vsaka premaknila.

## Prilagoditev

Najprej se kotno odstopanje zaprtja enakomerno razporedi med kote. Nato se linearno odstopanje zaprtja razporedi po odsekih s pravilom kompasa (Bowditch): vsaka postaja se premakne proti odstopanju sorazmerno z dolžino, prevoženo do nje, tako da se poligonski vlak konča natanko tam, kjer mora.

:::note
Pravilo kompasa je standardna prilagoditev, ne metoda najmanjših kvadratov, in ne tehta kotov proti razdaljam. O tem, ali je natančnost dovolj dobra, odločajo vaši lastni standardi in predpisi vaše pristojnosti.
:::

## Uporaba rezultata

- **Dodaj kot točke izmere**: prilagojene postaje postanejo točke izmere z imeni, ki ste jih vpisali (sicer naslednje proste številke), opis `TRAV`, brez kote. Zadnja postaja zanke je njen začetek, zato se ne doda dvakrat. En korak: {{key:Mod+Z}} to razveljavi.
- **Dodaj kot parcelo** (zanke): prilagojene postaje postanejo [parcela](topic:parcels), z oznakami in opisom parcele.
- **Poročilo (CSV)**: vrstice zaprtja, nato smer, razdalja, neprilagojene in prilagojene koordinate ter popravki za vsako postajo.
