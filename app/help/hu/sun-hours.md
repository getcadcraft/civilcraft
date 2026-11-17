---
title: A napos órák kiszámítása egy területen
summary: Válasszon egy napot (vagy évszakot) és időzónát, és lássa az egyes épülettömegek minden falára és körülöttük a talajra eső közvetlen napsütés óráit, a talajt az alaprajzon, a számokat CSV-ben.
keywords: nap, napos órák, árnyék, árnyékolás, napfény-hozzáférés, nappali órák, homlokzat, fal, évszak, napforduló, napéjegyenlőség, időzóna, nyári időszámítás, szélesség, hosszúság, CSV, raszter
from: 4e32a314
---

A **Napos órák** számolja a közvetlen napsütés óráit, amelyek minden épülettömeg minden falát és körülötte a talajt érik, egy kiválasztott napon vagy évszakra átlagolva. A tömegek és maga a talaj vetnek árnyékot; más nem (fák, nem rajzolt szomszédok nem). A nem közvetlen égboltfény nincs beszámítva.

## Mielőtt elkezdi

A nap helyzete a terület szélességi és hosszúsági fokából származik, ezek a projekt **koordináta-rendszeréből** jönnek. A koordináta-rendszer nélküli projekt üzenettel elutasításra kerül: állítsa be először (**Koordináták** a GIS csoportban). Egy kézzel beírt szélesség és hosszúság találgatás volna, ezért nincs hozzájuk mező.

## Kiszámítás

A **Tulajdonságok** alatt, az **Épülettömegek** és a **Napos órák** részben:

1. Válassza ki a **Nap** értékét. Az a nap a kezdő, amikor a nap ott a legalacsonyabban jár, ahol Ön van (december 21., illetve a déli féltekén június 21.). Évszakhoz jelölje be az **Évszakra átlagolva** négyzetet, válassza ki az **Utolsó nap** értékét, és azt, hány naponként mintavételezzen.
2. Írja be az **Időzóna** értékét: egy nevet, például `America/Mexico_City`, vagy az UTC-hez képesti eltolást, például `-6`. A név az adott zóna nyári időszámítási szabályait követi a napra; a beírt eltolás pontosan úgy számít, ahogy megadja, ezért az adott napon érvényest írja be. A mező alatti sor megmondja, melyik eltolást találta.
3. Válassza ki, milyen gyakran helyezze el a napot (5, 10, 15 vagy 30 percenként), majd nyomja meg a **Napos órák kiszámítása** gombot. Az évszakos számítás háttérfolyamatként fut; a **Leállítás** megszakítja.

## Mit kap

- Tömegenként egy táblázat: a **legrosszabb fal**, az **átlag** és a **legjobb fal** napi órákban, valamint egy táblázat minden faláról azzal, hogyan néz, és szintenként az óraszámaival.
- A tömegek körüli talaj az alaprajzon, a sötéttől (nincs nap) a sárgáig (a legtöbb, amit egy cella kap), jelmagyarázattal. Az épülettömegek alatti cellák üresek. A **Talaj megjelenítése az alaprajzon** kikapcsolja.
- A **Falak CSV** és a **Talaj CSV** gomb menti a számokat.

Évszaknál a számok a mintavett napok átlagos napi értékei. Semmi sem mentődik a projektbe: az eredmény megtekintésre való, és újrafuttatáskor újra készül.

## Jó tudni

- Egy fal csak akkor számít napos pillanatnak, ha a nap felé néz, és semmi nem áll útjában. Az elfordult fal semmit sem kap.
- A talaj olyan rácson van mintavételezve, amely a terület méretétől függ, és a nap helyzete minden időlépés közepén van, így az órák a választott lépésnek megfelelő pontossággal helyesek.
- A nap helyzete egy közzétett csillagászati képlet, amely kb. egy ívperc pontosságú.
