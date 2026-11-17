---
title: Kreslení parcel a psaní jejich právních popisů
summary: Nakreslete parcelu podle jejích rohů, nebo zadejte směry z listiny či geometrického plánu, zkontrolujte, jak dobře se směry uzavírají, popište na půdorysu směry a vzdálenosti, udělejte z libovolného úseku oblouk a zkopírujte koncept právního popisu.
keywords: parcely, pozemky, hranice pozemku, listina, geometrický plán, uzavření, odchylka, přesnost, právní popis, výchozí bod, oblouk, poloměr, plocha, akry
from: 6793d6ce
---

Parcely leží na půdorysu se směrníkem a vzdáleností podél každého přímého úseku (oblouk ukazuje svůj poloměr, délku a středový úhel) a jejich název a plocha uprostřed. Jdou do PDF vykreslení a exportů DWG a DXF, na vrstvách `V-PROP` (čáry) a `V-PROP-TEXT` (popisky). Vše je pod **Parcely** v pravém panelu, když nic není vybráno.

## Nakreslení parcely

1. Klikněte na **Nakreslit parcelu**.
2. Klikejte na rohy, počínaje výchozím bodem. Kliknutí blízko bodu zaměření převezme jeho přesnou polohu.
3. Klikněte znovu na první roh, nebo stiskněte {{key:Enter}}, pro dokončení. {{key:Backspace}} vrátí poslední roh zpět; {{key:Esc}} zahodí dosud zadané rohy; stisknutím znovu opustíte nástroj.

## Zadání směrů z listiny

1. Klikněte na **Zadat směry z listiny**.
2. Řekněte, kde směry začínají: číslo bodu zaměření, nebo souřadnici Y a X.
3. Napište nebo vložte směry, jeden na řádek:
   - přímka: směrník a vzdálenost, například `N 45°30'15" E 125.50`. Fungují i `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` a azimuty (`AZ 45°30'15"`); slova "thence", čárky a "feet" se ignorují.
   - oblouk: `C R 300 L 52.36 right` (poloměr a délka oblouku), nebo `C R 300 D 10°00'00" left` (poloměr a středový úhel). Oblouk navazuje na předchozí úsek; pokud ne, přidejte jeho tětivový směrník: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` začíná řádek s komentářem.
4. Jak píšete, dialog ukazuje délku směrů, **odchylku uzávěru** (jak daleko od začátku skončí a kterým směrem), **přesnost** (délka dělená odchylkou, 1 : 10,000 a tak dále) a plochu. Řádky, které nelze přečíst, se vypíší s jejich čísly řádků.
5. **Přidat parcelu**. Pokud se směry neuzavírají, parcela se uzavře přímým úsekem přes mezeru: zkontrolujte směry podle listiny. Chcete-li rozložit chybu polygonového pořadu do jeho úseků, nejdřív ji upravte.

## Oblouky

V **Vlastnostech** parcely má každý úsek **Poloměr**. Zadejte jej, aby se úsek stal obloukem mezi stejnými dvěma rohy (poloměr menší než polovina vzdálenosti mezi rohy nelze dosáhnout a je odmítnut). V **Obloucích** zvolte **Vpravo** nebo **Vlevo**: oblouk vpravo má střed vpravo od směru pohybu, jako v listině. Vymažte poloměr, aby byl úsek zase přímý. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

## Právní popis

Vlastnosti parcely končí jejím právním popisem, napsaným z výkresu:

- "Začíná v" **Výchozím bodu**, který zadáte (například "severovýchodní roh parcely 4"), jinak souřadnice Y a X prvního rohu, nebo bod zaměření, ze kterého směry začínaly.
- "pak" každý úsek: směrník a vzdálenost, nebo oblouk s jeho poloměrem, délkou oblouku, středovým úhlem a tětivovým směrníkem a vzdáleností.
- "Obsahuje" jeho plochu ve čtverečních stopách a akrech (ve čtverečních metrech a hektarech v projektu v metrech).

**Kopírovat** vloží text do schránky; **Stáhnout jako text** uloží soubor `.txt`.

:::warning
Právní popis je koncept vytvořený z výkresu, ne zaměření. Před použitím ho musí zkontrolovat a podepsat autorizovaný geodet a ověřit ho proti evidenci.
:::

Klikněte uvnitř parcely na půdorysu, abyste ji vybrali; {{key:Delete}} ji odstraní. Parcely se ukládají do souboru projektu.
