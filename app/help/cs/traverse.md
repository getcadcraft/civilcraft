---
title: Zadání polygonového pořadu a jeho vyrovnání pravidlem kompasu
summary: Zadejte úhly nebo směrníky a délky, zkontrolujte úhlový a délkový uzávěr a přesnost, vyrovnejte pravidlem kompasu a přidejte stanoviště jako body zaměření nebo smyčku jako parcelu.
keywords: polygonový pořad, uzavřený pořad, smyčka, úhly vpravo, zpětná záměra, směrníky, délky, uzávěr, odchylka uzávěru, přesnost, pravidlo kompasu, bowditch, vyrovnání, zaměření
from: 56ce5a8c
---

Polygonový pořad je řada měřených úseků: na každém stanovišti úhel (nebo směrník) a délka k dalšímu. Klikněte na **Zadat polygonový pořad** v části **Polygonový pořad** v pravém panelu, když nic není vybráno.

## Kde začíná a končí

1. **Začátek v bodu**: jeho číslo. Nebo zadejte sever a východ.
2. **Úseky jako**: **Úhly vpravo a délky**, nebo **Směrníky a délky**.
3. U úhlů uveďte, odkud začínají: **Bod zpětné záměry**, nebo **jeho azimut** (od prvního stanoviště k zpětné záměře, ve směru hodinových ručiček od severu).
4. **Konec**: **zpět na začátek (smyčka)**, nebo **v bodu** a jeho číslo (otevřený pořad mezi známými body).

## Zadejte úseky

Jeden úsek na řádek: nejprve úhel nebo směrník, pak délka a případně název stanoviště, ke kterému úsek vede:

- Úhly vpravo, otočené ve směru hodinových ručiček na stanovišti, ze kterého úsek vychází, od stanoviště za sebou k dalšímu: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` a `270.0028` fungují také.
- Směrníky: `N 45°30'15" E 125.50 B`, nebo azimut jako jedno slovo: `AZ 45-30-15 125.50 B`.
- U smyčky s úhly ukončete řádek příkazem `close` a úhlem na začátku znovu, otočeným od posledního stanoviště ke druhému: `close 270°00'05"`. Tím se úhly kontrolují.

Řádky, které nelze přečíst, se vypíší s čísly řádků. "feet", čárky a řádky komentáře začínající `#` jsou v pořádku.

## Přečtěte uzávěr

Jak píšete, dialog zobrazuje:

- **Úhlová odchylka uzávěru**: jak daleko jsou úhly od uzavření a podíl, který každý úhel zabírá. Bez uzavíracího úhlu se úhly nekontrolují a případná chyba v nich se projeví v délkové odchylce.
- **Délková odchylka uzávěru**: jak daleko od místa, kde má pořad skončit, pořad končí, a jakým směrem.
- **Přesnost**: délka pořadu dělená délkovou odchylkou: 1 : 10,000 znamená 1 ft na 10,000 ft.
- Stanoviště po vyrovnání a o kolik se každé posunulo.

## Vyrovnání

Nejprve se úhlová odchylka rozloží rovnoměrně na úhly. Pak se délková odchylka rozloží na úseky pravidlem kompasu (Bowditch): každé stanoviště se posune proti odchylce úměrně délce, kterou urazil, aby se k němu dostal, takže pořad skončí přesně tam, kde má.

:::note
Pravidlo kompasu je standardní vyrovnání, nikoli vyrovnání metodou nejmenších čtverců, a nevažuje úhly proti délkám. Zda je přesnost dostatečná, je věcí vašich vlastních norem a předpisů v dané jurisdikci.
:::

## Použijte výsledek

- **Přidat jako body zaměření**: vyrovnaná stanoviště se stanou body zaměření s názvy, které jste zadali (jinak se použijí další volná čísla), s popisem `TRAV` a bez výšky. Poslední stanoviště smyčky je její začátek, takže se nepřidá dvakrát. Jeden krok: {{key:Mod+Z}} to vrátí zpět.
- **Přidat jako parcelu** (smyčky): vyrovnaná stanoviště se stanou [parcelou](topic:parcels), s jejími popisky a popisem pozemku.
- **Přehled (CSV)**: řádky uzávěru, pak směr, délka, nevyrovnané a vyrovnané souřadnice a opravy každého stanoviště.
