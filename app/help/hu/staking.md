---
title: Kitűzési jelentés készítése
summary: Kitűzési pontok felsorolása a tengelyen, állomásokon és eltolásokon, vagy a tengely közelében lévő felmérési pontoké, a szelvényszámmal, eltolással, észak- és keletkoordinátával, a tervezett és a terepi magassággal, valamint a bevágással vagy feltöltéssel; a jelentés mentése CSV-ben vagy PDF-ben.
keywords: kitűzés, kitűzési jelentés, kitűzési lap, bevágási lap, szintezési lap, állomás, eltolás, bevágás, feltöltés, elhelyezés, építési kitűzés, kivitelezési (as-built)
from: d8a4e9f1
---

Jelöljön ki egy tengelyt, majd a **Tulajdonságok** részében kattintson a **Kitűzési jelentés** gombra.

## Kitűzések állomásokon és eltolásokon

1. **Ettől** és **eddig**: a kitűzendő szelvények (1+50 vagy 150).
2. **Köz**: a kitűzések köze. A kitűzések annak minden többszörösénél készülnek, mindkét végén, és (ha a négyzet be van jelölve) ott, ahol a tengely ívei kezdődnek és érnek véget.
3. **Eltolások**: a tengelytől balra és jobbra, az állomásirányt nézve: `12 L, 0, 12 R`, `L12 CL R12` vagy `-12, 0, 12` (a bal oldal a mínusz). A folyosóval rendelkező tengely a burkolat széleivel és a padkákkal kezdődik.
4. **Számozás kezdete** és **Előtag**: ezekkel nevezi el a kitűzéseket: 1, 2, 3, vagy S101, S102.

## Felmérési pontok a tengely közelében

Válassza a **Felmérési pontok a tengely közelében** lehetőséget, és adja meg, milyen közel. Minden, ezen a távolságon belüli pont megkapja a szelvényszámát és eltolását, a ott lévő tervezett értéket, valamint a saját magasságát terepi magasságként. Ez a kitűzött vagy kivitelezés után (as-built) felmért pontok ellenőrzése.

## Mit tartalmaz a jelentés

| Oszlop | Jelentése |
|---|---|
| Pont | A kitűzés neve, vagy a felmérési pont száma |
| Szelvényszám, Eltolás | Hol van a tengely mentén: B bal, J jobb |
| Észak, Kelet | Koordinátái |
| Tervezett magasság | A kialakított terep felülete ott (takarási vonaltól takarási vonalig), egyébként a tervezett hossz-szelvény a középvonalon |
| Terepi magasság | Az ott lévő meglévő felület, vagy a felmérési pont saját magassága |
| Bevágás/feltöltés | C, ha a terep a tervezett felett van (le kell vágni), F, ha alatta (fel kell tölteni), a századig |

Tervezett magasság nélküli kitűzésnél (a folyosón kívül, vagy olyan tengelynél, amelynek nincs ilyen, a középvonaltól távol) nincs bevágás vagy feltöltés; a párbeszédpanel megadja, hány ilyen van.

## Mentés

- **CSV**: egy címsor, utána a fenti oszlopok, továbbá a bevágás vagy feltöltés előjeles számként (terep mínusz tervezett), táblázatkezelőknek és adatgyűjtőknek.
- **PDF**: táblázatlapok a kiválasztott papírméreten, soronként egy kitűzéssel; a bevágások narancssárgák, a feltöltések zöldek, a többi lap címsávjával együtt.

:::note
A kitűzések a projektben lévő tervből készülnek. Mielőtt bármi megépül, ellenőrizze őket a jóváhagyott tervekkel.
:::
