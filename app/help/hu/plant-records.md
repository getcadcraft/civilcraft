---
title: Növényrekordok, fajták és megadott méretek
summary: A projekt saját növénylistája táblázatként: fajták, megadott méretek (konténer, gyökérlabda, törzskerület, szabad törzs), sűrűség, specifikációs megjegyzések, CSV be- és kivitel; minden elhelyezett növény méretet nevez meg; növényjelképek méretarány szerint, valamint saját jelképek és 3D-s modellek.
keywords: növénytábla, növényadatbázis, fajta, változat, megadott méret, konténer, gyökérlabda, csupasz gyökér, törzskerület, szabad törzs, sűrűség, négyzetméterenkénti növény, specifikáció, specifikációs megjegyzések, növényjelkép, blokk, saját jelkép, 3D-s növény, részletességi szint, méretarány
from: 12251beb
---

Nyissa meg a Tájépítészet csoport {{ui:Továbbiak}} menüjéből a {{ui:Növénytábla}} elemet, vagy a Növények szakaszból. Minden sor egy növényrekord a projekt saját listájában (a növénylistából egy rekord másolódik be, amikor hozzáadja). Minden szerkesztést ugyanúgy ellenőrzünk, mint egy importált fájlt, és minden szerkesztés egy visszavonási lépés.

## Az oszlopok

- **Tudományos név**, **Köznév**, **Típus**, **Magasság** és **Terjedelem** érett állapotban (méter).
- **Távolság** (középponttól középpontig) vagy **Sűrűség** (növény/m²). Sűrűséggel, de távolság nélkül megadott rekord ágya ezzel a sűrűséggel töltődik ki, a saját mintájának (háromszög vagy négyzet) szerint.
- **Megadott méretek**: méretenként egy bejegyzés, `;` választja el egymástól. Minden bejegyzés egy azonosító, egy típus (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`), majd tetszőlegesen: térfogat `10L`, magasság `h0.6`, terjedelem `s0.4`, törzskerület `g14-16` (cm), szabad törzs `st1.8`. Példa: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Fajták**: nevek, `;` választja el őket. Egy fajta megtartja a saját méreteit és megjegyzéseit, ha a beolvasott fájlban voltak ilyenek.
- **Specifikációs megjegyzések**.

A {{ui:Kettőzés}} új kulccsal másol egy sort. A {{ui:Mentés CSV-ként}} és a {{ui:Mentés növényfájlként}} kiírja a listát (a fajták CSV-sorai a fajuk alá kerülnek, a `cultivar_of` mezővel). A CSV- vagy növényfájl importálása egyesíti a meglévő adatokkal.

## Saját könyvtári növénylista

Jelentkezzen be a CadCraft-fiókjába (Beállítások, Saját bővítmények, Bejelentkezés), és a növénytábla használhatja a könyvtárban tárolt listáját:

- A {{ui:Saját könyvtári listámból}} behozza a saját növényelemeit (a felülvizsgálatra váró elemeket is). Az itt már meglévő növényt a könyvtárból frissíti; az itt hozzáadott fajtákat, megadott méreteket, sűrűséget és specifikációt megtartja.
- A {{ui:Mentés növénylistaként}} minden sort saját könyvtári növényelemként ment, fajonként egy elemként: az új növény új elem, a megváltozott növény új verzió, a változatlan marad. Először pipálja be a jelölőnégyzetet: a mentés a növényeket a nyilvánosság számára CC0 alatt adja közre. Egy még nem megbízható feltöltő első nyilvános feltöltését egy személy ellenőrzi, mielőtt megjelenne, ahogy minden feltöltést.

A könyvtár az alapvető növényrekordot tárolja. A fajták, a megadott méretek, a sűrűség és a specifikációs megjegyzések a projektben és a növényfájlban ({{ui:Mentés növényfájlként}}) maradnak; a párbeszédpanel minden mentéskor megmondja, hány sort érint.

## Az elhelyezett növény mérete

Jelöljön ki egy növényt, egy sövényt, vagy egy ágy vagy területi növényzet keverékének sorát: ha a rekordnak vannak fajtái vagy megadott méretei, a {{ui:Fajta és méret}} választ egyet. A növénykimutatás ezután fajonként, fajtánként és méretenként számol, a felirat pedig megjelenítheti őket: `{botanical} '{cultivar}' {size}` vagy `{full}`.

## Növényjelképek méretarány szerint

{{ui:Növénygrafika}} (Tájépítészet › {{ui:Továbbiak}}) határozza meg, hogyan rajzolódnak ki a növények az alaprajzon: **automatikus** (az 1:500-nál durvább méretarányban a terjedelem köré rajzolt kör, 1:200 és 1:500 között középponttal rendelkező körvonal, finomabbnál a részletes jelkép; mindkét méretarány módosítható), vagy egy szint minden méretarányhoz. A Lapok párbeszédpanel saját **Növény részletessége alaprajzon** beállítással rendelkezik ehhez a készlethez.

A rekord Növények szakaszában a {{ui:Saját jelkép…}} SVG-t vagy DXF/DWG-rajz blokkját olvassa be, és a növény terjedelmében, részletes szinten rajzolja ki. A {{ui:Saját 3D-s modell…}} OBJ, STL vagy GLB fájlt olvas; a Növénygrafikában válassza a **Minden rekord saját modellje** lehetőséget, hogy 3D-ben lássa. A fájlok korlátozottak (512 KB SVG, 2000 alakzat, 50 000 háromszög), és a projektben maradnak meg. Az SVG-átalakítások nem alkalmazódnak (erről értesítést kap, ha a fájlban vannak). A szintekről, a korlátokról és arról, mit tartalmazhat egy GLB, lásd: [Növénygrafika, saját jelképek és 3D-s növények](topic:plant-graphics).
