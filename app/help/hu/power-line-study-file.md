---
title: Vizsgálati fájlok más légvezeték-programhoz (.DON)
summary: Egy légvezeték mentése .DON vizsgálati fájlként, vagy egy ilyen fájl tartóinak beolvasása egy új vezetékbe. Az azt olvasó programmal nincs tesztelve.
keywords: don, .don, vizsgálati fájl, xml, exportálás, importálás, légvezeték-program, huzalfeszítés, canton
from: 1abc4d07
---

Egyes légvezeték-programok egy vizsgálatot `.DON` fájlban tartanak (XML szöveg). A CivilCraft egy vezetéket ilyen fájlként ki tud írni, és egy ilyen fájl tartóit be tudja olvasni.

:::warning
**Nincs tesztelve.** Ezt egy felhasználó által megosztott, a formátum mezőneveiből készült lista alapján építettük, nem valódi fájlból, és a fájljainkat még nem nyitottuk meg abban a programban, amely olvassa őket. Nyissa meg ott a fájlt, és ellenőrizzen minden értéket, mielőtt építene rá. Ha egy `.DON` fájl megoszthatóvá válik (az ügyféladatok eltávolításával), az segít nekünk ezt helyesen megcsinálni.
:::

## Vizsgálati fájl mentése

1. Adjon a vezetéknek vezetőt, és győződjön meg róla, hogy vannak eredményei (a Tulajdonságokban nem szerepelhet a „nincs kiszámítva”).
2. {{ui:Továbbiak}} › {{ui:Vizsgálati fájl mentése (.DON)…}}, válassza ki a vezetéket, adjon meg leírást és munkaszámot.
3. {{ui:A vizsgálati fájl mentése}}.

A fájl tartalmazza a vezeték tartóit (koordináták, talaj, magasságok, szerepek, keresztkar, a megtartott vagy javasolt tartó, terhelések terhelési esetenként, alapozás), szakaszonként egy-egy blokkot a végtartók között (vezető, feszültség, irányadó fesztávolság, fesztávok, feszítőerő és láncgörbe-paraméter, a legnagyobb feszítőerő terhelési esetenként), valamint a huzalfeszítési táblázatokat. A hosszúságok méterben, az erők daN-ban vannak; a szöveg Latin-1 kódolással íródik, így a kódtáblán kívüli karakter `?` lesz.

## Vizsgálati fájl beolvasása

{{ui:Továbbiak}} › {{ui:Vizsgálati fájl megnyitása (.DON)…}} beolvassa a tartókat egy új vezetékbe. A vezetőt, a tartókat és a keresztkarokat a könyvtárral nevük alapján párosítja; amit nem talál, azt a **Tulajdonságok** panelen kell kiválasztani.
