---
title: Zadať polygónový ťah a vyrovnať ho metódou kompasu
summary: Zadajte uhly alebo smerníky a dĺžky, skontrolujte uhlový a lineárny uzáver a presnosť, vyrovnajte metódou kompasu a pridajte stanoviská ako body alebo slučku ako parcelu.
keywords: polygónový ťah, uzavretý polygónový ťah, slučka, uhly vpravo, spätný zámer, smerníky, dĺžky, uzáver, odchýlka uzáveru, presnosť, metóda kompasu, Bowditch, vyrovnanie, geodézia
from: 56ce5a8c
---

Polygónový ťah je rad meraných úsekov: na každom stanovisku uhol (alebo smerník) a dĺžka k ďalšiemu. Kliknite na **Zadať polygónový ťah** pod **Polygónový ťah** na pravom paneli, keď nič nie je vybrané.

## Kde začína a kde končí

1. **Začať na bode**: jeho číslo. Alebo zadajte Y a X.
2. **Úseky ako**: **Uhly vpravo a dĺžky**, alebo **Smerníky a dĺžky**.
3. Pri uhloch uveďte, odkiaľ začínajú: **Spätný zámer na bode**, alebo **jeho azimut** (od prvého stanoviska k spätnému zámeru, v smere hodinových ručičiek od severu).
4. **Koniec**: **späť na začiatok (slučka)**, alebo **na bode** a jeho číslo (otvorený polygónový ťah medzi známymi bodmi).

## Zadajte úseky

Jeden úsek na riadok: najskôr uhol alebo smerník, potom dĺžka a potom názov stanoviska, ku ktorému úsek dospeje, ak chcete:

- Uhly vpravo, otočené v smere hodinových ručičiek na stanovisku, z ktorého úsek vychádza, od stanoviska za ním k ďalšiemu: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` a `270.0028` fungujú tiež.
- Smerníky: `N 45°30'15" E 125.50 B`, alebo azimut ako jedno slovo: `AZ 45-30-15 125.50 B`.
- Pri slučke s uhlami ukončite riadok slovom `close` a uhlom na začiatku, otočeným od posledného stanoviska k druhému: `close 270°00'05"`. Tým sa overujú uhly.

Riadky, ktoré sa nedajú prečítať, sú uvedené s číslami riadkov. "feet", čiarky a riadky komentára `#` sú v poriadku.

## Vyhodnoťte uzáver

Ako píšete, dialóg zobrazuje:

- **Uhlová odchýlka uzáveru**: o koľko sú uhly od uzavretia a podiel, ktorý pripadá na každý uhol. Bez uzatváracieho uhla sa uhly nekontrolujú a každá chyba v nich sa prejaví v lineárnej odchýlke uzáveru.
- **Lineárna odchýlka uzáveru**: o koľko sa polygónový ťah končí od miesta, kde by mal skončiť, a v akom smere.
- **Presnosť**: dĺžka polygónového ťahu delená lineárnou odchýlkou uzáveru: 1 : 10,000 znamená 1 ft na 10,000 ft.
- Stanoviská po vyrovnaní a o koľko sa každé z nich posunulo.

## Vyrovnanie

Najskôr sa uhlová odchýlka uzáveru rozdelí rovnomerne medzi uhly. Potom sa lineárna odchýlka uzáveru rozdelí medzi úseky metódou kompasu (Bowditch): každé stanovisko sa posunie proti odchýlke úmerne dĺžke prejdenej k nemu, takže polygónový ťah skončí presne tam, kde má.

:::note
Metóda kompasu je štandardné vyrovnanie, nie vyrovnanie metódou najmenších štvorcov, a neváži uhly oproti dĺžkam. To, či je presnosť dostatočná, posudzujte podľa vlastných noriem a predpisov vašej jurisdikcie.
:::

## Použite výsledok

- **Pridať ako body**: vyrovnané stanoviská sa stanú bodmi s názvami, ktoré ste zadali (inak s nasledujúcimi voľnými číslami), s popisom `TRAV` a bez výšky. Posledné stanovisko slučky je jej začiatok, takže sa nepridá dvakrát. Jeden krok: {{key:Mod+Z}} to vráti späť.
- **Pridať ako parcelu** (slučky): vyrovnané stanoviská sa stanú [parcelou](topic:parcels), s jej popiskami a popisom pozemku.
- **Správa (CSV)**: riadky uzáveru, potom pri každom stanovisku smer, dĺžka, nevyrovnané a vyrovnané súradnice a opravy.
