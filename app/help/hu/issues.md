---
title: Problémák és BCF
summary: Rögzítsen egy problémát a tervhez, egy nyomvonal-szelvényhez, egy felületi ponthoz vagy egy csőhöz, adjon neki állapotot és megjegyzéseket, és cserélje a problémákat BCF 2.1-fájlként a LandXML-fájl mellett.
keywords: probléma, problémák, bcf, megjegyzés, jelölés, hiba, helyszín, rögzítés, állapot, nyitott, megoldva, lezárt, BIM-együttműködési formátum, landxml, problémák
from: e44153b1
---

A probléma olyan megjegyzés, amely a CivilCraft-rajz egy helyéhez van rögzítve, és címe, állapota és megjegyzései vannak. Arra használja, hogy megmondja a helyszíni munkatársaknak vagy egy másik programnak, mit kell megnézniük, és hogy visszaolvassa, amit válaszolnak.

## Probléma hozzáadása

1. Nyissa meg a **Felület, További, Problémák (BCF)...** menüpontot.
2. Írjon be egy címet, és írja le, mi a hiba.
3. Válassza ki, hová rögzítse: az alaprajz nézetének középpontját, a középponti felületi pontot, a kijelölt nyomvonal egy szelvényét (írja be a szelvényszámot és az eltolást; a jobb oldal pozitív), vagy a kijelölt csövet, műtárgyat vagy jellemzővonalat.
4. Nyomja meg a **Probléma hozzáadása** gombot. A rögzítőjel az alaprajzon kis rombuszként jelenik meg a számával.

Kattintson a probléma címére a ráközelítéshez, módosítsa az állapotát a listában (Nyitott, Aktív, Megoldva, Lezárt), és adjon hozzá megjegyzéseket. Minden módosítás egy visszavonási lépés, a problémák pedig a projektfájlban mentődnek.

## Csere BCF-formátumban

- A **BCF exportálása** BCF 2.1-fájlt ír, problémánként egy témakörrel: cím, állapot, megjegyzések, valamint egy nézőpont merőleges alaprajzi kamerával és a rögzítőjellel.
- A **BCF importálása** BCF-fájlt olvas (a 2.0 és 3.0 fájlokat annyiban, amennyiben megfelelnek a 2.1-nek). Ha egy témakör guid-ja már megvan, az a probléma frissül (állapot, új megjegyzések), ahelyett hogy második példány jönne létre.
- A **Létrehozás a Problémákból** problémát készít a Problémák panel minden olyan nyitott bejegyzéséből, amely megmondja, hol van.

A BCF ebben a projektben a saját koordinátáit viszi, méterben, eltolás nélkül. A másik programnak ugyanabban a koordinátarendszerben kell lennie, mint a LandXML-fájl, hogy a rögzítőjelek a helyükre kerüljenek. A rögzítőjel által mutatott elem (nyomvonal, szelvényszám, eltolás, cső) „cc:” kezdetű címkékként utazik, amelyeket a CivilCraft visszaolvas.

## Amit nem ellenőriztünk

A rögzítőjeleket és a nézőpontokat csak úgy teszteltük, hogy fájlt írtunk, és azt visszaolvastuk a CivilCraftban. Még egyetlen másik BIM-program sem nyitotta meg őket. A BCF „view to world scale” mezőjére vonatkozóan – hogy a nézet teljes vagy fél magasságát jelenti-e – a programok eltérnek: a CivilCraft a teljes magasságot írja.
