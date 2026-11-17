---
title: Talajmódosítók és élő szintek
summary: Minden, ami a tervezett terepet alakítja, egy sorrendezett listában (később lévő nyer ott, ahol átfednek), bevágás és feltöltés módosítónként, csatlakozási ellenőrzések a Problémák panelen, valamint pontszintek és lejtésnyilak, amelyek élőben olvassák a terepet.
keywords: talajmódosítók, lista, sorrend, tervezett terep, meglévő terep, átfedés, bevágás és feltöltés, csatlakozás, támfal, burkolatszél, ágyazási szint, lépcsőpihenő, pontszint, pontmagasság, lejtésnyíl, lejtésfelirat, esés
from: 3998a5b0
---

A tervezett terep = meglévő terep + a módosítók, sorrendben. A meglévő terep soha nem változik.

## A lista

{{ui:Szintek}} › {{ui:Talajmódosítók…}} felsorolja az összes olyan objektumot, amely alakítja a terepet: emelvényeket, földtöltéseket, vápákat, tereprendezési területeket, burkolatokat és utakat, szintre készített ültetési területeket, valamint azokat a lépcsőket és rámpákat, amelyeknél be van jelölve az **Alakítja a terepet** négyzet (az alsó és a felső szintjükkel együtt). Ahol kettő átfed, a **későbbi** nyer. A sor húzásával vagy a nyilakkal változtatható a sorrend; a terep azonnal újraépül. Minden sor megmutatja a saját bevágását és feltöltését (azt, amit a fölötte lévők után formál), a lista alatt pedig az összeg látható.

## Csatlakozás-ellenőrzések

A Problémák panel a **Ugrás** gombbal listázza:

- olyan falat, amelynek magas oldala a teteje fölött van (talaj a fal fölött), vagy amelynek alacsony oldalán látszik az alapozása;
- olyan ültetési területet, amelynek kész szintje a találkozó burkolatszél fölött van, vagy a tipikus 150 mm-nél jobban van alatta;
- olyan lépcsőket, amelyeknek alja vagy teteje nem csatlakozik a burkolathoz, amelyre érkeznek;
- két módosítót, amely átfed (ott a későbbi nyer).

A támfal teteje követheti a talaj magas oldalát: magassága minden alkalommal újraszámítódik, amikor a talaj változik.

## Támfal, amely alakítja a terepet

Jelöljön ki egy támfalat, és jelölje be az **Alakítja a terepet** négyzetet. A fal alatti sáv (olyan széles, mint amilyen vastag a fal) módosítóként bekerül a listába:

- a **magas oldali** él a talajhoz van tartva, állomásonként, így a fal teteje követi a magas oldalt (a koronázással a tetején). Ha beír egy **Teteje** szintet, akkor a magas oldalt ezen a szinten tartja, a koronázás levonásával;
- az **alacsony oldali** élt a megadott **Alacsony oldalon tartott terep** szinten tartja, vagy ha üresen hagyja, ott a talajon;
- a magas oldal az az oldal, amelynek a talaja a fal egész hossza fölött magasabb, így a sáv a fal mentén nem vált át;
- a sávon túli talaj nem változik, a meglévő terep pedig soha nem változik.

Mint bármely módosító, ez is a listában van, és a később következő módosító nyer, ahol átfedik. Ha a fal egy végén a tartott szint több mint a tipikus 150 mm-rel tér el a meglévő talajtól, figyelmeztetés kerül a Problémák panelre (**Ugrás** gombbal). A szabadon álló fal nem alakítja a terepet. A jelölőnégyzet a korábbi buildekből származó fájlokban ki van kapcsolva, így azok úgy nyílnak meg, ahogy voltak.

## Pontszintek és lejtésnyilak

{{ui:Pontszint}} (egy kattintás) és {{ui:Lejtésnyíl}} (két kattintás) minden rajzoláskor beolvassa a terepet: ha mozgat vagy újra szintez egy objektumot, a feliratok követik. A Tulajdonságokban kiválasztható, hogy a felirat a tervezett vagy a meglévő terepet mutassa; a meglévő terepre vonatkozó feliratok zárójelben látszanak. A nyilak lefelé mutatnak, és ilyen szöveget jelenítenek meg: `1:20 (5.0 %)`.
