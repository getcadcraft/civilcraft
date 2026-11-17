---
title: Kreslenie parciel a zápis ich právnych popisov
summary: Nakreslite parcelu podľa jej rohov alebo zadajte údaje z listiny či z geometrického plánu, skontrolujte, ako dobre sa údaje uzatvárajú, označte smery a vzdialenosti v pôdoryse, urobte ľubovoľný úsek oblúkom a skopírujte návrh právneho popisu.
keywords: parcely, pozemky, hranice, hranica pozemku, listina, geometrický plán, smerník, vzdialenosť, uzáver, chyba uzáveru, presnosť, právny popis, začiatočný bod, oblúk, polomer, plocha, acres
from: 6793d6ce
---

Parcely sú v pôdoryse so smerníkom a vzdialenosťou pozdĺž každého priameho úseku (oblúk ukazuje svoj polomer, dĺžku a stredový uhol) a s ich názvom a plochou v strede. Idú do PDF vykreslenia a do exportov DWG a DXF, na vrstvy `V-PROP` (čiary) a `V-PROP-TEXT` (popisy). Všetko je v pravom paneli pod **Parcely**, keď nič nie je vybrané.

## Kreslenie parcely

1. Kliknite na **Nakresliť parcelu**.
2. Klikajte na rohy, začínajúc od začiatočného bodu. Kliknutie blízko geodetického bodu použije presné umiestnenie tohto bodu.
3. Kliknite znova na prvý roh alebo stlačte {{key:Enter}}, aby ste dokončili. {{key:Backspace}} vráti späť posledný roh; {{key:Esc}} zruší doterajšie rohy; stlačte ho znova, aby ste opustili nástroj.

## Zadanie úsekov z listiny

1. Kliknite na **Zadať údaje z listiny**.
2. Povedzte, kde údaje začínajú: číslo geodetického bodu, alebo sever a východ.
3. Napíšte alebo vložte údaje, jeden na riadok:
   - úsek: smerník a vzdialenosť, napríklad `N 45°30'15" E 125.50`. Fungujú aj `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` a azimuty (`AZ 45°30'15"`); slová "thence", čiarky a "feet" sa ignorujú.
   - oblúk: `C R 300 L 52.36 right` (polomer a dĺžka oblúka) alebo `C R 300 D 10°00'00" left` (polomer a stredový uhol). Oblúk nadväzuje na predchádzajúci úsek; ak nie, pridajte smerník jeho tetivy: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` začína riadok komentára.
4. Ako píšete, dialógové okno ukazuje dĺžku údajov, **uzáverovú chybu** (ako ďaleko od začiatku skončia a v akom smere), **presnosť** (dĺžka vydelená uzáverovou chybou, 1 : 10,000 a podobne) a plochu. Riadky, ktoré nedokáže prečítať, sú vypísané s ich číslami riadkov.
5. **Pridať parcelu**. Ak sa údaje neuzatvárajú, parcela sa uzavrie priamym úsekom cez medzeru: skontrolujte údaje voči listine. Ak chcete rozložiť chybu polygónového ťahu medzi jeho úseky, najprv ju upravte.

## Oblúky

V **Vlastnostiach** parcely má každý úsek **Polomer**. Zadajte ho, aby sa tento úsek stal oblúkom medzi tými istými dvoma rohmi (polomer menší než polovica vzdialenosti medzi rohmi sa nedá dosiahnuť, a preto sa odmietne). V **Oblúkoch** vyberte **Vpravo** alebo **Vľavo**: oblúk vpravo má stred vpravo od smeru pohybu, ako v listine. Vymazaním polomeru ho opäť urobíte priamym. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Právny popis

Vlastnosti parcely končia jej právnym popisom, napísaným z výkresu:

- "Začína sa v" **Začiatočnom bode**, ktorý zadáte (napríklad "severovýchodný roh parcely 4"), inak sever a východ prvého rohu, alebo geodetický bod, z ktorého údaje začali.
- "potom" každý úsek: smerník a vzdialenosť, alebo oblúk s jeho polomerom, dĺžkou oblúka, stredovým uhlom a smerníkom a vzdialenosťou tetivy.
- "Obsahuje" jej plochu v square feet a acres (v metrickom projekte v square meters a hectares).

**Kopírovať** vloží text do schránky; **Stiahnuť ako text** ho uloží ako súbor `.txt`.

:::warning
Právny popis je návrh z výkresu, nie geodetické zameranie. Licencovaný geodet ho musí skontrolovať voči záznamu a podpísať, kým sa na neho ktokoľvek spolieha.
:::

Kliknutím do parcely v pôdoryse ju vyberiete; {{key:Delete}} ju odstráni. Parcely sa ukladajú do súboru projektu.
