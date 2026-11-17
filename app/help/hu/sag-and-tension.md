---
title: Ernyedés és húzóerő
summary: A terhelési esetek (hőmérséklet, szél, jég) és a húzóerő-határértékek, ahogyan a CivilCraft minden szakasz húzóerejét kiszámítja, valamint a feszítési táblázatok.
keywords: ernyedés, húzóerő, terhelési eset, hőmérséklet, szél, jég, aszimmetrikus jegesedés, irányadó mező, egyenértékű mező, állapotváltozás, láncgörbe, feszítési táblázat, szakítószilárdság, mindennapi feszültség
from: f8876c35
---

## Terhelési esetek és határértékek

A {{ui:Továbbiak}} › {{ui:Terhelési esetek és határértékek…}} szerkeszti azokat a szabályokat, amelyeket a projekt minden vezetéke követ.

- **Terhelési esetek**: egy hőmérséklet, a vezetéken lévő szélnyomás (Pa), és sugárirányú jég (mm, a sűrűségével együtt). Az első eset a viszonyítási alap.
- **Húzóerő-határértékek**: a vezeték szakítószilárdságának egy része, a vízszintes húzóerőre vagy egy tartóponton fellépő legnagyobb húzóerőre, egy terhelési esetben. Vagy adja meg magát a vízszintes húzóerőt.
- **Szabadtávolságok**: a vezeték által a talaj, egy út, egy épület és így tovább felett tartott távolság. Adjon hozzá, nevezzen át és távolítson el: ezek saját szabályai. Alattuk válassza ki a **Vezeték alatti növényzet**, a **Vezeték alatti tájépítési falak** és a **Földalatti keresztezések** szabályait.
- **Az ellenőrzések által használt esetek**: melyik eset adja a legnagyobb ernyedést (meleg), a szigetelő kilengését (szél), a jegesedést, és a jegesedést a tartópont egyik oldalán.
- **Tényezők**: fázistávolság-tényező (k), legnagyobb szigetelő-kilengés, tényező a tartók és a szerelvények terhelésére, a forduló szögek, amelyek a sarok- és végtartókat meghatározzák, a földkábelek legkisebb takarása és a legnagyobb feszültségesés.

## Csomagok: szabályok és könyvtár egy országhoz

Egyetlen ország szabályai sincsenek beépítve a CivilCraftba. A **csomag** egy fájlban (`.cclinepack.json`) tartja együtt a szabálykészletet és a könyvtárat, egy országhoz, hálózatüzemeltetőhöz vagy vállalathoz:

- A **Mentés csomagként…** a {{ui:Terhelési esetek és határértékek…}} ablakban kiírja a megjelenített szabálykészletet és a könyvtárát (vagy, ha a könyvtárban még nincs semmi, a projekt által használt elemeket). Először írja be az **Ország vagy régió** mezőt.
- A **Szabálykészlet vagy csomag megnyitása…** beolvas egy csomagot, egy szabályfájlt vagy egy könyvtárfájlt. A csomag szabályai megjelennek a párbeszédpanelen (az **Alkalmaz** gombbal használhatók), elemei pedig a könyvtárba kerülnek.
- A többiek által megosztott csomagok a bővítmények oldalon, a **Távvezeték-csomagok** alatt találhatók. Két példacsomag mutatja a formátumot; ezek egyetlen ország szabályai sem.

Minden csomagot megnyitáskor ellenőrzünk, mint bármely fájlt. Minden értéket az érvényes szabvánnyal ellenőrizzen, mielőtt bármit megépítenének.

Két példa szabálykészlet van a kiinduláshoz: **Példa: hideg éghajlat** és **Példa: enyhe éghajlat**. Számaik egyetlen szabványból sem származnak: állítsa be azokat az értékeket, amelyeket a szabványa ad. A {{ui:Szabályok mentése}} és az {{ui:Szabályok megnyitása…}} egy szabálykészletet fájlként oszt meg.

## Hogyan számítódik ki a húzóerő

Minden végtartók közötti szakaszra:

1. Az **irányadó mező** a szakasz mezőinek √(ΣL³ ÷ ΣL) értéke.
2. Minden határértéket vízszintes húzóerővé alakítunk a viszonyítási esetben az irányadó mezőn az **állapotváltozási egyenleten** keresztül: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. A legszigorúbb határozza meg a húzóerőt.
3. Minden terhelési eset húzóereje ebből következik, és minden mező alakja a két rögzítési pontján átmenő pontos **láncgörbe** (lejtőn lévő mezőkkel együtt): az ernyedés a húrból, a hossz és a húzóerő mindkét végen.

Az esetben méterenkénti terhelés: a saját súly plusz a jég (jégterület × sűrűség × g) függőlegesen; a szélnyomás × a jeges átmérő vízszintesen.

## Feszítési táblázatok

A {{ui:Továbbiak}} › {{ui:Huzalfeszítési táblázatok…}} szelvényenként felsorolja a vízszintes húzóerőt és minden mező ernyedését a szabálykészlet minden hőmérsékletén (kezdetben −5 °C-tól 40 °C-ig, 5 °C-onként), nyugodt levegőben. Mentse őket, valamint a tartók táblázatát, **CSV** formátumban.

Nincs figyelembe véve: a vezeték évek alatti kúszása és egy új vezeték nyúlása. Ezeket a feszítési hőmérsékletek megadásával építse be.
